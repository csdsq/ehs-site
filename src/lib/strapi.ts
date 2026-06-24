// src/lib/strapi.ts
// Strapi v5 API 数据获取工具

export const STRAPI_URL = 'https://api.hser.ren:8443'; // Use Vercel rewrites to proxy to Strapi

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export async function fetchStrapi<T>(endpoint: string): Promise<T[]> {
  try {
    const pageSize = 100;
    let page = 1;
    let pageCount = 1;
    const all: T[] = [];

    do {
      const joiner = endpoint.includes('?') ? '&' : '?';
      const url = `${STRAPI_URL}/api/${endpoint}${joiner}pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Strapi fetch failed: ${url} - ${res.status}`);
        return all;
      }
      const json: StrapiResponse<T> = await res.json();
      all.push(...(json.data ?? []));
      pageCount = json.meta?.pagination?.pageCount ?? page;
      page += 1;
    } while (page <= pageCount);

    return all;
  } catch (err) {
    console.error(`Strapi fetch error (${endpoint}):`, err);
    return [];
  }
}

// AI应用
export interface AiApp {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  url: string;
  slug: string;
}
export const getAiApps = () => fetchStrapi<AiApp>('ai-apps');

// 国标地标
export interface Regulation {
  id: number;
  title: string;
  description: string;
  category: string;
  publishDate: string;
  source: string;
  content: any;
  slug: string;
}
export const getRegulations = () => fetchStrapi<Regulation>('regulations');

// 法规文件
export interface Standard {
  id: number;
  title: string;
  description: string;
  category: string;
  standardNo: string;
  publishDate: string;
  source: string;
  slug: string;
}
export const getStandards = () => fetchStrapi<Standard>('standards');

// 事故报告
export interface Accident {
  id: number;
  title: string;
  description: string;
  severity: string;
  category: string;
  date: string;
  location: string;
  casualties: string;
  slug: string;
}
export const getAccidents = () => fetchStrapi<Accident>('accidents');

// 视频课堂
export interface Video {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  duration: string;
  slug: string;
}
export const getVideos = () => fetchStrapi<Video>('videos');

// 资料文件
export interface Document {
  id: number;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: string;
  publishDate: string;
  slug: string;
}
export const getDocuments = () => fetchStrapi<Document>('documents');

// 留言
export interface Message {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  publishDate: string;
  slug: string;
}
export const getMessages = () => fetchStrapi<Message>('messages');

