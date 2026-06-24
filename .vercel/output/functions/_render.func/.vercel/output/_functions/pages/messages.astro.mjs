import { Q as createComponent, a0 as renderComponent, a7 as renderTemplate, _ as maybeRenderHead } from '../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bx3h9tcU.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u7559\u8A00\u677F", "currentPath": "/messages/" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-layout"> <div class="container"> <h1 class="page-title">留言板</h1> <p class="page-description">交流讨论、经验分享、问题反馈，EHS从业者互助社区。资料文档分享请发送至：<a href="mailto:csdsq@qq.com">csdsq@qq.com</a></p> <div style="margin-top:24px; margin-bottom:24px;"> <div class="search-box" style="margin-bottom: 32px; max-width: 100%;"> <input type="text" id="msg-search" placeholder="搜索留言..."> <button id="msg-search-btn">搜索</button> </div> </div> <!-- 提交留言 --> <div class="msg-submit-card"> <h3 style="font-size:16px;margin-bottom:16px;font-weight:600;">✍️ 发表留言</h3> <form id="msg-form" class="msg-form"> <div class="msg-form-row" style="display:flex;gap:12px;"> <input type="text" id="msg-author" placeholder="你的昵称（选填）" class="msg-input" style="flex:1;"> <input type="email" id="msg-email" placeholder="你的邮箱（必填，用于接收回复通知）" class="msg-input" style="flex:1;"> </div> <div class="msg-form-row"> <textarea id="msg-content" placeholder="输入你的留言内容..." class="msg-textarea" rows="4"></textarea> </div> <button type="submit" class="detail-action-btn">提交留言</button> <div id="msg-status" style="margin-top:8px;font-size:13px;"></div> </form> </div> <div style="margin-top:32px;"> <div id="msg-count" style="font-size: 13px; color: var(--text-light); margin-bottom: 16px;"></div> <div class="list-grid" id="msg-list"> <div class="empty">加载中...</div> </div> </div> </div> </div>  ` })}`;
}, "/tmp/ehs-site/src/pages/messages/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/messages/index.astro";
const $$url = "/messages";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
