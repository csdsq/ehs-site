/**
 * Build-time data generator
 * Pulls lightweight list data from Strapi and writes static JSON files to public/data/.
 * These files are served as static assets by Vercel CDN, avoiding serverless cold starts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_BASE = process.env.STRAPI_BASE || 'http://8.149.139.66:1337/api';
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');

const PROVINCE_NORMALIZE = {
  '北京市': '北京',
  '上海市': '上海',
  '天津市': '天津',
  '重庆市': '重庆',
};

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${await res.text()}`);
  }
  return res.json();
}

async function fetchAll(endpoint, fields, sort = 'createdAt:desc') {
  const fieldParams = fields.map((f, i) => `fields[${i}]=${encodeURIComponent(f)}`).join('&');
  const allData = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const url = `${STRAPI_BASE}/${endpoint}?pagination[pageSize]=100&pagination[page]=${page}&sort=${encodeURIComponent(sort)}&${fieldParams}`;
    const json = await fetchPage(url);
    if (Array.isArray(json.data)) {
      allData.push(...json.data);
    }
    const pagination = json.meta?.pagination;
    if (pagination) {
      pageCount = pagination.pageCount;
    }
    page++;
  }
  return allData;
}

/**
 * 从事故标题中自动提取事故等级。
 * 根据《生产安全事故报告和调查处理条例》：
 *   特别重大/特大 → major
 *   重大 → larger
 *   较大 → general
 *   一般 → minor
 * 
 * 只要标题中包含关键词，就能自动判断。不依赖人工在 Strapi 中的选择。
 * 这相当于在构建时对整个链条（录入→映射→显示）进行自动纠错。
 */
function detectSeverityFromTitle(title) {
  if (!title) return null;
  if (title.includes('特别重大') || /特大(?!暴雨|洪)/.test(title)) return 'major';
  if (title.includes('重大')) return 'larger';
  if (title.includes('较大')) return 'general';
  if (title.includes('一般')) return 'minor';
  return null;
}

/**
 * 当标题不含事故等级关键词时，从伤亡描述中推断等级。
 * 依据《生产安全事故报告和调查处理条例》：
 *   特别重大 (major): ≥30死亡
 *   重大 (larger):    10-29死亡
 *   较大 (general):    3-9死亡
 *   一般 (minor):      1-2死亡
 */
function detectSeverityFromCasualties(casualties) {
  if (!casualties || casualties === '-' ||
    ['待官方公布','未知','待确认','待从完整报告获取'].includes(casualties.trim())) return null;
  if (/(无人员伤亡|无人员死亡|0人死亡|未造成人员伤亡|无具体)/.test(casualties)) return null;
  const m = casualties.match(/(\d+)人死亡/);
  if (!m) return null;
  const deaths = parseInt(m[1], 10);
  if (deaths >= 30) return 'major';
  if (deaths >= 10) return 'larger';
  if (deaths >= 3) return 'general';
  return 'minor';
}

/**
 * 清洗标题：去掉 .pdf / .docx 等文件后缀
 */
function cleanTitle(title) {
  if (!title) return title;
  return title.replace(/\.(pdf|docx|doc|txt)$/i, '');
}

/**
 * 清洗伤亡数据：只保留人数统计，去除括号内的人名和伤情细节
 * 如 "5人死亡（王x忠、陶x江），4人受伤（周绍洪肋骨骨折）" → "5人死亡，4人受伤"
 */
function cleanCasualties(casualties) {
  if (!casualties || casualties === '-' ||
      ['待官方公布','未知','待确认','待从完整报告获取'].includes(casualties.trim())) return casualties;
  if (/(无人员伤亡|无人员死亡|0人死亡|未造成人员伤亡)/.test(casualties)) return casualties.trim();

  const parts = [];
  const deathMatch = casualties.match(/(\d+)人死亡/);
  if (deathMatch) parts.push(deathMatch[1] + '人死亡');
  const injuryMatch = casualties.match(/(\d+)人[受重轻]伤/);
  if (injuryMatch) parts.push(injuryMatch[1] + '人受伤');
  if (parts.length > 0) return parts.join('，');
  return casualties;
}

