import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AudienceProfileBadge } from '../AudienceProfileBadge';

describe('AudienceProfileBadge', () => {
  it('shows the completed audience and opens re-selection on request', async () => {
    const user = userEvent.setup();
    const onReselect = vi.fn();

    render(
      <AudienceProfileBadge
        profile={{ audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', department: 'academic' }}
        onReselect={onReselect}
      />
    );

    expect(screen.getByText('依「國小・行政人員・教務處」推薦')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '重新設定推薦身分' }));
    expect(onReselect).toHaveBeenCalledOnce();
  });
});
