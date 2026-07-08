import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// ECS 部署：output:'hybrid' 才能在 Node 服务上运行 /api/* 服务端路由
//（Strapi 同源代理、反馈接口），静态页面仍预渲染（SEO/首屏）。
// 必须配合 @astrojs/node 适配器 standalone 模式，PM2 运行 dist/server/entry.mjs。
export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  site: 'https://hser.ren',
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
