import"./hoisted.B9DQytfQ.js";const m="/api/strapi";let p=[],r=[],i=1,o=10;function h(){return Math.max(1,Math.ceil(r.length/o))}function y(e){const a=e.title||"",s=e.description||"",d=e.videoUrl||e.url||"",v=e.duration||"",l=e.category||"";let n="";if(d.includes("bilibili.com/video/")){const t=d.match(/BV[a-zA-Z0-9]+/);n=t?`https://i0.hdslb.com/bfs/archive/${t[0]}s.jpg`:""}else if(d.includes("youtube.com/watch")){const t=new URL(d).searchParams.get("v");n=t?`https://img.youtube.com/vi/${t}/mqdefault.jpg`:""}return`
        <a href="/videos/${e.slug||e.id}" class="video-card">
          <div class="video-card-thumb">
            ${n?`<img src="${n}" alt="${a}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                 <div class="video-card-placeholder" style="display:none"><svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>`:'<div class="video-card-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>'}
            ${v?`<span class="video-card-duration">${v}</span>`:""}
            <div class="video-card-play">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="video-card-info">
            <div class="video-card-title">${a}</div>
            ${l?`<span class="card-tag tag-video">${l}</span>`:""}
            ${s?`<div class="video-card-desc">${s.length>80?s.slice(0,80)+"...":s}</div>`:""}
          </div>
        </a>`}function $(e){const a=document.getElementById("vid-list");if(a){if(e.length===0){a.innerHTML='<div class="empty">暂无视频</div>';return}a.innerHTML=e.map(s=>y(s)).join("")}}function w(){const e=document.getElementById("vid-pagination"),a=r.length,s=h();if(a<=o){e.style.display="none";return}e.style.display="flex";const d=(i-1)*o+1,v=Math.min(i*o,a);let l="";const n=[];if(s<=7)for(let t=1;t<=s;t++)n.push(t);else{n.push(1),i>4&&n.push(-1);const t=Math.max(2,i-2),f=Math.min(s-1,i+2);for(let u=t;u<=f;u++)n.push(u);i<s-3&&n.push(-2),n.push(s)}for(const t of n)t<0?l+='<span class="page-ellipsis">…</span>':l+=`<button class="${t===i?"active":""}" data-page="${t}">${t}</button>`;e.innerHTML=`
        <div class="pagination-info">显示 ${d}-${v}，共 ${a} 个视频</div>
        <div class="pagination-controls">
          <button data-action="prev" ${i===1?"disabled":""}>上一页</button>
          ${l}
          <button data-action="next" ${i===s?"disabled":""}>下一页</button>
        </div>
        <div class="page-size-select">
          每页
          <select id="vid-page-size">
            <option value="10" ${o===10?"selected":""}>10</option>
            <option value="20" ${o===20?"selected":""}>20</option>
            <option value="50" ${o===50?"selected":""}>50</option>
            <option value="100" ${o===100?"selected":""}>100</option>
          </select>
          条
        </div>`,e.querySelector("#vid-page-size").addEventListener("change",t=>{o=parseInt(t.target.value),i=1,c()}),e.querySelectorAll("[data-page]").forEach(t=>{t.addEventListener("click",()=>{i=parseInt(t.dataset.page),c(),window.scrollTo({top:0,behavior:"smooth"})})}),e.querySelector('[data-action="prev"]').addEventListener("click",()=>{i>1&&(i--,c(),window.scrollTo({top:0,behavior:"smooth"}))}),e.querySelector('[data-action="next"]').addEventListener("click",()=>{i<h()&&(i++,c(),window.scrollTo({top:0,behavior:"smooth"}))})}function c(){const e=(i-1)*o;$(r.slice(e,e+o)),w()}async function b(){try{const a=await(await fetch(`${m}/videos?pagination[pageSize]=200&sort=createdAt:desc`)).json();p=a.data??[],r=[...p];const s=a.meta?.pagination?.total??0;document.getElementById("vid-count").textContent=`共 ${s} 个视频`,c()}catch{document.getElementById("vid-list").innerHTML='<div class="empty">加载失败</div>'}}function g(){const e=document.getElementById("vid-search").value.trim().toLowerCase();e?r=p.filter(a=>(a.title??"").toLowerCase().includes(e)||(a.category??"").toLowerCase().includes(e)):r=[...p],i=1,c()}document.getElementById("vid-search").addEventListener("input",g);document.getElementById("vid-search-btn").addEventListener("click",g);b();
