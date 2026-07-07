import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Astro 5 中 output:'static'（默认）已等同于旧版 hybrid：
// 标记 prerender=true 的页面仍静态预渲染（SEO/首屏），
// 未预渲染的 /api/* 服务端路由（Strapi 代理）照常由 Node 服务运行。
// 必须配合 @astrojs/node 适配器，否则不会产出可运行的 Node 服务。
// ECS 上用 PM2 运行 dist/server/entry.mjs（standalone 模式）。
export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  site: 'https://hser.ren',
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
