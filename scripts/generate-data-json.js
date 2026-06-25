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

async function fetchAll(endpoint, fields) {
  const fieldParams = fields.map((f, i) => `fields[${i}]=${encodeURIComponent(f)}`).join('&');
  const allData = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const url = `${STRAPI_BASE}/${endpoint}?pagination[pageSize]=100&pagination[page]=${page}&${fieldParams}`;
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

function writeJson(name, data) {
  const filePath = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
  console.log(`Generated ${filePath} with ${data.length} items (${Math.round(fs.statSync(filePath).size / 1024)} KB)`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Keep in sync with src/pages/accidents/index.astro expectations
  const accidents = await fetchAll('accidents', [
    'title', 'slug', 'severity', 'category', 'province', 'date', 'casualties', 'location'
  ]);
  const normalizedAccidents = normalizeAccidents(accidents);
  writeJson('accidents', normalizedAccidents);
  // Preview file for instant first paint (first 50 most recent items)
  writeJson('accidents-preview', normalizedAccidents.slice(0, 50));

  // Keep in sync with src/pages/regulations/index.astro expectations
  const regulations = await fetchAll('regulations', [
    'title', 'category', 'source', 'standardNo', 'effectiveDate', 'publishDate', 'slug'
  ]);
  writeJson('regulations', regulations);

  // Keep in sync with src/pages/standards/index.astro expectations
  const standards = await fetchAll('standards', [
    'title', 'slug', 'standardNo', 'category', 'publishDate', 'effectiveDate', 'source'
  ]);
  writeJson('standards', standards);
}

main().catch(err => {
  console.error('generate-data-json failed:', err.message);
  process.exit(1);
});
