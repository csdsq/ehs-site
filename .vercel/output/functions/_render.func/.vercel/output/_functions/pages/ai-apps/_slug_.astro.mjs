import { O as createAstro, Q as createComponent, a0 as renderComponent, a7 as renderTemplate, X as defineScriptVars, _ as maybeRenderHead } from '../../chunks/astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_Bx3h9tcU.mjs';
import { $ as $$PageComment } from '../../chunks/PageComment_DhM8OCj6.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://hser.ren");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { slug } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "AI\u5E94\u7528\u8BE6\u60C5", "currentPath": "/ai-apps/" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/ai-apps/">AI\u5E94\u7528</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div class="detail-meta-flat" id="detail-meta"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        let res = await fetch(\`\${API}/ai-apps?filters[slug][$eq]=\${slug}&pagination[pageSize]=1\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\`\${API}/ai-apps/\${slug}\`);
          json = await res.json();
          item = json.data;
        }
        if (item) {
          document.getElementById('detail-title').textContent = item.title || '';
          document.getElementById('detail-meta').innerHTML = [
            item.category ? \`<span>\${item.category}</span>\` : '',
          ].filter(Boolean).join(' ');

          const intro = item.features || item.description || '';
          const imageHtml = item.demoContent || '';
          const appUrl = item.appUrl || item.url || '';

          document.getElementById('detail-body').innerHTML = \`
            \${intro ? \`
            <section class="detail-section">
              <h2 class="detail-section-title">\u5E94\u7528\u7B80\u4ECB</h2>
              <div class="detail-section-content">
                <div class="detail-text">\${intro.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>')}</div>
              </div>
            </section>\` : ''}

            \${imageHtml ? \`
            <section class="detail-section">
              <h2 class="detail-section-title">\u5E94\u7528\u5C55\u793A</h2>
              <div class="detail-section-content">
                <div class="detail-app-image">\${imageHtml}</div>
              </div>
            </section>\` : ''}

            \${appUrl ? \`
            <section class="detail-section">
              <h2 class="detail-section-title">\u8BBF\u95EE\u5E94\u7528</h2>
              <div class="detail-section-content">
                <div class="detail-actions">
                  <a href="\${appUrl}" target="_blank" rel="noopener" class="detail-action-btn btn-preview">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    \u8FDB\u5165\u5E94\u7528
                  </a>
                </div>
              </div>
            </section>\` : ''}
          \`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u5E94\u7528</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `], [" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/ai-apps/">AI\u5E94\u7528</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div class="detail-meta-flat" id="detail-meta"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        let res = await fetch(\\\`\\\${API}/ai-apps?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1\\\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\\\`\\\${API}/ai-apps/\\\${slug}\\\`);
          json = await res.json();
          item = json.data;
        }
        if (item) {
          document.getElementById('detail-title').textContent = item.title || '';
          document.getElementById('detail-meta').innerHTML = [
            item.category ? \\\`<span>\\\${item.category}</span>\\\` : '',
          ].filter(Boolean).join(' ');

          const intro = item.features || item.description || '';
          const imageHtml = item.demoContent || '';
          const appUrl = item.appUrl || item.url || '';

          document.getElementById('detail-body').innerHTML = \\\`
            \\\${intro ? \\\`
            <section class="detail-section">
              <h2 class="detail-section-title">\u5E94\u7528\u7B80\u4ECB</h2>
              <div class="detail-section-content">
                <div class="detail-text">\\\${intro.replace(/\\\\*\\\\*(.*?)\\\\*\\\\*/g, '<strong>$1</strong>').replace(/\\\\n/g, '<br>')}</div>
              </div>
            </section>\\\` : ''}

            \\\${imageHtml ? \\\`
            <section class="detail-section">
              <h2 class="detail-section-title">\u5E94\u7528\u5C55\u793A</h2>
              <div class="detail-section-content">
                <div class="detail-app-image">\\\${imageHtml}</div>
              </div>
            </section>\\\` : ''}

            \\\${appUrl ? \\\`
            <section class="detail-section">
              <h2 class="detail-section-title">\u8BBF\u95EE\u5E94\u7528</h2>
              <div class="detail-section-content">
                <div class="detail-actions">
                  <a href="\\\${appUrl}" target="_blank" rel="noopener" class="detail-action-btn btn-preview">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    \u8FDB\u5165\u5E94\u7528
                  </a>
                </div>
              </div>
            </section>\\\` : ''}
          \\\`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u5E94\u7528</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `])), maybeRenderHead(), renderComponent($$result2, "PageComment", $$PageComment, { "pageUrl": `/ai-apps/${slug}` }), defineScriptVars({ slug })) })}`;
}, "/tmp/ehs-site/src/pages/ai-apps/[slug]/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/ai-apps/[slug]/index.astro";
const $$url = "/ai-apps/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
