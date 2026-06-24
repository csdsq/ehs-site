import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u89C6\u9891\u8BFE\u5802", "currentPath": "/videos/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">视频课堂</h1> <p class="page-description">安全培训、应急处置、事故案例分析等视频资源，助力安全意识与技能提升。</p> <div class="search-box" style="margin-bottom: 32px; max-width: 100%;"> <input type="text" id="vid-search" placeholder="搜索视频名称..."> <button id="vid-search-btn">搜索</button> </div> <div id="vid-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="video-grid video-grid-3col" id="vid-list"> <div class="empty">加载中...</div> </div> <div id="vid-pagination" class="pagination-bar" style="display:none;"></div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/videos/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/videos/index.astro";
const $$url = "/videos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
