/**
 * AdminAuth - 管理員驗證元件
 * 
 * 功能：
 * - 使用 Firebase Custom Claims 驗證管理員權限
 * - 整合 Google 登入
 */

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogOut, Shield, ShieldAlert, Loader2 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";

export function AdminAuth() {
    const { user, isAdmin, loading, signIn, logout } = useAuth();
    const [, setLocation] = useLocation();

    // 處理登入
    const handleLogin = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error("登入失敗", error);
        }
    };

    // 處理登出
    const handleLogout = async () => {
        await logout();
        setLocation("/"); // 登出後返回首頁
    };

    // 載入中狀態
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    <p className="text-slate-500">正在驗證權限...</p>
                </div>
            </div>
        );
    }

    // 情境 1: 已登入且是管理員 -> 顯示儀表板
    if (user && isAdmin) {
        return (
            <div className="relative">
                {/* 登出按鈕 */}
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200 shadow-sm">
                        管理員: {user.displayName || user.email}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300 shadow-md"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        登出
                    </Button>
                </div>
                <AnalyticsDashboard />
            </div>
        );
    }

    // 情境 2: 已登入但不是管理員 -> 顯示無權限
    if (user && !isAdmin) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-red-100">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-red-700">
                            無存取權限
                        </CardTitle>
                        <CardDescription className="text-slate-600 mt-2">
                            抱歉，您的帳號 <strong>{user.email}</strong> 沒有管理員權限。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full border-red-200 text-red-700 hover:bg-red-50"
                        >
                            登出並切換帳號
                        </Button>
                        <div className="text-center">
                            <Link href="/">
                                <a className="text-sm text-slate-500 hover:text-slate-700 no-underline hover:underline">
                                    返回首頁
                                </a>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 情境 3: 未登入 -> 顯示登入表單
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        管理員登入
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        請使用 Google 帳號登入以驗證身份
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button
                            onClick={handleLogin}
                            className="w-full h-12 text-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                            使用 Google 登入
                        </Button>

                        <div className="mt-6 text-center">
                            <Link href="/">
                                <a className="text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1">
                                    ← 返回首頁
                                </a>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
