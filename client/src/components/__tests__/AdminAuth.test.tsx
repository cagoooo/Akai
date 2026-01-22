/**
 * AdminAuth 元件單元測試
 * 測試管理員驗證功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminAuth } from '../AdminAuth';

// Mock AnalyticsDashboard
vi.mock('../AnalyticsDashboard', () => ({
    AnalyticsDashboard: () => <div data-testid="analytics-dashboard">儀表板內容</div>
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('AdminAuth', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should show login form when not authenticated', async () => {
        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByText('管理員驗證')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('請輸入管理員密碼')).toBeInTheDocument();
            expect(screen.getByText('登入管理後台')).toBeInTheDocument();
        });
    });

    it('should show error message with wrong password', async () => {
        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('請輸入管理員密碼')).toBeInTheDocument();
        });

        const passwordInput = screen.getByPlaceholderText('請輸入管理員密碼');
        const submitButton = screen.getByText('登入管理後台');

        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('密碼錯誤，請重新輸入')).toBeInTheDocument();
        });
    });

    it('should show dashboard with correct password', async () => {
        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('請輸入管理員密碼')).toBeInTheDocument();
        });

        const passwordInput = screen.getByPlaceholderText('請輸入管理員密碼');
        const submitButton = screen.getByText('登入管理後台');

        fireEvent.change(passwordInput, { target: { value: 'smes1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        });
    });

    it('should save auth status to localStorage on login', async () => {
        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('請輸入管理員密碼')).toBeInTheDocument();
        });

        const passwordInput = screen.getByPlaceholderText('請輸入管理員密碼');
        const submitButton = screen.getByText('登入管理後台');

        fireEvent.change(passwordInput, { target: { value: 'smes1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(localStorageMock.getItem('admin_authenticated')).toBe('true');
            expect(localStorageMock.getItem('admin_auth_expiry')).not.toBeNull();
        });
    });

    it('should show dashboard when already authenticated', async () => {
        // 預先設定已登入狀態
        const futureExpiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorageMock.setItem('admin_authenticated', 'true');
        localStorageMock.setItem('admin_auth_expiry', futureExpiry.toString());

        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        });
    });

    it('should show login form when auth expired', async () => {
        // 設定過期的登入狀態
        const pastExpiry = Date.now() - 1000;
        localStorageMock.setItem('admin_authenticated', 'true');
        localStorageMock.setItem('admin_auth_expiry', pastExpiry.toString());

        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByText('管理員驗證')).toBeInTheDocument();
        });
    });

    it('should logout when clicking logout button', async () => {
        // 預先設定已登入狀態
        const futureExpiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorageMock.setItem('admin_authenticated', 'true');
        localStorageMock.setItem('admin_auth_expiry', futureExpiry.toString());

        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        });

        const logoutButton = screen.getByText('登出');
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(screen.getByText('管理員驗證')).toBeInTheDocument();
            expect(localStorageMock.getItem('admin_authenticated')).toBeNull();
        });
    });

    it('should toggle password visibility', async () => {
        render(<AdminAuth />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('請輸入管理員密碼')).toBeInTheDocument();
        });

        const passwordInput = screen.getByPlaceholderText('請輸入管理員密碼') as HTMLInputElement;
        expect(passwordInput.type).toBe('password');

        // 找到眼睛圖標按鈕並點擊
        const toggleButtons = document.querySelectorAll('button[type="button"]');
        const eyeButton = toggleButtons[0];
        fireEvent.click(eyeButton);

        expect(passwordInput.type).toBe('text');
    });
});
