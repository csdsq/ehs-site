import"./hoisted.B9DQytfQ.js";const y="/api/strapi";let v=[],p=[],u="",n=1,c=10;function h(){return Math.max(1,Math.ceil(p.length/c))}function $(t){const e=(t.demoContent||"").match(/src=["']([^"']+)["']/);return e?e[1]:t.icon?t.icon:""}function E(t){const s=document.getElementById("ai-list");if(s){if(t.length===0){s.innerHTML='<div class="empty">暂无AI应用</div>';return}s.innerHTML=t.map(e=>{const a=e.description||"",i=$(e),l=e.category||"";return`
        <a href="/ai-apps/${e.slug||e.id}" class="ai-card">
          ${i?`<div class="ai-card-thumb"><img src="${i}" alt="${e.title}" loading="lazy" /></div>`:'<div class="ai-card-icon icon-ai">🤖</div>'}
          <div class="ai-card-body">
            <div class="ai-card-title">${e.title}</div>
            ${l?`<div class="ai-card-category">${l}</div>`:""}
            ${a?`<div class="ai-card-desc">${a.length>100?a.slice(0,100)+"...":a}</div>`:""}
          </div>
        </a>`}).join("")}}function b(){const t=document.getElementById("ai-pagination"),s=p.length,e=h();if(s<=c){t.style.display="none";return}t.style.display="flex";const a=(n-1)*c+1,i=Math.min(n*c,s);let l="";const r=[];if(e<=7)for(let o=1;o<=e;o++)r.push(o);else{r.push(1),n>4&&r.push(-1);const o=Math.max(2,n-2),f=Math.min(e-1,n+2);for(let m=o;m<=f;m++)r.push(m);n<e-3&&r.push(-2),r.push(e)}for(const o of r)o<0?l+='<span class="page-ellipsis">…</span>':l+=`<button class="${o===n?"active":""}" data-page="${o}">${o}</button>`;t.innerHTML=`
        <div class="pagination-info">显示 ${a}-${i}，共 ${s} 个应用</div>
        <div class="pagination-controls">
          <button data-action="prev" ${n===1?"disabled":""}>上一页</button>
          ${l}
          <button data-action="next" ${n===e?"disabled":""}>下一页</button>
        </div>
        <div class="page-size-select">
          每页
          <select id="ai-page-size">
            <option value="10" ${c===10?"selected":""}>10</option>
            <option value="20" ${c===20?"selected":""}>20</option>
            <option value="50" ${c===50?"selected":""}>50</option>
            <option value="100" ${c===100?"selected":""}>100</option>
          </select>
          条
        </div>`,t.querySelector("#ai-page-size").addEventListener("change",o=>{c=parseInt(o.target.value),n=1,d()}),t.querySelectorAll("[data-page]").forEach(o=>{o.addEventListener("click",()=>{n=parseInt(o.dataset.page),d(),window.scrollTo({top:0,behavior:"smooth"})})}),t.querySelector('[data-action="prev"]').addEventListener("click",()=>{n>1&&(n--,d(),window.scrollTo({top:0,behavior:"smooth"}))}),t.querySelector('[data-action="next"]').addEventListener("click",()=>{n<h()&&(n++,d(),window.scrollTo({top:0,behavior:"smooth"}))})}function d(){const t=(n-1)*c;E(p.slice(t,t+c)),b()}function L(){const t=document.getElementById("ai-category-tags");if(!t)return;const s=Array.from(new Set(v.map(a=>(a.category||"").trim()).filter(Boolean))).sort((a,i)=>a.localeCompare(i,"zh-CN"));t.innerHTML="";const e=document.createElement("button");e.type="button",e.className="filter-tag active",e.textContent="全部",e.addEventListener("click",()=>{u="",t.querySelectorAll(".filter-tag").forEach(a=>a.classList.remove("active")),e.classList.add("active"),g()}),t.appendChild(e),s.forEach(a=>{const i=document.createElement("button");i.type="button",i.className="filter-tag",i.textContent=a,i.addEventListener("click",()=>{u=a,t.querySelectorAll(".filter-tag").forEach(l=>l.classList.remove("active")),i.classList.add("active"),g()}),t.appendChild(i)})}async function C(){try{v=(await(await fetch(`${y}/ai-apps?pagination[pageSize]=200&sort=createdAt:desc`)).json()).data??[],L(),g()}catch{document.getElementById("ai-list").innerHTML='<div class="empty">加载失败</div>'}}function g(){const t=document.getElementById("ai-search").value.trim().toLowerCase();p=v.filter(e=>{const a=(e.category||"").trim(),i=!u||a===u,l=!t||(e.title??"").toLowerCase().includes(t)||(e.description??"").toLowerCase().includes(t)||a.toLowerCase().includes(t);return i&&l}),n=1;const s=document.getElementById("ai-count");s.textContent=`共 ${p.length} 个应用${t||u?`（筛选自 ${v.length} 个）`:""}`,d()}document.getElementById("ai-search").addEventListener("input",g);document.getElementById("ai-search-btn").addEventListener("click",g);C();
