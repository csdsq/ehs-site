#!/usr/bin/env node
/**
 * strapi_admin.js — 用「标准 API Token」操作 Strapi（沙箱已可直连 8.149.139.66:1337）
 * ----------------------------------------------------------------------------
 * 三种模式：
 *   node scripts/strapi_admin.js reset   # 备份并删除全部旧 standards 记录（删 1000+ 页面）
 *   node scripts/strapi_admin.js link    # 用户后台上传 792 PDF 后，按标准号建 792 条 standards 记录
 *   node scripts/strapi_admin.js link --dry  # 只统计将建多少条，不写库
 *
 * 鉴权说明：
 *   早期用 admin JWT + /content-manager/* 路径，但被 Users&Permissions 拒（401/403）。
 *   改用「标准 API Token」+ 公开 REST API（/api/standards、/api/upload/files）即可读写。
 *   该 Token 对 /api/upload/folders 返回 405（创建文件夹动作未通过 API 开放），
 *   故「媒体库分类文件夹」无法经 API 建立，需用户在后台手动建（或上传到根目录，页面不受影响）。
 *
 * 标准号前缀 → 分类（与 gen_standards_from_pdfs.py 一致）：
 *   GB→国家标准  AQ/YJ→安全生产  HJ→环境保护  WS/YY/SY→卫生职业健康  DB→地方  其他→其他行业
 * slug 采用「标准代号+年号」格式（如 GB-26851-2026 / AQ-1029-2019 / DB11-T-123-2020），
 * 与 gen_standards_from_pdfs.py 产出一致；category 字段写主题码 safety/environment/occupational_health。
 *
 * 环境变量：STRAPI_BASE / STRAPI_TOKEN（不传则用内置默认 Token）
 * ----------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const BASE = (process.env.STRAPI_BASE || 'http://8.149.139.66:1337').replace(/\/+$/, '');
const TOKEN = process.env.STRAPI_TOKEN || 'da6216a3ba745ddf4ce4d8143aaa74056a45d5ed7e8307323c60383db02726f55dd7ab0fed68f943f17116e2b61341730c8e7f834d44d7a4641511e700f81144d9b66ca6916d0ee437cac065dea5858eca0b46f2df5e3be1b1fae31ed3fbe6a989fe10c47c16e518c22888bc626bd4f634d04d34dac6b79fdbb201dc361f2240';
const STD_DIR = path.join(process.cwd(), 'public/standards');
const MODE = process.argv[2] || 'reset';
const DRY = process.argv.includes('--dry');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const warn = (...a) => console.warn('⚠️', ...a);

// ---- 标准号 / 分类 ----
const STD_RE = /^([A-Z]{1,4}\s*(?:\d{2})?\s*(?:[-\/]\s*T)?\s*\d{2,6}(?:\.\d+)?\s*[-\.]\s*\d{2,4})/;
const PREFIX_CAT = {
  GB: '国家标准', AQ: '安全生产行业标准', HJ: '环境保护行业标准',
  WS: '卫生与职业健康标准', YY: '卫生与职业健康标准', SY: '卫生与职业健康标准',
  YJ: '安全生产行业标准', DB: '地方标准',
};
const CAT_THEME = {
  国家标准: 'safety', 地方标准: 'safety', 安全生产行业标准: 'safety',
  环境保护行业标准: 'environment', 卫生与职业健康标准: 'occupational_health', 其他行业标准: 'safety',
};
function stdPrefix(no) {
  const m = no.replace(/[\s/]/g, '').match(/^([A-Z]+)/);
  return m ? m[1].toUpperCase().replace(/T$/, '') : '';
}
function stdCategory(no) {
  return PREFIX_CAT[stdPrefix(no)] || '其他行业标准';
}
function slugify(no) {
  return no.toUpperCase().replace(/\s+/g, '-').replace(/\//g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
// 归一化用于匹配（去空白、大写）
function normKey(s) {
  return (s || '').toUpperCase().replace(/\s+/g, '').replace(/\./g, '');
}
function extractStdNo(name) {
  const m = name.match(STD_RE);
  return m ? m[1].trim() : null;
}

// ---- HTTP（标准 Token + 公开 REST API）----
async function api(p, method = 'GET', body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: ctrl.signal,
  });
  clearTimeout(t);
  if (!res.ok) throw new Error(`${method} ${p} => ${res.status}: ${(await res.text()).slice(0, 200)}`);
  if (res.status === 204) return null;
  return res.json();
}
async function listAll(ct) {
  const out = [];
  let page = 1;
  while (true) {
    const j = await api(`/api/${ct}?pagination[page]=${page}&pagination[pageSize]=100&sort=id:asc`);
    const rows = j.data || [];
    out.push(...rows);
    const meta = j.meta?.pagination || j.pagination;
    if (!meta || page >= (meta.pageCount || 1)) break;
    page++;
  }
  return out;
}

// ---- 模式：reset（删旧记录）----
async function modeReset() {
  log('🔍 列出旧 standards 记录...');
  const old = await listAll('standards');
  log(`📊 共 ${old.length} 条旧记录`);
  if (old.length === 0) { log('✅ 无旧记录，跳过'); return; }
  const backupPath = path.join(process.cwd(), 'scripts/_backup_standards_before_delete.json');
  fs.writeFileSync(backupPath, JSON.stringify(old, null, 2), 'utf-8');
  log(`💾 已备份到 ${backupPath}（如需恢复可用此文件）`);
  if (DRY) { log('🔎 DRY 模式：不执行删除'); return; }
  let ok = 0, fail = 0;
  for (const r of old) {
    try { await api(`/api/standards/${r.documentId}`, 'DELETE'); ok++; }
    catch (e) { fail++; warn(`删除 ${r.documentId} 失败: ${e.message}`); }
    await sleep(20);
  }
  log(`✅ 删除完成：成功 ${ok} / 失败 ${fail}`);
}

// ---- 模式：link（用户上传 792 PDF 后建记录）----
async function modeLink() {
  // 本地 792 PDF：标准号 → 元信息
  const localPdfs = fs.existsSync(STD_DIR)
    ? fs.readdirSync(STD_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
    : [];
  const localByKey = new Map();
  for (const f of localPdfs) {
    const name = f.slice(0, -4);
    const no = extractStdNo(name);
    if (!no) { warn(`本地文件无法提取标准号，跳过: ${f}`); continue; }
    localByKey.set(normKey(no), { file: f, name, no });
  }
  log(`📂 本地标准 PDF：${localPdfs.length} 个（可识别标准号 ${localByKey.size} 个）`);

  log('🔍 拉取 Strapi 已上传文件...');
  // upload/files 返回纯数组（非 {data:[]} 格式），需特殊处理
  const uploadResp = await api('/api/upload/files?pagination[pageSize]=1000', 'GET');
  const allFiles = Array.isArray(uploadResp) ? uploadResp : (uploadResp?.data || []);
  const pdfs = allFiles.filter((f) => (f.ext || '').toLowerCase() === '.pdf' || (f.mime || '').includes('pdf'));
  log(`📄 Strapi 中 PDF 文件：${pdfs.length} 个`);

  const existing = await listAll('standards');
  const usedSlugs = new Set(existing.map((r) => r.slug));
  const existingStdNos = new Set(existing.map((r) => r.standardNo));
  log(`📊 已有 standards 记录：${existing.length} 条`);

  let ok = 0, skip = 0, fail = 0;
  for (const pf of pdfs) {
    const fname = (pf.name || '').replace(/\.pdf$/i, '');
    const no = extractStdNo(fname);
    const local = no ? localByKey.get(normKey(no)) : null;
    if (!local) { skip++; continue; } // 不是标准 PDF 或本地无对应，跳过
    if (existingStdNos.has(local.no)) { skip++; continue; } // 已存在，跳过重复
    let slug = slugify(local.no);
    let base = slug, n = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);
    const category = stdCategory(local.no);
    const yearMatch = local.no.match(/-(\d{4})/);
    const year = yearMatch ? yearMatch[1] : '';
    const downloadUrl = `https://api.hser.ren/uploads/${pf.hash}${pf.ext}`;
    const payload = {
      title: local.name, slug, standardNo: local.no,
      source: category, category: CAT_THEME[category] || 'safety',
      downloadUrl,
      publishDate: year ? `${year}-01-01` : null,
      effectiveDate: year ? `${year}-01-01` : null,
      content: '', regionLevel: category === '地方标准' ? 'provincial' : 'national',
    };
    if (DRY) { ok++; log(`  [dry] 将建: ${slug} <- ${local.file}`); continue; }
    try {
      await api('/api/standards', 'POST', { data: payload });
      ok++;
    } catch (e) { fail++; warn(`建记录失败 ${local.file}: ${e.message}`); }
    await sleep(60);
  }
  log(`✅ link 完成：新建 ${ok} / 跳过 ${skip} / 失败 ${fail}`);
}

// ---- main ----
async function main() {
  log(`▶ 模式: ${MODE}${DRY ? ' (DRY)' : ''}  | Strapi: ${BASE}`);
  if (MODE === 'reset') await modeReset();
  else if (MODE === 'link') await modeLink();
  else { console.error('未知模式，用法: reset | link [--dry]'); process.exit(1); }
}
main().catch((e) => { console.error('💥 异常:', e.message); process.exit(1); });
