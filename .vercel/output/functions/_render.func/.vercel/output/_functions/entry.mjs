import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_C1Pwnl7S.mjs';
import { manifest } from './manifest_CkhqYxyw.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/accidents/_slug_.astro.mjs');
const _page2 = () => import('./pages/accidents.astro.mjs');
const _page3 = () => import('./pages/ai-apps/_slug_.astro.mjs');
const _page4 = () => import('./pages/ai-apps.astro.mjs');
const _page5 = () => import('./pages/documents/_slug_.astro.mjs');
const _page6 = () => import('./pages/documents.astro.mjs');
const _page7 = () => import('./pages/messages/_slug_.astro.mjs');
const _page8 = () => import('./pages/messages.astro.mjs');
const _page9 = () => import('./pages/regulations/_slug_.astro.mjs');
const _page10 = () => import('./pages/regulations.astro.mjs');
const _page11 = () => import('./pages/standards/_slug_.astro.mjs');
const _page12 = () => import('./pages/standards.astro.mjs');
const _page13 = () => import('./pages/videos/_slug_.astro.mjs');
const _page14 = () => import('./pages/videos.astro.mjs');
const _page15 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/accidents/[slug]/index.astro", _page1],
    ["src/pages/accidents/index.astro", _page2],
    ["src/pages/ai-apps/[slug]/index.astro", _page3],
    ["src/pages/ai-apps/index.astro", _page4],
    ["src/pages/documents/[slug]/index.astro", _page5],
    ["src/pages/documents/index.astro", _page6],
    ["src/pages/messages/[slug]/index.astro", _page7],
    ["src/pages/messages/index.astro", _page8],
    ["src/pages/regulations/[slug]/index.astro", _page9],
    ["src/pages/regulations/index.astro", _page10],
    ["src/pages/standards/[slug]/index.astro", _page11],
    ["src/pages/standards/index.astro", _page12],
    ["src/pages/videos/[slug]/index.astro", _page13],
    ["src/pages/videos/index.astro", _page14],
    ["src/pages/index.astro", _page15]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "8ade4e1a-295e-41e9-ad59-86480726f086",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
