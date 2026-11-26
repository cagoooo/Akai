/**
 * 部落格文章左下角「複製 AI 開發提示詞」的內容。
 *
 * 讀者把提示詞貼給自己的 AI 助手（ChatGPT、Claude、Gemini、Codex 等），
 * 以文章介紹的工具為參考，規劃並開發適合自己情境的版本。
 * 工具放在 cagoooo.github.io/<repo>/ 的，原始碼就在 github.com/cagoooo/<repo>（2026-10-22 核對 91 個皆為公開 repo）；
 * 其他平台（Google Sites、學校主機等）的工具沒有獨立 repo，改請 Agent 以線上試用畫面推敲。
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
      : '- 原始碼：這個工具沒有獨立的 GitHub repo，請以線上試用畫面推敲功能',
    `- 工具介紹頁：${SITE_URL}/tool/${tool.id}/`,
    `- 它在做什麼：${tool.description}`,
  ];
  if (tool.tags?.length) lines.push(`- 關鍵字：${tool.tags.slice(0, 8).join('、')}`);
  return lines.join('\n');
}

interface DeployContext {
  post: PromptPost;
  tool: PromptTool;
  repo: string;
  articleUrl: string;
  creditUrl: string;
}

/**
 * 「直接套用成自己學校版本」的工具：原作品已整理成開源範本，別校只要改設定就能用。
 * 這類工具用通用的「參考後重新開發」提示詞，Agent 會從零重寫、提出改良方向，反而做不出來（2026-11-27 使用者要求檢查 #141）。
 */
