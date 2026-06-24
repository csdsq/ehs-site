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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u56FD\u6807\u5730\u6807\u8BE6\u60C5", "currentPath": "/standards/" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/standards/">\u56FD\u6807\u5730\u6807</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div id="detail-tags" style="margin-bottom: 16px;"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';

    const categoryMap = { safety: '\u5B89\u5168', environment: '\u73AF\u4FDD', occupational_health: '\u804C\u4E1A\u5065\u5EB7' };
    const regionLevelMap = { national: '\u56FD\u5BB6', provincial: '\u7701', municipal: '\u5E02' };

    function getStdTypeLabel(item) {
      const no = (item.standardNo || '').toUpperCase().trim();
      if (/^GB/.test(no)) return '\u56FD\u6807';
      if (/^DB/.test(no)) return '\u5730\u6807';
      return '\u884C\u6807';
    }

    async function loadDetail() {
      try {
        // \u6807\u51C6\u6570\u636E\u73B0\u5728\u5168\u5728 standards \u96C6\u5408
        const res = await fetch(\`\${API}/standards?filters[slug][$eq]=\${slug}&pagination[pageSize]=1\`);
        const json = await res.json();
        const item = json.data?.[0];

        if (item) {
          const stdTypeLabel = getStdTypeLabel(item);
          const catLabel = categoryMap[item.category] || '';
          const regLevelLabel = regionLevelMap[item.regionLevel] || '';
          const tagHtml = [
            \`<span class="std-tag std-tag-type">\${stdTypeLabel}</span>\`,
            catLabel ? \`<span class="std-tag std-tag-\${item.category}">\${catLabel}</span>\` : '',
            regLevelLabel ? \`<span class="std-tag std-tag-region">\${regLevelLabel}</span>\` : '',
          ].filter(Boolean).join(' ');

          document.getElementById('detail-title').textContent = item.title || '';
          document.getElementById('detail-tags').innerHTML = tagHtml;

          // \u6807\u51C6\u7B80\u4ECB\uFF08\u4ECE description \u63D0\u53D6\uFF09
          let intro = (item.description || '').replace(/\\s*\u72B6\u6001[\uFF1A:].+$/, '').trim();

          // \u89E3\u6790 content \u4E2D\u7684\u7ED3\u6784\u5316\u6570\u636E\uFF08\u652F\u6301 JSON \u548C HTML \u8868\u683C\u4E24\u79CD\u683C\u5F0F\uFF09
          let infoRows = [];
          const content = (item.content || '').trim();

          if (content.startsWith('{')) {
            try {
              const extraInfo = JSON.parse(content);
              if (extraInfo.intro && !intro) intro = extraInfo.intro;
              infoRows = [
                ['\u82F1\u6587\u540D\u79F0', extraInfo.englishName],
                ['\u66FF\u4EE3\u60C5\u51B5', extraInfo.replacement],
                ['\u4E2D\u6807\u5206\u7C7B', extraInfo.ccs],
                ['ICS\u5206\u7C7B', extraInfo.ics],
                ['\u53D1\u5E03\u90E8\u95E8', item.source || extraInfo.publisher],
                ['\u53D1\u5E03\u65E5\u671F', item.publishDate],
                ['\u5B9E\u65BD\u65E5\u671F', item.effectiveDate],
                ['\u63D0\u51FA\u5355\u4F4D', extraInfo.proposingOrg],
                ['\u5F52\u53E3\u5355\u4F4D', extraInfo.managingOrg],
                ['\u9875\u6570', extraInfo.pages],
                ['\u51FA\u7248\u793E', extraInfo.publishingHouse],
              ].filter(([,v]) => v);
            } catch(e) {}
          } else if (content.includes('<table')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const rows = doc.querySelectorAll('tr');
            rows.forEach(row => {
              const th = row.querySelector('th');
              const td = row.querySelector('td');
              if (th && td) {
                const key = th.textContent.trim();
                let val = td.textContent.trim();
                val = val.replace(/\\s*\u5373\u5C06\u5B9E\u65BD.*$/, '').replace(/\\s*\u73B0\u884C.*$/, '').replace(/\\s*\u5E9F\u6B62.*$/, '').trim();
                if (key === '\u6807\u51C6\u72B6\u6001') return;
                if (key && val) infoRows.push([key, val]);
              }
            });
          }

          // \u5982\u679C content \u89E3\u6790\u4E0D\u5230\u4FE1\u606F\uFF0C\u4ECE\u5B57\u6BB5\u515C\u5E95
          if (infoRows.length === 0) {
            infoRows = [
              ['\u53D1\u5E03\u90E8\u95E8', item.source],
              ['\u53D1\u5E03\u65E5\u671F', item.publishDate],
              ['\u5B9E\u65BD\u65E5\u671F', item.effectiveDate],
            ].filter(([,v]) => v);
          }

          // \u6807\u51C6\u7F16\u53F7\u59CB\u7EC8\u4F5C\u4E3A\u7B2C\u4E00\u884C
          if (item.standardNo && !infoRows.some(([k]) => k === '\u6807\u51C6\u7F16\u53F7' || k === '\u6807\u51C6\u53F7')) {
            infoRows.unshift(['\u6807\u51C6\u7F16\u53F7', item.standardNo]);
          }

          // \u6807\u51C6\u67E5\u9605\u94FE\u63A5
          const stdPageUrl = item.downloadUrl || item.sourceUrl || '';

          document.getElementById('detail-body').innerHTML = \`
            <!-- \u6807\u51C6\u7B80\u4ECB -->
            \${intro ? \`
            <section class="detail-section">
              <h2 class="detail-section-title">\u6807\u51C6\u7B80\u4ECB</h2>
              <div class="detail-section-content">
                <div class="detail-text">\${intro.replace(/\\n/g, '<br>')}</div>
              </div>
            </section>\` : ''}

            <!-- \u6807\u51C6\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u6807\u51C6\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \${infoRows.length > 0
                  ? \`<div class="info-card-list">
                       \${infoRows.map(([k,v]) => \`
                         <div class="info-card-item">
                           <span class="info-card-label">\${k}</span>
                           <span class="info-card-value">\${v}</span>
                         </div>\`).join('')}
                     </div>\`
                  : '<p class="detail-empty">\u6682\u65E0\u6807\u51C6\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u6807\u51C6\u67E5\u9605 -->
            \${stdPageUrl ? \`
            <section class="detail-section">
              <h2 class="detail-section-title">\u6807\u51C6\u67E5\u9605</h2>
              <div class="detail-section-content">
                <div class="detail-actions">
                  <a href="\${stdPageUrl}" target="_blank" rel="noopener" class="detail-action-btn btn-preview">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    \u5728\u7EBF\u9884\u89C8/\u4E0B\u8F7D\u6807\u51C6
                  </a>
                </div>
              </div>
            </section>\` : ''}
          \`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u6807\u51C6</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `], [" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/standards/">\u56FD\u6807\u5730\u6807</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div id="detail-tags" style="margin-bottom: 16px;"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';

    const categoryMap = { safety: '\u5B89\u5168', environment: '\u73AF\u4FDD', occupational_health: '\u804C\u4E1A\u5065\u5EB7' };
    const regionLevelMap = { national: '\u56FD\u5BB6', provincial: '\u7701', municipal: '\u5E02' };

    function getStdTypeLabel(item) {
      const no = (item.standardNo || '').toUpperCase().trim();
      if (/^GB/.test(no)) return '\u56FD\u6807';
      if (/^DB/.test(no)) return '\u5730\u6807';
      return '\u884C\u6807';
    }

    async function loadDetail() {
      try {
        // \u6807\u51C6\u6570\u636E\u73B0\u5728\u5168\u5728 standards \u96C6\u5408
        const res = await fetch(\\\`\\\${API}/standards?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1\\\`);
        const json = await res.json();
        const item = json.data?.[0];

        if (item) {
          const stdTypeLabel = getStdTypeLabel(item);
          const catLabel = categoryMap[item.category] || '';
          const regLevelLabel = regionLevelMap[item.regionLevel] || '';
          const tagHtml = [
            \\\`<span class="std-tag std-tag-type">\\\${stdTypeLabel}</span>\\\`,
            catLabel ? \\\`<span class="std-tag std-tag-\\\${item.category}">\\\${catLabel}</span>\\\` : '',
            regLevelLabel ? \\\`<span class="std-tag std-tag-region">\\\${regLevelLabel}</span>\\\` : '',
          ].filter(Boolean).join(' ');

          document.getElementById('detail-title').textContent = item.title || '';
          document.getElementById('detail-tags').innerHTML = tagHtml;

          // \u6807\u51C6\u7B80\u4ECB\uFF08\u4ECE description \u63D0\u53D6\uFF09
          let intro = (item.description || '').replace(/\\\\s*\u72B6\u6001[\uFF1A:].+$/, '').trim();

          // \u89E3\u6790 content \u4E2D\u7684\u7ED3\u6784\u5316\u6570\u636E\uFF08\u652F\u6301 JSON \u548C HTML \u8868\u683C\u4E24\u79CD\u683C\u5F0F\uFF09
          let infoRows = [];
          const content = (item.content || '').trim();

          if (content.startsWith('{')) {
            try {
              const extraInfo = JSON.parse(content);
              if (extraInfo.intro && !intro) intro = extraInfo.intro;
              infoRows = [
                ['\u82F1\u6587\u540D\u79F0', extraInfo.englishName],
                ['\u66FF\u4EE3\u60C5\u51B5', extraInfo.replacement],
                ['\u4E2D\u6807\u5206\u7C7B', extraInfo.ccs],
                ['ICS\u5206\u7C7B', extraInfo.ics],
                ['\u53D1\u5E03\u90E8\u95E8', item.source || extraInfo.publisher],
                ['\u53D1\u5E03\u65E5\u671F', item.publishDate],
                ['\u5B9E\u65BD\u65E5\u671F', item.effectiveDate],
                ['\u63D0\u51FA\u5355\u4F4D', extraInfo.proposingOrg],
                ['\u5F52\u53E3\u5355\u4F4D', extraInfo.managingOrg],
                ['\u9875\u6570', extraInfo.pages],
                ['\u51FA\u7248\u793E', extraInfo.publishingHouse],
              ].filter(([,v]) => v);
            } catch(e) {}
          } else if (content.includes('<table')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const rows = doc.querySelectorAll('tr');
            rows.forEach(row => {
              const th = row.querySelector('th');
              const td = row.querySelector('td');
              if (th && td) {
                const key = th.textContent.trim();
                let val = td.textContent.trim();
                val = val.replace(/\\\\s*\u5373\u5C06\u5B9E\u65BD.*$/, '').replace(/\\\\s*\u73B0\u884C.*$/, '').replace(/\\\\s*\u5E9F\u6B62.*$/, '').trim();
                if (key === '\u6807\u51C6\u72B6\u6001') return;
                if (key && val) infoRows.push([key, val]);
              }
            });
          }

          // \u5982\u679C content \u89E3\u6790\u4E0D\u5230\u4FE1\u606F\uFF0C\u4ECE\u5B57\u6BB5\u515C\u5E95
          if (infoRows.length === 0) {
            infoRows = [
              ['\u53D1\u5E03\u90E8\u95E8', item.source],
              ['\u53D1\u5E03\u65E5\u671F', item.publishDate],
              ['\u5B9E\u65BD\u65E5\u671F', item.effectiveDate],
            ].filter(([,v]) => v);
          }

          // \u6807\u51C6\u7F16\u53F7\u59CB\u7EC8\u4F5C\u4E3A\u7B2C\u4E00\u884C
          if (item.standardNo && !infoRows.some(([k]) => k === '\u6807\u51C6\u7F16\u53F7' || k === '\u6807\u51C6\u53F7')) {
            infoRows.unshift(['\u6807\u51C6\u7F16\u53F7', item.standardNo]);
          }

          // \u6807\u51C6\u67E5\u9605\u94FE\u63A5
          const stdPageUrl = item.downloadUrl || item.sourceUrl || '';

          document.getElementById('detail-body').innerHTML = \\\`
            <!-- \u6807\u51C6\u7B80\u4ECB -->
            \\\${intro ? \\\`
            <section class="detail-section">
              <h2 class="detail-section-title">\u6807\u51C6\u7B80\u4ECB</h2>
              <div class="detail-section-content">
                <div class="detail-text">\\\${intro.replace(/\\\\n/g, '<br>')}</div>
              </div>
            </section>\\\` : ''}

            <!-- \u6807\u51C6\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u6807\u51C6\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \\\${infoRows.length > 0
                  ? \\\`<div class="info-card-list">
                       \\\${infoRows.map(([k,v]) => \\\`
                         <div class="info-card-item">
                           <span class="info-card-label">\\\${k}</span>
                           <span class="info-card-value">\\\${v}</span>
                         </div>\\\`).join('')}
                     </div>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u6807\u51C6\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u6807\u51C6\u67E5\u9605 -->
            \\\${stdPageUrl ? \\\`
            <section class="detail-section">
              <h2 class="detail-section-title">\u6807\u51C6\u67E5\u9605</h2>
              <div class="detail-section-content">
                <div class="detail-actions">
                  <a href="\\\${stdPageUrl}" target="_blank" rel="noopener" class="detail-action-btn btn-preview">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    \u5728\u7EBF\u9884\u89C8/\u4E0B\u8F7D\u6807\u51C6
                  </a>
                </div>
              </div>
            </section>\\\` : ''}
          \\\`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u6807\u51C6</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `])), maybeRenderHead(), renderComponent($$result2, "PageComment", $$PageComment, { "pageUrl": `/standards/${slug}` }), defineScriptVars({ slug })) })}`;
}, "/tmp/ehs-site/src/pages/standards/[slug]/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/standards/[slug]/index.astro";
const $$url = "/standards/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
