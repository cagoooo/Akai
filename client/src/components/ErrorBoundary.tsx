import React, { Component, ErrorInfo, ReactNode } from 'react';
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

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // 呼叫外部錯誤處理函式
        this.props.onError?.(error, errorInfo);

        // 記錄錯誤到控制台
        console.error('ErrorBoundary caught an error:', error, errorInfo);
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
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
