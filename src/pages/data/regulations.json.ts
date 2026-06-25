import type { APIRoute } from 'astro';

const STRAPI_BASE = 'http://8.149.139.66:1337/api';

async function fetchAllRegulations() {
  let allData: any[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${STRAPI_BASE}/regulations?pagination[pageSize]=100&pagination[page]=${page}&sort=publishDate:desc&fields[0]=title&fields[1]=slug&fields[2]=category&fields[3]=source&fields[4]=publishDate&fields[5]=effectiveDate`;
    const res = await fetch(url);
    if (!res.ok) break;
    const json = await res.json();
    if (json.data) allData = allData.concat(json.data);
    if (json.meta?.pagination) {
      totalPages = json.meta.pagination.pageCount;
    } else {
      break;
    }
    page++;
  }
  return allData;
}

export const GET: APIRoute = async () => {
  try {
    const data = await fetchAllRegulations();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
