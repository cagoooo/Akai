/**
 * PWA 更新提示元件
 * 顯示應用程式更新、離線狀態和安裝提示
 */

import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function PWAUpdatePrompt() {
    const {
        isUpdateAvailable,
        isOffline,
        isInstallable,
        updateApp,
        installApp,
        dismissUpdate,
    } = usePWAUpdate();

    const [showInstallPrompt, setShowInstallPrompt] = useState(true);

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

    // 更新提示
    const UpdatePrompt = () => (
        <AnimatePresence>
            {isUpdateAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                >
                    <Card className="border-primary/20 bg-card/95 backdrop-blur shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <RefreshCw className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium mb-1">有新版本可用！</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        點擊更新以獲得最新功能和改進
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={updateApp}>
                                            立即更新
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={dismissUpdate}>
                                            稍後再說
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-8 w-8"
                                    onClick={dismissUpdate}
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
            {isInstallable && showInstallPrompt && (
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
                                            onClick={() => setShowInstallPrompt(false)}
                                        >
                                            不用了
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-8 w-8"
                                    onClick={() => setShowInstallPrompt(false)}
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
