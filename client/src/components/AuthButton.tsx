/**
 * 登入/登出按鈕
 * 顯示用戶頭像和名稱，或登入按鈕
 */

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
    const { user, loading, isAuthenticated, signIn, logout, isAvailable } = useAuth();

    // Auth 不可用時不顯示
    if (!isAvailable) {
        return null;
    }

    // 載入中
    if (loading) {
        return (
            <Button variant="ghost" size="sm" disabled>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </Button>
        );
    }

    // 未登入
    if (!isAuthenticated || !user) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={signIn}
                className="gap-2"
            >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">登入</span>
            </Button>
        );
    }

    // 已登入
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <Avatar className="w-7 h-7">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || '用戶'} />
                        <AvatarFallback>
                            <User className="w-4 h-4" />
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline max-w-[100px] truncate">
                        {user.displayName || '用戶'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    登出
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
