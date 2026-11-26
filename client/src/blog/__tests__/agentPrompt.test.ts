import { describe, expect, it } from 'vitest';
import { AKAI_REPO_URL, buildAgentPrompt, ensurePromptTools, hasMainTool, toolRepoUrl } from '../agentPrompt';

const iwin = {
  id: 131,
  title: 'iWIN 兒少上網問卷結果閱讀站',
  description: '將本校回饋與全國結果連結收在一頁。',
  url: 'https://cagoooo.github.io/iwin-115-survey/',
  tags: ['iWIN', '兒少上網'],
};
const googleSitesTool = {
  id: 20,
  title: '外部平台工具',
  description: '放在 Google Sites 的工具。',
  url: 'https://sites.google.com/view/example',
};

describe('文章專屬 AI 開發提示詞', () => {
  it('GitHub Pages 工具對應同名 repo，其他平台沒有獨立 repo', () => {
    expect(toolRepoUrl('https://cagoooo.github.io/iwin-115-survey/')).toBe('https://github.com/cagoooo/iwin-115-survey');
    expect(toolRepoUrl('https://cagoooo.github.io/it-cockpit/#/unit/3')).toBe('https://github.com/cagoooo/it-cockpit');
    expect(toolRepoUrl('https://sites.google.com/view/example')).toBeNull();
    expect(toolRepoUrl('/Akai/tool/100')).toBeNull();
  });

  it('每篇提示詞含主工具、原始碼 repo 與文章網址', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: '#131 先看本校', toolIds: [131, 20] }, [googleSitesTool, iwin]);
    expect(prompt).toContain('#131 iWIN 兒少上網問卷結果閱讀站');
    expect(prompt).toContain('https://github.com/cagoooo/iwin-115-survey');
    expect(prompt).toContain('https://cagoooo.github.io/Akai/blog/iwin-131/');
    expect(prompt).toContain('石門國小');
  });

  it('只聚焦文章主角一個工具：不列其他相關工具與工具集總 repo', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: '#131 先看本校', toolIds: [131, 20] }, [googleSitesTool, iwin]);
    expect(prompt).not.toContain('#20 外部平台工具');
    expect(prompt).not.toContain('可選擇性參考');
    expect(prompt).not.toContain(AKAI_REPO_URL);
    expect(prompt).toContain('這次只以這一個作品為參考');
  });

  it('每個步驟標題自成一行，內容換到下一行', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: 'T', toolIds: [131] }, [iwin]);
    expect(prompt).toContain('2. **讀懂原作品**：\n如果你能在我的電腦執行指令');
    expect(prompt).toContain('11. **帶我上線**：\n把作品推到我的 GitHub');
    expect(prompt).not.toMatch(/^\d+\. \*\*[^*]+\*\*：\S/m);
  });

  it('致謝段請改造者附上工具介紹頁連結，讓作品連回本站', () => {
    const withRepo = buildAgentPrompt({ slug: 'iwin-131', title: 'T', toolIds: [131] }, [iwin]);
    expect(withRepo).toMatch(/頁尾註明[^]*- 工具介紹頁：https:\/\/cagoooo\.github\.io\/Akai\/tool\/131\/\n- 原始碼：https:\/\/github\.com\/cagoooo\/iwin-115-survey/);
    const noRepo = buildAgentPrompt({ slug: 'g', title: 'G', toolIds: [20] }, [googleSitesTool]);
    expect(noRepo).toMatch(/頁尾註明[^]*- 工具介紹頁：https:\/\/cagoooo\.github\.io\/Akai\/tool\/20\//);
    expect(noRepo).not.toContain('- 原始碼：https');
  });

  it('不同文章產生不同內容', () => {
    const a = buildAgentPrompt({ slug: 'a', title: 'A', toolIds: [131] }, [iwin, googleSitesTool]);
    const b = buildAgentPrompt({ slug: 'b', title: 'B', toolIds: [20] }, [iwin, googleSitesTool]);
    expect(a).not.toBe(b);
    expect(b).toContain('沒有獨立的 GitHub repo');
  });

  it('工具目錄還沒載入時仍給出工具編號與介紹頁', () => {
    const prompt = buildAgentPrompt({ slug: 'x', title: 'X', toolIds: [131] }, []);
    expect(prompt).toContain('#131');
    expect(prompt).toContain('https://cagoooo.github.io/Akai/tool/131/');
  });

  it('新手電腦也能一路做到上線：環境檢查、下載原始碼、換成自己的雲端專案、上線確認', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: 'T', toolIds: [131] }, [iwin]);
    expect(prompt).toContain('先確認我的電腦準備好了');
    expect(prompt).toContain('一次只問一題');
    expect(prompt).toContain('（https://github.com/cagoooo/iwin-115-survey）下載到一個新的資料夾');
    expect(prompt).toContain('最小可用版本');
    expect(prompt).toContain('不要直接修改原作者的 repo');
    expect(prompt).toContain('不能沿用');
    expect(prompt).toContain('先建立 .gitignore');
    expect(prompt).toContain('開啟 GitHub Pages');
  });

  it('找不到授權時改為參考構想、自己重寫，不整段複製', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: 'T', toolIds: [131] }, [iwin]);
    expect(prompt).toContain('package.json 的 license 欄位');
    expect(prompt).toContain('**找不到明確授權時**');
    expect(prompt).toContain('不要整段複製原始碼');
  });

  it('沒有獨立原始碼的工具改以線上畫面推敲', () => {
    const prompt = buildAgentPrompt({ slug: 'g', title: 'G', toolIds: [20] }, [googleSitesTool]);
    expect(prompt).toContain('這個工具沒有獨立原始碼，請以線上試用畫面推敲');
    expect(prompt).not.toContain('先看 README');
  });

  it('動手前先對齊概念：讀完原作品後逐題追問、複述需求，確認前不提方案也不寫程式', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: 'T', toolIds: [131] }, [iwin]);
    const read = prompt.indexOf('**讀懂原作品**');
    const align = prompt.indexOf('**先跟我對齊概念，再談做法**');
    const options = prompt.indexOf('**提出 2～3 個改良方向**');
    expect(read).toBeGreaterThan(-1);
    expect(align).toBeGreaterThan(read);
    expect(options).toBeGreaterThan(align);
    expect(prompt).toContain('舉例追問，不要自己假設');
    expect(prompt).toContain('需不需要登入');
    expect(prompt).toContain('做到什麼程度就算成功');
    expect(prompt).toContain('反問我最常用的是哪一兩個');
    expect(prompt).toContain('「我理解的需求」');
    expect(prompt).toContain('我確認之前，不要提方案，也不要寫程式');
    expect(prompt).toContain('11. **帶我上線**：');
  });
});

