import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const seed = { toolCount: 130, milestones: { tool100: '2026-05-24T06:08:04.057Z' } };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function loadBanner() {
  vi.resetModules();
  return (await import('../bulletin/BulletinMilestone100')).BulletinMilestone100;
}

describe('破百橫幅不再晚到把英雄區往下推（CLS）', () => {
  it('建置時內嵌了統計：第一個畫面就畫出慶祝橫幅，也不再多發一次請求', async () => {
    vi.stubEnv('VITE_MILESTONE_STATS', JSON.stringify(seed));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const BulletinMilestone100 = await loadBanner();

    render(<BulletinMilestone100 />);

    expect(screen.getByTestId('milestone-celebration')).toBeInTheDocument(); // 同步就在，不必等 effect 或網路
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('內嵌資料不到 100 個工具時，第一個畫面就是倒數橫幅', async () => {
    vi.stubEnv('VITE_MILESTONE_STATS', JSON.stringify({ toolCount: 97, milestones: {} }));
    const BulletinMilestone100 = await loadBanner();

    render(<BulletinMilestone100 />);

    expect(screen.getByTestId('milestone-countdown')).toHaveTextContent('3');
  });

  it('沒有內嵌統計（或內容壞掉）時，退回原本的 fetch，抓到才畫出', async () => {
    vi.stubEnv('VITE_MILESTONE_STATS', 'not-json');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(seed)));
    vi.stubGlobal('fetch', fetchMock);
    const BulletinMilestone100 = await loadBanner();

    render(<BulletinMilestone100 />);
    expect(screen.queryByTestId('milestone-celebration')).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId('milestone-celebration')).toBeInTheDocument());
    expect(fetchMock.mock.calls[0][0]).toContain('api/site-stats.json');
  });
});
