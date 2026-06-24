import"./hoisted.B9DQytfQ.js";const p="/api/strapi";async function g(s){try{const a=await fetch(s);if(!a.ok)throw new Error("HTTP "+a.status);return await a.json()}catch(a){return console.warn("Fetch failed:",s,a),null}}function y(s,a,d){const e=s.title||"",n=s.description||s.summary||"",o=s.standardNo||"",c=s.publishDate||"",r=s.effectiveDate||"";if(d==="regulation")return`
          <a href="${a}${s.slug||s.id}" class="list-item">
            <div class="list-item-body">
              <div class="list-item-title">${e}${o?` <span class="list-item-no">${o}</span>`:""}</div>
              <div class="list-item-meta-row">
                ${c?`<span>发布：${c}</span>`:""}
                ${r?`<span>实施：${r}</span>`:""}
              </div>
            </div>
            <div class="list-item-arrow">&rarr;</div>
          </a>`;if(d==="standard"){const t=s.source||"",i=s.standardNo||"",l=s.effectiveDate||s.publishDate||"";return`
          <a href="${a}${s.slug||s.id}" class="list-item">
            <div class="list-item-body">
              <div class="list-item-title">${e}</div>
              <div class="list-item-meta-row">
                ${t?`<span>${t}</span>`:""}
                ${i?`<span>${i}</span>`:""}
                ${l?`<span>${l}</span>`:""}
              </div>
            </div>
            <div class="list-item-arrow">&rarr;</div>
          </a>`}const v={major:"特大",larger:"重大",general:"较大",minor:"一般"},u={suffocation:"窒息",fall:"高处坠落",gas_leak:"燃气泄漏",traffic:"交通",poisoning_suffocation:"中毒窒息",falling_object:"物体打击",collapse:"坍塌",crane:"起重伤害",other_injury:"其他伤害",fire:"火灾",explosion:"爆炸",electric_shock:"触电",mechanical:"机械伤害",drowning:"淹溺"};if(d==="accident"){const t=u[s.category]||s.category||"",i=v[s.severity]||s.severity||"",l=s.date||"";return`
          <a href="${a}${s.slug||s.id}" class="list-item">
            <div class="list-item-body">
              <div class="list-item-title">${e}</div>
              <div class="list-item-meta-row">
                ${l?`<span>发生日期：${l}</span>`:""}
                ${t?`<span>事故类型：${t}</span>`:""}
                ${i?`<span>事故等级：${i}</span>`:""}
              </div>
            </div>
            <div class="list-item-arrow">&rarr;</div>
          </a>`}if(d==="document"){const t=s.fileType?s.fileType.toUpperCase():"",i=s.fileSize||"",l=t||i?` <span class="list-item-no">(${[t,i].filter(Boolean).join("，")})</span>`:"",$=s.category||"";return`
          <a href="${a}${s.slug||s.id}" class="list-item">
            <div class="list-item-body">
              <div class="list-item-title">${e}${l}</div>
              <div class="list-item-meta-row">
                ${$?`<span>${$}</span>`:""}
                ${s.publishDate?`<span>${s.publishDate}</span>`:""}
              </div>
            </div>
            <div class="list-item-arrow">&rarr;</div>
          </a>`}return`
        <a href="${a}${s.slug||s.id}" class="list-item">
          <div class="list-item-body">
            <div class="list-item-title">${e}</div>
            ${n?`<div class="list-item-desc">${n.length>80?n.slice(0,80)+"...":n}</div>`:""}
          </div>
          <div class="list-item-arrow">&rarr;</div>
        </a>`}function w(s){const a=s.title||"",d=s.description||"",e=s.videoUrl||s.url||"",n=s.duration||"";let o="";if(e.includes("bilibili.com/video/")){const c=e.match(/BV[a-zA-Z0-9]+/);o=c?`https://i0.hdslb.com/bfs/archive/${c[0]}s.jpg`:""}else if(e.includes("youtube.com/watch")){const c=new URL(e).searchParams.get("v");o=c?`https://img.youtube.com/vi/${c}/mqdefault.jpg`:""}return`
        <a href="/videos/${s.slug||s.id}" class="video-card">
          <div class="video-card-thumb">
            ${o?`<img src="${o}" alt="${a}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                 <div class="video-card-placeholder" style="display:none"><svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>`:'<div class="video-card-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>'}
            ${n?`<span class="video-card-duration">${n}</span>`:""}
            <div class="video-card-play">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="video-card-info">
            <div class="video-card-title">${a}</div>
            ${d?`<div class="video-card-desc">${d.length>60?d.slice(0,60)+"...":d}</div>`:""}
          </div>
        </a>`}async function b(){const[s,a,d,e,n,o,c]=await Promise.all([g(`${p}/ai-apps?pagination[pageSize]=6&sort=createdAt:desc`),g(`${p}/regulations?pagination[pageSize]=6&sort=publishDate:desc`),g(`${p}/standards?pagination[pageSize]=6&sort=publishDate:desc`),g(`${p}/accidents?pagination[pageSize]=6&sort=date:desc`),g(`${p}/videos?pagination[pageSize]=3&sort=createdAt:desc`),g(`${p}/documents?pagination[pageSize]=6&sort=createdAt:desc`),g(`${p}/messages?pagination[pageSize]=6&sort=publishDate:desc`)]),r=(t,i)=>{const l=document.getElementById(t);l&&(l.textContent=i?.meta?.pagination?.total??"0")};r("stat-laws",d),r("stat-standards",a),r("stat-ai",s),r("stat-accs",e),r("stat-videos",n),r("stat-docs",o),r("stat-msgs",c);const v=(t,i,l,$)=>{const h=document.getElementById(t);if(!h)return;const f=i?.data??[];h.innerHTML=f.length===0?'<div class="empty">暂无数据</div>':f.map(m=>y(m,l,$)).join("")};v("home-ai-list",s,"/ai-apps/"),v("home-laws-list",d,"/standards/","regulation"),v("home-standards-list",a,"/regulations/","standard"),v("home-accs-list",e,"/accidents/","accident"),v("home-docs-list",o,"/documents/","document");const u=document.getElementById("home-videos-list");if(u){const t=n?.data??[];u.innerHTML=t.length===0?'<div class="empty">暂无视频</div>':t.map(i=>w(i)).join("")}}b();
