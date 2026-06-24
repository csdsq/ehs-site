import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u4E8B\u6545\u62A5\u544A", "currentPath": "/accidents/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">事故报告</h1> <!-- 筛选区 --> <div class="filter-bar" id="acc-filter-row1"> <!-- 事故等级 --> <div class="filter-group"> <span class="filter-label">等级</span> <div class="filter-tags" id="severity-tags"></div> </div> <!-- 省份 --> <div class="filter-group" id="province-group"> <span class="filter-label">省份</span> <div class="filter-tags" id="province-tags"></div> </div> </div> <!-- 事故类型 --> <div class="filter-group"> <span class="filter-label">类型</span> <div class="filter-tags" id="category-tags"></div> </div> <div class="search-box" style="margin-bottom: 24px; max-width: 100%;"> <input type="text" id="acc-search" placeholder="搜索事故名称、地点..."> <button id="acc-search-btn">搜索</button> </div> <div id="acc-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="list-grid" id="acc-list"> <div class="empty">加载中...</div> </div> <div id="acc-pagination" class="pagination-bar" style="display:none;"></div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/accidents/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/accidents/index.astro";
const $$url = "/accidents";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
