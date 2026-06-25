import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  site: 'https://hser.ren',
  base: '/',
  adapter: vercel(),
});
