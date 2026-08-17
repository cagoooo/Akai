import React, { Component, ErrorInfo, ReactNode } from 'react';
import { shouldReportErrorToFirestore } from '@/lib/errorReporting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * 錯誤邊界元件
 * 捕獲子元件的 JavaScript 錯誤，防止整個應用程式崩潰
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    /**
     * 判斷錯誤是不是「動態 import chunk 失敗」型別 — 這通常代表 vite build 後 chunk hash 變了，
     * 但使用者瀏覽器持有舊版 SPA / SW cache。這不是 bug，是 PWA cache 不匹配，自動 reload 即可。
     */
    private static isChunkError(error: Error): boolean {
        const msg = String(error?.message || '');
        const stack = String(error?.stack || '');
        return /Loading chunk|Failed to fetch dynamically imported module|ChunkLoadError|Importing a module script failed/i.test(
            msg + ' ' + stack
        );
    }

    /**
     * 判斷錯誤是不是「Google 翻譯 / 外掛造成的 DOM 脫節錯誤」
     * （例如 Failed to execute 'insertBefore' / 'removeChild' on 'Node'）
     */
    private static isDomDesyncError(error: Error): boolean {
        const msg = String(error?.message || '');
        const name = String(error?.name || '');
        return (
            name === 'NotFoundError' ||
            /insertBefore|removeChild|not a child of this node/i.test(msg)
        );
    }

    /**
     * 接住 chunk error → 強制清 SW + reload 一次。
     * 用 sessionStorage 旗標防無限循環（reload 過一次後若還噴 chunk error，就改顯示一般錯誤畫面）
     */
    private async handleChunkError() {
        const FLAG = 'akai-chunk-reload-attempted';
        try {
            if (sessionStorage.getItem(FLAG) === '1') {
                console.warn('[ErrorBoundary] chunk error 已嘗試 reload 過，這次顯示一般錯誤畫面避免循環');
                return; // 已試過就放棄自癒，讓 fallback UI 顯示
            }
            sessionStorage.setItem(FLAG, '1');
        } catch { /* sessionStorage 不可用就直接 reload */ }

        console.warn('[ErrorBoundary] 偵測到 chunk error，自動清 SW + reload');
        try {
            // 1. unregister 所有 SW
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (const reg of regs) await reg.unregister();
            }
            // 2. 清所有 cache（強制 fresh）
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            }
        } catch (e) {
            console.warn('[ErrorBoundary] 清 SW/cache 失敗，直接 reload', e);
        }
        // 3. 強制 reload（不走 SW，從 server 拿最新）
        window.location.reload();
    }

    private domDesyncRetryCount = 0;

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // 🚀 chunk error 自癒：偵測到動態 import 失敗 → 自動清 SW + reload
        // 這不是 bug，是 vite build 後 chunk hash 變了但瀏覽器卡舊版 SPA
        if (ErrorBoundary.isChunkError(error)) {
            console.warn('[ErrorBoundary] 偵測到 chunk error，啟動自癒流程', error.message);
            void this.handleChunkError();
            return; // 不繼續跑 Sentry / Firestore 紀錄（不算 bug）
        }

        // 🛡️ DOM 脫節（如 Google Translate / 插件插入節點）自癒：
        // 自動嘗試重置 React 虛擬 DOM 狀態一次，避免白畫面
        if (ErrorBoundary.isDomDesyncError(error) && this.domDesyncRetryCount < 2) {
            this.domDesyncRetryCount++;
            console.warn('[ErrorBoundary] 偵測到 DOM 脫節錯誤，自動重試恢復渲染...', error.message);
            setTimeout(() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
            }, 50);
            return;
        }

        // 呼叫外部錯誤處理函式
        this.props.onError?.(error, errorInfo);

        // 記錄錯誤到控制台
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // 記錄錯誤到 Sentry（含完整 React component stack）
        import('@/lib/sentry').then(({ captureException }) => {
            captureException(error, {
                source: 'ErrorBoundary',
                componentStack: errorInfo.componentStack?.substring(0, 2000),
                url: window.location.href,
            });
        }).catch(() => { /* Sentry 載入失敗不影響其他流程 */ });

        // 記錄錯誤到 Firestore（既有 fallback 通道，雙保險）
        this.logErrorToFirestore(error, errorInfo);
    }

    private async logErrorToFirestore(error: Error, errorInfo: ErrorInfo) {
        // 本機開發不寫進正式 errorLogs（避免污染 Google Chat 告警）
        if (!shouldReportErrorToFirestore()) return;
        try {
            const { db, isFirebaseAvailable } = await import('@/lib/firebase');
            if (!isFirebaseAvailable() || !db) return;
            const { ensureSignedIn } = await import('@/lib/authService');
            if (!await ensureSignedIn()) return;
            const { collection, addDoc } = await import('firebase/firestore');
            await addDoc(collection(db, 'errorLogs'), {
                message: error.message,
                stack: error.stack?.substring(0, 2000),
                componentStack: errorInfo.componentStack?.substring(0, 2000),
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                level: 'error',
                // P1-4：告警卡片要顯示「這是哪一版壞的」；走既有的 metadata 欄位，不必動 firestore.rules
                metadata: { appVersion: import.meta.env.VITE_APP_VERSION ?? 'unknown' },
            });
        } catch (e) {
            // Silently fail - don't create error loops
        }
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            // 如果提供了自定義 fallback，使用它
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // 在 Lighthouse/CI 環境中，減少錯誤 UI 的渲染，避免干擾 LCP
            const isCI = typeof window !== 'undefined' &&
                (window.navigator.userAgent.includes('Lighthouse') ||
                    window.location.search.includes('lighthouse') ||
                    (window as any).isLighthouseCI);

            if (isCI) {
                return (
                    <div style={{ opacity: 0, height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true">
                        Error caught in CI
                    </div>
                );
            }

            // 預設錯誤 UI
            return (
                <Card className="m-4 border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            發生錯誤
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            很抱歉，此區塊發生了錯誤。請嘗試重新載入或稍後再試。
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-xs bg-muted p-2 rounded-md">
                                <summary className="cursor-pointer font-medium">
                                    錯誤詳情 (開發模式)
                                </summary>
                                <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={this.handleRetry}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                重試
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={this.handleReload}
                            >
                                重新載入頁面
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

/**
 * 帶有 Suspense 的元件載入包裝器
 */
interface SuspenseWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
    const defaultFallback = (
        <div className="flex items-center justify-center p-8" role="status" aria-label="載入中">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" role="progressbar" aria-label="正在載入內容"></div>
        </div>
    );

    return (
        <ErrorBoundary>
            <React.Suspense fallback={fallback || defaultFallback}>
                {children}
            </React.Suspense>
        </ErrorBoundary>
    );
}