describe('ensurePromptTools（文章頁剛打開就按複製，v3.6.216）', () => {
  const post = { toolIds: [131, 45] };
  const other = { id: 45, title: '文字雲', description: '收集關鍵詞', url: 'https://cagoooo.github.io/cloud' };

  it('主角工具已在手上就不重新載入', async () => {
    let called = 0;
    const result = await ensurePromptTools(post, [iwin], async () => { called++; return []; });
    expect(result).toEqual([iwin]);
    expect(called).toBe(0);
    expect(hasMainTool(post, [iwin])).toBe(true);
  });

  it('工具清單還是空的時，等目錄載入後只留文章相關的工具', async () => {
    expect(hasMainTool(post, [])).toBe(false);
    const result = await ensurePromptTools(post, [], async () => [other, iwin, { ...other, id: 99 }]);
    expect(result.map((t) => t.id)).toEqual([45, 131]);
    const prompt = buildAgentPrompt({ slug: 'x', title: 't', toolIds: [131, 45] }, result);
    expect(prompt).toContain('- 工具：#131 iWIN 兒少上網問卷結果閱讀站');
    expect(prompt).not.toContain('文章介紹的 #131 工具');
  });

  it('目錄載入失敗或逾時，退回手上的資料，不讓按鈕卡住', async () => {
    await expect(ensurePromptTools(post, [other], async () => { throw new Error('offline'); })).resolves.toEqual([other]);
    const never = () => new Promise<never>(() => {});
    await expect(ensurePromptTools(post, [], never, 20)).resolves.toEqual([]);
  });
});

describe('直接套用版提示詞（#141 iPad 電量監控站）', () => {
  const monitor = {
    id: 141,
    title: 'iPad 電量監控站｜Jamf 充電車自動巡查',
    description: '每 15 分鐘自動讀取 Jamf 的全校 iPad 電量。',
    url: 'https://cagoooo.github.io/ipad-battery-monitor/',
    tags: ['Jamf', 'iPad'],
  };
  const prompt = buildAgentPrompt({ slug: 'ipad-141', title: '#141 T', toolIds: [141, 46] }, [monitor]);

  it('照範本套用，不走重新開發', () => {
    expect(prompt).toContain('套用成我們學校的版本');
    expect(prompt).toContain('不要重寫程式');
    expect(prompt).toContain('--template cagoooo/ipad-battery-monitor');
    expect(prompt).not.toContain('提出 2～3 個改良方向');
    expect(prompt).not.toContain('Firebase');
  });

  it('涵蓋別校要改的設定：config.json、Jamf Secrets、Pages、Apps Script 鬧鐘', () => {
    for (const key of ['config.json', 'JAMF_URL', 'JAMF_CLIENT_SECRET', 'GCHAT_WEBHOOK', 'JAMF_SEND_UPDATE_INVENTORY', 'GitHub Actions', 'gas/Code.gs']) {
      expect(prompt).toContain(key);
    }
  });

  it('提醒密碼不要貼進對話、平板名稱不能有學生姓名', () => {
    expect(prompt).toContain('不要叫我把密碼貼到對話裡');
    expect(prompt).toContain('學生姓名或學號');
  });

  it('學校 Jamf 由教育局統一管理、看不到 API 設定時有替代做法', () => {
    expect(prompt).toContain('找不到「API 角色與用戶端」');
    expect(prompt).toContain('請教育局的 Jamf 管理者');
  });

  it('附原始碼、設定說明與工具介紹頁', () => {
    expect(prompt).toContain('https://github.com/cagoooo/ipad-battery-monitor#給其他學校改成自己的版本');
    expect(prompt).toContain('https://cagoooo.github.io/Akai/tool/141/');
    expect(prompt).toContain('https://cagoooo.github.io/Akai/blog/ipad-141/');
  });

  it('其他工具仍用原本的開發提示詞', () => {
    const other = buildAgentPrompt({ slug: 'iwin-131', title: 'T', toolIds: [131] }, [iwin]);
    expect(other).toContain('提出 2～3 個改良方向');
  });
});
