/**
 * 離線狀態指示器
 * 監聽網路狀態變化，顯示離線/上線提示
 */

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkStatus {
    isOnline: boolean;
    wasOffline: boolean;
}

export function OfflineIndicator() {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        wasOffline: false,
    });
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setNetworkStatus(prev => {
                if (!prev.isOnline) {
                    // 從離線恢復到上線，顯示「已連線」提示
                    setShowReconnected(true);
                    setTimeout(() => setShowReconnected(false), 3000);
                }
                return { isOnline: true, wasOffline: prev.wasOffline || !prev.isOnline };
            });
        };

        const handleOffline = () => {
            setNetworkStatus({ isOnline: false, wasOffline: true });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {/* 離線狀態 Banner */}
            {!networkStatus.isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
                    role="alert"
                    aria-live="assertive"
                >
                    <WifiOff className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">目前處於離線狀態</span>
                    <span className="text-amber-100 text-sm">- 部分功能可能受限</span>
                </motion.div>
            )}

            {/* 已連線提示 */}
            {showReconnected && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
                    role="status"
                    aria-live="polite"
                >
                    <Wifi className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">已恢復連線</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
