import{G as o}from"./index-C4DTnMrX.js";import"./vendor-ui--2rknC_a.js";import"./vendor-react-CJhR42E5.js";import"./vendor-firebase-By6GcgLu.js";import"./vendor-charts-BfhBwcPg.js";import"./vendor-utils-C4xBKWBT.js";import"./vendor-animation-ClxbdzuJ.js";const d={communication:"溝通互動",teaching:"教學設計",language:"語文寫作",reading:"語文閱讀",utilities:"實用工具",games:"教育遊戲",interactive:"互動體驗"},l={communication:"💬",teaching:"📚",language:"✍️",reading:"📖",utilities:"🛠️",games:"🎮",interactive:"🎯"},m={communication:"blue",teaching:"green",language:"purple",reading:"orange",utilities:"yellow",games:"pink",interactive:"blue"};function $(i){const e=d[i.category]||i.category,c=l[i.category]||"🔖",s=`tool-${i.id}`,t=i.tags||[],n=i.description||"",a=i.detailedDescription||"",r=`## 這是什麼工具？

${c} **${i.title}** 是阿凱老師打造的 **${e}** 類工具${t.length>0?`，主要解決 ${t.slice(0,3).join("、")} 等情境的需求`:""}。

${n}

${a&&a!==n?`
${a.split(`
`).slice(0,6).join(`
`)}
`:""}

## 適合誰用？

- 想做 **${e}** 相關教學的國小 / 國中老師
- 對「${t[0]||i.title}」「${t[1]||e}」有需求的教育工作者
- 想要免註冊、免費、無廣告教育工具的所有人

## 怎麼開始？

1. 點下方按鈕進到 [#${i.id} 工具頁](/tool/${i.id})
2. 看「立即開啟工具」按鈕（會跳到工具實際運作的網站）
3. 收藏到「我的工具」方便下次找

${t.length>0?`
## 🏷 工具標籤

${t.map(g=>`\`${g}\``).join(" · ")}
`:""}

## 想看更詳細的使用情境？

阿凱老師為部分熱門工具寫了 [長篇教學情境文章](/blog) — 含真實數據、學生回饋、配對工具推薦。
歡迎 [到許願池](/?wish=1) 留言「想看 #${i.id} ${i.title} 詳細用法」，阿凱老師會考慮優先寫。
`;return{slug:s,title:`【30 秒看完】#${i.id} ${i.title}：適合誰用？怎麼開始？`,excerpt:n.length>100?n.slice(0,98)+"…":n,publishedAt:i.addedAt||"2024-06-01",readingMinutes:2,tags:[e,...t.slice(0,4)],toolIds:[i.id],coverEmoji:c,coverColor:m[i.category]||"yellow",body:r}}function T(i){return i.filter(e=>!e.isInternal&&!o.has(e.id)).map($)}export{T as generateMiniPosts,$ as toolToMiniPost};
