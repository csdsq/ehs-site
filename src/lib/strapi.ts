// src/lib/strapi.ts
// Strapi API 数据获取工具

const STRAPI_URL = import.meta.env.STRAPI_URL || 'https://strapi.hser.ren:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

interface StrapiResponse<T> {
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

async function fetchStrapi<T>(endpoint: string): Promise<T[]> {
  const url = `${STRAPI_URL}/api/${endpoint}?pagination[pageSize]=100&sort=publishDate:desc`;
  const res = await fetch(url, {
    headers: STRAPI_TOKEN
      ? { Authorization: `Bearer ${STRAPI_TOKEN}` }
      : {},
  });
  if (!res.ok) {
    console.error(`Strapi fetch failed: ${url} - ${res.status}`);
    return [];
  }
  const json: StrapiResponse<T> = await res.json();
  return json.data ?? [];
}

// 法规标准
export interface Regulation {
  id: number;
  attributes: {
    title: string;
    category: string;
    source: string;
    publishDate: string;
    content: any;
    summary: string;
    standardNo: string;
    tags: string;
  };
}
export const getRegulations = () => fetchStrapi<Regulation>('regulations');

// 事故报告
export interface Accident {
  id: number;
  attributes: {
    title: string;
    level: string;
    source: string;
    publishDate: string;
    content: any;
    location: string;
    casualties: string;
    summary: string;
    tags: string;
  };
}
export const getAccidents = () => fetchStrapi<Accident>('accidents');

// 视频课堂
export interface Video {
  id: number;
  attributes: {
    title: string;
    category: string;
    publishDate: string;
    description: string;
    videoUrl: string;
    duration: string;
    tags: string;
  };
}
export const getVideos = () => fetchStrapi<Video>('videos');

// 资料文件
export interface Document {
  id: number;
  attributes: {
    title: string;
    fileType: string;
    description: string;
    pages: string;
    fileSize: string;
    version: string;
    previewUrl: string;
    tags: string;
  };
}
export const getDocuments = () => fetchStrapi<Document>('documents');

// 问答
export interface QA {
  id: number;
  attributes: {
    question: string;
    answer: any;
    category: string;
    publishDate: string;
    viewCount: number;
    tags: string;
  };
}
export const getQAs = () => fetchStrapi<QA>('q-as');
