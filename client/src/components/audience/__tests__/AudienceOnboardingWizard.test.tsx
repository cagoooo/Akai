import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudienceOnboardingWizard } from '../AudienceOnboardingWizard';

const noop = () => {};

// 讓「為你思考中」過場在測試裡走 reduced-motion（立即完成），不必等 ~3s 動畫
beforeEach(() => {
  // P0-1 草稿存在 sessionStorage，測試之間必須互相隔離
  sessionStorage.clear();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: true, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

function renderWizard(open = true, onComplete = vi.fn(), onDismiss = vi.fn()) {
  return {
    onComplete,
    onDismiss,
    ...render(<AudienceOnboardingWizard open={open} tools={[]} onComplete={onComplete} onDismiss={onDismiss} onLocateTool={noop} />),
  };
}

describe('AudienceOnboardingWizard', () => {
  it('completes a profile once (after pain-point step) and lets a visitor return from results', async () => {
    const user = userEvent.setup();
    const { onComplete } = renderWizard();
    await user.click(screen.getByRole('button', { name: /我是老師/ }));
    await user.click(screen.getByRole('button', { name: /國小/ }));
    await user.click(screen.getByRole('button', { name: /班級導師/ }));
    // 進到痛點步驟，尚未完成
    expect(onComplete).toHaveBeenCalledTimes(0);
    await user.click(screen.getByRole('button', { name: /直接看推薦/ }));
    // 思考過場後才抵達結果並回呼 onComplete（jsdom 無 matchMedia → 過場立即完成）
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    // 從結果返回會先回到痛點步驟，再返回才回到職務步驟
    await user.click(screen.getByRole('button', { name: /上一步/ }));
    await user.click(screen.getByRole('button', { name: /上一步/ }));
    expect(screen.getByRole('button', { name: /行政人員/ })).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // P0-1：關掉再開不再是「從頭來過」，而是接續上次選到一半的進度
  it('restores focus on close and resumes the saved draft when reopened', async () => {
    const user = userEvent.setup();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const onDismiss = vi.fn();
    const view = renderWizard(true, vi.fn(), onDismiss);
    await user.click(screen.getByRole('button', { name: /我是學生/ }));
    view.rerender(<AudienceOnboardingWizard open={false} tools={[]} onComplete={vi.fn()} onDismiss={onDismiss} onLocateTool={noop} />);
    expect(trigger).toHaveFocus();
    view.rerender(<AudienceOnboardingWizard open tools={[]} onComplete={vi.fn()} onDismiss={onDismiss} onLocateTool={noop} />);
    // 接回學段步驟，並明講是接續來的
    await waitFor(() => expect(screen.getByText(/已幫你接續上次選到一半的進度/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /我是老師/ })).not.toBeInTheDocument();
    trigger.remove();
  });

  it('lets a resumed visitor start over from the first question', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const view = renderWizard(true, vi.fn(), onDismiss);
    await user.click(screen.getByRole('button', { name: /我是學生/ }));
    view.rerender(<AudienceOnboardingWizard open={false} tools={[]} onComplete={vi.fn()} onDismiss={onDismiss} onLocateTool={noop} />);
    view.rerender(<AudienceOnboardingWizard open tools={[]} onComplete={vi.fn()} onDismiss={onDismiss} onLocateTool={noop} />);
    await user.click(await screen.findByRole('button', { name: '重新開始' }));
    expect(screen.getByRole('button', { name: /我是老師/ })).toBeInTheDocument();
    expect(sessionStorage.getItem('akai_audience_wizard_draft_v1')).toBeNull();
  });

  it('traps tab navigation and supports Escape dismissal', async () => {
    const user = userEvent.setup();
    const { onDismiss } = renderWizard();
    const close = screen.getByRole('button', { name: '稍後再說' });
    close.focus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: /稍後再說，先逛逛/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
