import React, { useState } from 'react';
import { m as motion, useAnimation } from 'framer-motion';
import { OptimizedIcon } from '@/components/OptimizedIcons';

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const controls = useAnimation();
    const PULL_THRESHOLD = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
        // 只有當頁面在最上方，且沒有在更新時才紀錄起點
        if (window.scrollY <= 0 && !isRefreshing) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing) return;

        // 如果頁面已經向下滾動超過 0，取消 Pull to refresh (防呆)
        if (window.scrollY > 0) {
            setStartY(0);
            setCurrentY(0);
            controls.set({ y: 0 });
            return;
        }

        const y = e.touches[0].clientY;
        const dy = y - startY;

        // 只有向下拉動才觸發
        if (dy > 0) {
            // 增加阻力效果，拉越多越難拉
            const resistance = dy > PULL_THRESHOLD ? PULL_THRESHOLD + (dy - PULL_THRESHOLD) * 0.2 : dy;

            setCurrentY(resistance);
            controls.set({ y: resistance });

            // 可以考慮防滾動 e.preventDefault()，但 React touchMove 預設是 passive，可能會無法 prevent
            // 已在外層容器使用 overscroll-y-none 防止瀏覽器預設下拉
        }
    };

    const handleTouchEnd = async () => {
        if (startY === 0 || isRefreshing) return;

        if (currentY > PULL_THRESHOLD) {
            setIsRefreshing(true);
            // 彈回到準備刷新的位置 (約 60px)
            await controls.start({ y: 60, transition: { type: 'spring', stiffness: 300, damping: 20 } });

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
                setStartY(0);
                setCurrentY(0);
            }
        } else {
            // 未達閾值，彈回原位
            controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
            setStartY(0);
            setCurrentY(0);
        }
    };

    return (
        <div
            className="relative w-full overflow-hidden sm:overflow-visible overscroll-y-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* 藏在後方的下拉提示容器 */}
            <div
                className="absolute top-0 left-0 w-full flex flex-col items-center justify-center pointer-events-none"
                style={{ height: `${Math.max(currentY, isRefreshing ? 60 : 0)}px` }}
            >
                <div className="flex flex-col items-center justify-end pb-3 h-full text-primary">
                    {isRefreshing ? (
                        <OptimizedIcon name="Loader2" className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                        <div className={`transition-transform duration-300 ${currentY > PULL_THRESHOLD ? 'rotate-180' : ''}`}>
                            <OptimizedIcon name="ArrowDown" className="w-6 h-6 text-indigo-500" />
                        </div>
                    )}
                    <span className="text-xs font-medium mt-2 text-indigo-600">
                        {isRefreshing
                            ? '整理資料中...'
                            : currentY > PULL_THRESHOLD
                                ? '放開以尋找更新'
                                : '下拉重新整理'}
                    </span>
                </div>
            </div>

            {/* 主要內容，當下拉時整個往下移 */}
            <motion.div
                animate={controls}
                className="relative z-10 bg-background min-h-screen shadow-md rounded-t-2xl sm:rounded-none"
            >
                {children}
            </motion.div>
        </div>
    );
}
