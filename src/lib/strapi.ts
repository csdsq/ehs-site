// src/lib/strapi.ts
// Strapi v5 API 数据获取工具

export const STRAPI_URL = ''; // Use Vercel rewrites to proxy to Strapi

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
    const url = `${STRAPI_URL}/api/${endpoint}?pagination[pageSize]=100`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Strapi fetch failed: ${url} - ${res.status}`);
      return [];
    }
    const json: StrapiResponse<T> = await res.json();
    return json.data ?? [];
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

// 法律法规
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
