
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock dependencies
const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdTokenResult: vi.fn(),
};

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
let authStateCallback: ((user: any) => void) | null = null;

// Correct path to match project structure
vi.mock('@/lib/authService', () => ({
    signInWithGoogle: () => mockSignIn(),
    signOut: () => mockSignOut(),
    subscribeToAuthState: (callback: any) => {
        authStateCallback = callback;
        return () => { };
    },
    getCurrentUser: () => null,
}));

vi.mock('@/lib/firebase', () => ({
    isAuthAvailable: () => true,
}));

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStateCallback = null;
        mockUser.getIdTokenResult.mockReset();
    });

    it('should initialize with loading state', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
    });

    it('should update state when user logs in', async () => {
        const { result } = renderHook(() => useAuth());

        act(() => {
            if (authStateCallback) {
                authStateCallback(mockUser);
            }
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should check for admin claim', async () => {
        mockUser.getIdTokenResult.mockResolvedValue({
            claims: { admin: true }
        });

        const { result } = renderHook(() => useAuth());

        // Simulate auth state change
        await act(async () => {
            if (authStateCallback) {
                await authStateCallback(mockUser);
            }
        });

        // useAuth uses async fetching for claims, so we need to wait
        await waitFor(() => {
            expect(result.current.isAdmin).toBe(true);
        });
    });

    it('should handle non-admin user', async () => {
        mockUser.getIdTokenResult.mockResolvedValue({
            claims: {}
        });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            if (authStateCallback) {
                await authStateCallback(mockUser);
            }
        });

        await waitFor(() => {
            expect(result.current.isAdmin).toBe(false);
        });
    });

    it('should calling signIn triggers authService', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signIn();
        });

        expect(mockSignIn).toHaveBeenCalled();
    });

    it('should handle logout and reset admin state', async () => {
        mockUser.getIdTokenResult.mockResolvedValue({
            claims: { admin: true }
        });

        const { result } = renderHook(() => useAuth());

        // Login first
        await act(async () => {
            if (authStateCallback) {
                await authStateCallback(mockUser);
            }
        });

        await waitFor(() => {
            expect(result.current.isAdmin).toBe(true);
        });

        // Logout
        await act(async () => {
            await result.current.logout();
        });

        expect(mockSignOut).toHaveBeenCalled();
        expect(result.current.isAdmin).toBe(false);
    });
});
