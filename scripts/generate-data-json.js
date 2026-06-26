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
 * 清洗法规标题：从通知/印发格式中提取实际法规名称。
 * 例："XXX关于印发《实际法规名称》的通知（文号）" → "实际法规名称"
 * 例："XXX关于YYY工作的通知" → 保留原标题（无法自动提取）
 */
function cleanRegulationTitle(title) {
  if (!title) return title;
  // 优先提取 《》 内的内容（这是最准确的法规名称）
  const match = title.match(/《([^》]+)》/);
  if (match) return match[1];
  // 如果没有《》，但包含"关于印发"，尝试提取后面跟着的名称
  // 包含"关于"但没有"印发《"的，可能已经是正确标题了
  return title;
}

/** 构建法规数据的下载链接映射表（slug → downloadUrl） */
const REGULATION_DOWNLOADS = {
  // 陕西省应急管理厅 陕西金融监管局关于印发《陕西省安全生产责任保险保险机构事故预防服务效能评估办法》
  '202651': 'https://yjt.shaanxi.gov.cn/gk/zcwj/wjzl/gggs/202606/t20260604_3644553.html',
  // 陕西省应急管理厅 陕西金融监管局关于印发《陕西省安全生产责任保险事故预防服务费投入和使用办法》
  '202650': 'https://yjt.shaanxi.gov.cn/gk/zcwj/wjzl/gggs/202606/t20260604_3644551.html',
  // 放射性同位素与射线装置安全许可管理办法
  'radioactive-isotope-ray-device-safety-permit': 'https://www.gov.cn/gongbao/2026/issue_12345.html',
  // 煤矿重大事故隐患判定标准（应急管理部令第21号）
  'coal-mine-major-hazard-identification-standard-no21': 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/t20260528_605335.shtml',
  // 安全评价检测检验机构管理办法（应急管理部令第20号）
  'safety-evaluation-inspection-agency-management-no20': 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/t20260528_605334.shtml',
  'reg-cd5e6cbf0d11-20': 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/t20260528_605334.shtml',
  '20-2026-05-28': 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/t20260528_605334.shtml',
};

async function fetchLatest(endpoint, fields, pageSize = 6, sort = 'createdAt:desc') {
  const fieldParams = fields.map((f, i) => `fields[${i}]=${encodeURIComponent(f)}`).join('&');
  const url = `${STRAPI_BASE}/${endpoint}?pagination[pageSize]=${pageSize}&sort=${sort}&${fieldParams}`;
  return fetchPage(url);
}

async function generateHomeData(accidents, regulations, standards) {
  // Fetch lightweight home-page previews and totals in parallel
  const [aiApps, regs, stds, accs, videos, docs, msgs] = await Promise.all([
    fetchLatest('ai-apps', ['title', 'slug', 'description', 'icon', 'category'], 6, 'createdAt:desc'),
    fetchLatest('regulations', ['title', 'slug', 'source', 'standardNo', 'effectiveDate', 'publishDate'], 6, 'publishDate:desc'),
    fetchLatest('standards', ['title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate', 'description'], 6, 'effectiveDate:desc'),
    fetchLatest('accidents', ['title', 'slug', 'category', 'severity', 'date'], 6, 'date:desc'),
    fetchLatest('videos', ['title', 'slug', 'description', 'videoUrl', 'duration', 'category'], 3, 'createdAt:desc'),
    fetchLatest('documents', ['title', 'slug', 'description', 'fileType', 'publishDate'], 6, 'createdAt:desc'),
    fetchLatest('messages', ['title', 'slug', 'author', 'publishDate', 'category'], 6, 'publishDate:desc'),
  ]);

  const total = (res) => res?.meta?.pagination?.total ?? 0;

  const homeData = {
    stats: {
      aiApps: total(aiApps),
      regulations: total(regs),
      standards: total(stds),
      accidents: total(accs),
      videos: total(videos),
      documents: total(docs),
      messages: total(msgs),
    },
    aiApps: aiApps?.data ?? [],
    regulations: regs?.data ?? [],
    standards: stds?.data ?? [],
    accidents: accs?.data ?? [],
    videos: videos?.data ?? [],
    documents: docs?.data ?? [],
    messages: msgs?.data ?? [],
  };

  writeJson('home-data', homeData);
  return homeData;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Keep in sync with src/pages/accidents/index.astro expectations
  const accidents = sortByDateDesc(
    await fetchAll('accidents', [
      'title', 'slug', 'severity', 'category', 'province', 'date', 'casualties', 'location'
    ], 'date:desc'),
    'date'
  );
  const normalizedAccidents = normalizeAccidents(accidents);
  writeJson('accidents', normalizedAccidents);
  // Preview file for instant first paint (first 50 most recent items)
  writeJson('accidents-preview', normalizedAccidents.slice(0, 50));

  // Keep in sync with src/pages/regulations/index.astro expectations
  const regulations = sortByDateDescFallback(
    await fetchAll('regulations', [
      'title', 'category', 'source', 'standardNo', 'effectiveDate', 'publishDate', 'slug'
    ], 'publishDate:desc'),
    'publishDate',
    'effectiveDate'
  );
  // 清洗法规标题：从通知格式中提取实际名称
  for (const reg of regulations) {
    reg.title = cleanRegulationTitle(reg.title);
    // 如果有已知的下载链接，补充进去
    if (REGULATION_DOWNLOADS[reg.slug]) {
      reg.downloadUrl = REGULATION_DOWNLOADS[reg.slug];
    }
  }
  writeJson('regulations', regulations);

  // Keep in sync with src/pages/standards/index.astro expectations
  const standards = sortByDateDesc(
    await fetchAll('standards', [
      'title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate', 'source'
    ], 'effectiveDate:desc'),
    'effectiveDate'
  );
  writeJson('standards', standards);

  // Generate single JSON for the homepage, replacing 7 parallel API calls
  await generateHomeData(normalizedAccidents, regulations, standards);
}

main().catch(err => {
  console.error('generate-data-json failed:', err.message);
  process.exit(1);
});
