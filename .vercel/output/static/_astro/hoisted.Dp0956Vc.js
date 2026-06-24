import"./hoisted.B9DQytfQ.js";const L="/api/strapi",I=[[["消防","火灾","防爆","安全培训","安全检查","隐患","事故","应急","安全规章","安全操作","安全生产","四防","监控"],"安全"],[["环保","环境","生态","污染","废物","排污","水污染","大气","噪声","土壤"],"环保"],[["职业健康","职业卫生","职业病","防护用品","工效学","辐射"],"职业健康"]],b=[[["道路","运输","旅客","货运","客运","车辆","危险货物","动态监控"],"交通"],[["化工","危化","危险化学品","储运"],"化工"],[["工贸","冶金","机械","轻工","纺织","建材"],"工贸"],[["建筑","施工","工地","脚手架","坍塌"],"建筑"],[["矿山","煤矿","非煤矿","矿井"],"矿山"]];function m(t,s){const e=t+s;for(const[l,r]of I)if(l.some(c=>e.includes(c)))return r;return"安全"}function $(t,s){const e=t+s;for(const[l,r]of b)if(l.some(c=>e.includes(c)))return r;return"通用"}const w={安全:"safety",环保:"environment",职业健康:"occupational_health"};let u=[],d=[],a=1,o=10,v="",y="";function h(){return Math.max(1,Math.ceil(d.length/o))}function x(t){const s=document.getElementById("doc-list");if(s){if(t.length===0){s.innerHTML='<div class="empty">暂无资料</div>';return}s.innerHTML=t.map(e=>{const l=m(e.title||"",e.description||""),r=$(e.title||"",e.description||""),c=w[l]||"safety",i=[];i.push(`<span class="std-tag std-tag-${c}">${l}</span>`),r!=="通用"&&i.push(`<span class="std-tag std-tag-region">${r}</span>`);const n=[];return e.fileType&&n.push(`<span>${e.fileType.toUpperCase()}</span>`),e.publishDate&&n.push(`<span>${e.publishDate}</span>`),`
        <a href="/documents/${e.slug||e.id}" class="list-item">
          <div class="list-item-body">
            <div class="list-item-title">${e.title}</div>
            <div class="list-item-meta-row">
              ${i.join("")}
              ${n.join("")}
            </div>
          </div>
          <div class="list-item-arrow">&rarr;</div>
        </a>`}).join("")}}function T(){const t=document.getElementById("doc-pagination"),s=d.length,e=h();if(s<=o){t.style.display="none";return}t.style.display="flex";const l=(a-1)*o+1,r=Math.min(a*o,s);let c="";const i=[];if(e<=7)for(let n=1;n<=e;n++)i.push(n);else{i.push(1),a>4&&i.push(-1);const n=Math.max(2,a-2),E=Math.min(e-1,a+2);for(let g=n;g<=E;g++)i.push(g);a<e-3&&i.push(-2),i.push(e)}for(const n of i)n<0?c+='<span class="page-ellipsis">…</span>':c+=`<button class="${n===a?"active":""}" data-page="${n}">${n}</button>`;t.innerHTML=`
        <div class="pagination-info">显示 ${l}-${r}，共 ${s} 份资料</div>
        <div class="pagination-controls">
          <button data-action="prev" ${a===1?"disabled":""}>上一页</button>
          ${c}
          <button data-action="next" ${a===e?"disabled":""}>下一页</button>
        </div>
        <div class="page-size-select">
          每页
          <select id="doc-page-size">
            <option value="10" ${o===10?"selected":""}>10</option>
            <option value="20" ${o===20?"selected":""}>20</option>
            <option value="50" ${o===50?"selected":""}>50</option>
            <option value="100" ${o===100?"selected":""}>100</option>
          </select>
          条
        </div>`,t.querySelector("#doc-page-size").addEventListener("change",n=>{o=parseInt(n.target.value),a=1,p()}),t.querySelectorAll("[data-page]").forEach(n=>{n.addEventListener("click",()=>{a=parseInt(n.dataset.page),p(),window.scrollTo({top:0,behavior:"smooth"})})}),t.querySelector('[data-action="prev"]').addEventListener("click",()=>{a>1&&(a--,p(),window.scrollTo({top:0,behavior:"smooth"}))}),t.querySelector('[data-action="next"]').addEventListener("click",()=>{a<h()&&(a++,p(),window.scrollTo({top:0,behavior:"smooth"}))})}function f(){const t=document.getElementById("doc-search").value.trim().toLowerCase();d=u.filter(s=>!(v&&m(s.title||"",s.description||"")!==v||y&&$(s.title||"",s.description||"")!==y||t&&!`${s.title??""} ${s.category??""} ${s.fileType??""}`.toLowerCase().includes(t))),a=1,p()}function p(){const t=(a-1)*o;x(d.slice(t,t+o)),T(),document.getElementById("doc-count").textContent=`共 ${d.length} 份资料${d.length!==u.length?`（筛选自 ${u.length} 份）`:""}`}async function B(){try{const s=await(await fetch(`${L}/documents?pagination[pageSize]=200&sort=createdAt:desc`)).json();u=s.data??[],d=[...u];const e=s.meta?.pagination?.total??0;document.getElementById("doc-count").textContent=`共 ${e} 份资料`,p()}catch{document.getElementById("doc-list").innerHTML='<div class="empty">加载失败</div>'}}document.getElementById("specialty-filters").addEventListener("click",t=>{t.target.classList.contains("filter-tag")&&(document.querySelectorAll("#specialty-filters .filter-tag").forEach(s=>s.classList.remove("active")),t.target.classList.add("active"),v=t.target.dataset.value||"",f())});document.getElementById("industry-filters").addEventListener("click",t=>{t.target.classList.contains("filter-tag")&&(document.querySelectorAll("#industry-filters .filter-tag").forEach(s=>s.classList.remove("active")),t.target.classList.add("active"),y=t.target.dataset.value||"",f())});document.getElementById("doc-search").addEventListener("input",f);document.getElementById("doc-search-btn").addEventListener("click",f);B();
