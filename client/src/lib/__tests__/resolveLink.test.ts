import { describe, expect, it } from 'vitest';
import { convertExternalToolLink, resolveInternalLink } from '../resolveLink';

describe('convertExternalToolLink', () => {
  it('自家工具網址改寫成工具介紹頁', () => {
    expect(convertExternalToolLink('https://cagoooo.github.io/pirls-questioncraft/')).toBe('/tool/87');
  });

  it('工具網址底下的子頁面仍改寫成工具介紹頁', () => {
    expect(convertExternalToolLink('https://cagoooo.github.io/pirls-questioncraft/quiz/')).toBe('/tool/87');
  });

  it('擴充套件下載頁是獨立資源，保留原網址（v3.6.204）', () => {
    const urls = [
      'https://cagoooo.github.io/pirls-questioncraft/extension/',
      'https://cagoooo.github.io/pirls-questioncraft/extension',
      'https://cagoooo.github.io/pirls-questioncraft/extension/#update',
      'https://cagoooo.github.io/pirls-questioncraft/extension/pirls-helper-extension.zip',
    ];
    for (const url of urls) expect(convertExternalToolLink(url)).toBe(url);
  });

  it('名稱相近但不是 extension 路徑的網址不受例外影響', () => {
    expect(convertExternalToolLink('https://cagoooo.github.io/pirls-questioncraft/extensions-old/')).toBe('/tool/87');
  });

  it('外部網址不改寫', () => {
    expect(convertExternalToolLink('https://aistudio.google.com/apikey')).toBe('https://aistudio.google.com/apikey');
  });
});

describe('resolveInternalLink', () => {
  it('擴充套件下載頁保持外部連結', () => {
    expect(resolveInternalLink('https://cagoooo.github.io/pirls-questioncraft/extension/')).toBe('https://cagoooo.github.io/pirls-questioncraft/extension/');
  });
});
