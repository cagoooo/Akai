import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WishingWellAdmin } from '../WishingWellAdmin';

const mocks = vi.hoisted(() => ({
  getWishes: vi.fn(),
  updateWishStatus: vi.fn(),
  deleteWish: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@/lib/wishingService', () => ({
  getWishes: mocks.getWishes,
  updateWishStatus: mocks.updateWishStatus,
  deleteWish: mocks.deleteWish,
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));

const wish = {
  id: 'wish-1', userId: 'visitor', userName: '阿凱', type: 'suggestion',
  content: '希望增加新工具', status: 'pending',
  createdAt: { toDate: () => new Date('2026-07-19T00:00:00Z') },
};

describe('WishingWellAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWishes.mockResolvedValue([wish]);
    mocks.updateWishStatus.mockResolvedValue(undefined);
    mocks.deleteWish.mockResolvedValue(undefined);
  });

  it('更新失敗時保留待處理狀態並顯示錯誤', async () => {
    mocks.updateWishStatus.mockRejectedValue(new Error('permission denied'));
    render(<WishingWellAdmin />);
    fireEvent.click(await screen.findByRole('button', { name: /標記處理/ }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '更新失敗' })));
    expect(screen.getByText('待處理')).toBeInTheDocument();
  });

  it('刪除失敗時不移除卡片也不誤報成功', async () => {
    mocks.deleteWish.mockRejectedValue(new Error('offline'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<WishingWellAdmin />);
    fireEvent.click(await screen.findByRole('button', { name: /刪除/ }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '刪除失敗' })));
    expect(screen.getByText('希望增加新工具')).toBeInTheDocument();
    expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ title: '刪除成功' }));
  });

  it('刪除成功後才移除卡片', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<WishingWellAdmin />);
    fireEvent.click(await screen.findByRole('button', { name: /刪除/ }));
    await waitFor(() => expect(screen.queryByText('希望增加新工具')).not.toBeInTheDocument());
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '刪除成功' }));
  });
});
