import type { APIRoute } from 'astro';

/**
 * 同源 Strapi 文件代理（服务端转发）
 * 浏览器 → wiki.hser.ren → ECS（阿里云）上的 Astro Node 服务 → Strapi uploads
 *
 * 处理所有 Strapi 上传文件（PDF、图片等），浏览器端通过 /suploads/ 访问，
 * 避免直接请求 api.hser.ren 暴露源站。
 *
 * 轻量反爬防护：
 *   1. 拦截常见脚本 / 批量下载工具 UA（python / wget / curl / scrapy ...）
 *   2. Referer 同源校验（允许空 Referer = 用户直接打开链接；拒绝外站盗链）
 *   3. 目录穿越防护（过滤 ../ 与单独 . 段）
 *
 * 前端调用示例：
 *   <iframe src="/suploads/_d4414a3d34.pdf" />
 *   <a href="/suploads/gongmao_standard_fedbb35cae.pdf" download>下载</a>
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://8.149.139.66:1337';
const SITE_HOST = process.env.SITE_HOST || 'wiki.hser.ren';

// 常见脚本 / 批量下载工具 UA（命中即拦截）
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

/** Office Online 使用的域名，这些域需要能拉取资源以完成预览 */
const OFFICE_PREVIEW_HOSTS = [
  'view.officeapps.live.com',
  'officeapps.live.com',
];

function isAllowedReferer(referer: string | null): boolean {
  if (!referer) return true; // 允许直接打开链接（无 Referer）
  try {
    const r = new URL(referer);
    const h = r.hostname;
    return (
      h === SITE_HOST ||
      h.endsWith('.' + SITE_HOST) ||
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h.endsWith('.localhost') ||
      OFFICE_PREVIEW_HOSTS.some((oh) => h === oh || h.endsWith('.' + oh))
    );
  } catch {
    return false; // 非法 Referer 头，拒绝
  }
}

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }

  // 1) 反爬：拦截脚本 / 爬虫 UA
  const ua = request.headers.get('user-agent') || '';
  if (isBotUA(ua)) {
    return new Response('Forbidden', { status: 403 });
  }

  // 2) 反爬：Referer 同源校验
  if (!isAllowedReferer(request.headers.get('referer'))) {
    return new Response('Forbidden', { status: 403 });
  }

  const seg = (params.path || '').toString();
  if (!seg) {
    return new Response('Not Found', { status: 404 });
  }

  // 3) 防目录穿越：过滤 ../ 与单独的 . 段
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
    const resp = await fetch(upstream, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!resp.ok) {
      return new Response(`File not found: ${resp.status}`, { status: resp.status });
    }

    // 透传文件内容
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
      {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
