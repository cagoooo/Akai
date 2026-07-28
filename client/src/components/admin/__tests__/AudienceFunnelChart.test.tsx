import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AudienceFunnelChart } from '../AudienceFunnelChart';

describe('AudienceFunnelChart', () => {
    it('把最該優化的一步指出來', () => {
        render(<AudienceFunnelChart funnel={{
            opened: 100, audienceSelected: 80, schoolLevelSelected: 70,
            teacherRoleSelected: 60, departmentSelected: 12,
            painPointsConfirmed: 30, resultsShown: 28,
        }} />);

        expect(screen.getByText('掉最多人')).toBeInTheDocument();
        expect(screen.getByText(/下一個該優化的是/)).toBeInTheDocument();
        expect(screen.getByText('確認想解決的情境')).toBeInTheDocument();
    });

    it('分支步驟另外列，不混進主漏斗', () => {
        render(<AudienceFunnelChart funnel={{ opened: 100, audienceSelected: 80, schoolLevelSelected: 70, teacherRoleSelected: 60, painPointsConfirmed: 50, resultsShown: 48 }} />);
        expect(screen.getByText(/只有老師會走到/)).toBeInTheDocument();
        expect(screen.getByText(/只有行政人員會走到/)).toBeInTheDocument();
    });

    it('樣本不足時只報數字，不下判斷', () => {
        render(<AudienceFunnelChart funnel={{ opened: 5, audienceSelected: 2, schoolLevelSelected: 2, painPointsConfirmed: 1, resultsShown: 1 }} />);
        expect(screen.queryByText('掉最多人')).not.toBeInTheDocument();
        expect(screen.getByText(/樣本累積中/)).toBeInTheDocument();
    });

    it('沒有資料時給空狀態而不是 0%', () => {
        render(<AudienceFunnelChart funnel={undefined} />);
        expect(screen.getByText('這個區間還沒有引導資料。')).toBeInTheDocument();
    });
});