function normalizeAccidents(items) {
  return items.map(item => {
    let result = { ...item };
    // 归一化省份简称
    if (result.province && PROVINCE_NORMALIZE[result.province]) {
      result.province = PROVINCE_NORMALIZE[result.province];
    }
    // 清洗标题：去掉 .pdf / .docx 后缀
    result.title = cleanTitle(result.title);
    // 清洗伤亡：只保留人数，去掉人名和伤情细节
    result.casualties = cleanCasualties(result.casualties);
    // 自动从标题提取事故等级，覆盖 Strapi 中可能错误的字段值
    result.severity = detectSeverityFromTitle(result.title) || result.severity;
    // 标题没有关键词时，从伤亡数据推断
    if (!detectSeverityFromTitle(result.title)) {
      result.severity = detectSeverityFromCasualties(result.casualties) || result.severity;
    }
    return result;
  });
}

function parseDate(value) {
  if (!value || value === 'null') return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d;
}

function sortByDateDesc(items, field) {
  return items.slice().sort((a, b) => {
    const da = parseDate(a[field]);
    const db = parseDate(b[field]);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.getTime() - da.getTime();
  });
}

function sortByDateDescFallback(items, primaryField, fallbackField) {
  return items.slice().sort((a, b) => {
    const da = parseDate(a[primaryField]) || parseDate(a[fallbackField]);
    const db = parseDate(b[primaryField]) || parseDate(b[fallbackField]);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.getTime() - da.getTime();
  });
}

function writeJson(name, data) {
  const filePath = path.join(OUT_DIR, `${name}.json`);
  const isArray = Array.isArray(data);
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
  const size = Math.round(fs.statSync(filePath).size / 1024);
  console.log(`Generated ${filePath} (${isArray ? data.length + ' items' : 'object'}, ${size} KB)`);
}

/**
 * 生成统一 slug：格式为 YYMM-NNN（如 2606-001）
 * 按发布年月分组，组内按日期排序后分配序列号
 */
