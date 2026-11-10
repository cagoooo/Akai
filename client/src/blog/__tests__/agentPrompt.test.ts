import { describe, expect, it } from 'vitest';
import { AKAI_REPO_URL, buildAgentPrompt, toolRepoUrl } from '../agentPrompt';

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
