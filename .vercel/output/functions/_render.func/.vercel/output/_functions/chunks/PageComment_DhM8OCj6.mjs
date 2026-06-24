import { O as createAstro, Q as createComponent, a7 as renderTemplate, X as defineScriptVars, _ as maybeRenderHead } from './astro/server_Jx1ZJCLd.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://hser.ren");
const $$PageComment = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageComment;
  const { pageUrl, pageTitle = "" } = Astro2.props;
  return renderTemplate(_a || (_a = __template(["", '<div class="comment-section" id="comment-section"> <h2 class="detail-section-title">\u{1F4AC} \u8BC4\u8BBA\u533A</h2> <div id="comment-form" class="comment-form"> <div class="comment-form-avatar"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> </div> <div class="comment-form-body"> <div class="comment-form-row"> <input type="text" id="comment-nickname" placeholder="\u6635\u79F0\uFF08\u5FC5\u586B\uFF09" required class="comment-input comment-input-half"> <input type="email" id="comment-email" placeholder="\u90AE\u7BB1\uFF08\u5FC5\u586B\uFF0C\u7528\u4E8E\u63A5\u6536\u56DE\u590D\u901A\u77E5\uFF09" required class="comment-input comment-input-half"> </div> <textarea id="comment-content" placeholder="\u5199\u4E0B\u4F60\u7684\u8BC4\u8BBA..." rows="3" required class="comment-textarea"></textarea> <div class="comment-form-footer"> <span class="comment-form-hint">\u652F\u6301\u56DE\u590D \xB7 \u90AE\u7BB1\u4EC5\u7528\u4E8E\u63A5\u6536\u56DE\u590D\u901A\u77E5</span> <button id="comment-submit" class="comment-submit-btn">\u53D1\u8868\u8BC4\u8BBA</button> </div> </div> </div> <div id="comment-list" class="comment-list"> <div class="comment-loading">\u52A0\u8F7D\u8BC4\u8BBA\u4E2D...</div> </div> </div> <script>(function(){', `
  const API = '/api/strapi';

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return '\u521A\u521A';
    if (diff < 3600) return Math.floor(diff / 60) + '\u5206\u949F\u524D';
    if (diff < 86400) return Math.floor(diff / 3600) + '\u5C0F\u65F6\u524D';
    if (diff < 2592000) return Math.floor(diff / 86400) + '\u5929\u524D';
    return d.toLocaleDateString('zh-CN');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getAvatarColor() {
    return '#5B8FF9';
  }

  function renderComment(item, depth = 0) {
    const isAdmin = item.isAdminReply;
    const adminBadge = isAdmin ? '<span class="comment-admin-badge">\u2726 \u7BA1\u7406\u5458</span>' : '';
    const replyClass = depth > 0 ? 'comment-item-reply' : '';
    const initial = escapeHtml(item.nickname).charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(item.nickname);
    const avatarHtml = \`<div class="comment-avatar" style="background:\${avatarColor}">\${initial}</div>\`;
    return \`
      <div class="comment-item \${replyClass}" data-id="\${item.id}">
        <div class="comment-main">
          \${avatarHtml}
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-nickname">\${escapeHtml(item.nickname)}\${adminBadge}</span>
              <span class="comment-time">\${timeAgo(item.createdAt)}</span>
            </div>
            <div class="comment-content">\${escapeHtml(item.content)}</div>
            <div class="comment-actions">
              <button class="comment-reply-btn" data-id="\${item.id}" data-nickname="\${escapeHtml(item.nickname)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                \u56DE\u590D
              </button>
            </div>
          </div>
        </div>
        <div class="comment-reply-form" id="reply-form-\${item.id}" style="display:none;">
          <input type="text" class="comment-input reply-nickname" placeholder="\u6635\u79F0\uFF08\u5FC5\u586B\uFF09" />
          <input type="email" class="comment-input reply-email" placeholder="\u90AE\u7BB1\uFF08\u5FC5\u586B\uFF09" />
          <textarea class="comment-textarea reply-content" rows="2" placeholder="\u56DE\u590D \${escapeHtml(item.nickname)}..."></textarea>
          <div class="reply-form-actions">
            <button class="comment-submit-btn reply-submit" data-parent-id="\${item.id}">\u56DE\u590D</button>
            <button class="comment-cancel-btn reply-cancel">\u53D6\u6D88</button>
          </div>
        </div>
      </div>\`;
  }

  async function loadComments() {
    try {
      const encodedUrl = encodeURIComponent(pageUrl);
      const res = await fetch(\`\${API}/comments?filters[pageUrl][$eq]=\${encodedUrl}&sort=createdAt:asc&pagination[pageSize]=100\`);
      const json = await res.json();
      const items = json.data || [];

      const listEl = document.getElementById('comment-list');
      if (!listEl) return;

      if (items.length === 0) {
        listEl.innerHTML = '<div class="comment-empty">\u6682\u65E0\u8BC4\u8BBA\uFF0C\u6765\u53D1\u8868\u7B2C\u4E00\u6761\u5427 \u2728</div>';
        return;
      }

      const rootComments = items.filter(c => !c.parentId || c.parentId === 0);
      const replies = items.filter(c => c.parentId && c.parentId !== 0);

      let html = '';
      for (const root of rootComments) {
        html += renderComment(root, 0);
        const childReplies = replies.filter(r => r.parentId === root.id);
        for (const reply of childReplies) {
          html += renderComment(reply, 1);
        }
      }
      listEl.innerHTML = html;

      listEl.querySelectorAll('.comment-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const form = document.getElementById(\`reply-form-\${id}\`);
          if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
      });

      listEl.querySelectorAll('.reply-submit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const parentId = parseInt(btn.dataset.parentId);
          const form = btn.closest('.comment-reply-form');
          const nickname = form.querySelector('.reply-nickname').value.trim();
          const email = form.querySelector('.reply-email').value.trim();
          const content = form.querySelector('.reply-content').value.trim();
          if (!nickname || !content) { alert('\u8BF7\u586B\u5199\u6635\u79F0\u548C\u56DE\u590D\u5185\u5BB9'); return; }
          if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) { alert('\u8BF7\u586B\u5199\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740'); return; }
          btn.disabled = true;
          btn.textContent = '\u63D0\u4EA4\u4E2D...';
          try {
            const res = await fetch(\`\${API}/comments\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: { nickname, email, content, pageUrl, pageTitle, parentId, isAdminReply: false } })
            });
            if (res.ok) {
              loadComments();
            } else {
              alert('\u56DE\u590D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
              btn.disabled = false;
              btn.textContent = '\u56DE\u590D';
            }
          } catch (e) {
            alert('\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
            btn.disabled = false;
            btn.textContent = '\u56DE\u590D';
          }
        });
      });

      listEl.querySelectorAll('.reply-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.comment-reply-form').style.display = 'none';
        });
      });

    } catch (e) {
      const listEl = document.getElementById('comment-list');
      if (listEl) listEl.innerHTML = '<div class="comment-empty">\u8BC4\u8BBA\u52A0\u8F7D\u5931\u8D25</div>';
    }
  }

  const submitBtn = document.getElementById('comment-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const nickname = document.getElementById('comment-nickname').value.trim();
      const email = document.getElementById('comment-email').value.trim();
      const content = document.getElementById('comment-content').value.trim();
      if (!nickname) { alert('\u8BF7\u586B\u5199\u6635\u79F0'); return; }
      if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) { alert('\u8BF7\u586B\u5199\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740'); return; }
      if (!content) { alert('\u8BF7\u586B\u5199\u8BC4\u8BBA\u5185\u5BB9'); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = '\u63D0\u4EA4\u4E2D...';

      try {
        const res = await fetch(\`\${API}/comments\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { nickname, email, content, pageUrl, pageTitle, parentId: 0, isAdminReply: false }
          })
        });
        if (res.ok) {
          document.getElementById('comment-content').value = '';
          document.getElementById('comment-email').value = '';
          loadComments();
        } else {
          const err = await res.json();
          alert('\u8BC4\u8BBA\u5931\u8D25\uFF1A' + (err.error?.message || '\u8BF7\u7A0D\u540E\u91CD\u8BD5'));
        }
      } catch (e) {
        alert('\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = '\u53D1\u8868\u8BC4\u8BBA';
    });
  }

  loadComments();
})();<\/script> `], ["", '<div class="comment-section" id="comment-section"> <h2 class="detail-section-title">\u{1F4AC} \u8BC4\u8BBA\u533A</h2> <div id="comment-form" class="comment-form"> <div class="comment-form-avatar"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> </div> <div class="comment-form-body"> <div class="comment-form-row"> <input type="text" id="comment-nickname" placeholder="\u6635\u79F0\uFF08\u5FC5\u586B\uFF09" required class="comment-input comment-input-half"> <input type="email" id="comment-email" placeholder="\u90AE\u7BB1\uFF08\u5FC5\u586B\uFF0C\u7528\u4E8E\u63A5\u6536\u56DE\u590D\u901A\u77E5\uFF09" required class="comment-input comment-input-half"> </div> <textarea id="comment-content" placeholder="\u5199\u4E0B\u4F60\u7684\u8BC4\u8BBA..." rows="3" required class="comment-textarea"></textarea> <div class="comment-form-footer"> <span class="comment-form-hint">\u652F\u6301\u56DE\u590D \xB7 \u90AE\u7BB1\u4EC5\u7528\u4E8E\u63A5\u6536\u56DE\u590D\u901A\u77E5</span> <button id="comment-submit" class="comment-submit-btn">\u53D1\u8868\u8BC4\u8BBA</button> </div> </div> </div> <div id="comment-list" class="comment-list"> <div class="comment-loading">\u52A0\u8F7D\u8BC4\u8BBA\u4E2D...</div> </div> </div> <script>(function(){', `
  const API = '/api/strapi';

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return '\u521A\u521A';
    if (diff < 3600) return Math.floor(diff / 60) + '\u5206\u949F\u524D';
    if (diff < 86400) return Math.floor(diff / 3600) + '\u5C0F\u65F6\u524D';
    if (diff < 2592000) return Math.floor(diff / 86400) + '\u5929\u524D';
    return d.toLocaleDateString('zh-CN');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getAvatarColor() {
    return '#5B8FF9';
  }

  function renderComment(item, depth = 0) {
    const isAdmin = item.isAdminReply;
    const adminBadge = isAdmin ? '<span class="comment-admin-badge">\u2726 \u7BA1\u7406\u5458</span>' : '';
    const replyClass = depth > 0 ? 'comment-item-reply' : '';
    const initial = escapeHtml(item.nickname).charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(item.nickname);
    const avatarHtml = \\\`<div class="comment-avatar" style="background:\\\${avatarColor}">\\\${initial}</div>\\\`;
    return \\\`
      <div class="comment-item \\\${replyClass}" data-id="\\\${item.id}">
        <div class="comment-main">
          \\\${avatarHtml}
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-nickname">\\\${escapeHtml(item.nickname)}\\\${adminBadge}</span>
              <span class="comment-time">\\\${timeAgo(item.createdAt)}</span>
            </div>
            <div class="comment-content">\\\${escapeHtml(item.content)}</div>
            <div class="comment-actions">
              <button class="comment-reply-btn" data-id="\\\${item.id}" data-nickname="\\\${escapeHtml(item.nickname)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                \u56DE\u590D
              </button>
            </div>
          </div>
        </div>
        <div class="comment-reply-form" id="reply-form-\\\${item.id}" style="display:none;">
          <input type="text" class="comment-input reply-nickname" placeholder="\u6635\u79F0\uFF08\u5FC5\u586B\uFF09" />
          <input type="email" class="comment-input reply-email" placeholder="\u90AE\u7BB1\uFF08\u5FC5\u586B\uFF09" />
          <textarea class="comment-textarea reply-content" rows="2" placeholder="\u56DE\u590D \\\${escapeHtml(item.nickname)}..."></textarea>
          <div class="reply-form-actions">
            <button class="comment-submit-btn reply-submit" data-parent-id="\\\${item.id}">\u56DE\u590D</button>
            <button class="comment-cancel-btn reply-cancel">\u53D6\u6D88</button>
          </div>
        </div>
      </div>\\\`;
  }

  async function loadComments() {
    try {
      const encodedUrl = encodeURIComponent(pageUrl);
      const res = await fetch(\\\`\\\${API}/comments?filters[pageUrl][$eq]=\\\${encodedUrl}&sort=createdAt:asc&pagination[pageSize]=100\\\`);
      const json = await res.json();
      const items = json.data || [];

      const listEl = document.getElementById('comment-list');
      if (!listEl) return;

      if (items.length === 0) {
        listEl.innerHTML = '<div class="comment-empty">\u6682\u65E0\u8BC4\u8BBA\uFF0C\u6765\u53D1\u8868\u7B2C\u4E00\u6761\u5427 \u2728</div>';
        return;
      }

      const rootComments = items.filter(c => !c.parentId || c.parentId === 0);
      const replies = items.filter(c => c.parentId && c.parentId !== 0);

      let html = '';
      for (const root of rootComments) {
        html += renderComment(root, 0);
        const childReplies = replies.filter(r => r.parentId === root.id);
        for (const reply of childReplies) {
          html += renderComment(reply, 1);
        }
      }
      listEl.innerHTML = html;

      listEl.querySelectorAll('.comment-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const form = document.getElementById(\\\`reply-form-\\\${id}\\\`);
          if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
      });

      listEl.querySelectorAll('.reply-submit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const parentId = parseInt(btn.dataset.parentId);
          const form = btn.closest('.comment-reply-form');
          const nickname = form.querySelector('.reply-nickname').value.trim();
          const email = form.querySelector('.reply-email').value.trim();
          const content = form.querySelector('.reply-content').value.trim();
          if (!nickname || !content) { alert('\u8BF7\u586B\u5199\u6635\u79F0\u548C\u56DE\u590D\u5185\u5BB9'); return; }
          if (!email || !/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/.test(email)) { alert('\u8BF7\u586B\u5199\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740'); return; }
          btn.disabled = true;
          btn.textContent = '\u63D0\u4EA4\u4E2D...';
          try {
            const res = await fetch(\\\`\\\${API}/comments\\\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: { nickname, email, content, pageUrl, pageTitle, parentId, isAdminReply: false } })
            });
            if (res.ok) {
              loadComments();
            } else {
              alert('\u56DE\u590D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
              btn.disabled = false;
              btn.textContent = '\u56DE\u590D';
            }
          } catch (e) {
            alert('\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
            btn.disabled = false;
            btn.textContent = '\u56DE\u590D';
          }
        });
      });

      listEl.querySelectorAll('.reply-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.comment-reply-form').style.display = 'none';
        });
      });

    } catch (e) {
      const listEl = document.getElementById('comment-list');
      if (listEl) listEl.innerHTML = '<div class="comment-empty">\u8BC4\u8BBA\u52A0\u8F7D\u5931\u8D25</div>';
    }
  }

  const submitBtn = document.getElementById('comment-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const nickname = document.getElementById('comment-nickname').value.trim();
      const email = document.getElementById('comment-email').value.trim();
      const content = document.getElementById('comment-content').value.trim();
      if (!nickname) { alert('\u8BF7\u586B\u5199\u6635\u79F0'); return; }
      if (!email || !/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/.test(email)) { alert('\u8BF7\u586B\u5199\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740'); return; }
      if (!content) { alert('\u8BF7\u586B\u5199\u8BC4\u8BBA\u5185\u5BB9'); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = '\u63D0\u4EA4\u4E2D...';

      try {
        const res = await fetch(\\\`\\\${API}/comments\\\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { nickname, email, content, pageUrl, pageTitle, parentId: 0, isAdminReply: false }
          })
        });
        if (res.ok) {
          document.getElementById('comment-content').value = '';
          document.getElementById('comment-email').value = '';
          loadComments();
        } else {
          const err = await res.json();
          alert('\u8BC4\u8BBA\u5931\u8D25\uFF1A' + (err.error?.message || '\u8BF7\u7A0D\u540E\u91CD\u8BD5'));
        }
      } catch (e) {
        alert('\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = '\u53D1\u8868\u8BC4\u8BBA';
    });
  }

  loadComments();
})();<\/script> `])), maybeRenderHead(), defineScriptVars({ pageUrl, pageTitle }));
}, "/tmp/ehs-site/src/components/PageComment.astro", void 0);

export { $$PageComment as $ };
