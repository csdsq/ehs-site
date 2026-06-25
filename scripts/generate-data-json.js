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

function normalizeAccidents(items) {
  return items.map(item => {
    if (item.province && PROVINCE_NORMALIZE[item.province]) {
      return { ...item, province: PROVINCE_NORMALIZE[item.province] };
    }
    return item;
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

  // Generate full regulation data for detail page prerendering
  // All fields (including content, downloadUrl) for 504 items
  // Only used at build time by getStaticPaths()
  const regFull = await fetchAll('regulations', [
    'title', 'slug', 'source', 'standardNo', 'downloadUrl',
    'publishDate', 'effectiveDate', 'category',
    'content', 'summary', 'validity', 'description'
  ], 'publishDate:desc');
  writeJson('regulations-full', regFull);
  console.log(`Regulations full data ready for prerender (${regFull.length} items).`);

  // Generate full accident data for detail page prerendering
  const accFull = await fetchAll('accidents', [
    'title', 'slug', 'severity', 'category', 'province', 'date', 'casualties',
    'location', 'company', 'economicLoss', 'description', 'content',
    'causes', 'suggestions', 'personnelHandling', 'reportUrl', 'downloadUrl'
  ], 'date:desc');
  writeJson('accidents-full', normalizeAccidents(accFull));
  console.log(`Accidents full data ready for prerender (${accFull.length} items).`);

  // Generate full standards data for detail page prerendering
  const stdFull = await fetchAll('standards', [
    'title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate',
    'source', 'description', 'content', 'downloadUrl'
  ], 'effectiveDate:desc');
  writeJson('standards-full', stdFull);
  console.log(`Standards full data ready for prerender (${stdFull.length} items).`);
}

main().catch(err => {
  console.error('generate-data-json failed:', err.message);
  process.exit(1);
});
