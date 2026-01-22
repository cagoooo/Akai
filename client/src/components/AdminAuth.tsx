/**
 * AdminAuth - 管理員驗證元件
 * 
 * 功能：
 * - 密碼驗證保護 /admin 頁面
 * - 登入狀態持久化 (LocalStorage)
 * - 登出功能
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, LogOut, Shield, Eye, EyeOff } from "lucide-react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

// 管理員密碼
const ADMIN_PASSWORD = "smes1234";
const AUTH_KEY = "admin_authenticated";
const AUTH_EXPIRY_KEY = "admin_auth_expiry";
const AUTH_DURATION_MS = 24 * 60 * 60 * 1000; // 24 小時

export function AdminAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // 檢查現有登入狀態
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem(AUTH_KEY);
            const authExpiry = localStorage.getItem(AUTH_EXPIRY_KEY);

            if (authStatus === "true" && authExpiry) {
                const expiryTime = parseInt(authExpiry, 10);
                if (Date.now() < expiryTime) {
                    setIsAuthenticated(true);
                } else {
                    // 登入已過期
                    localStorage.removeItem(AUTH_KEY);
                    localStorage.removeItem(AUTH_EXPIRY_KEY);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // 處理登入
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password === ADMIN_PASSWORD) {
            const expiryTime = Date.now() + AUTH_DURATION_MS;
            localStorage.setItem(AUTH_KEY, "true");
            localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
            setIsAuthenticated(true);
            setPassword("");
        } else {
            setError("密碼錯誤，請重新輸入");
            setPassword("");
        }
    };

    // 處理登出
    const handleLogout = () => {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_EXPIRY_KEY);
        setIsAuthenticated(false);
    };

    // 載入中狀態
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Shield className="h-12 w-12 text-indigo-500" />
                    <p className="text-slate-600">驗證中...</p>
                </div>
            </div>
        );
    }

    // 已登入：顯示儀表板
    if (isAuthenticated) {
        return (
            <div className="relative">
                {/* 登出按鈕 */}
                <div className="fixed top-4 right-4 z-50">
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

    // 未登入：顯示登入表單
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        管理員驗證
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        請輸入密碼以存取管理儀表板
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* 密碼輸入框 */}
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="請輸入管理員密碼"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10 h-12 text-lg"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* 錯誤訊息 */}
                        {error && (
                            <Alert variant="destructive" className="animate-shake">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* 登入按鈕 */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                            disabled={!password}
                        >
                            <Shield className="h-5 w-5 mr-2" />
                            登入管理後台
                        </Button>
                    </form>

                    {/* 返回首頁連結 */}
                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            ← 返回首頁
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
