import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u56FD\u6807\u5730\u6807", "currentPath": "/standards/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">国标地标</h1> <!-- ICS分类筛选 + 地区筛选 --> <div class="filter-bar" id="reg-filter-bar"> <!-- 动态生成 --> </div> <div class="search-box" style="margin-bottom: 32px; max-width: 100%;"> <input type="text" id="reg-search" placeholder="搜索国标地标名称、来源..."> <button id="reg-search-btn">搜索</button> </div> <div id="reg-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="list-grid" id="reg-list"> <div class="empty">加载中...</div> </div> <div id="reg-pagination" class="pagination-bar" style="display:none;"></div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/standards/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/standards/index.astro";
const $$url = "/standards";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
