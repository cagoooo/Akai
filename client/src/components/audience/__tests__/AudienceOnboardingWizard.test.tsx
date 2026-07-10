import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AudienceOnboardingWizard } from '../AudienceOnboardingWizard';

const noop = () => {};

function renderWizard(open = true, onComplete = vi.fn(), onDismiss = vi.fn()) {
  return {
    onComplete,
    onDismiss,
    ...render(<AudienceOnboardingWizard open={open} tools={[]} onComplete={onComplete} onDismiss={onDismiss} onLocateTool={noop} />),
  };
}

describe('AudienceOnboardingWizard', () => {
  it('completes a profile once and lets a visitor return from results', async () => {
    const user = userEvent.setup();
    const { onComplete } = renderWizard();
    await user.click(screen.getByRole('button', { name: /我是老師/ }));
    await user.click(screen.getByRole('button', { name: /國小/ }));
    await user.click(screen.getByRole('button', { name: /班級導師/ }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /上一步/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /上一步/ }));
    expect(screen.getByRole('button', { name: /行政人員/ })).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('resets and restores focus when reopened', async () => {
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
    expect(screen.getByRole('button', { name: /我是老師/ })).toBeInTheDocument();
    trigger.remove();
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
