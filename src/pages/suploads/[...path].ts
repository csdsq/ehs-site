import type { APIRoute } from 'astro';

/**
 * 同源 Strapi 文件代理（服务端转发）
 * 浏览器 → hser.ren → Cloudflare → ECS 上的 Astro Node 服务 → Strapi uploads
 *
 * 处理所有 Strapi 上传文件（PDF、图片等），浏览器端通过 /suploads/ 访问，
 * 避免直接请求 api.hser.ren 被拒绝。
 *
 * 前端调用示例：
 *   <iframe src="/suploads/_d4414a3d34.pdf" />
 *   <a href="/suploads/gongmao_standard_fedbb35cae.pdf" download>下载</a>
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://8.149.139.66:1337';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }

  const seg = (params.path || '').toString();
  if (!seg) {
    return new Response('Not Found', { status: 404 });
  }

  const upstream = `${STRAPI_URL}/uploads/${seg}`;

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