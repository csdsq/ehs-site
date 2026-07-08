/**
 * 共享的 Strapi 按需加载客户端
 * 通过同源代理 /sapi 访问内部 Strapi，绝不在浏览器直连 Strapi。
 * 注意：原 /api/ 前缀被 Cloudflare/Vercel 旧规则拦截（hser.ren/api/* 仍路由到 Vercel 旧函数），
 * 故改用 /sapi 前缀，使其走 hser.ren → Cloudflare → ECS Nginx → Astro Node 的正常通道。
 * - 列表：并行分页拉取「摘要字段（不含 content）」，本地缓存 30 分钟，再做筛选/分页渲染
 * - 详情：按 slug 单条拉取（含 content），仅几 KB
 * - 兜底：代理不可用时退回本地 /data/*-preview.json（列表）或全量 JSON（详情）
 */

export const STRAPI_PROXY = '/sapi';
const CACHE_TTL = 30 * 60 * 1000;

export interface StrapiPage {
  data: any[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

async function getJson(url: string): Promise<StrapiPage> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return res.json();
}

/** 并行分页拉取某集合的全部摘要记录（不含 content），结果缓存到 localStorage */
export async function fetchAllSummaries(
  collection: string,
  fields: string[],
  sort = 'createdAt:desc'
): Promise<any[]> {
  const cacheKey = `strapi_${collection}_summaries`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.ts && Date.now() - parsed.ts < CACHE_TTL) return parsed.data;
    }
  } catch {}

  const baseParams = new URLSearchParams();
  baseParams.set('pagination[pageSize]', '100');
  fields.forEach((f, i) => baseParams.set(`fields[${i}]`, f));
  baseParams.set('sort', sort);

  const first = await getJson(`${STRAPI_PROXY}/${collection}?${baseParams}&pagination[page]=1`);
  const all = [...(first.data || [])];
  const pageCount = first.meta?.pagination?.pageCount ?? 1;

  if (pageCount > 1) {
    const rest = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) =>
        getJson(`${STRAPI_PROXY}/${collection}?${baseParams}&pagination[page]=${i + 2}`)
      )
    );
    for (const r of rest) all.push(...(r.data || []));
  }

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data: all, ts: Date.now() }));
  } catch {}
  return all;
}

/** 按 slug 拉取单条记录（含 content 等完整字段） */
export async function fetchBySlug(collection: string, slug: string): Promise<any | null> {
  const params = new URLSearchParams();
  params.set('filters[slug][$eq]', slug);
  params.set('populate', '*');
  const url = `${STRAPI_PROXY}/${collection}?${params}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data && json.data.length > 0 ? json.data[0] : null;
}

/** 兜底：从本地 preview JSON 加载（代理不可用时） */
export async function fetchPreview(url: string): Promise<any[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`preview HTTP ${res.status}`);
  return res.json();
}

/** 兜底：从全量本地 JSON 中按 slug 查找单条 */
export async function findInFullJson(url: string, slug: string): Promise<any | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const all = await res.json();
  return all.find((i: any) => i.slug === slug) || null;
}
