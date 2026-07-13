import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 国标地标文件服务路由（与资料文档 /sdoc/、其它 /suploads/ 物理分离）
 *
 * 解析顺序：
 *   1. 本地：public/standards/ 或 ECS /var/www/hser.ren/uploads/standards/
 *      （下载脚本的输出目录，便于本地预览 / 离线兜底）
 *   2. 远端：Strapi 媒体库（标准 PDF 上传到 Strapi "standards" 文件夹后，
 *      由本路由代理 STRAPI_URL/uploads/<path> 内联预览 / 下载）
 *
 * 前端详情页通过 /sstd/<file> 在线预览，避免直接依赖外部政府站点。
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://8.149.139.66:1337';
const SITE_HOST = process.env.SITE_HOST || 'wiki.hser.ren';

const BASE_DIRS = [
  path.join(process.cwd(), 'public/standards'),
  '/var/www/hser.ren/uploads/standards',
];

export const prerender = false;

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function isAllowedReferer(referer: string | null): boolean {
  if (!referer) return true;
  try {
    const r = new URL(referer);
    const h = r.hostname;
    return (
      h === SITE_HOST ||
      h.endsWith('.' + SITE_HOST) ||
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}

async function proxyStrapi(seg: string): Promise<Response | null> {
  const decoded = decodeURIComponent(seg).replace(/\\/g, '/');
  const safe = decoded
    .split('/')
    .filter((p) => p !== '..' && p !== '.' && p !== '')
    .join('/');
  if (!safe || safe !== decoded) return null;

  const upstream = `${STRAPI_URL}/uploads/${safe}`;
  if (!upstream.startsWith(`${STRAPI_URL}/uploads/`)) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(upstream, { method: 'GET', signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) return null;

    const buffer = await resp.arrayBuffer();
    const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
    const ext = path.extname(safe).toLowerCase();
    const isPdf = ext === '.pdf' || contentType === 'application/pdf';
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.byteLength),
        'Content-Disposition': isPdf ? 'inline' : 'attachment',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ params, request }) => {
  if (request.method !== 'GET') return new Response(null, { status: 405 });

  // 反爬：Referer 同源校验（允许空 Referer = 用户直接打开链接）
  if (!isAllowedReferer(request.headers.get('referer'))) {
    return new Response('Forbidden', { status: 403 });
  }

  const seg = (params.path || '').toString();
  if (!seg) return new Response('Not Found', { status: 404 });

  // 1) 本地文件系统优先
  const decoded = decodeURIComponent(seg).replace(/\\/g, '/');
  const safe = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  if (safe !== decoded && decoded.startsWith('..')) {
    return new Response('Forbidden', { status: 403 });
  }
  for (const base of BASE_DIRS) {
    const cand = path.join(base, safe);
    if (cand.startsWith(base) && fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      const ext = path.extname(cand).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      const buf = fs.readFileSync(cand);
      const isPdf = mime === 'application/pdf';
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Content-Length': String(buf.length),
          'Content-Disposition': isPdf ? 'inline' : 'attachment',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // 2) 回退到 Strapi 媒体库代理
  const strapiResp = await proxyStrapi(seg);
  if (strapiResp) return strapiResp;

  return new Response('Not Found', { status: 404 });
};
