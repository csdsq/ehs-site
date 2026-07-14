import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 国标地标文件服务路由（与资料文档 /sdoc/、其它 /suploads/ 物理分离）
 *
 * 解析顺序：
 *   1. 本地：public/standards/ 或 ECS /var/www/hser.ren/uploads/standards/
 *   2. 远端：Strapi 媒体库代理
 *
 * 前端详情页通过 /sstd/<file> 在线预览，避免直接依赖外部政府站点。
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const STRAPI_FALLBACK = 'http://8.149.139.66:1337';
const SITE_HOST = process.env.SITE_HOST || 'wiki.hser.ren';

const BASE_DIRS = [
  path.join(process.cwd(), 'public/standards'),
  'D:\\Work\\9、法规及绩效评价\\9.1 HSE法规收集\\9.2.1 国标地标',
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

/** 解析路径参数，返回安全路径或 null */
function resolveSafePath(params: { path?: string }): string | null {
  const seg = (params.path || '').toString();
  if (!seg) return null;
  const decoded = decodeURIComponent(seg).replace(/\\/g, '/');
  const safe = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  if (safe !== decoded && decoded.startsWith('..')) return null;
  return safe;
}

/** 查找本地文件，返回路径或 null */
function findLocalFile(safe: string): string | null {
  for (const base of BASE_DIRS) {
    const cand = path.join(base, safe);
    if (cand.startsWith(base) && fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return cand;
    }
  }
  return null;
}

// ─── HEAD 请求：返回文件元信息，让 PDF.js 走渐进加载 ───
export const HEAD: APIRoute = async ({ params, request }) => {
  const safe = resolveSafePath(params);
  if (!safe) return new Response(null, { status: 404 });

  // 先查本地文件
  const localFile = findLocalFile(safe);
  if (localFile) {
    const stat = fs.statSync(localFile);
    const ext = path.extname(localFile).toLowerCase();
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': String(stat.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 查 Strapi（先 127.0.0.1，失败回退公网 IP）
  for (const base of [STRAPI_URL, STRAPI_FALLBACK]) {
    try {
      const resp = await fetch(`${base}/uploads/${safe}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        return new Response(null, {
          status: 200,
          headers: {
            'Content-Type': resp.headers.get('Content-Type') || 'application/pdf',
            'Content-Length': resp.headers.get('Content-Length') || '0',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch {}
  }

  return new Response(null, { status: 404 });
};

// ─── GET 请求：返回文件内容（支持 Range） ───
export const GET: APIRoute = async ({ params, request }) => {
  // 反爬
  if (!isAllowedReferer(request.headers.get('referer'))) {
    return new Response('Forbidden', { status: 403 });
  }

  const safe = resolveSafePath(params);
  if (!safe) return new Response('Not Found', { status: 404 });

  const range = request.headers.get('range');

  // 1) 本地文件
  const localFile = findLocalFile(safe);
  if (localFile) {
    const ext = path.extname(localFile).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    const stat = fs.statSync(localFile);
    const total = stat.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunkSize = end - start + 1;
      const fd = fs.openSync(localFile, 'r');
      const buf = Buffer.alloc(chunkSize);
      fs.readSync(fd, buf, 0, chunkSize, start);
      fs.closeSync(fd);
      return new Response(buf, {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': String(chunkSize),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const buf = fs.readFileSync(localFile);
    const isPdf = mime === 'application/pdf';
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(buf.length),
        'Content-Disposition': isPdf ? 'inline' : 'attachment',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 2) Strapi 代理（先 127.0.0.1，失败回退公网 IP）
  for (const base of [STRAPI_URL, STRAPI_FALLBACK]) {
    const upstream = `${base}/uploads/${safe}`;
    if (!upstream.startsWith(`${base}/uploads/`)) continue;

    try {
      const fetchOpts: RequestInit = { method: 'GET' };
      if (range) {
        fetchOpts.headers = { Range: range };
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      const resp = await fetch(upstream, { ...fetchOpts, signal: controller.signal });
      clearTimeout(timer);

      if (!resp.ok && resp.status !== 206) continue;

      const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
      const contentLength = resp.headers.get('Content-Length');
      const contentRange = resp.headers.get('Content-Range');
      const respHeaders: Record<string, string> = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      };
      if (contentLength) respHeaders['Content-Length'] = contentLength;
      if (contentRange) respHeaders['Content-Range'] = contentRange;

      const ext = path.extname(safe).toLowerCase();
      const isPdf = ext === '.pdf' || contentType === 'application/pdf';
      if (!contentRange) respHeaders['Content-Disposition'] = isPdf ? 'inline' : 'attachment';

      return new Response(resp.body, {
        status: range && resp.status === 206 ? 206 : 200,
        headers: respHeaders,
      });
    } catch {
      continue;
    }
  }

  return new Response('Not Found', { status: 404 });
};
