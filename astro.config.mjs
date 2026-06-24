import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  site: 'https://hser.ren',
  base: '/',
  adapter: vercel(),
});
