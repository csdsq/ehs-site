import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 资料文档文件代理路由（与标准 /sstd/、其它 /suploads/ 物理分离）
 *
 * 解析顺序：
 *   1. 本地文件（public/documents/ 目录）
 *   2. 远端：Strapi 媒体库代理
 *
 * 浏览器 → wiki.hser.ren → ECS（阿里云）上的 Astro Node 服务 → Strapi uploads
 *
 * 处理资料文档的上传文件（PDF、Office 等），浏览器端通过 /sdoc/ 访问，
 * 避免直接请求 api.hser.ren 暴露源站，也避免与标准/事故/法规/视频共用 /suploads/。
 *
 * 轻量反爬防护：
 *   1. 拦截常见脚本 / 批量下载工具 UA
 *   2. Referer 同源校验（允许空 Referer；拒绝外站盗链）
 *   3. 目录穿越防护
 *
 * 前端调用示例：
 *   <iframe src="/sdoc/_d4414a3d34.pdf" />
 *   <a href="/sdoc/gongmao_standard_fedbb35cae.pdf" download>下载</a>
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const STRAPI_FALLBACK = 'http://8.149.139.66:1337';
const SITE_HOST = process.env.SITE_HOST || 'wiki.hser.ren';

const BASE_DIRS = [
  path.join(process.cwd(), 'public/documents'),
  '/var/www/hser.ren/uploads/documents',
];

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const BOT_UA = [
  'python-requests', 'requests', 'scrapy', 'wget', 'curl',
  'go-http-client', 'axios', 'httpx', 'aiohttp', 'okhttp',
  'java/', 'postmanruntime', 'headlesschrome', 'phantomjs',
  'selenium', 'puppeteer', 'httpclient', 'got/', 'node-fetch',
];

function isBotUA(ua: string): boolean {
  const s = (ua || '').toLowerCase();
  return BOT_UA.some((k) => s.includes(k));
}

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

/** 解析路径参数，返回安全路径或 null（表示非法） */
function resolveSafePath(params: { path?: string }): string | null {
  const seg = (params.path || '').toString();
  if (!seg) return null;
  const decoded = decodeURIComponent(seg).replace(/\\/g, '/');
  const safe = decoded
    .split('/')
    .filter((p) => p !== '..' && p !== '.' && p !== '')
    .join('/');
  if (!safe || safe !== decoded) return null;
  return safe;
}

/** 查找本地文件，返回路径或 null */
function findLocalFile(safe: string): string | null {
  for (const dir of BASE_DIRS) {
    try {
      const fp = path.join(dir, safe);
      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        return fp;
      }
    } catch {}
  }
  return null;
}

export const prerender = false;

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
  const ua = request.headers.get('user-agent') || '';
  if (isBotUA(ua)) {
    return new Response('Forbidden', { status: 403 });
  }
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
    const contentType = MIME[ext] || 'application/octet-stream';
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
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': String(chunkSize),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const buffer = fs.readFileSync(localFile);
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.byteLength),
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
      // 60 秒超时，大 PDF 需要足够时间
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

      return new Response(resp.body, {
        status: range && resp.status === 206 ? 206 : 200,
        headers: respHeaders,
      });
    } catch (err) {
      // 尝试下一个 base
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: 'file_proxy_unavailable' }),
    { status: 504, headers: { 'Content-Type': 'application/json' } }
  );
};
