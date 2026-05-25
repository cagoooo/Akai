import{j as e}from"./vendor-ui--2rknC_a.js";import{L as f,a7 as w,J as L,H as D,c as H,K as F,ac as O,ad as z,u as U,B as k,t as j,a as B,P as I,b as W}from"./index-Dp1IV5t5.js";import{r as u}from"./vendor-react-CJhR42E5.js";import{P as Y}from"./PageHead-DcLjNIp-.js";import{u as q,r as G,B as J,s as $}from"./useExtractedSections-DBtqInRg.js";import{M as K,r as Q}from"./index-D7uEujSO.js";import"./vendor-firebase-BBkAadeS.js";import"./vendor-charts-BfhBwcPg.js";import"./vendor-utils-C4xBKWBT.js";import"./vendor-animation-ClxbdzuJ.js";function V({left:a,hero:t,article:i,toc:n}){return e.jsxs("main",{className:"bp-page","aria-label":"部落格文章內容",children:[a&&e.jsx("aside",{className:"bp-page__left","aria-label":"作者資訊與分享",children:a}),e.jsx("header",{className:"bp-page__hero",children:t}),e.jsx("article",{className:"bp-page__article",children:i}),n&&e.jsx("aside",{className:"bp-page__toc","aria-label":"文章目錄",children:n})]})}function Z(a){try{return new Date(a).toLocaleDateString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"})}catch{return a}}function ee({kicker:a,title:t,excerpt:i,emoji:n,date:r,readingMinutes:d,author:s="阿凱",tags:c=[],variant:m="editorial",crumbHref:h="/blog",crumbLabel:g="部落格"}){const b=m==="sticky"?"bp-hero bp-hero--sticky":"bp-hero";return e.jsxs(e.Fragment,{children:[e.jsxs(f,{href:h,className:"bp-crumb","aria-label":`回到${g}列表`,children:[e.jsx("span",{className:"bp-crumb__arrow","aria-hidden":"true",children:"←"}),e.jsxs("span",{className:"bp-crumb__label",children:["回",g]}),a&&e.jsxs("span",{className:"bp-crumb__path",children:[e.jsx("span",{className:"bp-crumb__sep","aria-hidden":"true",children:"·"}),e.jsx("span",{className:"bp-crumb__context",children:a.split("·")[0].trim()})]})]}),e.jsxs("div",{className:b,children:[m==="editorial"&&n&&e.jsx("div",{className:"bp-hero__emoji-sticker","aria-hidden":"true",children:n}),e.jsx("div",{className:"bp-hero__kicker",children:a}),e.jsx("h1",{className:"bp-hero__title",children:t}),i&&e.jsx("p",{className:"bp-hero__excerpt",children:i}),e.jsxs("div",{className:"bp-hero__meta",children:[e.jsxs("span",{className:"bp-hero__meta-item",children:[e.jsx("span",{className:"bp-hero__author-pic","aria-hidden":"true",children:"凱"}),e.jsxs("span",{children:[s,"老師"]})]}),e.jsx("span",{className:"bp-hero__meta-dot","aria-hidden":"true"}),e.jsxs("span",{className:"bp-hero__meta-item",children:["📅 ",Z(r)]}),e.jsx("span",{className:"bp-hero__meta-dot","aria-hidden":"true"}),e.jsxs("span",{className:"bp-hero__meta-item",children:["📖 ",d," 分鐘閱讀"]})]}),c.length>0&&e.jsx("div",{className:"bp-hero__tags",children:c.map(v=>e.jsxs("span",{className:"bp-tag",children:["#",v]},v))})]})]})}function se({initial:a="凱",authorName:t="阿凱老師",authorRole:i="教育科技創新",facts:n,progress:r,shareTitle:d}){const[s,c]=u.useState(!1),m=()=>{typeof navigator>"u"||!navigator.clipboard||navigator.clipboard.writeText(window.location.href).then(()=>{c(!0),window.setTimeout(()=>c(!1),1600)},()=>{})},h=b=>{b.preventDefault(),window.print()},g=(()=>{if(typeof window>"u")return"#";const b=encodeURIComponent(window.location.href),v=encodeURIComponent(d||document.title);return`https://social-plugins.line.me/lineit/share?url=${b}&text=${v}`})();return e.jsxs("div",{className:"bp-lrail",children:[e.jsxs("div",{className:"bp-lrail-polaroid",children:[e.jsx("div",{className:"bp-lrail-polaroid__photo","aria-hidden":"true",children:a}),e.jsx("div",{className:"bp-lrail-polaroid__caption",children:t}),e.jsx("div",{className:"bp-lrail-polaroid__sub",children:i})]}),n.length>0&&e.jsxs("div",{className:"bp-lrail-card",children:[e.jsx("div",{className:"bp-lrail-card__label",children:"本篇 · INFO"}),n.map(b=>e.jsxs("div",{className:"bp-lrail-fact",children:[e.jsx("span",{className:"bp-lrail-fact__key",children:b.key}),e.jsx("span",{className:"bp-lrail-fact__dots","aria-hidden":"true"}),e.jsx("span",{className:"bp-lrail-fact__val",children:b.value})]},b.key))]}),e.jsxs("div",{className:"bp-lrail-progress",children:[e.jsxs("div",{className:"bp-lrail-progress__head",children:[e.jsx("span",{className:"bp-lrail-progress__label",children:"閱讀進度"}),e.jsxs("span",{className:"bp-lrail-progress__pct",children:[Math.round(r),"%"]})]}),e.jsx("div",{className:"bp-lrail-progress__track",children:e.jsx("div",{className:"bp-lrail-progress__bar",style:{width:`${r}%`}})}),e.jsxs("div",{className:"bp-lrail-progress__ticks","aria-hidden":"true",children:[e.jsx("span",{children:"0"}),e.jsx("span",{children:"·"}),e.jsx("span",{children:"·"}),e.jsx("span",{children:"·"}),e.jsx("span",{children:"100"})]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"bp-lrail-share-label",children:"分享"}),e.jsxs("div",{className:"bp-lrail-share",children:[e.jsxs("button",{type:"button",className:"bp-lrail-share__btn",onClick:m,"aria-label":"複製文章連結",children:[e.jsx("span",{"aria-hidden":"true",children:s?"✓":"🔗"}),e.jsx("span",{children:s?"已複製連結":"複製連結"})]}),e.jsxs("a",{className:"bp-lrail-share__btn",href:g,target:"_blank",rel:"noopener noreferrer","aria-label":"分享到 LINE",children:[e.jsx("span",{"aria-hidden":"true",children:"💬"}),e.jsx("span",{children:"傳給同事"})]}),e.jsxs("a",{className:"bp-lrail-share__btn",href:"#",onClick:h,"aria-label":"列印或匯出 PDF",children:[e.jsx("span",{"aria-hidden":"true",children:"🖨️"}),e.jsx("span",{children:"列印 / PDF"})]})]})]})]})}function ae(a){const t=document.getElementById(a);if(!t)return;const i=t.getBoundingClientRect().top+window.scrollY-24;window.scrollTo({top:i,behavior:"smooth"})}function te({sections:a,activeId:t,slug:i}){return a.length?e.jsxs("nav",{className:"bp-toc","aria-label":"本文目錄",children:[e.jsx("div",{className:"bp-toc__head",children:e.jsx("span",{className:"bp-toc__head-tape",children:"本文章節 · INDEX"})}),e.jsx("ul",{className:"bp-toc__list",children:a.map(n=>e.jsx("li",{className:"bp-toc__item",children:e.jsx("a",{href:`#${n.id}`,className:"bp-toc__link"+(n.id===t?" is-active":""),"aria-current":n.id===t?"true":void 0,onClick:r=>{r.preventDefault(),ae(n.id),i&&w("blog_toc_click",{slug:i,section_id:n.id,section_label:n.label,source:"desktop"})},children:n.label})},n.id))}),e.jsx("a",{className:"bp-toc__totop",href:"#top",onClick:n=>{n.preventDefault(),window.scrollTo({top:0,behavior:"smooth"})},children:"↑ 回到頂端"})]}):null}function ne(a){const t=document.getElementById(a);if(!t)return;const i=t.getBoundingClientRect().top+window.scrollY-24;window.scrollTo({top:i,behavior:"smooth"})}function ie({sections:a,activeId:t,slug:i}){const[n,r]=u.useState(!1);if(!a.length)return null;const d=a.find(s=>s.id===t)||a[0];return e.jsxs("div",{className:"bp-mtoc"+(n?" is-open":""),children:[e.jsxs("button",{type:"button",className:"bp-mtoc__btn","aria-expanded":n,"aria-label":"展開或收合文章目錄",onClick:()=>r(s=>!s),children:[e.jsxs("span",{className:"bp-mtoc__btn-label",children:["本文 · ",a.length," 節"]}),e.jsx("span",{className:"bp-mtoc__btn-current",children:d.label}),e.jsx("span",{className:"bp-mtoc__arrow","aria-hidden":"true",children:"▾"})]}),e.jsx("div",{className:"bp-mtoc__panel",children:e.jsx("ul",{className:"bp-mtoc__list",children:a.map(s=>e.jsx("li",{className:"bp-mtoc__item",children:e.jsx("a",{href:`#${s.id}`,className:"bp-mtoc__link"+(s.id===t?" is-active":""),"aria-current":s.id===t?"true":void 0,onClick:c=>{c.preventDefault(),r(!1),ne(s.id),i&&w("blog_toc_click",{slug:i,section_id:s.id,section_label:s.label,source:"mobile"})},children:s.label})},s.id))})})]})}function le({tools:a}){return a.length?e.jsxs("section",{className:"bp-related","aria-label":"文章提到的工具",children:[e.jsx("div",{className:"bp-related__label",children:"🔗 文章提到的工具"}),e.jsx("div",{className:"bp-related__grid",children:a.map(t=>e.jsxs(f,{href:`/tool/${t.id}`,className:"bp-related-card",children:[e.jsxs("span",{className:"bp-related-card__num",children:["#",t.id]}),e.jsx("span",{className:"bp-related-card__title",children:t.title}),e.jsx("span",{className:"bp-related-card__cat",children:L(t.category)}),e.jsx("span",{className:"bp-related-card__arrow","aria-hidden":"true",children:"→"})]},t.id))})]}):null}function re({prev:a,next:t}){return!a&&!t?null:e.jsxs("nav",{className:"bp-pnnav","aria-label":"文章導航",children:[a?e.jsxs(f,{href:`/blog/${a.slug}`,className:"bp-pncard",children:[e.jsx("div",{className:"bp-pncard__label",children:"← 上一篇"}),e.jsxs("div",{className:"bp-pncard__title",children:[a.emoji?`${a.emoji} `:"",a.title]})]}):e.jsx("div",{"aria-hidden":"true"}),t?e.jsxs(f,{href:`/blog/${t.slug}`,className:"bp-pncard bp-pncard--next",children:[e.jsx("div",{className:"bp-pncard__label",children:"下一篇 →"}),e.jsxs("div",{className:"bp-pncard__title",children:[t.emoji?`${t.emoji} `:"",t.title]})]}):e.jsx("div",{"aria-hidden":"true"})]})}function ce(){return e.jsxs("div",{className:"bp-cta",children:[e.jsx("div",{className:"bp-cta__heading",children:"看完這篇，接下來呢？"}),e.jsxs("div",{className:"bp-cta__actions",children:[e.jsxs(f,{href:"/blog",className:"bp-btn bp-btn--primary",children:[e.jsx("span",{"aria-hidden":"true",children:"📖"}),e.jsx("span",{children:"看更多教學情境長文"})]}),e.jsxs(f,{href:"/?wish=1",className:"bp-btn bp-btn--ghost",children:[e.jsx("span",{"aria-hidden":"true",children:"✨"}),e.jsx("span",{children:"跟阿凱老師許願"})]})]})]})}function oe({shareTitle:a}){const[t,i]=u.useState(!1),n=()=>{typeof navigator>"u"||!navigator.clipboard||navigator.clipboard.writeText(window.location.href).then(()=>{i(!0),window.setTimeout(()=>i(!1),1600)},()=>{})},r=s=>{s.preventDefault(),window.print()},d=(()=>{if(typeof window>"u")return"#";const s=encodeURIComponent(window.location.href),c=encodeURIComponent(a||document.title);return`https://social-plugins.line.me/lineit/share?url=${s}&text=${c}`})();return e.jsxs("div",{className:"bp-mshare",children:[e.jsx("div",{className:"bp-mshare__label",children:"分享給其他老師"}),e.jsxs("div",{className:"bp-mshare__row",children:[e.jsxs("button",{type:"button",className:"bp-mshare__btn",onClick:n,"aria-label":"複製文章連結",children:[e.jsx("span",{"aria-hidden":"true",children:t?"✓":"🔗"}),e.jsx("span",{children:t?"已複製":"複製連結"})]}),e.jsxs("a",{className:"bp-mshare__btn",href:d,target:"_blank",rel:"noopener noreferrer","aria-label":"分享到 LINE",children:[e.jsx("span",{"aria-hidden":"true",children:"💬"}),e.jsx("span",{children:"傳 LINE"})]}),e.jsxs("a",{className:"bp-mshare__btn",href:"#",onClick:r,"aria-label":"列印",children:[e.jsx("span",{"aria-hidden":"true",children:"🖨️"}),e.jsx("span",{children:"列印"})]})]})]})}const C="https://cagoooo.github.io/Akai",de="阿凱老師",pe="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5",ue="科技教育創新專區",he=`${C}/icon-512.png`;function me({title:a,description:t,slug:i,publishedAt:n,readingMinutes:r,body:d,tags:s=[]}){const c=`${C}/blog/${i}`,m=d.length,h={"@context":"https://schema.org","@type":"BlogPosting",headline:a,description:t,url:c,mainEntityOfPage:{"@type":"WebPage","@id":c},datePublished:n,dateModified:n,inLanguage:"zh-TW",wordCount:m,timeRequired:`PT${r}M`,keywords:s.join(", "),author:{"@type":"Person",name:de,url:pe,jobTitle:"教育科技創新者 · 國小資訊教師",affiliation:{"@type":"EducationalOrganization",name:"桃園市龍潭區石門國民小學"}},publisher:{"@type":"Organization",name:ue,logo:{"@type":"ImageObject",url:he}}};return e.jsx(D,{children:e.jsx("script",{type:"application/ld+json",children:JSON.stringify(h)})})}const be=`## 第一段：問題切入

很多老師問我「...」 — 我以前也這樣以為。

<div class="callout callout--warn">
<div class="callout__label">⚠ 真相</div>

**這工具不是 ...** — 那只是表面，真正的核心是 ...

</div>

## 第二段：以前怎麼解？

以前的流程：

1. 步驟一
2. 步驟二
3. 步驟三

**整個流程平均耗 X 天**，學生跟著倒楣。

## 解法：技術細節

**功能 A：xxx**
- 條目 1
- 條目 2

\`\`\`ts
// 程式碼範例（會自動語法高亮）
const result = await someApi();
\`\`\`

<div class="callout callout--tip">
<div class="callout__label">💡 重點機制</div>

關鍵設計是 ... 為什麼這樣做：因為 ...

</div>

**功能 B：xxx**
- 條目 1
- 條目 2

<div class="callout callout--info">
<div class="callout__label">ℹ️ 知識補充</div>

對該領域陌生的讀者：xxx 是指 ...

</div>

## 實測數字

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">指標 1</div>
    <div class="stat-card__value">XX <span style="font-size:14px;color:#6b5e4a;">單位</span></div>
    <span class="stat-card__delta">+XX% vs 之前</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">指標 2</div>
    <div class="stat-card__value">XX <span style="font-size:14px;color:#6b5e4a;">單位</span></div>
    <span class="stat-card__delta">說明</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">指標 3</div>
    <div class="stat-card__value">XX <span style="font-size:14px;color:#6b5e4a;">單位</span></div>
    <span class="stat-card__delta">說明</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">指標 4</div>
    <div class="stat-card__value">XX <span style="font-size:14px;color:#6b5e4a;">單位</span></div>
    <span class="stat-card__delta">說明</span>
  </div>
</div>

完整對照表：

| 指標 | 之前 | 現在 |
|------|-----|------|
| 指標 1 | X | Y |
| 指標 2 | A | B |

## 真實回饋

> 「實際使用者的回饋」
>
> — 角色 / 身分

## 配對工具推薦

- [#XX 工具名稱](/tool/XX) — 一行說明
- [#YY 工具名稱](/tool/YY) — 一行說明

## 適用對象

- 國小老師（哪些情境）
- 行政人員（哪些情境）

## 想試試？

→ [前往 #XX 工具](/tool/XX)

第一次推薦從 ... 開始。
`;function xe(){const{isAdmin:a}=H(),[t,i]=u.useState(!1);if(!a)return null;const n=async()=>{try{await navigator.clipboard.writeText(be),i(!0),window.setTimeout(()=>i(!1),1800)}catch{}};return e.jsxs("button",{type:"button",className:"bp-template-copier",onClick:n,title:"複製文章範本骨架到剪貼簿（含 callout / stat-grid / code block）","aria-label":"複製文章範本骨架",children:[e.jsx("span",{"aria-hidden":"true",children:t?"✓":"📋"}),e.jsx("span",{children:t?"已複製範本":"複製文章範本"})]})}function ge(){const[a,t]=u.useState(0),i=u.useRef(null);return u.useEffect(()=>{const n=()=>{i.current===null&&(i.current=requestAnimationFrame(()=>{i.current=null;const r=document.documentElement,d=r.scrollHeight-r.clientHeight,s=window.scrollY;t(d>0?Math.min(100,Math.max(0,s/d*100)):0)}))};return window.addEventListener("scroll",n,{passive:!0}),n(),()=>{window.removeEventListener("scroll",n),i.current!==null&&cancelAnimationFrame(i.current)}},[]),a}function je(a){var n;const[t,i]=u.useState((n=a[0])==null?void 0:n.id);return u.useEffect(()=>{var s;if(!a.length){i(void 0);return}i((s=a[0])==null?void 0:s.id);const r=a.map(c=>document.getElementById(c.id)).filter(c=>!!c);if(!r.length)return;const d=new IntersectionObserver(c=>{const m=c.filter(h=>h.isIntersecting);m.length&&(m.sort((h,g)=>h.boundingClientRect.top-g.boundingClientRect.top),i(m[0].target.id))},{rootMargin:"-12% 0px -70% 0px",threshold:[0,1]});return r.forEach(c=>d.observe(c)),()=>d.disconnect()},[a.map(r=>r.id).join("|")]),t}function y(a){var t;return a==null||a===!1||a===!0?"":typeof a=="string"||typeof a=="number"?String(a):Array.isArray(a)?a.map(y).join(""):typeof a=="object"&&"props"in a?y((t=a.props)==null?void 0:t.children):""}function A({id:a}){const t=i=>{i.preventDefault();const n=`${window.location.origin}${window.location.pathname}#${a}`;navigator.clipboard&&navigator.clipboard.writeText(n).catch(()=>{}),history.replaceState(null,"",`#${a}`)};return e.jsx("a",{href:`#${a}`,className:"bp-heading-anchor","aria-label":"複製章節連結",onClick:t,children:"#"})}function Ie(){const a=F(),t=O(a.slug),[i,n]=u.useState(void 0),[r,d]=u.useState(!1);u.useEffect(()=>{if(t){d(!0);return}z(a.slug).then(l=>{n(l),d(!0)})},[a.slug,t]);const s=t||i,{data:c}=U({queryKey:["/api/tools"],queryFn:async()=>{const p=await fetch("/api/tools.json?v=3.6.59");if(!p.ok)throw new Error("tools fetch failed");return p.json()},staleTime:5*60*1e3,enabled:!!s});u.useEffect(()=>{window.scrollTo(0,0),s&&w("blog_read",{slug:s.slug,title:s.title,related_tools:s.toolIds.join(","),reading_minutes:s.readingMinutes})},[a.slug,s]);const m=ge(),h=q(s==null?void 0:s.body),g=je(h),b=u.useRef(!1),v=u.useRef(null);if(u.useEffect(()=>{b.current=!1},[a.slug]),u.useEffect(()=>{if(!s)return;const l=v.current;if(!l)return;const o=new IntersectionObserver(p=>{const x=p[0];x!=null&&x.isIntersecting&&!b.current&&(b.current=!0,w("blog_read_complete",{slug:s.slug,title:s.title,reading_minutes:s.readingMinutes,related_tools:s.toolIds.join(",")}))},{threshold:.5});return o.observe(l),()=>o.disconnect()},[s]),!s&&!r)return e.jsxs(e.Fragment,{children:[e.jsx(k,{}),e.jsx("div",{style:{maxWidth:600,margin:"40px auto",padding:60,textAlign:"center",color:j.muted2,fontFamily:j.font.tc,fontStyle:"italic"},children:"📌 載入文章中…"})]});if(!s)return e.jsxs(e.Fragment,{children:[e.jsx(k,{}),e.jsxs("div",{style:{maxWidth:600,margin:"40px auto",padding:28,textAlign:"center",fontFamily:j.font.tc},children:[e.jsx("h1",{style:{fontSize:28,fontWeight:900,color:j.ink},children:"找不到這篇文章 🤔"}),e.jsx("p",{style:{color:j.muted2,marginTop:12},children:"可能是連結錯誤或文章已下架。"}),e.jsx(f,{href:"/blog",style:{display:"inline-block",marginTop:20,padding:"10px 22px",background:j.accent,color:"#fff",textDecoration:"none",border:`2px solid ${j.ink}`,borderRadius:10,fontWeight:800,boxShadow:"3px 3px 0 rgba(0,0,0,.2)"},children:"← 回到部落格列表"})]}),e.jsx(B,{})]});const S=(c||[]).filter(l=>s.toolIds.includes(l.id)),P=I.findIndex(l=>l.slug===s.slug);let T,E;if(P!==-1){const l=[...I].sort((N,_)=>new Date(_.publishedAt).getTime()-new Date(N.publishedAt).getTime()),o=l.findIndex(N=>N.slug===s.slug),p=l[o+1],x=l[o-1];p&&(T={slug:p.slug,title:p.title,emoji:p.coverEmoji}),x&&(E={slug:x.slug,title:x.title,emoji:x.coverEmoji})}const R=s.tags.slice(0,2).join(" · ").toUpperCase(),X=[{key:"發布",value:new Date(s.publishedAt).toLocaleDateString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"})},{key:"閱讀",value:`${s.readingMinutes} min`},{key:"分類",value:s.tags[0]||"教學情境"},{key:"收錄",value:`${s.toolIds.length} 工具`}];return e.jsxs(e.Fragment,{children:[e.jsx(Y,{mode:"custom",title:`${s.title} · 阿凱老師教學情境長文`,description:s.excerpt,path:`/blog/${s.slug}`}),e.jsx(me,{title:s.title,description:s.excerpt,slug:s.slug,publishedAt:s.publishedAt,readingMinutes:s.readingMinutes,body:s.body,tags:s.tags}),e.jsx(k,{}),e.jsx("div",{"aria-hidden":"true",style:{position:"fixed",top:0,left:0,height:3,width:`${m}%`,background:`linear-gradient(90deg, ${j.accent}, ${j.red})`,zIndex:9998,transition:"width 0.08s linear",boxShadow:"0 0 8px rgba(234, 138, 62, 0.55)"}}),e.jsx(V,{left:e.jsx(se,{facts:X,progress:m,shareTitle:s.title}),hero:e.jsx(ee,{kicker:R,title:s.title,excerpt:s.excerpt,emoji:s.coverEmoji,date:s.publishedAt,readingMinutes:s.readingMinutes,tags:s.tags,variant:"editorial"}),toc:h.length>0?e.jsx(te,{sections:h,activeId:g,slug:s.slug}):void 0,article:e.jsxs(e.Fragment,{children:[h.length>0&&e.jsx(ie,{sections:h,activeId:g,slug:s.slug}),e.jsx("div",{className:"bp-article",children:e.jsx(K,{remarkPlugins:[Q],rehypePlugins:[G],components:{h2:({children:l})=>{const o=$(y(l));return e.jsxs("h2",{id:o,children:[l,e.jsx(A,{id:o})]})},h3:({children:l})=>{const o=$(y(l));return e.jsxs("h3",{id:o,children:[l,e.jsx(A,{id:o})]})},table:({children:l})=>e.jsx("div",{className:"bp-table-wrap",children:e.jsx("table",{children:l})}),pre:({children:l})=>{const o=Array.isArray(l)?l[0]:l;if(o&&typeof o=="object"&&"props"in o){const p=o.props,x=p==null?void 0:p.className,N=y(p==null?void 0:p.children),_=/language-(\w+)/.exec(x||"");return e.jsx(J,{language:_==null?void 0:_[1],code:N})}return e.jsx("pre",{children:l})},a:({href:l,children:o,...p})=>l?l.startsWith("/")?e.jsx(f,{href:l,children:o}):l.startsWith("#")?e.jsx("a",{href:l,onClick:x=>{const N=l.slice(1),_=document.getElementById(N);if(_){x.preventDefault();const M=_.getBoundingClientRect().top+window.scrollY-24;window.scrollTo({top:M,behavior:"smooth"}),history.replaceState(null,"",l)}},children:o}):e.jsx("a",{href:l,target:"_blank",rel:"noopener noreferrer",children:o}):e.jsx("a",{...p,children:o})},children:s.body})}),e.jsx(le,{tools:S}),e.jsx(oe,{shareTitle:s.title}),e.jsx("div",{ref:v,"aria-hidden":"true",style:{height:1,width:"100%",marginTop:-1}}),e.jsx(re,{prev:T,next:E}),e.jsx(ce,{})]})}),e.jsx(B,{}),e.jsx(W,{}),e.jsx(xe,{})]})}export{Ie as BlogPost};
