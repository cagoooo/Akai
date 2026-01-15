import { useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    placeholder?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * 懶載入圖片元件
 * 使用 Intersection Observer 實現延遲載入，提升首頁載入速度
 */
export function LazyImage({
    src,
    alt,
    className,
    width,
    height,
    placeholder,
    onLoad,
    onError
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // 使用 Intersection Observer 監測元素是否進入視窗
    const { ref, inView } = useInView({
        triggerOnce: true, // 只觸發一次
        threshold: 0.1,    // 10% 進入視窗就觸發
        rootMargin: '100px' // 提前 100px 開始載入
    });

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        setHasError(true);
        onError?.();
    }, [onError]);

    // 預設骨架屏
    const defaultPlaceholder = (
        <Skeleton
            className={cn("w-full h-full", className)}
            style={{ width, height }}
        />
    );

    // 錯誤時顯示的佔位符
    const errorPlaceholder = (
        <div
            className={cn(
                "flex items-center justify-center bg-muted text-muted-foreground",
                className
            )}
            style={{ width, height }}
        >
            <span className="text-sm">圖片載入失敗</span>
        </div>
    );

    return (
        <div ref={ref} className={cn("relative overflow-hidden", className)}>
            {/* 載入中或尚未進入視窗時顯示骨架屏 */}
            {(!inView || !isLoaded) && !hasError && (
                <div className="absolute inset-0">
                    {placeholder || defaultPlaceholder}
                </div>
            )}

            {/* 錯誤時顯示錯誤佔位符 */}
            {hasError && errorPlaceholder}

            {/* 實際圖片 - 只有進入視窗才載入 */}
            {inView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    loading="lazy"
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        "transition-opacity duration-300",
                        isLoaded ? "opacity-100" : "opacity-0",
                        className
                    )}
                />
            )}
        </div>
    );
}

/**
 * 懶載入背景圖片元件
 */
interface LazyBackgroundProps {
    src: string;
    className?: string;
    children?: React.ReactNode;
}

export function LazyBackground({ src, className, children }: LazyBackgroundProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '100px'
    });

    // 預載入圖片
    if (inView && !isLoaded) {
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.src = src;
    }

    return (
        <div
            ref={ref}
            className={cn(
                "transition-opacity duration-500",
                isLoaded ? "opacity-100" : "opacity-0",
                className
            )}
            style={isLoaded ? { backgroundImage: `url(${src})` } : undefined}
        >
            {children}
        </div>
    );
}