const DEPLOY_GUIDES: Record<number, (ctx: DeployContext) => string> = {
  141: ({ post, tool, repo, articleUrl, creditUrl }) => `# 請幫我把開源的「iPad 電量監控站」套用成我們學校的版本

我讀了阿凱老師（桃園市龍潭區石門國小）的文章〈${post.title}〉，想把「#${tool.id} ${tool.title}」套用到我們學校：每 15 分鐘自動從 Jamf Pro 讀取全校 iPad 電量，找出充電線可能有問題的平板，整理成網頁，必要時推播到 Google Chat。
這個作品已經整理成給別校套用的開源範本（MIT 授權）。**請照原作品的設定方式套用，不要重寫程式，也不要先提改良方向**；想調整功能，等我們學校的版本上線、用過一陣子再說。

## 參考作品

${toolBlock(tool)}
- 給別校的完整設定說明：${repo}#給其他學校改成自己的版本
- 介紹文章：${articleUrl}

## 我們學校的情況（請先填好再送出；不確定的留空，AI 會再問）

- 學校簡稱、全名、負責處室（例：石門國小／桃園市龍潭區石門國民小學／資訊組）：
- Jamf Pro 網址（例：https://xxxx.jamfcloud.com）：
- 我在 Jamf 有沒有權限建立「API 角色與用戶端」：
- 平板的裝置名稱或使用者名稱，請舉 3～5 個實際例子（例：STU3-12、SMES-ENG1-05）：
- 有哪幾台充電車、每台車在網頁上要叫什麼（例：STU3 是 3 年級車）：
- 哪些是老師機（只顯示，不列入待檢查與推播）：
- 要不要推播到 Google Chat 聊天室：
- 我的 GitHub 帳號（還沒有就寫「沒有」）：
- 我的電腦（Windows／Mac／Chromebook）與程式經驗：

⚠️ Jamf 密碼、用戶端密碼、GitHub 金鑰、Webhook 網址都不要寫在這裡，也不要貼到對話裡。

## 請你這樣協助我

我可能是第一次用 AI 助手做這種事，請用白話說明每一步；下指令前先說這個指令在做什麼。一次只做一步，我確認了再往下。

1. **先讀設定說明**：
讀原作品 README 的「給其他學校：改成自己的版本」和 \`config.json\`，用 5～8 行告訴我你理解的套用步驟。讀不到就直接說，請我貼上內容，不要憑空猜。只讀，不要修改原作者的 repo。

2. **先檢查平板名稱（隱私）**：
GitHub 免費帳號的網頁是公開的，網頁會顯示 Jamf 的裝置名稱和使用者名稱。請先看我舉的名稱例子：如果含學生姓名或學號，請停下來，先請我在 Jamf 改成編號再繼續。

3. **複製成我們學校的專案**：
用原作品的「Use this template」建立新的 Public repo（名稱可沿用 \`ipad-battery-monitor\`），不要用 Fork，也不要修改原作者的 repo。能在我的電腦執行指令的話，可以用 \`gh repo create <我的帳號>/ipad-battery-monitor --template cagoooo/ipad-battery-monitor --public --clone\`。剛建立時如果自動跑了一次失敗，是因為還沒放帳密，先不用處理。

4. **在 Jamf 建立唯讀的 API 帳號**：
帶我到 Jamf Pro「設定 → 系統 → API 角色與用戶端」：建一個角色，勾「讀取行動裝置」；要用「每小時請平板回報」再加傳送清查要求的權限（名稱以畫面為準，可以搜尋 Inventory）。再建用戶端、套用角色、啟用、產生用戶端密碼。這一步由我自己在 Jamf 畫面操作，你負責說明。
原作者學校用的是帳號密碼方式；用戶端方式程式有支援，但原作者還沒實際用過。用戶端方式失敗時，改用專門建立的唯讀帳號密碼。

5. **把機密放進 GitHub 保險箱（Secrets）**：
需要的名稱：\`JAMF_URL\`、\`JAMF_CLIENT_ID\`、\`JAMF_CLIENT_SECRET\`（沒有用戶端時改用 \`JAMF_USER\`、\`JAMF_PASSWORD\`），推播再加 \`GCHAT_WEBHOOK\`。
**請不要叫我把密碼貼到對話裡**：請我自己到 repo 的 Settings → Secrets and variables → Actions 貼上，或在我自己的終端機執行 \`gh secret set JAMF_CLIENT_SECRET\`，等它提示時由我輸入。
要「每小時請平板回報」的話，在同一頁的 Variables 新增 \`JAMF_SEND_UPDATE_INVENTORY\`，值填 \`1\`。

6. **改 config.json（唯一要改的設定檔）**：
- \`school\` 換成我們的校名和處室，網頁標題和頁尾會自動跟著換。
- \`carts\` 依我給的平板名稱設計：\`prefix\` 是名稱裡的代號，要在名稱開頭，或前後有 \`-\`、\`_\`；名稱最後一段數字會當成車上的格號；\`kind\` 填 \`student\` 會列入待檢查與推播，填 \`teacher\` 只顯示。
- 改之前，先把我給的每個名稱例子對照規則，列成表給我看「這台會分到哪一車、第幾格」，我確認後再改。
- \`thresholds\`、\`night\`、\`utcOffsetHours\`（台灣是 8）先不要動。
- 不要改 \`scripts/\`、\`site/\`、\`.github/\` 裡的程式。

7. **開網頁發布、第一次執行**：
Settings → Pages → Source 選 **GitHub Actions**。接著到 Actions 分頁執行「iPad 電量監控（每 15 分鐘）」→ Run workflow（或 \`gh workflow run monitor.yml\`）。變紅色叉叉時，用 \`gh run view <編號> --log-failed\` 看原因，用白話告訴我是哪一步、怎麼修；最常見的是 Jamf 網址或帳密打錯、Pages 沒開。

8. **一起檢查分車結果**：
打開 \`https://<我的帳號>.github.io/<專案名稱>/\`，請我確認：平板總數跟 Jamf 差不多、每台車都分對、「其他」裡沒有應該分到車上的平板。分錯就回到第 6 步調整 \`config.json\`，推上去會自動重新產生。

9. **（選用）Google Chat 推播**：
在 Google Chat 建聊天室 → 應用程式與整合 → Webhook → 新增，網址由我自己存成 Secret \`GCHAT_WEBHOOK\`。之後學生機出現「電量危險、半夜沒充飽、連續低電量」才會推播，同一個問題不會每小時重複通知。

10. **（建議）用 Google Apps Script 當鬧鐘**：
GitHub 內建排程常延遲好幾個小時，照 README 步驟 8 設定：建 Fine-grained token（只選這個 repo，Actions 設 Read and write）；新增 Apps Script，貼上 \`gas/Code.gs\`，把第一行的 \`REPO\` 改成「我的帳號/專案名稱」；token 由我自己存進「指令碼屬性」\`GITHUB_TOKEN\`；執行 \`setup\`，授權畫面由我自己按允許。

11. **確認真的在自動跑**：
設定好 30 分鐘後，請我看 Actions 是否大約每 15 分鐘有一次綠色勾勾、網頁上的「資料更新於」時間有沒有跟著變，都正常才算完成。

## 授權與致謝

1. 原作品是 MIT 授權：請保留 \`LICENSE\` 裡原作者的版權標示。
2. 網頁頁尾原本的「Made with ❤️ by 阿凱老師」連結請保留；這是唯一可以改 \`site/\` 的地方：想標示我們學校的話，可以把那一行改成「我們學校名稱・參考自 阿凱老師 iPad 電量監控站」，連結維持不變。
3. 原作品資訊，讓開源分享延續下去：
- 工具介紹頁：${creditUrl}
- 原始碼：${repo}
`,
};

