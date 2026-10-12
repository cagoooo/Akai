import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OptimizedIcon } from '../OptimizedIcons';
import { ChartStyle } from '../ui/chart';
import { AmpHome } from '../../pages/amp/Home';
import { escapeChatCardText } from '../../../../server/chat-card-escape';
import { serializeJsonLd } from '../../lib/jsonLdSafety';
import { renderToStaticMarkup } from 'react-dom/server';

describe('動態通知文字與 HTML 輸出安全', () => {
  it('通知卡片把偽造標籤、連結與實體當文字，保留中文及換行', () => {
    const result = escapeChatCardText('錯誤\n</pre><a href="https://evil.example">&lt;攻擊\'</a>');
    expect(result).toBe('錯誤\n&lt;/pre&gt;&lt;a href=&quot;https://evil.example&quot;&gt;&amp;lt;攻擊&#39;&lt;/a&gt;');
    expect(result).not.toMatch(/<\/?(?:a|pre)/);
    expect(escapeChatCardText(undefined)).toBe('');
  });

  it('固定 SVG 圖示保留路徑及多種幾何元素', () => {
    const { container } = render(<><OptimizedIcon name="Clock" size={32} /><OptimizedIcon name="Palette" /></>);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('32');
    expect(container.querySelector('polyline')?.getAttribute('points')).toBe('12 6 12 12 16 14');
    expect(container.querySelectorAll('circle')).toHaveLength(5);
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('圖示名稱無法讀取原型或插入 HTML', () => {
    const { container } = render(<><OptimizedIcon name="__proto__" /><OptimizedIcon name="constructor" /><OptimizedIcon name="<script>alert(1)</script>" /></>);
    expect(container.innerHTML).toBe('');
  });

  it('圖表保留淺深色 CSS 變數與常用色彩格式', () => {
    const { container } = render(<ChartStyle id="chart-safe_1" config={{
      count: { theme: { light: 'hsl(var(--chart-1))', dark: '#123456' } },
      other: { color: 'rgba(10, 20, 30, 0.5)' },
    }} />);
    const css = container.querySelector('style')?.textContent;
    expect(css).toContain('.dark [data-chart=chart-safe_1]');
    expect(css).toContain('--color-count: hsl(var(--chart-1));');
    expect(css).toContain('--color-count: #123456;');
    expect(css).toContain('--color-other: rgba(10, 20, 30, 0.5);');
  });

  it('圖表拒絕跳出選擇器、CSS 宣告與 style 結束標籤', () => {
    const { container, rerender } = render(<ChartStyle id="chart-safe" config={{
      'evil}body': { color: 'red' },
      colorAttack: { color: 'red; background: url(https://evil.example)' },
      htmlAttack: { color: '</style><script>alert(1)</script>' },
      normal: { color: 'var(--chart-2)' },
    }} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('style')?.textContent).not.toMatch(/evil|background|script/);
    expect(container.querySelector('style')?.textContent).toContain('--color-normal: var(--chart-2);');
    rerender(<ChartStyle id="safe] { color: red }" config={{ normal: { color: 'red' } }} />);
    expect(container.querySelector('style')).toBeNull();
  });

  it('AMP 結構化資料仍為可解析的完整 JSON', () => {
    const { container } = render(<AmpHome />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const schema = JSON.parse(script?.textContent || '');
    expect(schema['@type']).toBe('EducationalOrganization');
    expect(schema.name).toBe('教育科技創新專區');
    expect(schema.hasCourseInstance.inLanguage).toBe('zh-TW');
    const serverHtml = renderToStaticMarkup(<AmpHome />);
    const serverSchema = JSON.parse(serverHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || '');
    expect(serverSchema).toEqual(schema);
  });

  it('JSON-LD 不會讓資料中的結束標籤變成新 script，並維持原資料', () => {
    const source = { name: '</script><script>alert(1)</script>&\u2028\u2029' };
    const json = serializeJsonLd(source);
    expect(json).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(json)).toEqual(source);
    expect(serializeJsonLd(undefined)).toBe('null');
  });
});
