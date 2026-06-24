import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u8D44\u6599\u6587\u6863", "currentPath": "/documents/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">资料文档</h1> <!-- 筛选标签区 --> <div class="filter-bar"> <div class="filter-group"> <span class="filter-label">专业</span> <div class="filter-tags" id="specialty-filters"> <button class="filter-tag active" data-value="">全部</button> <button class="filter-tag" data-value="安全">安全</button> <button class="filter-tag" data-value="环保">环保</button> <button class="filter-tag" data-value="职业健康">职业健康</button> </div> </div> <div class="filter-group"> <span class="filter-label">行业</span> <div class="filter-tags" id="industry-filters"> <button class="filter-tag active" data-value="">全部</button> <button class="filter-tag" data-value="交通">交通</button> <button class="filter-tag" data-value="化工">化工</button> <button class="filter-tag" data-value="工贸">工贸</button> <button class="filter-tag" data-value="建筑">建筑</button> <button class="filter-tag" data-value="矿山">矿山</button> <button class="filter-tag" data-value="通用">通用</button> </div> </div> </div> <div class="search-box" style="margin-bottom: 24px; max-width: 100%;"> <input type="text" id="doc-search" placeholder="搜索资料名称..."> <button id="doc-search-btn">搜索</button> </div> <div id="doc-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="list-grid" id="doc-list"> <div class="empty">加载中...</div> </div> <div id="doc-pagination" class="pagination-bar" style="display:none;"></div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/documents/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/documents/index.astro";
const $$url = "/documents";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
