import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewList } from '../ReviewList';
import type { ToolRating } from '../../lib/reviewService';

const mocks = vi.hoisted(() => ({ getReviews: vi.fn(), getToolRating: vi.fn(), subscribeToolRating: vi.fn() }));
vi.mock('@/lib/reviewService', () => mocks);
vi.mock('../ReviewItem', () => ({ ReviewItem: () => null }));
vi.mock('../ReviewForm', () => ({ ReviewForm: () => null }));
vi.mock('@/hooks/useReviewSort', () => ({
  useReviewSort: () => ({ sortOption: 'newest', setSortOption: () => {}, sortReviews: (reviews: unknown[]) => reviews }),
  reviewSortOptions: [],
}));

type Subscription = {
  toolId: number;
  next: (rating: ToolRating | null) => void;
  error: () => void;
  stop: ReturnType<typeof vi.fn>;
};
let subscriptions: Subscription[];
function rating(toolId: number, totalReviews: number, averageRating: number): ToolRating {
  return { toolId, totalReviews, averageRating, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: totalReviews } };
}
function setup(toolId = 81) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const view = render(<ReviewList toolId={toolId} />, {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  return { client, ...view };
}

beforeEach(() => {
  vi.clearAllMocks();
  subscriptions = [];
  mocks.getReviews.mockResolvedValue([]);
  mocks.getToolRating.mockImplementation(async (toolId: number) => rating(toolId, 1, 5));
  mocks.subscribeToolRating.mockImplementation((toolId: number, next: Subscription['next'], error: Subscription['error']) => {
    const stop = vi.fn();
    subscriptions.push({ toolId, next, error, stop });
    return stop;
  });
});

describe('評論留在同頁接收後端計票', () => {
  it('後端訂閱callback直接更新畫面與精準query cache，無須重新聚焦', async () => {
    const { client } = setup();
    await screen.findByText('(1 則評論)');
    const updated = rating(81, 2, 4.5);
    act(() => subscriptions[0].next(updated));
    await screen.findByText('(2 則評論)');
    expect(client.getQueryData(['toolRating', 81])).toEqual(updated);
    expect(mocks.subscribeToolRating).toHaveBeenCalledOnce();
    expect(mocks.getToolRating).toHaveBeenCalledOnce();
  });

  it('切換工具及卸載解除舊訂閱，晚到的舊callback不改新工具資料', async () => {
    const { client, rerender, unmount } = setup();
    await screen.findByText('(1 則評論)');
    const old = subscriptions[0];
    rerender(<ReviewList toolId={82} />);
    await waitFor(() => expect(subscriptions).toHaveLength(2));
    expect(old.stop).toHaveBeenCalledOnce();
    act(() => old.next(rating(81, 99, 1)));
    await screen.findByText('(1 則評論)');
    expect(client.getQueryData<ToolRating>(['toolRating', 82])?.toolId).toBe(82);
    expect(client.getQueryData<ToolRating>(['toolRating', 81])?.totalReviews).not.toBe(99);
    unmount();
    expect(subscriptions[1].stop).toHaveBeenCalledOnce();
  });

  it('訂閱失敗保留上次統計並顯示中斷訊息，收到新資料後恢復', async () => {
    const { client } = setup();
    await screen.findByText('(1 則評論)');
    act(() => subscriptions[0].error());
    expect(screen.getByRole('status')).toHaveTextContent('即時評分同步暫時中斷');
    expect(screen.getByText('(1 則評論)')).toBeVisible();
    expect(client.getQueryData<ToolRating>(['toolRating', 81])?.totalReviews).toBe(1);
    act(() => subscriptions[0].next(rating(81, 3, 4)));
    await screen.findByText('(3 則評論)');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('後端新計票先到時，較早啟動但晚返回的getDoc不覆蓋它', async () => {
    let finishInitial: ((value: ToolRating) => void) | undefined;
    mocks.getToolRating.mockReturnValueOnce(new Promise<ToolRating>(resolve => { finishInitial = resolve; }));
    const { client } = setup();
    await waitFor(() => expect(mocks.getToolRating).toHaveBeenCalledOnce());
    act(() => subscriptions[0].next(rating(81, 2, 4.5)));
    await screen.findByText('(2 則評論)');
    await act(async () => { finishInitial!(rating(81, 1, 5)); await Promise.resolve(); });
    expect(screen.getByText('(2 則評論)')).toBeVisible();
    expect(client.getQueryData<ToolRating>(['toolRating', 81])?.totalReviews).toBe(2);
  });
});
