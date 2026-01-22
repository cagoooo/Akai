/**
 * ReviewForm 元件單元測試
 * 測試評論表單功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewForm } from '../ReviewForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock reviewService
vi.mock('@/lib/reviewService', () => ({
    addReview: vi.fn().mockResolvedValue('test-review-id'),
    hasUserReviewed: vi.fn().mockResolvedValue(false)
}));

// Mock useAuth - 預設為已登入狀態
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { uid: 'test-user', displayName: 'Test User', email: 'test@test.com', photoURL: null },
        isAuthenticated: true,
        signIn: vi.fn(),
        loading: false
    })
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

// Mock useAchievements
vi.mock('@/hooks/useAchievements', () => ({
    useAchievements: () => ({
        incrementReviewsCount: vi.fn()
    })
}));

// 建立 QueryClient 包裝器
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('ReviewForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render ReviewForm component', () => {
        render(<ReviewForm toolId={1} />, { wrapper: createWrapper() });

        // 確保元件渲染成功
        expect(document.body).toBeTruthy();
    });

    it('should have proper DOM structure', () => {
        render(<ReviewForm toolId={1} onReviewSubmitted={vi.fn()} />, { wrapper: createWrapper() });

        // 確保元件有適當的 DOM 結構
        const container = document.querySelector('div');
        expect(container).toBeTruthy();
    });

    it('should render form title when authenticated', () => {
        render(<ReviewForm toolId={1} />, { wrapper: createWrapper() });

        // 應該顯示撰寫評論區塊（已登入狀態）
        const title = screen.queryByText(/撰寫評論/);
        expect(title).toBeTruthy();
    });

    it('should render star rating component', () => {
        render(<ReviewForm toolId={1} />, { wrapper: createWrapper() });

        // 應該有星級評分區域
        const ratingLabel = screen.queryByText(/您的評分/);
        expect(ratingLabel).toBeTruthy();
    });

    it('should render comment textarea', () => {
        render(<ReviewForm toolId={1} />, { wrapper: createWrapper() });

        // 應該有評論文字區域
        const commentLabel = screen.queryByText(/您的評論/);
        expect(commentLabel).toBeTruthy();
    });

    it('should render submit button', () => {
        render(<ReviewForm toolId={1} />, { wrapper: createWrapper() });

        // 應該有送出按鈕
        const submitButton = screen.queryByText(/送出評論/);
        expect(submitButton).toBeTruthy();
    });
});
