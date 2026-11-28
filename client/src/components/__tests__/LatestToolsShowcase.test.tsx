import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LATEST_NUDGE_AUTO_HIDE_MS, LatestToolsShowcase, selectLatestTools } from '../LatestToolsShowcase';
import type { EducationalTool } from '@/lib/data';

vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));
const tools: EducationalTool[] = [1, 2, 3, 4].map(id => ({
  id, title: `工具 ${id}`, description: '教學新點子', category: 'teaching', icon: '', url: '/', addedAt: `2026-09-0${id}`,
}));
function Harness({ blocked = false, autoEligible = true, data = tools }: { blocked?: boolean; autoEligible?: boolean; data?: EducationalTool[] }) {
  const [open, setOpen] = useState(false);
  return <LatestToolsShowcase tools={data} blocked={blocked} autoEligible={autoEligible} open={open} onOpenChange={setOpen} onLocateTool={() => {}} />;
}
const advance = () => act(() => { vi.advanceTimersByTime(1300); });
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); vi.useFakeTimers(); });
const nudge = () => screen.queryByRole('complementary', { name: '新上架工具提示' });
afterEach(() => { vi.useRealTimers(); });

describe('最新工具展示架', () => {
  it('依日期排序、同日以 ID 排序，排除站內工具，不改動原始資料', () => {
    const source = [...tools, { ...tools[0], id: 99, isInternal: true, addedAt: '2027-01-01' }, { ...tools[0], id: 88, addedAt: 'invalid' }];
    expect(selectLatestTools(source).map(t => t.id)).toEqual([4, 3, 2]);
    expect(source[0].id).toBe(1);
  });
  it('自動提示只滑出角落小便利貼，不自動打開大視窗；族群推薦開著時先不出現', () => {
    const { rerender } = render(<Harness blocked />);
    advance();
    expect(nudge()).not.toBeInTheDocument();
    rerender(<Harness />);
    advance();
    expect(nudge()).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Harness blocked />);
    expect(nudge()).not.toBeInTheDocument();
  });
  it('小提示按「看看」才打開展示架，並且 12 秒後自己收起', () => {
    const first = render(<Harness />);
    advance();
    fireEvent.click(screen.getByRole('button', { name: /新上架 3 個工具/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    first.unmount();
    localStorage.clear();
    render(<Harness />);
    advance();
    expect(nudge()).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(LATEST_NUDGE_AUTO_HIDE_MS); });
    expect(nudge()).not.toBeInTheDocument();
  });
  it('同一批只提示一次（回訪也不再提示），仍能從入口手動重看；看過後 NEW 標記消失', () => {
    const first = render(<Harness />);
    advance();
    fireEvent.click(screen.getByRole('button', { name: '關閉新上架提示' }));
    expect(nudge()).not.toBeInTheDocument();
    advance();
    expect(nudge()).not.toBeInTheDocument();
    first.unmount();
    render(<Harness />);
    advance();
    expect(nudge()).not.toBeInTheDocument();
    expect(screen.getByText('NEW')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /看看最新/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });
  it('有新工具上架（批次不同）時會再提示一次', () => {
    const first = render(<Harness />);
    advance();
    first.unmount();
    render(<Harness data={[...tools, { ...tools[0], id: 5, addedAt: '2026-09-09' }]} />);
    advance();
    expect(nudge()).toBeInTheDocument();
  });
  it('有搜尋或指定工具意圖時不自動插入推薦', () => {
    render(<Harness autoEligible={false} />);
    advance();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('目錄載入前先佔住入口的位置（不可操作），載入後換成真正的入口，避免把下方內容往下推', () => {
    const { container, rerender } = render(<Harness data={[]} />);
    const pending = container.querySelector('.latest-tools-entry--pending');
    expect(pending).toBeInTheDocument();
    expect(pending).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<Harness />);
    expect(container.querySelector('.latest-tools-entry--pending')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /看看最新/ })).toBeInTheDocument();
    // 真正的入口與預留位置用同一個外框，位置才會一致
    expect(container.querySelector('.latest-tools-entry')).toBeInTheDocument();
  });
  it('資料延遲載入後仍能展示，空資料不顯示入口', () => {
    const { rerender } = render(<Harness data={[]} />);
    advance();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<Harness />);
    advance();
    expect(nudge()).toBeInTheDocument();
  });
  it('客群對話阻擋時不搶下載；小提示出現後才預載最新三張', () => {
    const preloads = () => document.head.querySelectorAll('link[rel="preload"][as="image"]');
    const data = tools.map(tool => ({ ...tool, previewUrl: `/previews/tool_${tool.id}.webp` }));
    const { rerender } = render(<Harness data={data} blocked />);
    expect(preloads()).toHaveLength(0);
    rerender(<Harness data={data} />);
    expect(preloads()).toHaveLength(0);
    advance();
    expect(preloads()).toHaveLength(3);
  });
  it('縮圖失敗可回退原圖，原圖也失敗才顯示圖示', () => {
    const id = Number(Object.keys(JSON.parse(import.meta.env.VITE_LATEST_TOOL_PREVIEWS))[0]);
    const tool = { ...tools[0], id, addedAt: '2026-10-05', previewUrl: `/previews/tool_${id}.webp` };
    render(<Harness data={[tool]} />);
    fireEvent.click(screen.getByRole('button', { name: /看看最新/ }));
    const dialog = screen.getByRole('dialog');
    const image = dialog.querySelector('img')!;
    expect(image.getAttribute('src')).toContain('/previews/latest/');
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe(`/previews/tool_${id}.webp`);
    fireEvent.error(image);
    expect(dialog.querySelector('img')).toBeNull();
  });
});
