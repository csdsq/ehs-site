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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u7559\u8A00\u8BE6\u60C5", "currentPath": "/messages/" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/messages/">\u7559\u8A00\u677F</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div class="detail-meta-flat" id="detail-meta"></div> </div> <div class="container"> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    const TOKEN = '2f3b49e0adab57651579bc408d265c4d417d7826aa393a5d21a0fcced8de390536302b741438a36368e8bee686b9e36ec792da4d6025205367bcfe1a78abf7532937e2cddeb7b3521aff305d120983bded91ee91549905e557fc81f21d437c83806628d59d92c9c7a3b2b75aa1f298f4b0730c480d1e09f543d05bd434dbe2df';
    let currentItem = null;

    async function loadDetail() {
      try {
        let res = await fetch(\`\${API}/messages?filters[slug][$eq]=\${slug}&pagination[pageSize]=1&populate=*\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\`\${API}/messages/\${slug}?populate=*\`);
          json = await res.json();
          item = json.data;
        }
        if (!item) {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u7559\u8A00</div>';
          return;
        }
        currentItem = item;

        document.getElementById('detail-title').textContent = item.title || '';
        document.getElementById('detail-meta').innerHTML = [
          item.author ? \`<span>\u7559\u8A00\u4EBA\uFF1A\${item.author}</span>\` : '<span>\u6E38\u5BA2</span>',
          item.category ? \`<span>\${item.category}</span>\` : '',
          item.publishDate ? \`<span>\${item.publishDate}</span>\` : '',
        ].filter(Boolean).join('');

        const replies = Array.isArray(item.replies) ? item.replies : [];
        const adminReplies = Array.isArray(item.adminReplies) ? item.adminReplies : [];

        document.getElementById('detail-body').innerHTML = \`
          <!-- \u7559\u8A00\u5185\u5BB9 -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u7559\u8A00\u5185\u5BB9</h2>
            <div class="detail-section-content">
              <div class="msg-bubble msg-guest">
                <div class="msg-author">\${item.author || '\u6E38\u5BA2'}</div>
                <div class="msg-text">\${item.content || ''}</div>
                <div class="msg-time">\${item.publishDate || ''}</div>
              </div>
            </div>
          </section>

          <!-- \u8BBF\u5BA2\u56DE\u590D -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u{1F4AC} \u8BBF\u5BA2\u56DE\u590D (\${replies.length})</h2>
            <div class="detail-section-content" id="visitor-replies">
              \${replies.length > 0
                ? replies.map(r => \`
                    <div class="msg-bubble msg-guest">
                      <div class="msg-author">\${r.author || '\u6E38\u5BA2'}</div>
                      <div class="msg-text">\${r.content || ''}</div>
                      <div class="msg-time">\${r.date || ''}</div>
                    </div>\`).join('')
                : '<p class="detail-empty">\u6682\u65E0\u56DE\u590D</p>'}
            </div>
          </section>

          <!-- \u7BA1\u7406\u5458\u56DE\u590D -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u{1F6E1} \u7BA1\u7406\u5458\u56DE\u590D (\${adminReplies.length})</h2>
            <div class="detail-section-content" id="admin-replies">
              \${adminReplies.length > 0
                ? adminReplies.map(r => \`
                    <div class="msg-bubble msg-admin">
                      <div class="msg-author">\u7BA1\u7406\u5458</div>
                      <div class="msg-text">\${r.content || ''}</div>
                      <div class="msg-time">\${r.date || ''}</div>
                    </div>\`).join('')
                : '<p class="detail-empty">\u6682\u65E0\u7BA1\u7406\u5458\u56DE\u590D</p>'}
            </div>
          </section>

          <!-- \u56DE\u590D\u8868\u5355 -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u270D\uFE0F \u56DE\u590D\u7559\u8A00</h2>
            <div class="detail-section-content">
              <form id="reply-form" class="msg-form">
                <div class="msg-form-row" style="display:flex;gap:12px;">
                  <input type="text" id="reply-author" placeholder="\u4F60\u7684\u6635\u79F0\uFF08\u9009\u586B\uFF09" class="msg-input" style="flex:1;" />
                  <select id="reply-type" class="msg-input" style="flex:1;">
                    <option value="visitor">\u8BBF\u5BA2\u56DE\u590D</option>
                    <option value="admin">\u7BA1\u7406\u5458\u56DE\u590D</option>
                  </select>
                </div>
                <div id="admin-key-row" class="msg-form-row" style="display:none;">
                  <input type="password" id="admin-key" placeholder="\u7BA1\u7406\u53E3\u4EE4" class="msg-input" />
                </div>
                <div class="msg-form-row">
                  <textarea id="reply-content" placeholder="\u8F93\u5165\u56DE\u590D\u5185\u5BB9..." class="msg-textarea" rows="4"></textarea>
                </div>
                <button type="submit" class="detail-action-btn">\u63D0\u4EA4\u56DE\u590D</button>
                <div id="reply-status" style="margin-top:8px;font-size:13px;"></div>
              </form>
            </div>
          </section>
        \`;

        // \u7BA1\u7406\u5458\u56DE\u590D\u6A21\u5F0F\u5207\u6362
        const typeSelect = document.getElementById('reply-type');
        const adminKeyRow = document.getElementById('admin-key-row');
        if (typeSelect) {
          typeSelect.addEventListener('change', () => {
            adminKeyRow.style.display = typeSelect.value === 'admin' ? 'block' : 'none';
          });
        }

        // \u7ED1\u5B9A\u56DE\u590D\u8868\u5355
        const form = document.getElementById('reply-form');
        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const author = document.getElementById('reply-author').value.trim() || '\u6E38\u5BA2';
            const content = document.getElementById('reply-content').value.trim();
            const replyType = document.getElementById('reply-type').value;

            if (!content) {
              document.getElementById('reply-status').textContent = '\u8BF7\u8F93\u5165\u56DE\u590D\u5185\u5BB9';
              document.getElementById('reply-status').style.color = '#e63946';
              return;
            }

            const now = new Date();
            const dateStr = \`\${now.getFullYear()}-\${String(now.getMonth()+1).padStart(2,'0')}-\${String(now.getDate()).padStart(2,'0')}\`;
            const newReply = { author, content, date: dateStr };

            try {
              // \u83B7\u53D6\u5F53\u524Dmessage\u7684\u6700\u65B0\u6570\u636E
              const freshRes = await fetch(\`\${API}/messages?filters[slug][$eq]=\${slug}&pagination[pageSize]=1&populate=*\`);
              const freshJson = await freshRes.json();
              const freshItem = freshJson.data?.[0];
              if (!freshItem) throw new Error('\u7559\u8A00\u4E0D\u5B58\u5728');

              let fieldName, existing;
              if (replyType === 'admin') {
                const adminKey = document.getElementById('admin-key').value.trim();
                if (adminKey !== 'ehs2026') {
                  document.getElementById('reply-status').textContent = '\u7BA1\u7406\u53E3\u4EE4\u4E0D\u6B63\u786E';
                  document.getElementById('reply-status').style.color = '#e63946';
                  return;
                }
                fieldName = 'adminReplies';
                existing = Array.isArray(freshItem.adminReplies) ? freshItem.adminReplies : [];
              } else {
                fieldName = 'replies';
                existing = Array.isArray(freshItem.replies) ? freshItem.replies : [];
              }

              existing.push(newReply);

              const updateRes = await fetch(\`\${API}/messages/\${freshItem.documentId}\`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': \`Bearer \${TOKEN}\`
                },
                body: JSON.stringify({
                  data: { [fieldName]: existing }
                })
              });

              if (updateRes.ok) {
                document.getElementById('reply-status').textContent = '\u56DE\u590D\u6210\u529F\uFF01';
                document.getElementById('reply-status').style.color = '#2a9d8f';
                document.getElementById('reply-content').value = '';

                // If admin reply and message has email, send notification
                if (replyType === 'admin' && freshItem.email) {
                  try {
                    await fetch('/api/send-notification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        adminKey: document.getElementById('admin-key').value.trim(),
                        toEmail: freshItem.email,
                        toName: freshItem.author || '',
                        messageTitle: freshItem.title || '',
                        replyContent: content,
                        messageUrl: window.location.href
                      })
                    });
                  } catch (emailErr) {
                    console.warn('Email notification failed:', emailErr);
                  }
                }

                setTimeout(() => loadDetail(), 800);
              } else {
                const err = await updateRes.json();
                throw new Error(err.error?.message || '\u63D0\u4EA4\u5931\u8D25');
              }
            } catch (err) {
              document.getElementById('reply-status').textContent = '\u63D0\u4EA4\u5931\u8D25\uFF1A' + (err.message || '\u8BF7\u7A0D\u540E\u91CD\u8BD5');
              document.getElementById('reply-status').style.color = '#e63946';
            }
          });
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `], [" ", '<div class="container"> <div class="detail-breadcrumb-flat"> <a href="/">\u9996\u9875</a> / <a href="/messages/">\u7559\u8A00\u677F</a> / \u8BE6\u60C5\n</div> <h1 class="detail-title-flat" id="detail-title">\u52A0\u8F7D\u4E2D...</h1> <div class="detail-meta-flat" id="detail-meta"></div> </div> <div class="container"> <div class="detail-body" id="detail-body"> <div class="loading">\u52A0\u8F7D\u4E2D...</div> </div> ', " </div> <script>(function(){", `
    const API = '/api/strapi';
    const TOKEN = '2f3b49e0adab57651579bc408d265c4d417d7826aa393a5d21a0fcced8de390536302b741438a36368e8bee686b9e36ec792da4d6025205367bcfe1a78abf7532937e2cddeb7b3521aff305d120983bded91ee91549905e557fc81f21d437c83806628d59d92c9c7a3b2b75aa1f298f4b0730c480d1e09f543d05bd434dbe2df';
    let currentItem = null;

    async function loadDetail() {
      try {
        let res = await fetch(\\\`\\\${API}/messages?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1&populate=*\\\`);
        let json = await res.json();
        let item = json.data?.[0];
        if (!item) {
          res = await fetch(\\\`\\\${API}/messages/\\\${slug}?populate=*\\\`);
          json = await res.json();
          item = json.data;
        }
        if (!item) {
          document.getElementById('detail-body').innerHTML = '<div class="empty">\u672A\u627E\u5230\u8BE5\u7559\u8A00</div>';
          return;
        }
        currentItem = item;

        document.getElementById('detail-title').textContent = item.title || '';
        document.getElementById('detail-meta').innerHTML = [
          item.author ? \\\`<span>\u7559\u8A00\u4EBA\uFF1A\\\${item.author}</span>\\\` : '<span>\u6E38\u5BA2</span>',
          item.category ? \\\`<span>\\\${item.category}</span>\\\` : '',
          item.publishDate ? \\\`<span>\\\${item.publishDate}</span>\\\` : '',
        ].filter(Boolean).join('');

        const replies = Array.isArray(item.replies) ? item.replies : [];
        const adminReplies = Array.isArray(item.adminReplies) ? item.adminReplies : [];

        document.getElementById('detail-body').innerHTML = \\\`
          <!-- \u7559\u8A00\u5185\u5BB9 -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u7559\u8A00\u5185\u5BB9</h2>
            <div class="detail-section-content">
              <div class="msg-bubble msg-guest">
                <div class="msg-author">\\\${item.author || '\u6E38\u5BA2'}</div>
                <div class="msg-text">\\\${item.content || ''}</div>
                <div class="msg-time">\\\${item.publishDate || ''}</div>
              </div>
            </div>
          </section>

          <!-- \u8BBF\u5BA2\u56DE\u590D -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u{1F4AC} \u8BBF\u5BA2\u56DE\u590D (\\\${replies.length})</h2>
            <div class="detail-section-content" id="visitor-replies">
              \\\${replies.length > 0
                ? replies.map(r => \\\`
                    <div class="msg-bubble msg-guest">
                      <div class="msg-author">\\\${r.author || '\u6E38\u5BA2'}</div>
                      <div class="msg-text">\\\${r.content || ''}</div>
                      <div class="msg-time">\\\${r.date || ''}</div>
                    </div>\\\`).join('')
                : '<p class="detail-empty">\u6682\u65E0\u56DE\u590D</p>'}
            </div>
          </section>

          <!-- \u7BA1\u7406\u5458\u56DE\u590D -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u{1F6E1} \u7BA1\u7406\u5458\u56DE\u590D (\\\${adminReplies.length})</h2>
            <div class="detail-section-content" id="admin-replies">
              \\\${adminReplies.length > 0
                ? adminReplies.map(r => \\\`
                    <div class="msg-bubble msg-admin">
                      <div class="msg-author">\u7BA1\u7406\u5458</div>
                      <div class="msg-text">\\\${r.content || ''}</div>
                      <div class="msg-time">\\\${r.date || ''}</div>
                    </div>\\\`).join('')
                : '<p class="detail-empty">\u6682\u65E0\u7BA1\u7406\u5458\u56DE\u590D</p>'}
            </div>
          </section>

          <!-- \u56DE\u590D\u8868\u5355 -->
          <section class="detail-section">
            <h2 class="detail-section-title">\u270D\uFE0F \u56DE\u590D\u7559\u8A00</h2>
            <div class="detail-section-content">
              <form id="reply-form" class="msg-form">
                <div class="msg-form-row" style="display:flex;gap:12px;">
                  <input type="text" id="reply-author" placeholder="\u4F60\u7684\u6635\u79F0\uFF08\u9009\u586B\uFF09" class="msg-input" style="flex:1;" />
                  <select id="reply-type" class="msg-input" style="flex:1;">
                    <option value="visitor">\u8BBF\u5BA2\u56DE\u590D</option>
                    <option value="admin">\u7BA1\u7406\u5458\u56DE\u590D</option>
                  </select>
                </div>
                <div id="admin-key-row" class="msg-form-row" style="display:none;">
                  <input type="password" id="admin-key" placeholder="\u7BA1\u7406\u53E3\u4EE4" class="msg-input" />
                </div>
                <div class="msg-form-row">
                  <textarea id="reply-content" placeholder="\u8F93\u5165\u56DE\u590D\u5185\u5BB9..." class="msg-textarea" rows="4"></textarea>
                </div>
                <button type="submit" class="detail-action-btn">\u63D0\u4EA4\u56DE\u590D</button>
                <div id="reply-status" style="margin-top:8px;font-size:13px;"></div>
              </form>
            </div>
          </section>
        \\\`;

        // \u7BA1\u7406\u5458\u56DE\u590D\u6A21\u5F0F\u5207\u6362
        const typeSelect = document.getElementById('reply-type');
        const adminKeyRow = document.getElementById('admin-key-row');
        if (typeSelect) {
          typeSelect.addEventListener('change', () => {
            adminKeyRow.style.display = typeSelect.value === 'admin' ? 'block' : 'none';
          });
        }

        // \u7ED1\u5B9A\u56DE\u590D\u8868\u5355
        const form = document.getElementById('reply-form');
        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const author = document.getElementById('reply-author').value.trim() || '\u6E38\u5BA2';
            const content = document.getElementById('reply-content').value.trim();
            const replyType = document.getElementById('reply-type').value;

            if (!content) {
              document.getElementById('reply-status').textContent = '\u8BF7\u8F93\u5165\u56DE\u590D\u5185\u5BB9';
              document.getElementById('reply-status').style.color = '#e63946';
              return;
            }

            const now = new Date();
            const dateStr = \\\`\\\${now.getFullYear()}-\\\${String(now.getMonth()+1).padStart(2,'0')}-\\\${String(now.getDate()).padStart(2,'0')}\\\`;
            const newReply = { author, content, date: dateStr };

            try {
              // \u83B7\u53D6\u5F53\u524Dmessage\u7684\u6700\u65B0\u6570\u636E
              const freshRes = await fetch(\\\`\\\${API}/messages?filters[slug][$eq]=\\\${slug}&pagination[pageSize]=1&populate=*\\\`);
              const freshJson = await freshRes.json();
              const freshItem = freshJson.data?.[0];
              if (!freshItem) throw new Error('\u7559\u8A00\u4E0D\u5B58\u5728');

              let fieldName, existing;
              if (replyType === 'admin') {
                const adminKey = document.getElementById('admin-key').value.trim();
                if (adminKey !== 'ehs2026') {
                  document.getElementById('reply-status').textContent = '\u7BA1\u7406\u53E3\u4EE4\u4E0D\u6B63\u786E';
                  document.getElementById('reply-status').style.color = '#e63946';
                  return;
                }
                fieldName = 'adminReplies';
                existing = Array.isArray(freshItem.adminReplies) ? freshItem.adminReplies : [];
              } else {
                fieldName = 'replies';
                existing = Array.isArray(freshItem.replies) ? freshItem.replies : [];
              }

              existing.push(newReply);

              const updateRes = await fetch(\\\`\\\${API}/messages/\\\${freshItem.documentId}\\\`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': \\\`Bearer \\\${TOKEN}\\\`
                },
                body: JSON.stringify({
                  data: { [fieldName]: existing }
                })
              });

              if (updateRes.ok) {
                document.getElementById('reply-status').textContent = '\u56DE\u590D\u6210\u529F\uFF01';
                document.getElementById('reply-status').style.color = '#2a9d8f';
                document.getElementById('reply-content').value = '';

                // If admin reply and message has email, send notification
                if (replyType === 'admin' && freshItem.email) {
                  try {
                    await fetch('/api/send-notification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        adminKey: document.getElementById('admin-key').value.trim(),
                        toEmail: freshItem.email,
                        toName: freshItem.author || '',
                        messageTitle: freshItem.title || '',
                        replyContent: content,
                        messageUrl: window.location.href
                      })
                    });
                  } catch (emailErr) {
                    console.warn('Email notification failed:', emailErr);
                  }
                }

                setTimeout(() => loadDetail(), 800);
              } else {
                const err = await updateRes.json();
                throw new Error(err.error?.message || '\u63D0\u4EA4\u5931\u8D25');
              }
            } catch (err) {
              document.getElementById('reply-status').textContent = '\u63D0\u4EA4\u5931\u8D25\uFF1A' + (err.message || '\u8BF7\u7A0D\u540E\u91CD\u8BD5');
              document.getElementById('reply-status').style.color = '#e63946';
            }
          });
        }
      } catch (e) {
        document.getElementById('detail-body').innerHTML = '<div class="empty">\u52A0\u8F7D\u5931\u8D25</div>';
      }
    }
    loadDetail();
  })();<\/script> `])), maybeRenderHead(), renderComponent($$result2, "PageComment", $$PageComment, { "pageUrl": `/messages/${slug}` }), defineScriptVars({ slug })) })}`;
}, "/tmp/ehs-site/src/pages/messages/[slug]/index.astro", void 0);

const $$file = "/tmp/ehs-site/src/pages/messages/[slug]/index.astro";
const $$url = "/messages/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
