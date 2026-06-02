// Client-side data fetching for Astro pages
export const STRAPI_URL = '';

interface ApiItem {
  id: number;
  [key: string]: any;
}

export async function loadData(endpoint: string): Promise<ApiItem[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/${endpoint}?pagination[pageSize]=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? [];
  } catch (e) {
    console.error(`Fetch ${endpoint} failed:`, e);
    return [];
  }
}

export function truncate(text: string, len: number): string {
  if (!text) return '';
  const plain = text.replace(/[#*`\n]/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > len ? plain.slice(0, len) + '...' : plain;
}
