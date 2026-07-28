import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AudienceEntryCard } from '../AudienceEntryCard';
import { BulletinQuickNav } from '@/components/bulletin/BulletinQuickNav';

describe('推薦精靈的常駐入口', () => {
    it('入口卡點下去會叫回精靈', async () => {
        const user = userEvent.setup();
        const onStart = vi.fn();
        render(<AudienceEntryCard onStart={onStart} />);
        await user.click(screen.getByRole('button', { name: /開啟推薦精靈/ }));
        expect(screen.getByText('不知道從哪個工具開始？')).toBeInTheDocument();
        expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('快速跳到列在有傳 onFindTools 時多一顆入口 chip', async () => {
        const user = userEvent.setup();
        const onFindTools = vi.fn();
        render(<BulletinQuickNav onFindTools={onFindTools} />);
        await user.click(screen.getByRole('button', { name: /開啟推薦精靈/ }));
        expect(onFindTools).toHaveBeenCalledTimes(1);
    });

    it('已經選過身分（沒傳 onFindTools）就不顯示入口 chip，避免與身分徽章重複', () => {
        render(<BulletinQuickNav />);
        expect(screen.queryByRole('button', { name: /開啟推薦精靈/ })).not.toBeInTheDocument();
        // 原本的區塊跳轉 chip 不受影響
        expect(screen.getByRole('button', { name: /跳到排行榜區塊/ })).toBeInTheDocument();
    });
});
