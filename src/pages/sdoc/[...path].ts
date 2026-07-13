import type { APIRoute } from 'astro';

/**
 * 资料文档文件代理路由（与标准 /sstd/、其它 /suploads/ 物理分离）
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
const STRAPI_URL = process.env.STRAPI_URL || 'http://8.149.139.66:1337';
const SITE_HOST = process.env.SITE_HOST || 'wiki.hser.ren';

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

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }

  const ua = request.headers.get('user-agent') || '';
  if (isBotUA(ua)) {
    return new Response('Forbidden', { status: 403 });
  }

  if (!isAllowedReferer(request.headers.get('referer'))) {
    return new Response('Forbidden', { status: 403 });
  }

  const seg = (params.path || '').toString();
  if (!seg) {
    return new Response('Not Found', { status: 404 });
  }

  const decoded = decodeURIComponent(seg).replace(/\\/g, '/');
  const safe = decoded
    .split('/')
    .filter((p) => p !== '..' && p !== '.' && p !== '')
    .join('/');
  if (!safe || safe !== decoded) {
    return new Response('Forbidden', { status: 403 });
  }

  const upstream = `${STRAPI_URL}/uploads/${safe}`;
  if (!upstream.startsWith(`${STRAPI_URL}/uploads/`)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(upstream, { method: 'GET', signal: controller.signal });
    clearTimeout(timer);

    if (!resp.ok) {
      return new Response(`File not found: ${resp.status}`, { status: resp.status });
    }

    const buffer = await resp.arrayBuffer();
    const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
    const contentLength = resp.headers.get('Content-Length');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || String(buffer.byteLength),
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'file_proxy_unavailable', message: String(err) }),
      { status: 504, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
