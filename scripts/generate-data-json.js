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
 * 按发布年月分组，组内按日期排序后分配序列号，原地修改 item.slug
 */
function generateSlugs(items, dateField = 'publishDate') {
  const groups = {};
  items.forEach(item => {
    const date = item[dateField] || item.createdAt || '';
    const key = date.substring(0, 7) || 'no-date';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  Object.keys(groups).sort().forEach(key => {
    const group = groups[key].sort((a, b) => {
      const da = a[dateField] || a.createdAt || '';
      const db = b[dateField] || b.createdAt || '';
      return da.localeCompare(db);
    });
    group.forEach((item, idx) => {
      const seq = String(idx + 1).padStart(3, '0');
      if (key === 'no-date') {
        item.slug = `9999-${seq}`;
      } else {
        const parts = key.split('-');
        const yy = parts[0].slice(2);
        const mm = parts[1];
        item.slug = `${yy}${mm}-${seq}`;
      }
    });
  });
}

/**
 * 清洗国标标题：去掉 —2025 或 -2019 等前缀
 * 清洗国标日期：如果日期年份 > 2030（显然是标准号伪装），清空该日期
 */
function normalizeStandards(items) {
  return items.map(item => {
    let result = { ...item };
    // 清洗标题：去掉 —2025 或 -2019 前缀
    if (result.title) {
      result.title = result.title.replace(/^[—-]\d{4}\s*/, '').replace(/^[—-]\d{4}/, '').trim();
    }
    // 清洗日期：年份 > 2030 的清空
    for (const field of ['publishDate', 'effectiveDate']) {
      const val = result[field];
      if (val && typeof val === 'string' && val.length === 10) {
        const year = parseInt(val.split('-')[0], 10);
        if (year > 2030 || year < 1900) {
          result[field] = null;
        }
      }
    }
    return result;
  });
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
  // 为每条记录生成 YYMM-NNN 格式的 slug（原地修改 item.slug）
  generateSlugs(normalizedAccidents, 'date');
  writeJson('accidents', normalizedAccidents);
  // 兜底预览：全量摘要（不含 content），API 代理不可用时列表页降级使用
  writeJson('accidents-preview', normalizedAccidents.map(a => ({
    id: a.id, documentId: a.documentId, title: a.title, slug: a.slug,
    severity: a.severity, category: a.category, province: a.province,
    date: a.date, casualties: a.casualties, location: a.location, company: a.company,
  })));

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
  // DownloadUrl already populated from Strapi data; no external mapping needed
  // ✅ FIX: Generate slugs BEFORE writing JSON, so regulations.json has YYMM-NNN slugs
  generateSlugs(filteredRegulations, 'publishDate');
  writeJson('regulations', filteredRegulations);
  // 兜底预览：全量摘要（不含 content）
  writeJson('regulations-preview', filteredRegulations.map(r => ({
    id: r.id, documentId: r.documentId, title: r.title, slug: r.slug,
    category: r.category, source: r.source, standardNo: r.standardNo,
    effectiveDate: r.effectiveDate, publishDate: r.publishDate, downloadUrl: r.downloadUrl,
  })));

  // Keep in sync with src/pages/standards/index.astro expectations
  const rawStandards = sortByDateDesc(
    await fetchAll('standards', [
      'title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate',
      'source', 'content', 'downloadUrl', 'description', 'regionLevel', 'summary'
    ], 'effectiveDate:desc'),
    'effectiveDate'
  );
  // 构建时清洗：标题去前缀、假日期清空
  const standards = normalizeStandards(rawStandards);
  // ✅ FIX: Generate slugs BEFORE writing JSON, so standards.json has YYMM-NNN slugs
  generateSlugs(standards, 'effectiveDate');
  const standardsCleanCount = rawStandards.length - standards.filter(s => s.title === (rawStandards.find(r => r.documentId === s.documentId) || {}).title).length;
  if (standardsCleanCount > 0 || standards.some(s => !s.publishDate || !s.effectiveDate)) {
    console.log(`Standards normalized: cleaned titles and/or cleared fake dates.`);
  }
  writeJson('standards', standards);
  // 兜底预览：全量摘要（不含 content）
  writeJson('standards-preview', standards.map(s => ({
    id: s.id, documentId: s.documentId, title: s.title, slug: s.slug,
    standardNo: s.standardNo, source: s.source, category: s.category,
    publishDate: s.publishDate, effectiveDate: s.effectiveDate,
    description: s.description, regionLevel: s.regionLevel, summary: s.summary,
  })));

  // documents — Strapi 公开 API 不允许访问 documents collection，
  // 构建时从内部 Strapi 拉取并写入 preview JSON，供页面静态加载。
  const documents = sortByDateDesc(
    await fetchAll('documents', [
      'title', 'slug', 'category', 'fileType', 'fileSize', 'publishDate',
      'description', 'downloadUrl'
    ], 'createdAt:desc'),
    'publishDate'
  );
  writeJson('documents', documents);
  writeJson('documents-preview', documents.map(d => ({
    id: d.id, documentId: d.documentId, title: d.title, slug: d.slug,
    category: d.category, fileType: d.fileType, fileSize: d.fileSize,
    publishDate: d.publishDate, description: d.description, downloadUrl: d.downloadUrl,
  })));

  // ai-apps — 同上，构建时拉取写入 preview JSON
  const aiAppsFull = sortByDateDesc(
    await fetchAll('ai-apps', [
      'title', 'slug', 'category', 'description', 'features', 'appUrl',
      'icon'
    ], 'createdAt:desc'),
    'createdAt'
  );
  writeJson('ai-apps', aiAppsFull);
  writeJson('ai-apps-preview', aiAppsFull.map(a => ({
    id: a.id, documentId: a.documentId, title: a.title, slug: a.slug,
    category: a.category, description: a.description, features: a.features,
    appUrl: a.appUrl, icon: a.icon,
  })));

  // videos — 同上（videos collection 实际字段：url, duration, category, description, slug, icon, downloadUrl, videoUrl, thumbnail）
  const videosFull = sortByDateDesc(
    await fetchAll('videos', [
      'title', 'slug', 'category', 'description', 'url', 'duration', 'icon', 'downloadUrl'
    ], 'createdAt:desc'),
    'createdAt'
  );
  writeJson('videos', videosFull);
  writeJson('videos-preview', videosFull.map(v => ({
    id: v.id, documentId: v.documentId, title: v.title, slug: v.slug,
    category: v.category, description: v.description, url: v.url,
    duration: v.duration, icon: v.icon, downloadUrl: v.downloadUrl,
  })));

  // Generate single JSON for the homepage, replacing 7 parallel API calls
  await generateHomeData(normalizedAccidents, filteredRegulations, standards);

}

main().catch(err => {
  console.error('generate-data-json failed:', err.message);
  process.exit(1);
});
