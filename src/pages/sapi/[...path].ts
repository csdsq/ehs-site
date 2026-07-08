import type { APIRoute } from 'astro';

/**
 * 同源 Strapi 代理（服务端转发）
 * 浏览器 → hser.ren → Cloudflare → ECS 上的 Astro Node 服务 → 内部 Strapi
 * 这样浏览器永远不直接碰 Strapi：无 CORS、无混内容（https→http）问题，Strapi 可保持内网。
 *
 * 前端调用示例（注意前缀是 /sapi，不是 /api，因 /api/* 仍被 Vercel 旧规则拦截）：
 *   GET /sapi/regulations?pagination[page]=1&pagination[pageSize]=30&fields[0]=title
 *   GET /sapi/regulations?filters[slug][$eq]=2512-005&populate=*
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';

// 只允许公开可读的集合，避免误暴露 users / uploads 等
const ALLOWED = new Set(['regulations', 'accidents', 'standards']);

export const prerender = false;

export const GET: APIRoute = async ({ params, url, request }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const seg = (params.path || '').toString();
  const collection = seg.split('/')[0];
  if (!ALLOWED.has(collection)) {
    return new Response(JSON.stringify({ error: 'collection_not_allowed', collection }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const upstream = `${STRAPI_URL}/api/${seg}${url.search}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(upstream, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await resp.text();
    return new Response(body, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'strapi_unavailable', message: String(err) }),
      {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
