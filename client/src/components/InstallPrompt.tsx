/**
 * PWA 安裝提示元件
 * 當瀏覽器支援 PWA 安裝時，顯示安裝提示按鈕
 */

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// BeforeInstallPromptEvent 類型定義
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // 檢查是否已經安裝
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // 檢查是否曾經關閉提示
        const wasDismissed = localStorage.getItem('pwa-install-dismissed');
        if (wasDismissed) {
            const dismissedTime = parseInt(wasDismissed, 10);
            // 7 天後再次顯示
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                setDismissed(true);
                return;
            }
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // 延遲顯示，避免干擾使用者
            setTimeout(() => setShowPrompt(true), 5000);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] 使用者接受安裝');
            } else {
                console.log('[PWA] 使用者取消安裝');
            }
        } catch (error) {
            console.error('[PWA] 安裝失敗:', error);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // 如果已安裝、曾關閉、或沒有安裝提示，不顯示
    if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
                role="dialog"
                aria-labelledby="install-prompt-title"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                        <Download className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 id="install-prompt-title" className="font-semibold text-gray-900 dark:text-white">
                            安裝應用程式
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            將教育科技創新專區加入主畫面，享受更快速的存取體驗！
                        </p>

                        <div className="flex gap-2 mt-3">
                            <Button
                                onClick={handleInstall}
                                size="sm"
                                className="flex-1"
                            >
                                <Download className="w-4 h-4 mr-1" aria-hidden="true" />
                                安裝
                            </Button>
                            <Button
                                onClick={handleDismiss}
                                variant="ghost"
                                size="sm"
                                aria-label="關閉安裝提示"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
