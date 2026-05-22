import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * 寫作範本骨架：含三種 callout、stat-grid、blockquote、table、code block 的最小範例。
 * 阿凱老師複製到 IDE 內當骨架，再依文章內容填字。
 */
const TEMPLATE = `## 第一段：問題切入

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
`;

/**
 * Admin-only 浮動按鈕：點擊複製 markdown body 範本到剪貼簿。
 * 範本含 callout / stat-grid / blockquote / table / code block 的最小骨架。
 */
export function BlogTemplateCopier() {
  const { isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isAdmin) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 安靜失敗 */
    }
  };

  return (
    <button
      type="button"
      className="bp-template-copier"
      onClick={handleCopy}
      title="複製文章範本骨架到剪貼簿（含 callout / stat-grid / code block）"
      aria-label="複製文章範本骨架"
    >
      <span aria-hidden="true">{copied ? '✓' : '📋'}</span>
      <span>{copied ? '已複製範本' : '複製文章範本'}</span>
    </button>
  );
}
