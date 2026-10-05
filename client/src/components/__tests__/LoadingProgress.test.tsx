import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoadingProgress } from '../LoadingProgress';

afterEach(() => vi.useRealTimers());
describe('載入階段進度', () => {
  it('依實際階段前進，時間經過不會假裝已下載更多', () => {
    vi.useFakeTimers();
    const { rerender } = render(<LoadingProgress phase="page" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
    expect(screen.getByRole('status').textContent).toContain('目前網路較慢');
    rerender(<LoadingProgress phase="content" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('2');
    expect(screen.getByRole('status').textContent).toContain('讀取內容中');
  });
  it('卸載後清除等待提示計時器', () => {
    vi.useFakeTimers();
    const { unmount } = render(<LoadingProgress phase="page" />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
