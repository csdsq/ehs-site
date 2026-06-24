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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u4E8B\u6545\u62A5\u544A\u8BE6\u60C5", "currentPath": "/accidents/" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/accidents/">\u4E8B\u6545\u62A5\u544A</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div id="detail-tags" style="margin-bottom: 16px;"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        let res = await fetch(\`\${API}/accidents?filters[slug][$eq]=\${slug}&pagination[pageSize]=1\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\`\${API}/accidents/\${slug}\`);
          json = await res.json();
          item = json.data;
        }
        if (item) {
          document.getElementById('detail-title').textContent = item.title || '';

          // \u6620\u5C04\u6807\u7B7E
          const severityMap = { major: '\u7279\u5927', larger: '\u91CD\u5927', general: '\u8F83\u5927', minor: '\u4E00\u822C' };
          const categoryMap = {
            suffocation: '\u7A92\u606F', fall: '\u9AD8\u5904\u5760\u843D', gas_leak: '\u71C3\u6C14\u6CC4\u6F0F',
            traffic: '\u4EA4\u901A', poisoning_suffocation: '\u4E2D\u6BD2\u7A92\u606F',
            falling_object: '\u7269\u4F53\u6253\u51FB', collapse: '\u574D\u584C', crane: '\u8D77\u91CD\u4F24\u5BB3',
            other_injury: '\u5176\u4ED6\u4F24\u5BB3', fire: '\u706B\u707E', explosion: '\u7206\u70B8',
            electric_shock: '\u89E6\u7535', mechanical: '\u673A\u68B0\u4F24\u5BB3', drowning: '\u6DF9\u6EBA'
          };
          const sevClassMap = { major: 'acc-sev-major', larger: 'acc-sev-larger', general: 'acc-sev-general', minor: 'acc-sev-minor' };
          const sevLabel = severityMap[item.severity] || item.severity || '';
          const catLabel = categoryMap[item.category] || item.category || '';
          const provLabel = item.province || '';
          const tags = [];
          if (sevLabel) tags.push(\`<span class="acc-tag \${sevClassMap[item.severity] || 'acc-sev-general'}">\${sevLabel}</span>\`);
          if (catLabel) tags.push(\`<span class="acc-tag acc-tag-cat">\${catLabel}</span>\`);
          if (provLabel) tags.push(\`<span class="acc-tag acc-tag-prov">\${provLabel}</span>\`);
          document.getElementById('detail-tags').innerHTML = tags.join(' ');

          // \u57FA\u672C\u4FE1\u606F\u8868\u683C
          const infoRows = [
            ['\u4E8B\u6545\u540D\u79F0', item.title],
            ['\u4E8B\u6545\u7C7B\u578B', catLabel || item.category],
            ['\u4E8B\u6545\u7B49\u7EA7', sevLabel || item.severity],
            ['\u53D1\u751F\u7701\u4EFD', provLabel || '-'],
            ['\u53D1\u751F\u5730\u70B9', item.location],
            ['\u53D1\u751F\u65F6\u95F4', item.date],
            ['\u4F24\u4EA1\u60C5\u51B5', item.casualties],
            ['\u6D89\u53CA\u4F01\u4E1A', item.company],
            ['\u76F4\u63A5\u7ECF\u6D4E\u635F\u5931', item.economicLoss],
          ].filter(([,v]) => v && v !== '-');

          document.getElementById('detail-body').innerHTML = \`
            <!-- \u57FA\u672C\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u57FA\u672C\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \${infoRows.length > 0
                  ? \`<table class="detail-info-table">
                       \${infoRows.map(([k,v]) => \`<tr><td class="info-label">\${k}</td><td class="info-value">\${v}</td></tr>\`).join('')}
                     </table>\`
                  : '<p class="detail-empty">\u6682\u65E0\u57FA\u672C\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u4E8B\u6545\u7ECF\u8FC7 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u4E8B\u6545\u7ECF\u8FC7</h2>
              <div class="detail-section-content">
                \${item.content
                  ? \`<div class="detail-text">\${item.content}</div>\`
                  : '<p class="detail-empty">\u6682\u65E0\u4E8B\u6545\u7ECF\u8FC7</p>'}
              </div>
            </section>

            <!-- \u4E8B\u6545\u539F\u56E0 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u4E8B\u6545\u539F\u56E0</h2>
              <div class="detail-section-content">
                \${item.causes
                  ? \`<div class="detail-text">\${item.causes}</div>\`
                  : '<p class="detail-empty">\u6682\u65E0\u539F\u56E0\u5206\u6790</p>'}
              </div>
            </section>

            <!-- \u6539\u5584\u63AA\u65BD -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u6539\u5584\u63AA\u65BD</h2>
              <div class="detail-section-content">
                \${item.suggestions
                  ? \`<div class="detail-text">\${item.suggestions}</div>\`
                  : '<p class="detail-empty">\u6682\u65E0\u6539\u5584\u63AA\u65BD</p>'}
              </div>
            </section>

            <!-- \u5904\u7406\u7ED3\u679C -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u5904\u7406\u7ED3\u679C</h2>
              <div class="detail-section-content">
                \${item.personnelHandling
                  ? \`<div class="detail-text">\${item.personnelHandling}</div>\`
                  : '<p class="detail-empty">\u6682\u65E0\u5904\u7406\u7ED3\u679C</p>'}
              </div>
            </section>

            <!-- \u62A5\u544A\u539F\u6587 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u62A5\u544A\u539F\u6587</h2>
              <div class="detail-section-content">
                \${item.reportUrl || item.downloadUrl
                  ? \`<a href="\${item.reportUrl || item.downloadUrl}" target="_blank" rel="noopener" class="detail-action-btn">\u67E5\u770B\u62A5\u544A\u539F\u6587 &rarr;</a>\`
                  : item.content
                    ? \`<details class="detail-expand" open><summary>\u5C55\u5F00/\u6536\u8D77\u62A5\u544A\u5168\u6587</summary><div class="detail-expand-body">\${item.content}</div></details>\`
                    : '<p class="detail-empty">\u6682\u65E0\u62A5\u544A\u539F\u6587</p>'}
              </div>
            </section>
          \`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u4E8B\u6545\u62A5\u544A</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `], [" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/accidents/">\u4E8B\u6545\u62A5\u544A</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div id="detail-tags" style="margin-bottom: 16px;"></div> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    async function loadDetail() {
      try {
        let res = await fetch(\\\`\\\${API}/accidents?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1\\\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\\\`\\\${API}/accidents/\\\${slug}\\\`);
          json = await res.json();
          item = json.data;
        }
        if (item) {
          document.getElementById('detail-title').textContent = item.title || '';

          // \u6620\u5C04\u6807\u7B7E
          const severityMap = { major: '\u7279\u5927', larger: '\u91CD\u5927', general: '\u8F83\u5927', minor: '\u4E00\u822C' };
          const categoryMap = {
            suffocation: '\u7A92\u606F', fall: '\u9AD8\u5904\u5760\u843D', gas_leak: '\u71C3\u6C14\u6CC4\u6F0F',
            traffic: '\u4EA4\u901A', poisoning_suffocation: '\u4E2D\u6BD2\u7A92\u606F',
            falling_object: '\u7269\u4F53\u6253\u51FB', collapse: '\u574D\u584C', crane: '\u8D77\u91CD\u4F24\u5BB3',
            other_injury: '\u5176\u4ED6\u4F24\u5BB3', fire: '\u706B\u707E', explosion: '\u7206\u70B8',
            electric_shock: '\u89E6\u7535', mechanical: '\u673A\u68B0\u4F24\u5BB3', drowning: '\u6DF9\u6EBA'
          };
          const sevClassMap = { major: 'acc-sev-major', larger: 'acc-sev-larger', general: 'acc-sev-general', minor: 'acc-sev-minor' };
          const sevLabel = severityMap[item.severity] || item.severity || '';
          const catLabel = categoryMap[item.category] || item.category || '';
          const provLabel = item.province || '';
          const tags = [];
          if (sevLabel) tags.push(\\\`<span class="acc-tag \\\${sevClassMap[item.severity] || 'acc-sev-general'}">\\\${sevLabel}</span>\\\`);
          if (catLabel) tags.push(\\\`<span class="acc-tag acc-tag-cat">\\\${catLabel}</span>\\\`);
          if (provLabel) tags.push(\\\`<span class="acc-tag acc-tag-prov">\\\${provLabel}</span>\\\`);
          document.getElementById('detail-tags').innerHTML = tags.join(' ');

          // \u57FA\u672C\u4FE1\u606F\u8868\u683C
          const infoRows = [
            ['\u4E8B\u6545\u540D\u79F0', item.title],
            ['\u4E8B\u6545\u7C7B\u578B', catLabel || item.category],
            ['\u4E8B\u6545\u7B49\u7EA7', sevLabel || item.severity],
            ['\u53D1\u751F\u7701\u4EFD', provLabel || '-'],
            ['\u53D1\u751F\u5730\u70B9', item.location],
            ['\u53D1\u751F\u65F6\u95F4', item.date],
            ['\u4F24\u4EA1\u60C5\u51B5', item.casualties],
            ['\u6D89\u53CA\u4F01\u4E1A', item.company],
            ['\u76F4\u63A5\u7ECF\u6D4E\u635F\u5931', item.economicLoss],
          ].filter(([,v]) => v && v !== '-');

          document.getElementById('detail-body').innerHTML = \\\`
            <!-- \u57FA\u672C\u4FE1\u606F -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u57FA\u672C\u4FE1\u606F</h2>
              <div class="detail-section-content">
                \\\${infoRows.length > 0
                  ? \\\`<table class="detail-info-table">
                       \\\${infoRows.map(([k,v]) => \\\`<tr><td class="info-label">\\\${k}</td><td class="info-value">\\\${v}</td></tr>\\\`).join('')}
                     </table>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u57FA\u672C\u4FE1\u606F</p>'}
              </div>
            </section>

            <!-- \u4E8B\u6545\u7ECF\u8FC7 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u4E8B\u6545\u7ECF\u8FC7</h2>
              <div class="detail-section-content">
                \\\${item.content
                  ? \\\`<div class="detail-text">\\\${item.content}</div>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u4E8B\u6545\u7ECF\u8FC7</p>'}
              </div>
            </section>

            <!-- \u4E8B\u6545\u539F\u56E0 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u4E8B\u6545\u539F\u56E0</h2>
              <div class="detail-section-content">
                \\\${item.causes
                  ? \\\`<div class="detail-text">\\\${item.causes}</div>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u539F\u56E0\u5206\u6790</p>'}
              </div>
            </section>

            <!-- \u6539\u5584\u63AA\u65BD -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u6539\u5584\u63AA\u65BD</h2>
              <div class="detail-section-content">
                \\\${item.suggestions
                  ? \\\`<div class="detail-text">\\\${item.suggestions}</div>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u6539\u5584\u63AA\u65BD</p>'}
              </div>
            </section>

            <!-- \u5904\u7406\u7ED3\u679C -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u5904\u7406\u7ED3\u679C</h2>
              <div class="detail-section-content">
                \\\${item.personnelHandling
                  ? \\\`<div class="detail-text">\\\${item.personnelHandling}</div>\\\`
                  : '<p class="detail-empty">\u6682\u65E0\u5904\u7406\u7ED3\u679C</p>'}
              </div>
            </section>

            <!-- \u62A5\u544A\u539F\u6587 -->
            <section class="detail-section">
              <h2 class="detail-section-title">\u62A5\u544A\u539F\u6587</h2>
              <div class="detail-section-content">
                \\\${item.reportUrl || item.downloadUrl
                  ? \\\`<a href="\\\${item.reportUrl || item.downloadUrl}" target="_blank" rel="noopener" class="detail-action-btn">\u67E5\u770B\u62A5\u544A\u539F\u6587 &rarr;</a>\\\`
                  : item.content
                    ? \\\`<details class="detail-expand" open><summary>\u5C55\u5F00/\u6536\u8D77\u62A5\u544A\u5168\u6587</summary><div class="detail-expand-body">\\\${item.content}</div></details>\\\`
                    : '<p class="detail-empty">\u6682\u65E0\u62A5\u544A\u539F\u6587</p>'}
              </div>
            </section>
          \\\`;
        } else {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u4E8B\u6545\u62A5\u544A</div>';
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `])), maybeRenderHead(), renderComponent($$result2, "PageComment", $$PageComment, { "pageUrl": `/accidents/${slug}` }), defineScriptVars({ slug })) })}`;
}, "/tmp/ehs-site/src/pages/accidents/[slug]/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/accidents/[slug]/index.astro";
const $$url = "/accidents/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
