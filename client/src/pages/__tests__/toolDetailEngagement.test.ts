import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('tool detail engagement notifications', () => {
  it('covers the current 114 public tools with a single detail-page notification path', () => {
    const tools = JSON.parse(readFileSync(resolve(root, 'client/public/api/tools.json'), 'utf8')) as Array<{
      id: number;
      url?: string;
      isInternal?: boolean;
    }>;

    const publicTools = tools.filter((tool) => !tool.isInternal);
    expect(publicTools).toHaveLength(114);
    expect(new Set(publicTools.map((tool) => tool.id)).size).toBe(publicTools.length);
    expect(publicTools.every((tool) => typeof tool.url === 'string' && tool.url.length > 0)).toBe(true);

    const source = readSource('client/src/pages/BulletinToolDetail.tsx');
    expect(source).toContain('notifyEngagementAfterHomeEntry({');
    expect(source).toContain("source: 'tool_detail_use'");
    expect(source).toContain('await Promise.race');
  });

  it('keeps the legacy detail page on the same notification contract', () => {
    const source = readSource('client/src/pages/ToolDetail.tsx');
    expect(source).toContain('notifyEngagementAfterHomeEntry({');
    expect(source).toContain("source: 'tool_detail_use'");
    expect(source).toContain('await Promise.race');
  });

  it('does not require a home-page session before sending blog and tool notifications', () => {
    const source = readSource('client/src/lib/analytics.ts');
    expect(source).toContain('const requiresHomeEntry = event.requireHomeEntry ?? false;');
  });
});
