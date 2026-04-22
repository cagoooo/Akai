/**
 * PWA 更新提示元件
 * 顯示應用程式更新、離線狀態和安裝提示
 * v3.5.8：新增自動更新倒數機制，3 秒後自動套用新版本
 */

import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Sparkles, Wifi, WifiOff, X } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// 自動更新倒數秒數（使用者可在此期間點「稍後」取消）
const AUTO_UPDATE_COUNTDOWN = 3;

export function PWAUpdatePrompt() {
    const {
        isUpdateAvailable: swUpdateAvailable,
        isOffline,
        isInstallable,
        updateApp,
        installApp,
        dismissUpdate,
    } = usePWAUpdate();

    // 獨立的 version.json 輪詢（15 分鐘一次），作為 SW updatefound 的備援通道
    const { hasNewVersion, latestVersion } = useVersionCheck({ intervalMs: 15 * 60 * 1000 });

    // 任一通道偵測到新版本就觸發更新流程（SW 事件 OR version.json 輪詢）
    const isUpdateAvailable = swUpdateAvailable || hasNewVersion;

    const [shouldShowAfterDelay, setShouldShowAfterDelay] = useState(false);
    const [autoUpdateCountdown, setAutoUpdateCountdown] = useState<number | null>(null);
    const [isAutoUpdateCancelled, setIsAutoUpdateCancelled] = useState(false);

    // 第十三波優化：強制延遲 PWA 提示顯示，避免干擾 LCP 測速
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldShowAfterDelay(true);
        }, 8000); // 8秒後才開始考慮顯示 PWA 提示
        return () => clearTimeout(timer);
    }, []);

    // 🚀 自動更新倒數：偵測到新版本時，3 秒後自動套用
    useEffect(() => {
        if (!isUpdateAvailable || isAutoUpdateCancelled) {
            setAutoUpdateCountdown(null);
            return;
        }

        setAutoUpdateCountdown(AUTO_UPDATE_COUNTDOWN);
        const intervalId = setInterval(() => {
            setAutoUpdateCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(intervalId);
                    // 倒數結束，自動套用更新
                    console.log('🚀 [PWA] Auto-update countdown finished, applying update...');
                    updateApp();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isUpdateAvailable, isAutoUpdateCancelled, updateApp]);

    // 使用者選擇稍後更新（取消自動倒數）
    const handlePostponeUpdate = () => {
        setIsAutoUpdateCancelled(true);
        setAutoUpdateCountdown(null);
        dismissUpdate();
    };

    const [showInstallPrompt, setShowInstallPrompt] = useState(() => {
        try {
            const lastDismissed = localStorage.getItem('lastPwaPromptDismissedAt');
            if (lastDismissed) {
                const dismissedAt = parseInt(lastDismissed, 10);
                const oneDayMs = 24 * 60 * 60 * 1000;
                if (Date.now() - dismissedAt < oneDayMs) {
                    return false;
                }
            }
        } catch (e) { }
        return true;
    });

    const handleDismissInstall = () => {
        setShowInstallPrompt(false);
        try {
            localStorage.setItem('lastPwaPromptDismissedAt', Date.now().toString());
        } catch (e) { }
    };

    // 離線指示器
    const OfflineIndicator = () => (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                    <WifiOff className="w-4 h-4" />
                    您目前處於離線模式，部分功能可能無法使用
                </motion.div>
            )}
        </AnimatePresence>
    );

    // 更新提示（含自動倒數）
    const UpdatePrompt = () => (
        <AnimatePresence>
            {isUpdateAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                >
                    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/95 to-purple-50/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                        {/* 倒數進度條 */}
                        {autoUpdateCountdown !== null && autoUpdateCountdown > 0 && (
                            <motion.div
                                className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 origin-left"
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: AUTO_UPDATE_COUNTDOWN, ease: 'linear' }}
                            />
                        )}
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg"
                                    animate={autoUpdateCountdown !== null ? { rotate: 360 } : {}}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Sparkles className="w-5 h-5 text-white" />
                                </motion.div>
                                <div className="flex-1">
                                    <h4 className="font-bold mb-1 text-indigo-900">
                                        ✨ 新版本已就緒！
                                        {latestVersion && (
                                            <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-mono font-normal text-indigo-700 bg-indigo-100 rounded">
                                                v{latestVersion.version}
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-indigo-700/80 mb-3">
                                        {autoUpdateCountdown !== null && autoUpdateCountdown > 0 ? (
                                            <>
                                                <span className="font-bold text-indigo-600">{autoUpdateCountdown}</span> 秒後自動套用最新功能與修復
                                            </>
                                        ) : (
                                            '正在套用更新...'
                                        )}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={updateApp}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                            立即更新
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handlePostponeUpdate}
                                            className="text-indigo-700 hover:bg-indigo-100"
                                        >
                                            稍後再說
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="關閉更新提示"
                                    className="shrink-0 h-8 w-8 text-indigo-600 hover:bg-indigo-100"
                                    onClick={handlePostponeUpdate}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // 安裝提示
    const InstallPrompt = () => (
        <AnimatePresence>
            {isInstallable && showInstallPrompt && shouldShowAfterDelay && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                >
                    <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 backdrop-blur shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Download className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium mb-1">安裝應用程式</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        將教育科技創新專區加入主畫面，享受更好的使用體驗
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                installApp();
                                                setShowInstallPrompt(false);
                                            }}
                                        >
                                            安裝
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleDismissInstall}
                                        >
                                            不用了
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="關閉安裝提示"
                                    className="shrink-0 h-8 w-8"
                                    onClick={handleDismissInstall}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <OfflineIndicator />
            <UpdatePrompt />
            {!isUpdateAvailable && <InstallPrompt />}
        </>
    );
}
