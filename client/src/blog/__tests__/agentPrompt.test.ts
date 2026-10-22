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

  it('每篇提示詞含主工具、原始碼 repo、文章網址與總 repo', () => {
    const prompt = buildAgentPrompt({ slug: 'iwin-131', title: '#131 先看本校', toolIds: [131, 20] }, [googleSitesTool, iwin]);
    expect(prompt).toContain('#131 iWIN 兒少上網問卷結果閱讀站');
    expect(prompt).toContain('https://github.com/cagoooo/iwin-115-survey');
    expect(prompt).toContain('https://cagoooo.github.io/Akai/blog/iwin-131/');
    expect(prompt).toContain(AKAI_REPO_URL);
    expect(prompt).toContain('#20 外部平台工具');
    expect(prompt).toContain('石門國小');
  });

  it('不同文章產生不同內容', () => {
    const a = buildAgentPrompt({ slug: 'a', title: 'A', toolIds: [131] }, [iwin, googleSitesTool]);
    const b = buildAgentPrompt({ slug: 'b', title: 'B', toolIds: [20] }, [iwin, googleSitesTool]);
    expect(a).not.toBe(b);
    expect(b).toContain('沒有獨立的 GitHub repo');
  });

  it('工具目錄還沒載入時仍給出工具編號與總 repo', () => {
    const prompt = buildAgentPrompt({ slug: 'x', title: 'X', toolIds: [131] }, []);
    expect(prompt).toContain('#131');
    expect(prompt).toContain(AKAI_REPO_URL);
  });
});
