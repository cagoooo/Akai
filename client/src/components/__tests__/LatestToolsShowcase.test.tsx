import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LatestToolsShowcase, selectLatestTools } from '../LatestToolsShowcase';
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
beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('最新工具展示架', () => {
  it('依日期排序、同日以 ID 排序，排除站內工具，不改動原始資料', () => {
    const source = [...tools, { ...tools[0], id: 99, isInternal: true, addedAt: '2027-01-01' }, { ...tools[0], id: 88, addedAt: 'invalid' }];
    expect(selectLatestTools(source).map(t => t.id)).toEqual([4, 3, 2]);
    expect(source[0].id).toBe(1);
  });
  it('族群推薦關閉後才自動出現；再次開啟族群推薦會立即隱藏', () => {
    const { rerender } = render(<Harness blocked />);
    advance();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Harness />);
    advance();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<Harness blocked />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('同一批不重複自動介紹，仍能手動重看', () => {
    const first = render(<Harness />);
    advance();
    fireEvent.click(screen.getByText('先逛逛，稍後再看'));
    advance();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    first.unmount();
    render(<Harness />);
    advance();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /看看最新/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('有搜尋或指定工具意圖時不自動插入推薦', () => {
    render(<Harness autoEligible={false} />);
    advance();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('資料延遲載入後仍能展示，空資料不顯示入口', () => {
    const { rerender } = render(<Harness data={[]} />);
    advance();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<Harness />);
    advance();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
