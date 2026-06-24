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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u8D44\u6599\u8BE6\u60C5", "currentPath": "/documents/" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="detail-breadcrumb-flat"> <div class="container"> <a href="/">\u9996\u9875</a> / <a href="/documents/">\u8D44\u6599\u6587\u6863</a> / \u8BE6\u60C5\n</div> </div> <div class="container"> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> </div> <div class="container"> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        let res = await fetch(\`\${API}/documents?filters[slug][$eq]=\${slug}&pagination[pageSize]=1&populate=*\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\`\${API}/documents/\${slug}?populate=*\`);
          json = await res.json();
          item = json.data;
        }
        if (item) {
          document.getElementById('detail-title').textContent = item.title || '';

          // Determine preview URL: use previewUrl if set, otherwise use downloadUrl
          const fileUrl = item.previewUrl || item.downloadUrl || '';
          const ft = (item.fileType || '').toLowerCase();

          let previewHtml = '';
          if (fileUrl) {
            if (ft === 'pdf') {
              // PDF: use browser's built-in PDF viewer via iframe
              previewHtml = \`<div class="detail-iframe-wrap">
                <iframe src="\${fileUrl}" style="width:100%;height:700px;border:none;border-radius:12px;"></iframe>
              </div>\`;
            } else if (ft.includes('doc') || ft.includes('ppt') || ft.includes('xls')) {
              // Office files: use Microsoft Office Online Viewer
              const encodedUrl = encodeURIComponent(fileUrl);
              previewHtml = \`<div class="detail-iframe-wrap">
                <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=\${encodedUrl}" style="width:100%;height:700px;border:none;border-radius:12px;"></iframe>
              </div>\`;
            } else {
              // Other file types: try iframe
              previewHtml = \`<div class="detail-iframe-wrap">
                <iframe src="\${fileUrl}" style="width:100%;height:700px;border:none;border-radius:12px;"></iframe>
              </div>\`;
            }
          }

          // Build basic info
          const infoItems = [];
          if (item.category) infoItems.push({ label: '\u5206\u7C7B', value: item.category });
          if (item.fileType) infoItems.push({ label: '\u6587\u4EF6\u7C7B\u578B', value: item.fileType.toUpperCase() });
          if (item.fileSize) infoItems.push({ label: '\u6587\u4EF6\u5927\u5C0F', value: item.fileSize });
          if (item.publishDate) infoItems.push({ label: '\u53D1\u5E03\u65E5\u671F', value: item.publishDate });

          document.getElementById('detail-body').innerHTML = \`
            <!-- \u57FA\u672C\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u57FA\u672C\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \${infoItems.length > 0
                  ? \`<table class="detail-info-table">
                      <tbody>
                        \${infoItems.map(i => \`<tr><td class="detail-info-label">\${i.label}</td><td>\${i.value}</td></tr>\`).join('')}
                      </tbody>
                    </table>\`
                  : '<p class="detail-empty">\u6682\u65E0\u57FA\u672C\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u5728\u7EBF\u9884\u89C8 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u5728\u7EBF\u9884\u89C8</h2>
              <div class="detail-section-content">
                \${previewHtml
                  ? previewHtml
                  : '<p class="detail-empty">\u6682\u4E0D\u652F\u6301\u5728\u7EBF\u9884\u89C8</p>'}
              </div>
            </section>

            <!-- \u4E0B\u8F7D -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u4E0B\u8F7D\u8D44\u6599</h2>
              <div class="detail-section-content">
                \${item.downloadUrl
                  ? \`<a href="\${item.downloadUrl}" target="_blank" rel="noopener" download class="detail-action-btn">\u4E0B\u8F7D\u6587\u4EF6 (\${item.fileType ? item.fileType.toUpperCase() : '\u6587\u4EF6'}\${item.fileSize ? ' \xB7 ' + item.fileSize : ''})</a>\`
                  : '<p class="detail-empty">\u6682\u65E0\u4E0B\u8F7D\u94FE\u63A5</p>'}
              </div>
            </section>
          \`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u8D44\u6599</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `], [" ", '<div class="detail-breadcrumb-flat"> <div class="container"> <a href="/">\u9996\u9875</a> / <a href="/documents/">\u8D44\u6599\u6587\u6863</a> / \u8BE6\u60C5\n</div> </div> <div class="container"> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> </div> <div class="container"> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        let res = await fetch(\\\`\\\${API}/documents?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1&populate=*\\\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\\\`\\\${API}/documents/\\\${slug}?populate=*\\\`);
          json = await res.json();
          item = json.data;
        }
        if (item) {
          document.getElementById('detail-title').textContent = item.title || '';

          // Determine preview URL: use previewUrl if set, otherwise use downloadUrl
          const fileUrl = item.previewUrl || item.downloadUrl || '';
          const ft = (item.fileType || '').toLowerCase();

          let previewHtml = '';
          if (fileUrl) {
            if (ft === 'pdf') {
              // PDF: use browser's built-in PDF viewer via iframe
              previewHtml = \\\`<div class="detail-iframe-wrap">
                <iframe src="\\\${fileUrl}" style="width:100%;height:700px;border:none;border-radius:12px;"></iframe>
              </div>\\\`;
            } else if (ft.includes('doc') || ft.includes('ppt') || ft.includes('xls')) {
              // Office files: use Microsoft Office Online Viewer
              const encodedUrl = encodeURIComponent(fileUrl);
              previewHtml = \\\`<div class="detail-iframe-wrap">
                <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=\\\${encodedUrl}" style="width:100%;height:700px;border:none;border-radius:12px;"></iframe>
              </div>\\\`;
            } else {
              // Other file types: try iframe
              previewHtml = \\\`<div class="detail-iframe-wrap">
                <iframe src="\\\${fileUrl}" style="width:100%;height:700px;border:none;border-radius:12px;"></iframe>
              </div>\\\`;
            }
          }

          // Build basic info
          const infoItems = [];
          if (item.category) infoItems.push({ label: '\u5206\u7C7B', value: item.category });
          if (item.fileType) infoItems.push({ label: '\u6587\u4EF6\u7C7B\u578B', value: item.fileType.toUpperCase() });
          if (item.fileSize) infoItems.push({ label: '\u6587\u4EF6\u5927\u5C0F', value: item.fileSize });
          if (item.publishDate) infoItems.push({ label: '\u53D1\u5E03\u65E5\u671F', value: item.publishDate });

          document.getElementById('detail-body').innerHTML = \\\`
            <!-- \u57FA\u672C\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u57FA\u672C\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \\\${infoItems.length > 0
                  ? \\\`<table class="detail-info-table">
                      <tbody>
                        \\\${infoItems.map(i => \\\`<tr><td class="detail-info-label">\\\${i.label}</td><td>\\\${i.value}</td></tr>\\\`).join('')}
                      </tbody>
                    </table>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u57FA\u672C\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u5728\u7EBF\u9884\u89C8 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u5728\u7EBF\u9884\u89C8</h2>
              <div class="detail-section-content">
                \\\${previewHtml
                  ? previewHtml
                  : '<p class="detail-empty">\u6682\u4E0D\u652F\u6301\u5728\u7EBF\u9884\u89C8</p>'}
              </div>
            </section>

            <!-- \u4E0B\u8F7D -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u4E0B\u8F7D\u8D44\u6599</h2>
              <div class="detail-section-content">
                \\\${item.downloadUrl
                  ? \\\`<a href="\\\${item.downloadUrl}" target="_blank" rel="noopener" download class="detail-action-btn">\u4E0B\u8F7D\u6587\u4EF6 (\\\${item.fileType ? item.fileType.toUpperCase() : '\u6587\u4EF6'}\\\${item.fileSize ? ' \xB7 ' + item.fileSize : ''})</a>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u4E0B\u8F7D\u94FE\u63A5</p>'}
              </div>
            </section>
          \\\`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u8D44\u6599</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `])), maybeRenderHead(), renderComponent($$result2, "PageComment", $$PageComment, { "pageUrl": `/documents/${slug}` }), defineScriptVars({ slug })) })}`;
}, "/tmp/ehs-site/src/pages/documents/[slug]/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/documents/[slug]/index.astro";
const $$url = "/documents/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
