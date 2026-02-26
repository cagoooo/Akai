import React, { useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OptimizedIcon } from '@/components/OptimizedIcons';

interface MobileSidebarDrawerProps {
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileSidebarDrawer({ children, isOpen, onOpenChange }: MobileSidebarDrawerProps) {
    const SWIPE_THRESHOLD = 50;
    const EDGE_SWIPE_AREA = 30; // 只能從畫面最左側 30px 內開始滑動

    // 全域註冊：從螢幕左邊緣向右滑動觸發打開選單
    useEffect(() => {
        let startX = 0;
        let currentX = 0;

        const handleTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            // 開啟條件：必須尚未打開，而且觸摸點在畫面最左側
            if (!isOpen && startX > EDGE_SWIPE_AREA) {
                startX = 0; // 重置，不允許觸發
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (startX === 0 && !isOpen) return;
            currentX = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            if (startX === 0 && !isOpen) return;
            const dx = currentX - startX;

            // 未打開且向右滑動超過閾值 -> 打開
            if (!isOpen && dx > SWIPE_THRESHOLD && currentX !== 0) {
                onOpenChange(true);
            }

            // 已打開且向左滑動超過閾值 -> 關閉
            if (isOpen && dx < -SWIPE_THRESHOLD && currentX !== 0) {
                onOpenChange(false);
            }

            startX = 0;
            currentX = 0;
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isOpen, onOpenChange]);

    // 防止底層滾動
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* 遮罩層 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/40 z-[60] xl:hidden backdrop-blur-sm"
                        onClick={() => onOpenChange(false)}
                    />
                )}
            </AnimatePresence>

            {/* 側邊欄 */}
            <motion.div
                className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] bg-background z-[70] shadow-2xl xl:hidden overflow-y-auto"
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(e, { offset, velocity }) => {
                    // 向左滑動關閉
                    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
                        onOpenChange(false);
                    }
                }}
            >
                <div className="p-5 relative min-h-full flex flex-col">
                    {/* 關閉按鈕 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => onOpenChange(false)}
                        aria-label="關閉側邊欄"
                    >
                        <OptimizedIcon name="X" className="w-5 h-5" />
                    </Button>

                    <div className="pt-8 flex-1">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <OptimizedIcon name="Filter" className="w-5 h-5" />
                            搜尋與分類篩選
                        </h3>
                        {children}
                    </div>

                    <div className="mt-8 pt-4 border-t text-xs text-center text-muted-foreground opacity-60">
                        向左滑動或點擊遮罩關閉
                    </div>
                </div>
            </motion.div>
        </>
    );
}
