import{j as e}from"./vendor-ui--2rknC_a.js";import{r as l}from"./vendor-react-CJhR42E5.js";import{c as H,d as N,B as v,t as a,L as z,a as E}from"./index-Dp1IV5t5.js";import{r as F,B as W,s as k}from"./useExtractedSections-DBtqInRg.js";import{M as L,r as M}from"./index-D7uEujSO.js";import"./vendor-firebase-BBkAadeS.js";import"./vendor-charts-BfhBwcPg.js";import"./vendor-utils-C4xBKWBT.js";import"./vendor-animation-ClxbdzuJ.js";const R="akai_blog_drafts_v1",u="akai_blog_draft_current_v1",h=5,b=`# 草稿標題（預覽不會顯示 H1，這只是給自己記）

## 第一段 H2 — 會出現在 TOC

這裡開始寫內文。**粗體**、*斜體*、\`inline code\`、[連結](https://example.com)。

<div class="callout callout--tip">
<div class="callout__label">💡 提示</div>

Callout 直接寫 HTML，paste 範本骨架就有，按右上「複製文章範本」可拿完整骨架。

</div>

\`\`\`ts
// 程式碼會自動語法高亮
const greeting = "Hello, Akai blog!";
\`\`\`

> 引言區塊 — 用 Noto Serif TC，左側橘色 border + 大引號裝飾

## 第二段 H2

- 自訂橘色圓點 unordered list
- 第二項

1. 有序列表
2. 第二項
`;function m(r){var s;return r==null||r===!1||r===!0?"":typeof r=="string"||typeof r=="number"?String(r):Array.isArray(r)?r.map(m).join(""):typeof r=="object"&&"props"in r?m((s=r.props)==null?void 0:s.children):""}function A(){try{const r=localStorage.getItem(R);if(!r)return[];const s=JSON.parse(r);return Array.isArray(s)?s:[]}catch{return[]}}function T(r){try{localStorage.setItem(R,JSON.stringify(r.slice(0,h)))}catch{}}function q(){const{isAdmin:r,loading:s}=H(),[,j]=N(),[_,w]=l.useState(()=>A()),[i,g]=l.useState(()=>localStorage.getItem(u)||"new"),[c,x]=l.useState(()=>{const n=A().find(o=>o.id===localStorage.getItem(u));return n?n.body:b}),d=l.useRef(null),S=l.useMemo(()=>{var n;const t=/^#{1,2}\s+(.+?)\s*$/m.exec(c);return((n=t==null?void 0:t[1])==null?void 0:n.trim())||"未命名草稿"},[c]);if(l.useEffect(()=>(d.current!==null&&window.clearTimeout(d.current),d.current=window.setTimeout(()=>{d.current=null,w(t=>{const n=i==="new"?`d_${Date.now()}`:i,o={id:n,title:S,body:c,updatedAt:Date.now()},p=t.filter(f=>f.id!==n),y=[o,...p].slice(0,h);if(T(y),i==="new"){g(n);try{localStorage.setItem(u,n)}catch{}}return y})},800),()=>{d.current!==null&&window.clearTimeout(d.current)}),[c,S,i]),l.useEffect(()=>{!s&&!r&&j("/")},[s,r,j]),s)return e.jsxs(e.Fragment,{children:[e.jsx(v,{}),e.jsx("div",{style:{padding:40,textAlign:"center",color:a.muted2},children:"📌 載入中…"})]});if(!r)return null;const C=()=>{try{localStorage.removeItem(u)}catch{}g("new"),x(b)},B=t=>{g(t.id),x(t.body);try{localStorage.setItem(u,t.id)}catch{}},D=t=>{w(n=>{const o=n.filter(p=>p.id!==t);if(T(o),i===t){try{localStorage.removeItem(u)}catch{}g("new"),x(b)}return o})};return e.jsxs(e.Fragment,{children:[e.jsx(v,{}),e.jsxs("div",{style:{maxWidth:1400,margin:"0 auto",padding:"20px clamp(16px, 3vw, 32px) 60px",fontFamily:a.font.tc},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap",marginBottom:16},children:[e.jsx("h1",{style:{fontSize:22,fontWeight:900,color:a.ink,margin:0},children:"✏️ 草稿預覽器"}),e.jsxs("span",{style:{fontSize:12,color:a.muted2},children:["自動存到 localStorage，最多 ",h," 篇。Admin only · 非正式發布途徑（正式文章請手寫進 posts.ts）"]}),e.jsx(z,{href:"/blog",style:{marginLeft:"auto",fontSize:12,color:a.red,fontWeight:700,textDecoration:"underline"},children:"← 回部落格列表"})]}),e.jsxs("div",{style:{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14},children:[e.jsx("button",{type:"button",onClick:C,style:I(i==="new"),children:"＋ 新草稿"}),_.map(t=>e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:4},children:[e.jsx("button",{type:"button",onClick:()=>B(t),title:`最後存於 ${new Date(t.updatedAt).toLocaleString("zh-TW")}`,style:I(i===t.id),children:t.title.length>14?t.title.slice(0,14)+"…":t.title}),e.jsx("button",{type:"button",onClick:()=>D(t.id),"aria-label":`刪除草稿 ${t.title}`,title:"刪除",style:{border:"none",background:"transparent",color:a.muted2,cursor:"pointer",fontSize:12,padding:"0 4px"},children:"×"})]},t.id))]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"},className:"bp-draft-split",children:[e.jsx("textarea",{value:c,onChange:t=>x(t.target.value),spellCheck:!1,style:{width:"100%",minHeight:"70vh",padding:"14px 16px",fontFamily:"'JetBrains Mono', ui-monospace, monospace",fontSize:14,lineHeight:1.55,color:a.ink,background:"#fff",border:"1.5px solid var(--rule, #d9cfb8)",borderRadius:10,outline:"none",resize:"vertical",boxSizing:"border-box"},placeholder:"把 markdown body 貼到這裡⋯"}),e.jsx("div",{className:"bp-article",style:{padding:"14px 18px",background:"#fff",border:"1.5px solid var(--rule, #d9cfb8)",borderRadius:10,minHeight:"70vh",maxWidth:"100%",overflowX:"auto"},children:e.jsx(L,{remarkPlugins:[M],rehypePlugins:[F],components:{h2:({children:t})=>{const n=k(m(t));return e.jsx("h2",{id:n,children:t})},h3:({children:t})=>{const n=k(m(t));return e.jsx("h3",{id:n,children:t})},table:({children:t})=>e.jsx("div",{className:"bp-table-wrap",children:e.jsx("table",{children:t})}),pre:({children:t})=>{const n=Array.isArray(t)?t[0]:t;if(n&&typeof n=="object"&&"props"in n){const o=n.props,p=o==null?void 0:o.className,y=m(o==null?void 0:o.children),f=/language-(\w+)/.exec(p||"");return e.jsx(W,{language:f==null?void 0:f[1],code:y})}return e.jsx("pre",{children:t})}},children:c})})]})]}),e.jsx(E,{})]})}function I(r){return{padding:"5px 12px",fontSize:12,fontFamily:a.font.tc,fontWeight:800,color:r?"#fff":a.ink,background:r?a.ink:"#fff",border:`1.8px solid ${a.ink}`,borderRadius:999,cursor:"pointer",boxShadow:r?"2px 2px 0 rgba(0,0,0,.2)":"1.5px 1.5px 0 rgba(0,0,0,.14)",transition:"all 0.15s ease"}}export{q as BlogDraftPreview};
