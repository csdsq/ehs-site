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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u6CD5\u89C4\u6587\u4EF6\u8BE6\u60C5", "currentPath": "/regulations/" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/regulations/">\u6CD5\u89C4\u6587\u4EF6</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div id="detail-tags" style="margin-bottom: 16px;"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        // \u6CD5\u89C4\u6570\u636E\u73B0\u5728\u5168\u5728 regulations \u96C6\u5408
        const res = await fetch(\`\${API}/regulations?filters[slug][$eq]=\${slug}&pagination[pageSize]=1\`);
        const json = await res.json();
        const item = json.data?.[0];
        if (item) {
          // \u7C7B\u522B+\u7EA7\u522B\u6807\u7B7E\u6620\u5C04
          const categoryMap = { safety: '\u5B89\u5168', environment: '\u73AF\u4FDD', occupational_health: '\u804C\u4E1A\u5065\u5EB7' };
          const regionMap = { national: '\u56FD\u5BB6', provincial: '\u7701', municipal: '\u5E02' };
          const catLabel = categoryMap[item.category] || '';
          const regLabel = regionMap[item.regionLevel] || '';
          const tagHtml = [
            catLabel ? \`<span class="std-tag std-tag-\${item.category}">\${catLabel}</span>\` : '',
            regLabel ? \`<span class="std-tag std-tag-region">\${regLabel}</span>\` : '',
          ].filter(Boolean).join(' ');

          document.getElementById('detail-title').textContent = item.title || '';
          document.getElementById('detail-tags').innerHTML = tagHtml;

          // \u6CD5\u89C4\u5168\u6587\uFF08content \u662F HTML \u683C\u5F0F\u5168\u6587\uFF09
          const content = (item.content || '').trim();
          const hasFullText = content && !content.startsWith('{') && !content.includes('<table');

          // \u57FA\u672C\u4FE1\u606F\u884C
          const infoRows = [
            ['\u53D1\u6587\u673A\u6784', item.source],
            ['\u53D1\u6587\u53F7', item.standardNo],
            item.publishDate ? ['\u53D1\u5E03\u65E5\u671F', item.publishDate] : null,
            item.effectiveDate ? ['\u5B9E\u65BD\u65E5\u671F', item.effectiveDate] : null,
          ].filter(Boolean).filter(([,v]) => v && v !== '-');

          document.getElementById('detail-body').innerHTML = \`
            <!-- \u57FA\u672C\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u57FA\u672C\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \${infoRows.length > 0
                  ? \`<div class="info-card-list">
                       \${infoRows.map(([k,v]) => \`
                         <div class="info-card-item">
                           <span class="info-card-label">\${k}</span>
                           <span class="info-card-value">\${v}</span>
                         </div>\`).join('')}
                     </div>\`
                  : '<p class="detail-empty">\u6682\u65E0\u57FA\u672C\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u6CD5\u89C4\u5168\u6587 -->
            \${hasFullText ? \`
            <section class="detail-section">
              <h2 class="detail-section-title">\u6CD5\u89C4\u5168\u6587</h2>
              <div class="detail-section-content">
                <div class="regulation-full-text">\${content}</div>
              </div>
            </section>\` : ''}

            <!-- \u67E5\u770B\u539F\u6587 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u67E5\u770B\u539F\u6587</h2>
              <div class="detail-section-content">
                <div class="detail-actions">
                  \${item.sourceUrl || item.downloadUrl
                    ? \`<a href="\${item.sourceUrl || item.downloadUrl}" target="_blank" rel="noopener" class="detail-action-btn btn-preview">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        \u67E5\u770B\u539F\u6587
                      </a>\`
                    : '<p class="detail-empty">\u6682\u65E0\u539F\u6587\u94FE\u63A5</p>'}
                </div>
              </div>
            </section>
          \`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u89C4\u8303</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `], [" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/regulations/">\u6CD5\u89C4\u6587\u4EF6</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div id="detail-tags" style="margin-bottom: 16px;"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        // \u6CD5\u89C4\u6570\u636E\u73B0\u5728\u5168\u5728 regulations \u96C6\u5408
        const res = await fetch(\\\`\\\${API}/regulations?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1\\\`);
        const json = await res.json();
        const item = json.data?.[0];
        if (item) {
          // \u7C7B\u522B+\u7EA7\u522B\u6807\u7B7E\u6620\u5C04
          const categoryMap = { safety: '\u5B89\u5168', environment: '\u73AF\u4FDD', occupational_health: '\u804C\u4E1A\u5065\u5EB7' };
          const regionMap = { national: '\u56FD\u5BB6', provincial: '\u7701', municipal: '\u5E02' };
          const catLabel = categoryMap[item.category] || '';
          const regLabel = regionMap[item.regionLevel] || '';
          const tagHtml = [
            catLabel ? \\\`<span class="std-tag std-tag-\\\${item.category}">\\\${catLabel}</span>\\\` : '',
            regLabel ? \\\`<span class="std-tag std-tag-region">\\\${regLabel}</span>\\\` : '',
          ].filter(Boolean).join(' ');

          document.getElementById('detail-title').textContent = item.title || '';
          document.getElementById('detail-tags').innerHTML = tagHtml;

          // \u6CD5\u89C4\u5168\u6587\uFF08content \u662F HTML \u683C\u5F0F\u5168\u6587\uFF09
          const content = (item.content || '').trim();
          const hasFullText = content && !content.startsWith('{') && !content.includes('<table');

          // \u57FA\u672C\u4FE1\u606F\u884C
          const infoRows = [
            ['\u53D1\u6587\u673A\u6784', item.source],
            ['\u53D1\u6587\u53F7', item.standardNo],
            item.publishDate ? ['\u53D1\u5E03\u65E5\u671F', item.publishDate] : null,
            item.effectiveDate ? ['\u5B9E\u65BD\u65E5\u671F', item.effectiveDate] : null,
          ].filter(Boolean).filter(([,v]) => v && v !== '-');

          document.getElementById('detail-body').innerHTML = \\\`
            <!-- \u57FA\u672C\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u57FA\u672C\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \\\${infoRows.length > 0
                  ? \\\`<div class="info-card-list">
                       \\\${infoRows.map(([k,v]) => \\\`
                         <div class="info-card-item">
                           <span class="info-card-label">\\\${k}</span>
                           <span class="info-card-value">\\\${v}</span>
                         </div>\\\`).join('')}
                     </div>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u57FA\u672C\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u6CD5\u89C4\u5168\u6587 -->
            \\\${hasFullText ? \\\`
            <section class="detail-section">
              <h2 class="detail-section-title">\u6CD5\u89C4\u5168\u6587</h2>
              <div class="detail-section-content">
                <div class="regulation-full-text">\\\${content}</div>
              </div>
            </section>\\\` : ''}

            <!-- \u67E5\u770B\u539F\u6587 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u67E5\u770B\u539F\u6587</h2>
              <div class="detail-section-content">
                <div class="detail-actions">
                  \\\${item.sourceUrl || item.downloadUrl
                    ? \\\`<a href="\\\${item.sourceUrl || item.downloadUrl}" target="_blank" rel="noopener" class="detail-action-btn btn-preview">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        \u67E5\u770B\u539F\u6587
                      </a>\\\`
                    : '<p class="detail-empty">\u6682\u65E0\u539F\u6587\u94FE\u63A5</p>'}
                </div>
              </div>
            </section>
          \\\`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u89C4\u8303</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `])), maybeRenderHead(), renderComponent($$result2, "PageComment", $$PageComment, { "pageUrl": `/regulations/${slug}` }), defineScriptVars({ slug })) })}`;
}, "/tmp/ehs-site/src/pages/regulations/[slug]/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/regulations/[slug]/index.astro";
const $$url = "/regulations/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
