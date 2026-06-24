import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u6CD5\u89C4\u6587\u4EF6", "currentPath": "/regulations/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">法规文件</h1> <!-- 筛选标签区 --> <div class="filter-bar"> <div class="filter-group"> <span class="filter-label">类别</span> <div class="filter-tags" id="category-filters"> <button class="filter-tag active" data-value="">全部</button> <button class="filter-tag" data-value="safety">安全</button> <button class="filter-tag" data-value="environment">环保</button> <button class="filter-tag" data-value="occupational_health">职业健康</button> </div> </div> <div class="filter-group"> <span class="filter-label">地区</span> <div class="filter-tags" id="region-filters"> <button class="filter-tag active" data-value="">全部</button> <button class="filter-tag" data-value="national">全国</button> <button class="filter-tag" data-value="北京">北京</button> <button class="filter-tag" data-value="天津">天津</button> <button class="filter-tag" data-value="上海">上海</button> <button class="filter-tag" data-value="重庆">重庆</button> <button class="filter-tag" data-value="河北">河北</button> <button class="filter-tag" data-value="山西">山西</button> <button class="filter-tag" data-value="辽宁">辽宁</button> <button class="filter-tag" data-value="吉林">吉林</button> <button class="filter-tag" data-value="黑龙江">黑龙江</button> <button class="filter-tag" data-value="江苏">江苏</button> <button class="filter-tag" data-value="浙江">浙江</button> <button class="filter-tag" data-value="安徽">安徽</button> <button class="filter-tag" data-value="福建">福建</button> <button class="filter-tag" data-value="江西">江西</button> <button class="filter-tag" data-value="山东">山东</button> <button class="filter-tag" data-value="河南">河南</button> <button class="filter-tag" data-value="湖北">湖北</button> <button class="filter-tag" data-value="湖南">湖南</button> <button class="filter-tag" data-value="广东">广东</button> <button class="filter-tag" data-value="海南">海南</button> <button class="filter-tag" data-value="四川">四川</button> <button class="filter-tag" data-value="贵州">贵州</button> <button class="filter-tag" data-value="云南">云南</button> <button class="filter-tag" data-value="陕西">陕西</button> <button class="filter-tag" data-value="广西">广西</button> <button class="filter-tag" data-value="甘肃">甘肃</button> <button class="filter-tag" data-value="青海">青海</button> <button class="filter-tag" data-value="内蒙古">内蒙古</button> <button class="filter-tag" data-value="西藏">西藏</button> <button class="filter-tag" data-value="宁夏">宁夏</button> <button class="filter-tag" data-value="新疆">新疆</button> </div> </div> </div> <div class="search-box" style="margin-bottom: 24px; max-width: 100%;"> <input type="text" id="std-search" placeholder="搜索规范名称、标准号..."> <button id="std-search-btn">搜索</button> </div> <div id="std-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="list-grid" id="std-list"> <div class="empty">加载中...</div> </div> <div id="std-pagination" class="pagination-bar" style="display:none;"></div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/regulations/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/regulations/index.astro";
const $$url = "/regulations";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
