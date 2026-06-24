import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "AI\u5E94\u7528", "currentPath": "/ai-apps/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">AI应用</h1> <div class="filter-bar" id="ai-filter-row"> <div class="filter-group"> <span class="filter-label">分类</span> <div class="filter-tags" id="ai-category-tags"></div> </div> </div> <div class="search-box" style="margin-bottom: 24px; max-width: 100%;"> <input type="text" id="ai-search" placeholder="搜索AI应用名称..."> <button id="ai-search-btn">搜索</button> </div> <div id="ai-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="list-grid" id="ai-list"> <div class="empty">加载中...</div> </div> <div id="ai-pagination" class="pagination-bar" style="display:none;"></div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/ai-apps/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/ai-apps/index.astro";
const $$url = "/ai-apps";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
