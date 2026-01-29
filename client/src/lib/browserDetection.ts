/**
 * LINE 瀏覽器及內建瀏覽器檢測工具
 * 用於優化在各種內建瀏覽器中的使用體驗
 */

/**
 * 檢測是否為 LINE 內建瀏覽器
 */
export function isLineBrowser(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Line/i.test(ua);
}

/**
 * 檢測是否為任何社群 App 的內建瀏覽器
 * (LINE, Facebook, Instagram, Twitter, WeChat 等)
 */
export function isInAppBrowser(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Twitter|MicroMessenger|Line|KAKAOTALK|Snapchat/i.test(ua);
}

/**
 * 檢測是否為行動裝置
 */
export function isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

/**
 * 檢測是否應該減少動畫效果
 * (在內建瀏覽器或使用者偏好減少動畫時)
 */
export function shouldReduceMotion(): boolean {
    // 使用者系統設定偏好減少動畫
    if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) return true;
    }

    // 在內建瀏覽器中減少動畫以提升效能
    return isInAppBrowser();
}

/**
 * 取得適合當前環境的動畫配置
 */
export function getAnimationConfig() {
    const reduceMotion = shouldReduceMotion();

    return {
        // 是否啟用動畫
        enableAnimations: !reduceMotion,

        // Framer Motion 的 transition 配置
        transition: reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 100, damping: 15 },

        // 簡化的 transition (用於較重的動畫)
        simpleTransition: reduceMotion
            ? { duration: 0 }
            : { duration: 0.2 },

        // hover/tap 效果
        whileHover: reduceMotion ? {} : { scale: 1.02, y: -4 },
        whileTap: reduceMotion ? {} : { scale: 0.98 },

        // 浮動動畫
        floatAnimation: reduceMotion
            ? {}
            : {
                y: [0, -8, 0],
                transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            },
    };
}

/**
 * 生成「用外部瀏覽器開啟」的連結
 * 各平台有不同的開啟方式
 */
export function getExternalBrowserUrl(url: string): string {
    const ua = navigator.userAgent || '';

    // LINE 瀏覽器
    if (/Line/i.test(ua)) {
        // LINE 可以使用 line://app/url? 來開啟外部瀏覽器
        // 但更簡單的方式是用 intent URL
        if (/Android/i.test(ua)) {
            // Android: 使用 intent URL
            return `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        } else {
            // iOS: 直接用 Safari 打開
            return url;
        }
    }

    return url;
}

/**
 * 在外部瀏覽器中開啟連結
 */
export function openInExternalBrowser(url: string): void {
    const externalUrl = getExternalBrowserUrl(url);
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
}
