# GEO Sitemap Indexing Strategy

更新日：2026-07-03

## 目標

讓 ChatGPT、Claude、Perplexity、Google / Bing 等搜尋與 AI 系統更容易理解「科技教育創新專區」的內容結構：

1. 站內工具詳情頁：`/tool/{id}`
2. 教學情境文章：`/blog/{slug}` 或 `/blog/tool-{id}`
3. 實際可使用工具網址：GitHub Pages、Firebase Hosting、Google Sites、XOOPS 校網等外部網址

## 索引策略

### `/tool/{id}`：主要工具節點

`/tool/{id}` 是每個工具在科技教育專區的 canonical 說明頁，負責提供：

- 工具名稱、摘要、分類、標籤
- `SoftwareApplication` JSON-LD
- 作者與學校關聯：阿凱老師、桃園市龍潭區石門國民小學
- `sameAs` 指向實際工具網址

因此 sitemap 會正式列入全部站內工具詳情頁。

### `/blog/{slug}`：教學情境與長尾查詢

部落格文章負責回答「老師會怎麼用」「適合什麼情境」「實測效果」這類 AI 搜尋常見問題。文章 JSON-LD 透過 `about` 連回相關工具。

### 實際工具網址：可使用頁

外部工具 URL 仍保留在 sitemap，但 priority 低於站內工具頁。這樣搜尋引擎可以找到真正可開啟的工具，也不會把外部網址誤認為科技教育專區的唯一內容來源。

## 避免的反模式

- 不把 `noindex` 頁面提交到 sitemap。
- 不把 `/wish/`、`/share/heatmap.html` 這類純 OG 導流頁列入 sitemap。
- 不讓 AI 只引用外部工具 URL，而漏掉站內工具說明與教學情境文章。

## 定期檢查

每月執行：

```powershell
node scripts/test-geo-discoverability.mjs
node scripts/test-geo-discoverability.mjs --report
```

測試結果記錄於 `geo-tests.json`。若 HIT / PARTIAL 下降，優先檢查：

- `client/public/llms.txt`
- `client/public/llms-full.txt`
- `client/public/sitemap.xml`
- 工具頁 `SoftwareApplication` JSON-LD
- 部落格文章 `BlogPosting` JSON-LD