function generateSlugs(items, dateField = 'publishDate') {
  const groups = {};
  items.forEach(item => {
    const date = item[dateField] || item.createdAt || '';
    const key = date.substring(0, 7) || 'no-date';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const slugMap = {}; // originalSlug → newSlug
  Object.keys(groups).sort().forEach(key => {
    const group = groups[key].sort((a, b) => {
      const da = a[dateField] || a.createdAt || '';
      const db = b[dateField] || b.createdAt || '';
      return da.localeCompare(db);
    });
    group.forEach((item, idx) => {
      const seq = String(idx + 1).padStart(3, '0');
      if (key === 'no-date') {
        // 无日期的放在最后，用 9999-XX
        slugMap[item.slug] = `9999-${seq}`;
        item.slug = `9999-${seq}`;
      } else {
        const parts = key.split('-');
        const yy = parts[0].slice(2);
        const mm = parts[1];
        const newSlug = `${yy}${mm}-${seq}`;
        slugMap[item.slug] = newSlug;
        item.slug = newSlug;
      }
    });
  });
  return slugMap;
}

/**
 * 清洗法规标题：从通知/印发格式中提取实际法规名称。
 * 规则：
 *   1. 优先提取《》内的内容 → "XXX关于印发《办法》的通知" → "办法"
 *   2. 无《》时，提取"印发"到"的通知"之间的内容 → "XXX印发办法的通知" → "办法"
 *   3. 以上都不匹配则返回原标题
 * 
 * 注意：此函数已不再被调用（死代码），标题清洗已在 Strapi 源头完成。
 * 前端直接使用 item.title，不做二次清洗。
 */
function cleanRegulationTitle(title) {
  if (!title) return title;
  // 规则1：优先提取 《》 内的内容（最准确的法规名称）
  const match = title.match(/《([^》]+)》/);
  if (match) return match[1];
  // 规则2：无《》时，从"印发..."中提取名称
  // "XXX印发XXX办法的通知" → "XXX办法"
  // "XXX印发XXX管理办法" (无通知) → "XXX管理办法"
  const yinfaMatch = title.match(/印发(.+?)(?:的)?通知/);
  if (yinfaMatch) {
    let name = yinfaMatch[1].trim();
    name = name.replace(/[（(][^）)]*[）)]$/, '').replace(/\s+$/, '');
    if (name) return name;
  }
  // 处理"印发XXX管理办法"（末句以"办法"、"规定"、"细则"、"条例"等结尾）
  const yinfaEndMatch = title.match(/印发(.+?)(?:办法|规定|细则|条例|制度|标准|规范|规程|决定)(?:\s|$)/);
  if (yinfaEndMatch) {
    let name = yinfaEndMatch[1] + (title.match(/办法|规定|细则|条例|制度|标准|规范|规程|决定/)[0]);
    if (name) return name;
  }
  // 规则3：以上都不匹配则返回原标题
  return title;
}

/** 获取 Strapi admin token，用于后台 API 查询 */
async function getAdminToken() {
  const adminUrl = (process.env.STRAPI_BASE || 'http://8.149.139.66:1337').replace(/\/api$/, '') + '/admin/login';
  const email = process.env.STRAPI_ADMIN_EMAIL || 'admin@hser.ren';
  const password = process.env.STRAPI_ADMIN_PASSWORD || 'StrapiAdmin2026';
  const res = await fetch(adminUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status}`);
  const json = await res.json();
  return json.data.token;
}

/** 用 admin token 查询 content-manager API，统计投稿数量 */
async function countSubmissions(token) {
  const base = (process.env.STRAPI_BASE || 'http://8.149.139.66:1337').replace(/\/api$/, '');
  const url = `${base}/content-manager/collection-types/api::message.message` +
    '?filters[$and][0][category][$startsWith]=submission' +
    '&pagination[pageSize]=1&pagination[page]=1';
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.pagination?.total ?? 0;
}

/** 加载法规下载链接映射表（slug → downloadUrl），从独立 JSON 文件读取 */
function loadRegulationDownloads() {
  const filePath = path.join(OUT_DIR, 'regulation-downloads.json');
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    console.warn('regulation-downloads.json not found, using empty mapping.');
    return {};
  }
}

async function fetchLatest(endpoint, fields, pageSize = 6, sort = 'createdAt:desc') {
  const fieldParams = fields.map((f, i) => `fields[${i}]=${encodeURIComponent(f)}`).join('&');
  const url = `${STRAPI_BASE}/${endpoint}?pagination[pageSize]=${pageSize}&sort=${sort}&${fieldParams}`;
  return fetchPage(url);
}

async function generateHomeData(accidents, filteredRegulations, standards) {
  // ✅ FIX: 使用已处理的数据（带 YYMM-NNN slug），不再从 Strapi 重新拉取
  // Stats totals still come from Strapi, but previews use processed data with new slugs
  // 投稿统计用 admin token 查 content-manager API
  const adminToken = await getAdminToken();
  const submissionCount = await countSubmissions(adminToken);

  const [aiApps, regsTotal, stdsTotal, accsTotal, videos, docs] = await Promise.all([
    fetchLatest('ai-apps', ['title', 'slug', 'description', 'icon', 'category'], 6, 'createdAt:desc'),
    fetchLatest('regulations', ['title', 'slug', 'source', 'standardNo', 'effectiveDate', 'publishDate'], 1, 'publishDate:desc'),
    fetchLatest('standards', ['title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate', 'description'], 1, 'effectiveDate:desc'),
    fetchLatest('accidents', ['title', 'slug', 'category', 'severity', 'date'], 1, 'date:desc'),
    fetchLatest('videos', ['title', 'slug', 'description', 'videoUrl', 'duration', 'category'], 3, 'createdAt:desc'),
    fetchLatest('documents', ['title', 'slug', 'description', 'fileType', 'publishDate'], 6, 'createdAt:desc'),
  ]);

  const total = (res) => res?.meta?.pagination?.total ?? 0;

  // 为首页预览数据：取已清洗、过滤后的前 6 条（已含 YYMM-NNN slug）
  const homeRegulations = filteredRegulations.slice(0, 6).map(reg => ({
    title: reg.title,
    slug: reg.slug,
    source: reg.source,
    standardNo: reg.standardNo,
    effectiveDate: reg.effectiveDate,
    publishDate: reg.publishDate,
  }));
  const homeStandards = standards.slice(0, 6).map(std => ({
    title: std.title,
    slug: std.slug,
    standardNo: std.standardNo,
    category: std.category,
    publishDate: std.publishDate,
    effectiveDate: std.effectiveDate,
    description: std.description,
  }));
  // ✅ FIX: 事故预览也用已处理数据（带 YYMM-NNN slug）
  const homeAccidents = accidents.slice(0, 6).map(acc => ({
    title: acc.title,
    slug: acc.slug,
    category: acc.category,
    severity: acc.severity,
    date: acc.date,
  }));

  const homeData = {
    stats: {
      aiApps: total(aiApps),
      regulations: total(regsTotal),
      standards: total(stdsTotal),
      accidents: total(accsTotal),
      videos: total(videos),
      documents: total(docs),
      submissions: submissionCount,
    },
    aiApps: aiApps?.data ?? [],
    regulations: homeRegulations,
    standards: homeStandards,
    accidents: homeAccidents,
    videos: videos?.data ?? [],
    documents: docs?.data ?? [],
    submissions: [],
  };

  writeJson('home-data', homeData);
  return homeData;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Keep in sync with src/pages/accidents/index.astro expectations
  const accidents = sortByDateDesc(
    await fetchAll('accidents', [
      'title', 'slug', 'severity', 'category', 'province', 'date', 'casualties',
      'location', 'company', 'content', 'causes', 'suggestions', 'personnelHandling',
      'reportUrl', 'economicLoss'
    ], 'date:desc'),
    'date'
  );
  const normalizedAccidents = normalizeAccidents(accidents);
  // 为事故生成统一 slug：按 date（事故日期）分组
  const accSlugMap = generateSlugs(normalizedAccidents, 'date');
  writeJson('accidents', normalizedAccidents);
  // Preview file for instant first paint (first 50 most recent items)
  writeJson('accidents-preview', normalizedAccidents.slice(0, 50));

  // Keep in sync with src/pages/regulations/index.astro expectations
  const regulations = sortByDateDescFallback(
    await fetchAll('regulations', [
      'title', 'category', 'source', 'standardNo', 'effectiveDate', 'publishDate',
      'slug', 'content', 'downloadUrl', 'description'
    ], 'publishDate:desc'),
    'publishDate',
    'effectiveDate'
  );
  // 过滤掉"意见""废止""TEST/测试记录"等非正式法规
  const filteredRegulations = regulations.filter(reg => {
    const t = reg.title || '';
    const s = reg.slug || '';
    // "XX的意见"、"XX指导意见" → 删掉
    if (/意见$/.test(t)) return false;
    // "废止XX" → 删掉
    if (/^关于废止/.test(t) || /决定废止/.test(t) || /废止/.test(t)) return false;
    // "TEST-请删除-测试记录" 等测试数据 → 删掉
    if (/test|TEST/.test(s) || /请删除|测试记录|示例|样例/.test(t)) return false;
    return true;
  });
  const removedCount = regulations.length - filteredRegulations.length;
  if (removedCount > 0) {
    console.log(`Filtered out ${removedCount} non-regulation items (意见/废止).`);
  }
  // ✅ FIX: Download URL lookup uses OLD slug (from Strapi) → must happen BEFORE generateSlugs
  const regDownloads = loadRegulationDownloads();
  for (const reg of filteredRegulations) {
    if (regDownloads[reg.slug]) {
      reg.downloadUrl = regDownloads[reg.slug];
    }
  }
  // ✅ FIX: Generate slugs BEFORE writing JSON, so regulations.json has YYMM-NNN slugs
  const regSlugMap = generateSlugs(filteredRegulations, 'publishDate');
  writeJson('regulations', filteredRegulations);

  // Keep in sync with src/pages/standards/index.astro expectations
  const standards = sortByDateDesc(
    await fetchAll('standards', [
      'title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate',
      'source', 'content', 'downloadUrl', 'description', 'regionLevel', 'summary'
    ], 'effectiveDate:desc'),
    'effectiveDate'
  );
  // ✅ FIX: Generate slugs BEFORE writing JSON, so standards.json has YYMM-NNN slugs
  const stdSlugMap = generateSlugs(standards, 'effectiveDate');
  writeJson('standards', standards);

  // Generate single JSON for the homepage, replacing 7 parallel API calls
  await generateHomeData(normalizedAccidents, filteredRegulations, standards);

  // ✅ FIX: 生成 slug 映射表（newSlug → { module: originalSlug }）
  // 不再合并三个 slugMap（避免 originalSlug 相同时后者覆盖前者）
  // 而是按模块分别写入，每个 detail page 用 URL 对应的 module 字段查找
  const slugMapping = {};
  Object.keys(regSlugMap).forEach(oldSlug => {
    const newSlug = regSlugMap[oldSlug];
    if (!slugMapping[newSlug]) slugMapping[newSlug] = {};
    slugMapping[newSlug]['regulations'] = oldSlug;
  });
  Object.keys(accSlugMap).forEach(oldSlug => {
    const newSlug = accSlugMap[oldSlug];
    if (!slugMapping[newSlug]) slugMapping[newSlug] = {};
    slugMapping[newSlug]['accidents'] = oldSlug;
  });
  Object.keys(stdSlugMap).forEach(oldSlug => {
    const newSlug = stdSlugMap[oldSlug];
    if (!slugMapping[newSlug]) slugMapping[newSlug] = {};
    slugMapping[newSlug]['standards'] = oldSlug;
  });
  writeJson('slug-mapping', slugMapping);
  console.log(`Generated slug mapping: ${Object.keys(slugMapping).length} entries.`);
}

main().catch(err => {
  console.error('generate-data-json failed:', err.message);
  process.exit(1);
});
