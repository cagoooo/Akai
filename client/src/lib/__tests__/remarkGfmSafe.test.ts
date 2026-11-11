import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { createRemarkGfmSafe, supportsRegexLookbehind } from '../remarkGfmSafe';

const markdown = [
  '| 欄 | 值 |',
  '| --- | --- |',
  '| A | 1 |',
  '',
  '聯絡 teacher@example.com 或 https://cagoooo.github.io/Akai/',
  '',
  '~~刪除線~~',
  '',
  '- [x] 待辦',
].join('\n');

function parse(lookbehindSupported: boolean) {
  const processor = unified().use(remarkParse).use(createRemarkGfmSafe(lookbehindSupported));
  return JSON.stringify(processor.runSync(processor.parse(markdown)));
}

describe('remark-gfm 舊瀏覽器相容版（JAVASCRIPT-REACT-2A，Safari 16.3）', () => {
  it('目前的測試環境支援往回看正規表示式', () => {
    expect(supportsRegexLookbehind()).toBe(true);
  });

  it('支援往回看時與原本 remark-gfm 相同：純文字 email 會變成連結', () => {
    const tree = parse(true);
    expect(tree).toContain('"type":"table"');
    expect(tree).toContain('mailto:teacher@example.com');
  });

  it('舊瀏覽器模式：不掛會建立往回看正規表示式的轉換，表格、刪除線、待辦清單、網址與 email 連結照常', () => {
    const processor = unified().use(remarkParse).use(createRemarkGfmSafe(false)).freeze();
    const extensions = (processor.data('fromMarkdownExtensions') ?? []) as Array<Array<{ transforms?: unknown[] }>>;
    const transforms = extensions.flat().flatMap((extension) => extension.transforms ?? []);
    expect(transforms).toHaveLength(0);

    const tree = parse(false);
    expect(tree).toContain('"type":"table"');
    expect(tree).toContain('"type":"delete"');
    expect(tree).toContain('"checked":true');
    expect(tree).toContain('"url":"https://cagoooo.github.io/Akai/"');
    expect(tree).toContain('mailto:teacher@example.com');
  });

  it('支援往回看時保留原本的轉換', () => {
    const processor = unified().use(remarkParse).use(createRemarkGfmSafe(true)).freeze();
    const extensions = (processor.data('fromMarkdownExtensions') ?? []) as Array<Array<{ transforms?: unknown[] }>>;
    expect(extensions.flat().flatMap((extension) => extension.transforms ?? [])).not.toHaveLength(0);
  });
});
