
/**
 * AdminAuth 元件單元測試
 * 測試管理員驗證功能 (Firebase Custom Claims)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminAuth } from '../AdminAuth';

// Mock AnalyticsDashboard
vi.mock('../AnalyticsDashboard', () => ({
    AnalyticsDashboard: () => <div data-testid="analytics-dashboard">儀表板內容</div>
}));
vi.mock('../AdminWebVitalsDashboard', () => ({
    AdminWebVitalsDashboard: () => <div data-testid="web-vitals-dashboard">效能儀表板</div>
}));

// Mock wouter
vi.mock('wouter', () => ({
    useLocation: () => ['/admin', vi.fn()],
    Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useAuth
const mockSignIn = vi.fn();
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth()
}));

describe('AdminAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading spinner when loading', () => {
        mockUseAuth.mockReturnValue({
            loading: true,
            user: null,
            isAdmin: false,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        expect(screen.getByText('正在驗證權限…')).toBeInTheDocument();
    });

    it('should show login button when not authenticated', () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: null,
            isAdmin: false,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        expect(screen.getByText('管理員登入')).toBeInTheDocument();
        expect(screen.getByText('使用 Google 登入')).toBeInTheDocument();
    });

    it('匿名 Firebase 身分仍顯示 Google 登入，不顯示無權限', () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: { uid: 'anon', isAnonymous: true },
            isAdmin: false,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        expect(screen.getByText('使用 Google 登入')).toBeInTheDocument();
        expect(screen.queryByText('無存取權限')).not.toBeInTheDocument();
    });

    it('should call signIn when clicking login button', () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: null,
            isAdmin: false,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        const loginButton = screen.getByText('使用 Google 登入');
        fireEvent.click(loginButton);
        expect(mockSignIn).toHaveBeenCalled();
    });

    it('should show access denied when logged in but not admin', () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: { email: 'user@example.com', isAnonymous: false },
            isAdmin: false,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        expect(screen.getByText('無存取權限')).toBeInTheDocument();
        expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    });

    it('should call logout when denied user clicks logout', () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: { email: 'user@example.com', isAnonymous: false },
            isAdmin: false,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        const logoutButton = screen.getByRole('button', { name: /登出並切換帳號/ });
        fireEvent.click(logoutButton);
        expect(mockLogout).toHaveBeenCalled();
    });

    it('should show dashboard when logged in and admin', () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: { email: 'admin@example.com', displayName: 'Admin', isAnonymous: false },
            isAdmin: true,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        expect(screen.getByText(/Admin/)).toBeInTheDocument();
    });

    it('should call logout when admin clicks logout', async () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            user: { email: 'admin@example.com', isAnonymous: false },
            isAdmin: true,
            signIn: mockSignIn,
            logout: mockLogout
        });

        render(<AdminAuth />);
        const logoutButton = screen.getByRole('button', { name: /登出/ });
        fireEvent.click(logoutButton);
        await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    });
});
