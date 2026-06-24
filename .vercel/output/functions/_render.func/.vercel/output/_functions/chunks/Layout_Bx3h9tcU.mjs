import { O as createAstro, Q as createComponent, a2 as renderHead, B as addAttribute, a7 as renderTemplate, a5 as renderSlot } from './astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro("https://hser.ren");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "EHS\u7ECF\u9A8C\u5206\u4EAB", currentPath = "" } = Astro2.props;
  const navItems = [
    { label: "AI\u5E94\u7528", href: "/ai-apps/" },
    { label: "\u56FD\u6807\u5730\u6807", href: "/standards/" },
    { label: "\u6CD5\u89C4\u6587\u4EF6", href: "/regulations/" },
    { label: "\u4E8B\u6545\u62A5\u544A", href: "/accidents/" },
    // { label: '视频课堂', href: '/videos/' }, // 暂时隐藏
    { label: "\u8D44\u6599\u6587\u6863", href: "/documents/" },
    { label: "\u7559\u8A00\u677F", href: "/messages/" }
  ];
  return renderTemplate`<!-- rebuilt: 20260606115148 --><html lang="zh-CN"> <!-- v20260603c --> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - EHS经验分享</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body> <header class="site-header"> <div class="header-inner"> <a href="/" class="logo"> <span class="logo-icon">🛡</span> <span>EHS经验分享</span> </a> <nav> <ul class="nav-links"> ${navItems.map((item) => renderTemplate`<li> <a${addAttribute(item.href, "href")}${addAttribute(["", { active: currentPath === item.href || currentPath !== "/" && item.href !== "/" && currentPath.startsWith(item.href.replace(/\/$/, "")) }], "class:list")}> ${item.label} </a> </li>`)} </ul> </nav> <!-- Mobile menu button --> <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="菜单">☰</button> </div> <!-- Mobile nav --> <div class="mobile-nav" id="mobile-nav"> <ul class="mobile-nav-links"> ${navItems.map((item) => renderTemplate`<li> <a${addAttribute(item.href, "href")}${addAttribute(["", { active: currentPath === item.href }], "class:list")}> ${item.label} </a> </li>`)} </ul> </div> </header> <main> ${renderSlot($$result, $$slots["default"])} </main> <footer class="site-footer"> <div class="container"> <div class="footer-grid"> <div class="footer-about"> <h3>🛡 EHS经验分享</h3> <p style="font-size: 13px; margin-top: 8px; line-height: 1.8;">
聚合环境、健康、安全领域国标地标、法规文件、事故报告，<br>
助力EHS从业者高效获取专业安全信息。
</p> </div> <div class="footer-links"> <h4>访问统计</h4> <div class="footer-stats"> <p>👤 访客 <span id="busuanzi_value_site_uv">-</span></p> <p>👁 阅读 <span id="busuanzi_value_site_pv">-</span></p> </div> </div> <div class="footer-links"> <h4>联系我们</h4> <ul> <li><a href="mailto:csdsq@qq.com">📧 csdsq@qq.com</a></li> <li><a href="/messages/">💬 留言反馈</a></li> </ul> </div> </div> <div class="footer-bottom"> <p>&copy; 2026 EHS经验分享 &middot; 数据来源于官方公开渠道 &middot; 仅供学习参考</p> <p style="margin-top: 6px; font-size: 12px;"> <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2026033883号-2</a> </p> </div> </div> </footer>  <!-- 不蒜子统计延迟加载，不阻塞页面渲染 -->  </body> </html>`;
}, "/tmp/ehs-site/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
