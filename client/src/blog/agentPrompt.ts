/**
 * 部落格文章左下角「複製 AI 開發提示詞」的內容。
 *
 * 讀者把提示詞貼給自己的 AI 助手（ChatGPT、Claude、Gemini、Codex 等），
 * 以文章介紹的工具為參考，規劃並開發適合自己情境的版本。
 * 工具放在 cagoooo.github.io/<repo>/ 的，原始碼就在 github.com/cagoooo/<repo>（2026-10-22 核對 91 個皆為公開 repo）；
 * 其他平台（Google Sites、學校主機等）的工具沒有獨立 repo，改附工具集總 repo。
 */

export const SITE_URL = 'https://cagoooo.github.io/Akai';
export const AKAI_REPO_URL = 'https://github.com/cagoooo/Akai';

export interface PromptPost {
  slug: string;
  title: string;
  toolIds: number[];
}

export interface PromptTool {
  id: number;
  title: string;
  description: string;
  url: string;
  tags?: string[];
}

/** 工具網址對應的 GitHub repo；不在 cagoooo.github.io 的工具回傳 null。 */
export function toolRepoUrl(toolUrl: string): string | null {
  const match = toolUrl.match(/^https:\/\/cagoooo\.github\.io\/([A-Za-z0-9._-]+)(?:[/?#]|$)/);
  return match ? `https://github.com/cagoooo/${match[1]}` : null;
}

/** 站內工具（例如 /Akai/tool/100）補成完整網址，方便讀者在別處點開。 */
function absoluteToolUrl(toolUrl: string): string {
  if (/^https?:\/\//.test(toolUrl)) return toolUrl;
  return `https://cagoooo.github.io${toolUrl.startsWith('/') ? '' : '/'}${toolUrl}`;
}

function toolBlock(tool: PromptTool): string {
  const repo = toolRepoUrl(tool.url);
  const lines = [
    `- 工具：#${tool.id} ${tool.title}`,
    `- 線上試用：${absoluteToolUrl(tool.url)}`,
    repo
      ? `- 原始碼（開源）：${repo}`
      : `- 原始碼：這個工具沒有獨立的 GitHub repo，請參考工具集總 repo ${AKAI_REPO_URL}，並以線上試用畫面推敲功能`,
    `- 工具介紹頁：${SITE_URL}/tool/${tool.id}/`,
    `- 它在做什麼：${tool.description}`,
  ];
  if (tool.tags?.length) lines.push(`- 關鍵字：${tool.tags.slice(0, 8).join('、')}`);
  return lines.join('\n');
}

export function buildAgentPrompt(post: PromptPost, tools: readonly PromptTool[]): string {
  const byId = new Map(tools.map((tool) => [tool.id, tool]));
  const related = post.toolIds.map((id) => byId.get(id)).filter((tool): tool is PromptTool => !!tool);
  const [main, ...others] = related;
  const articleUrl = `${SITE_URL}/blog/${post.slug}/`;
  const mainName = main ? `#${main.id} ${main.title}` : `文章介紹的 #${post.toolIds[0] ?? ''} 工具`;
  const mainRepo = main ? toolRepoUrl(main.url) : null;
  // 致謝連結指向站內工具介紹頁：別人改造後的作品連回本站，同時能從介紹頁找到線上版與原始碼
  const creditUrl = `${SITE_URL}/tool/${main ? main.id : post.toolIds[0] ?? ''}/`;

  const reference = main
    ? toolBlock(main)
    : `- 工具編號：${post.toolIds.map((id) => `#${id}`).join('、')}（詳細資料請到 ${SITE_URL}/tool/${post.toolIds[0] ?? ''}/ 查看）`;

  const otherTools = others.length
    ? `\n\n### 文章也提到這些相關工具（可選擇性參考）\n\n${others
      .map((tool) => {
        const repo = toolRepoUrl(tool.url);
        return `- #${tool.id} ${tool.title}：${absoluteToolUrl(tool.url)}${repo ? `（原始碼 ${repo}）` : ''}`;
      })
      .join('\n')}`
    : '';

  return `# 請幫我參考一個開源教育小工具，規劃並開發我自己的版本

我讀了阿凱老師（桃園市龍潭區石門國小）的文章〈${post.title}〉，想以文章介紹的「${mainName}」為參考，做一個適合我自己教學或工作情境的小工具。

## 參考作品

${reference}
- 介紹文章：${articleUrl}
- 阿凱老師教育工具集（上百個工具與原始碼）：${AKAI_REPO_URL}${otherTools}

## 我的情境（請先填好再送出）

- 我的身分與對象（例：國小五年級導師、科任、行政、家長）：
- 我想解決的問題：
- 我想和原作品不一樣的地方：
- 可用的環境與限制（例：學生用 Chromebook、不能安裝軟體、要用 Google 帳號登入、經費 0 元）：
- 我的程式經驗（例：完全沒寫過、會改一點網頁）：

## 請你這樣協助我

我可能是第一次用 AI 助手開發，請用白話說明每一步，下指令前先說這個指令在做什麼。

1. **先確認我的電腦準備好了**：問我用的是 Windows、Mac 還是 Chromebook，再檢查需要的工具，例如 Git、GitHub 帳號、可以在本機打開網頁預覽的方法；原作品需要 Node.js 或 Python 才檢查這兩項。缺什麼就一步一步教我安裝，裝好再往下。
2. **如果「我的情境」有空白**，請一題一題問我，不要自己假設。
3. **讀懂原作品**：如果你能在我的電腦執行指令，請把原始碼${mainRepo ? `（${mainRepo}）` : ''}下載到一個新的資料夾閱讀（例如 git clone），只讀不改，不要動到原作者的 repo；不能執行指令時再讀網頁上的檔案。${mainRepo ? '先看 README 與主要程式檔，' : '這個工具沒有獨立原始碼，請以線上試用畫面推敲，'}用白話說明：畫面有哪些功能、資料存在哪裡（只在這台電腦，還是雲端資料庫）、要不要登入、用了哪些外部服務或金鑰。讀不到就直接告訴我，讓我貼上關鍵檔案內容，不要憑空猜測。
4. **提出 2～3 個改良方向**：依照我的情境，各列出優點、缺點與大約工作量，讓我選一個。原作品功能很多時，請建議先做「最小可用版本」：只挑 1～2 個核心功能，做出來、上線、實際用過，再慢慢加。
5. **我選定後給開發計畫**：檔案結構、要新增或修改的功能、需要哪些帳號或 API 金鑰，以及每一步怎麼確認做對了。
6. **做成我自己的作品**：在我的 GitHub 建立新的 repo（不要直接修改原作者的 repo）；優先採用純前端靜態網頁加免費部署（例如 GitHub Pages）；畫面要同時適合手機與電腦。
7. **雲端資料庫與登入要換成我自己的**：原作品若用了 Firebase 之類的雲端資料庫或 Google 登入，原始碼裡的設定是原作者的專案或只是佔位文字，不能沿用。真的需要時，帶我建立自己的專案並設定好安全規則；不需要的話，先做資料只存在這台電腦（localStorage）的版本。
8. **保護金鑰**：第一次把檔案存進 Git 之前，先建立 .gitignore 並排除 .env；API 金鑰、密碼一律放在 .env 或部署平台的祕密設定，不要寫進程式碼，也不要上傳到公開 repo。
9. **保護學生個資**：如果會處理學生姓名、成績等個人資料，提醒我哪些資料不該上傳或公開，並建議去識別化的做法（例如只用座號）。
10. **一步一確認**：每完成一個步驟，就請我在瀏覽器實際操作確認，再進行下一步。
11. **帶我上線**：把作品推到我的 GitHub、開啟 GitHub Pages、給我正式網址，請我用手機和電腦各開一次確認都正常，才算完成。

## 授權與致謝

請先確認原始 repo 的授權條款：看 LICENSE 檔，也看 README 或 package.json 的 license 欄位。若找不到明確授權，請直接告訴我，改用「參考功能構想與畫面設計、自己重新撰寫程式」的方式進行，不要整段複製原始碼；我也可以先聯絡原作者確認。若沿用原始碼或設計，請在我的作品頁尾註明「參考自 阿凱老師 ${mainName}」，並附上工具介紹頁連結 ${creditUrl}${mainRepo ? `與原始碼連結 ${mainRepo}` : ''}，讓開源分享延續下去。
`;
}
