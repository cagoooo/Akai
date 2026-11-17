import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

let snapshotData: Record<string, unknown> = {};

vi.mock('@/lib/firebase', () => ({ db: {}, isFirebaseAvailable: () => true }));
vi.mock('firebase/firestore', () => ({
  doc: () => ({}),
  onSnapshot: (_ref: unknown, onNext: (s: unknown) => void) => {
    onNext({ exists: () => true, data: () => snapshotData });
    return () => {};
  },
}));

import { BulletinVisitorCounter } from '../BulletinVisitorCounter';

describe('首頁訪客計數器破萬慶祝貼紙', () => {
  beforeEach(() => { snapshotData = {}; });

  it('剛破萬（後端記了達成時間）顯示貼紙', async () => {
    snapshotData = { totalVisits: 10050, dailyVisits: {}, milestonesReachedAt: { '10000': Date.now() - 60_000 } };
    render(<BulletinVisitorCounter />);
    await waitFor(() => expect(screen.getByText(/突破 10,000 人次！謝謝老師們/)).toBeTruthy());
  });

  it('還沒破萬不顯示', async () => {
    snapshotData = { totalVisits: 9074, dailyVisits: {} };
    render(<BulletinVisitorCounter />);
    await waitFor(() => expect(screen.getByText(/還差 926 人/)).toBeTruthy());
    expect(screen.queryByText(/突破 10,000/)).toBeNull();
  });
});
