/**
 * PWA 更新提示元件 — E2 cork 公佈欄風格
 * 顯示應用程式更新、離線狀態和安裝提示
 *
 * v3.5.8：新增自動更新倒數機制，3 秒後自動套用新版本
 * v3.6.1：改為 cork 便利貼風格（黃色/粉色/藍色），與全站視覺一致
 */

import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

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

    // 離線指示器 — cork 風格膠帶橫幅
    const OfflineIndicator = () => (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: 22, // 避開上方木條
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        background: `repeating-linear-gradient(45deg, ${tokens.note.yellowBright}, ${tokens.note.yellowBright} 10px, ${tokens.note.yellow} 10px, ${tokens.note.yellow} 20px)`,
                        borderTop: `2px solid ${tokens.ink}`,
                        borderBottom: `2px solid ${tokens.ink}`,
                        color: tokens.ink,
                        padding: '8px 16px',
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        fontFamily: tokens.font.tc,
                        boxShadow: '0 4px 10px rgba(0,0,0,.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                    }}
                >
                    <span style={{ fontSize: 18 }}>📡</span>
                    <span>您目前處於離線模式，部分功能可能無法使用</span>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // 更新提示 — cork 黃色便利貼（含倒數進度條）
    const UpdatePrompt = () => (
        <AnimatePresence>
            {isUpdateAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: 50, rotate: -3 }}
                    animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                    exit={{ opacity: 0, y: 50, rotate: -3 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    className="pwa-prompt-update"
                    style={{
                        position: 'fixed',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        maxWidth: 380,
                        zIndex: 50,
                        marginLeft: 'auto',
                        background: tokens.note.yellow,
                        border: '2.5px solid #1a1a1a',
                        borderRadius: 6,
                        boxShadow: '4px 4px 0 rgba(0,0,0,.28), 0 18px 32px -6px rgba(0,0,0,.3)',
                        overflow: 'hidden',
                        fontFamily: tokens.font.tc,
                    }}
                >
                    {/* 紅色立體圖釘 */}
                    <div style={{ position: 'absolute', top: -11, left: '50%', marginLeft: -11, zIndex: 10 }}>
                        <Pin color={tokens.red} size={22} style={{ position: 'static' }} />
                    </div>

                    {/* 倒數進度條（橄欖綠 → 橘色漸層） */}
                    {autoUpdateCountdown !== null && autoUpdateCountdown > 0 && (
                        <motion.div
                            className="h-1 origin-left"
                            style={{
                                height: 4,
                                background: `linear-gradient(90deg, ${tokens.olive}, ${tokens.accent})`,
                            }}
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: AUTO_UPDATE_COUNTDOWN, ease: 'linear' }}
                        />
                    )}

                    <div style={{ padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        {/* ✨ icon */}
                        <motion.div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                background: tokens.accent,
                                border: '2.5px solid #1a1a1a',
                                boxShadow: '2px 2px 0 rgba(0,0,0,.3)',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                fontSize: 22,
                            }}
                            animate={autoUpdateCountdown !== null ? { rotate: 360 } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            ✨
                        </motion.div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: tokens.ink, lineHeight: 1.2 }}>
                                    新版本已就緒！
                                </h4>
                                {latestVersion && (
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            padding: '2px 6px',
                                            fontSize: 10,
                                            fontFamily: tokens.font.en,
                                            fontWeight: 800,
                                            color: tokens.ink,
                                            background: tokens.note.blue,
                                            border: '1.5px solid #1a1a1a',
                                            borderRadius: 3,
                                            boxShadow: '1px 1px 0 rgba(0,0,0,.2)',
                                            transform: 'rotate(-2deg)',
                                        }}
                                    >
                                        v{latestVersion.version}
                                    </span>
                                )}
                            </div>
                            <p style={{ margin: '0 0 12px', fontSize: 13, color: tokens.inkSoft, lineHeight: 1.5, fontWeight: 500 }}>
                                {autoUpdateCountdown !== null && autoUpdateCountdown > 0 ? (
                                    <>
                                        <span style={{ fontWeight: 900, color: tokens.accent, fontSize: 15 }}>{autoUpdateCountdown}</span> 秒後自動套用最新功能與修復
                                    </>
                                ) : (
                                    '正在套用更新...'
                                )}
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={updateApp}
                                    style={{
                                        background: tokens.accent,
                                        color: '#fff',
                                        border: '2.5px solid #1a1a1a',
                                        padding: '7px 14px',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '3px 3px 0 rgba(0,0,0,.3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        transition: 'transform .15s ease, box-shadow .15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget;
                                        el.style.transform = 'translate(-2px,-2px)';
                                        el.style.boxShadow = '5px 5px 0 rgba(0,0,0,.35)';
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget;
                                        el.style.transform = '';
                                        el.style.boxShadow = '3px 3px 0 rgba(0,0,0,.3)';
                                    }}
                                >
                                    🔄 立即更新
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePostponeUpdate}
                                    style={{
                                        background: '#fefdfa',
                                        color: tokens.ink,
                                        border: '2.5px solid #1a1a1a',
                                        padding: '7px 12px',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
                                    }}
                                >
                                    稍後
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handlePostponeUpdate}
                            aria-label="關閉更新提示"
                            style={{
                                flexShrink: 0,
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 18,
                                fontWeight: 900,
                                color: tokens.muted,
                                padding: 0,
                                display: 'grid',
                                placeItems: 'center',
                            }}
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // 安裝提示 — cork 藍色便利貼
    const InstallPrompt = () => (
        <AnimatePresence>
            {isInstallable && showInstallPrompt && shouldShowAfterDelay && (
                <motion.div
                    initial={{ opacity: 0, y: 50, rotate: 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 1.5 }}
                    exit={{ opacity: 0, y: 50, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    className="pwa-prompt-install"
                    style={{
                        position: 'fixed',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        maxWidth: 380,
                        zIndex: 50,
                        marginLeft: 'auto',
                        background: tokens.note.blue,
                        border: '2.5px solid #1a1a1a',
                        borderRadius: 6,
                        boxShadow: '4px 4px 0 rgba(0,0,0,.28), 0 18px 32px -6px rgba(0,0,0,.3)',
                        fontFamily: tokens.font.tc,
                    }}
                >
                    {/* 綠色圖釘 */}
                    <div style={{ position: 'absolute', top: -11, left: '50%', marginLeft: -11, zIndex: 10 }}>
                        <Pin color={tokens.pin[2]} size={22} style={{ position: 'static' }} />
                    </div>

                    <div style={{ padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        {/* 下載 icon */}
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                background: tokens.navy,
                                border: '2.5px solid #1a1a1a',
                                boxShadow: '2px 2px 0 rgba(0,0,0,.3)',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                fontSize: 20,
                            }}
                        >
                            📲
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 900, color: tokens.ink, lineHeight: 1.2 }}>
                                安裝應用程式
                            </h4>
                            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: tokens.inkSoft, lineHeight: 1.55, fontWeight: 500 }}>
                                將教育科技創新專區加入主畫面，享受更快載入與離線可用的順暢體驗
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        installApp();
                                        setShowInstallPrompt(false);
                                    }}
                                    style={{
                                        background: tokens.navy,
                                        color: '#fff',
                                        border: '2.5px solid #1a1a1a',
                                        padding: '7px 14px',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '3px 3px 0 rgba(0,0,0,.3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget;
                                        el.style.transform = 'translate(-2px,-2px)';
                                        el.style.boxShadow = '5px 5px 0 rgba(0,0,0,.35)';
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget;
                                        el.style.transform = '';
                                        el.style.boxShadow = '3px 3px 0 rgba(0,0,0,.3)';
                                    }}
                                >
                                    ⬇️ 安裝到主畫面
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDismissInstall}
                                    style={{
                                        background: '#fefdfa',
                                        color: tokens.ink,
                                        border: '2.5px solid #1a1a1a',
                                        padding: '7px 12px',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
                                    }}
                                >
                                    不用了
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDismissInstall}
                            aria-label="關閉安裝提示"
                            style={{
                                flexShrink: 0,
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 18,
                                fontWeight: 900,
                                color: tokens.muted,
                                padding: 0,
                                display: 'grid',
                                placeItems: 'center',
                            }}
                        >
                            ×
                        </button>
                    </div>
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