/** 這篇文章的主角工具若有「直接套用」的專屬提示詞，回傳它；沒有就回傳 null。 */
function deployGuidePrompt(post: PromptPost, main: PromptTool | undefined): string | null {
  if (!main) return null;
  const guide = DEPLOY_GUIDES[main.id];
  const repo = toolRepoUrl(main.url);
  if (!guide || !repo) return null;
  return guide({
    post,
    tool: main,
    repo,
    articleUrl: `${SITE_URL}/blog/${post.slug}/`,
    creditUrl: `${SITE_URL}/tool/${main.id}/`,
  });
}

export function buildAgentPrompt(post: PromptPost, tools: readonly PromptTool[]): string {
  const byId = new Map(tools.map((tool) => [tool.id, tool]));
  const related = post.toolIds.map((id) => byId.get(id)).filter((tool): tool is PromptTool => !!tool);
  // 只放文章主角一個工具：多列相關工具會讓 Agent 同時研究好幾個作品，開發方向發散（2026-11-11 使用者回饋）
  const [main] = related;
  const deploy = deployGuidePrompt(post, main);
  if (deploy) return deploy;
  const articleUrl = `${SITE_URL}/blog/${post.slug}/`;
  const mainName = main ? `#${main.id} ${main.title}` : `文章介紹的 #${post.toolIds[0] ?? ''} 工具`;
  const mainRepo = main ? toolRepoUrl(main.url) : null;
  // 致謝連結指向站內工具介紹頁：別人改造後的作品連回本站，同時能從介紹頁找到線上版與原始碼
  const creditUrl = `${SITE_URL}/tool/${main ? main.id : post.toolIds[0] ?? ''}/`;

  const reference = main
    ? toolBlock(main)
    : `- 工具編號：${post.toolIds.map((id) => `#${id}`).join('、')}（詳細資料請到 ${SITE_URL}/tool/${post.toolIds[0] ?? ''}/ 查看）`;

  return `# 請幫我參考一個開源教育小工具，規劃並開發我自己的版本

我讀了阿凱老師（桃園市龍潭區石門國小）的文章〈${post.title}〉，想以文章介紹的「${mainName}」為參考，做一個適合我自己教學或工作情境的小工具。
這次只以這一個作品為參考，請不要另外去研究其他工具，讓開發方向保持聚焦。

## 參考作品

${reference}
- 介紹文章：${articleUrl}

## 我的情境（請先填好再送出）

- 我的身分與對象（例：國小五年級導師、科任、行政、家長）：
- 我想解決的問題：
- 我想和原作品不一樣的地方：
- 可用的環境與限制（例：學生用 Chromebook、不能安裝軟體、要用 Google 帳號登入、經費 0 元）：
- 我的程式經驗（例：完全沒寫過、會改一點網頁）：

## 請你這樣協助我

我可能是第一次用 AI 助手開發，請用白話說明每一步，下指令前先說這個指令在做什麼。

1. **先確認我的電腦準備好了**：
問我用的是 Windows、Mac 還是 Chromebook，再檢查需要的工具，例如 Git、GitHub 帳號、可以在本機打開網頁預覽的方法；原作品需要 Node.js 或 Python 才檢查這兩項。缺什麼就一步一步教我安裝，裝好再往下。

2. **讀懂原作品**：
如果你能在我的電腦執行指令，請把原始碼${mainRepo ? `（${mainRepo}）` : ''}下載到一個新的資料夾閱讀（例如 git clone），只讀不改，不要動到原作者的 repo；不能執行指令時再讀網頁上的檔案。${mainRepo ? '先看 README 與主要程式檔，' : '這個工具沒有獨立原始碼，請以線上試用畫面推敲，'}用白話說明：畫面有哪些功能、資料存在哪裡（只在這台電腦，還是雲端資料庫）、要不要登入、用了哪些外部服務或金鑰。讀不到就直接告訴我，讓我貼上關鍵檔案內容，不要憑空猜測。

3. **先跟我對齊概念，再談做法**（像面談一樣，問清楚才動手）：
- 一次只問一題，依我的回答決定下一題；「我的情境」有空白或寫得含糊時，舉例追問，不要自己假設。
- 至少問清楚這些：誰會用（老師自己、投影給全班看，還是學生自己操作）、在什麼裝置上用、資料要存在這台電腦還是雲端、需不需要登入、會不會用到學生姓名或成績、做到什麼程度就算成功。
- 如果我想把原作品的功能全部做出來，請反問我最常用的是哪一兩個，幫我把範圍縮小。
- 問完後用 5～8 行寫出「我理解的需求」，請我確認或修正；我確認之前，不要提方案，也不要寫程式。

4. **提出 2～3 個改良方向**：
依照確認過的需求，各列出優點、缺點與大約工作量，讓我選一個。原作品功能很多時，請建議先做「最小可用版本」：只挑 1～2 個核心功能，做出來、上線、實際用過，再慢慢加。

5. **我選定後給開發計畫**：
檔案結構、要新增或修改的功能、需要哪些帳號或 API 金鑰，以及每一步怎麼確認做對了。

6. **做成我自己的作品**：
在我的 GitHub 建立新的 repo（不要直接修改原作者的 repo）；優先採用純前端靜態網頁加免費部署（例如 GitHub Pages）；畫面要同時適合手機與電腦。

7. **雲端資料庫與登入要換成我自己的**：
原作品若用了 Firebase 之類的雲端資料庫或 Google 登入，原始碼裡的設定是原作者的專案或只是佔位文字，不能沿用。真的需要時，帶我建立自己的專案並設定好安全規則；不需要的話，先做資料只存在這台電腦（localStorage）的版本。

8. **保護金鑰**：
第一次把檔案存進 Git 之前，先建立 .gitignore 並排除 .env；API 金鑰、密碼一律放在 .env 或部署平台的祕密設定，不要寫進程式碼，也不要上傳到公開 repo。

9. **保護學生個資**：
如果會處理學生姓名、成績等個人資料，提醒我哪些資料不該上傳或公開，並建議去識別化的做法（例如只用座號）。

10. **一步一確認**：
每完成一個步驟，就請我在瀏覽器實際操作確認，再進行下一步。

11. **帶我上線**：
把作品推到我的 GitHub、開啟 GitHub Pages、給我正式網址，請我用手機和電腦各開一次確認都正常，才算完成。

## 授權與致謝

1. **先確認授權**：
看原始 repo 的 LICENSE 檔，也看 README 或 package.json 的 license 欄位。

2. **找不到明確授權時**：
請直接告訴我，改用「參考功能構想與畫面設計、自己重新撰寫程式」的方式進行，不要整段複製原始碼；我也可以先聯絡原作者確認。

3. **在頁尾致謝**：
若沿用原始碼或設計，請在我的作品頁尾註明「參考自 阿凱老師 ${mainName}」，並附上下列連結，讓開源分享延續下去：
- 工具介紹頁：${creditUrl}${mainRepo ? `
- 原始碼：${mainRepo}` : ''}
`;
}

/** 文章主角工具（toolIds[0]）的資料是否已在手上；沒有時提示詞只會寫「文章介紹的 #N 工具」。 */
export function hasMainTool(post: Pick<PromptPost, 'toolIds'>, tools: readonly PromptTool[]): boolean {
  const mainId = post.toolIds[0];
  return mainId !== undefined && tools.some((tool) => tool.id === mainId);
}

/**
 * 確保組提示詞時拿得到主角工具的資料（v3.6.216）。
 * 文章頁剛打開時工具目錄可能還在下載，這時先等目錄載入（最多 timeoutMs），
 * 載入失敗或逾時就退回手上的資料，按鈕仍能複製。
 */
export async function ensurePromptTools(
  post: Pick<PromptPost, 'toolIds'>,
  tools: readonly PromptTool[],
  loadAll: () => Promise<readonly PromptTool[]>,
  timeoutMs = 5000,
): Promise<readonly PromptTool[]> {
  if (hasMainTool(post, tools)) return tools;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const all = await Promise.race([
      loadAll(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
      }),
    ]);
    const related = all.filter((tool) => post.toolIds.includes(tool.id));
    return related.length ? related : tools;
  } catch {
    return tools;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
