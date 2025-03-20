import { useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

/**
 * 通用延迟加载钩子，用于减少初始页面加载时间
 * @param importFunc 动态导入函数
 * @returns 延迟加载的组件和加载状态
 */
export function useLazyLoad<T>(importFunc: () => Promise<{ default: T }>) {
  const [component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        const module = await importFunc();
        if (isMounted) {
          setComponent(module.default);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('加载组件时发生错误'));
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { component, isLoading, error };
}

interface LoadingProps {
  message?: string;
}

interface ErrorProps {
  error: Error;
  message?: string;
}

const DefaultLoading = ({ message = 'Loading...' }: LoadingProps) => (
  <div className="flex items-center justify-center p-4">
    <span className="text-muted-foreground">{message}</span>
  </div>
);

const DefaultError = ({ error, message = 'Error: ' }: ErrorProps) => (
  <div className="flex items-center justify-center p-4 text-destructive">
    <span>{message}{error.message}</span>
  </div>
);

/**
 * 创建一个延迟加载的视图
 * @param importFunc 动态导入函数
 * @param LoadingComponent 加载时显示的组件
 * @param ErrorComponent 错误时显示的组件
 * @returns 延迟加载的视图组件
 */
export function createLazyView<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType<LoadingProps> = DefaultLoading,
  ErrorComponent: ComponentType<ErrorProps> = DefaultError
): ComponentType<P> {
  return function LazyView(props: P): ReactNode {
    const { component: Component, isLoading, error } = useLazyLoad(importFunc);

    if (isLoading) {
      return <LoadingComponent />;
    }

    if (error) {
      return <ErrorComponent error={error} />;
    }

    if (!Component) {
      return <div className="text-muted-foreground">组件未能加载</div>;
    }

    return <Component {...props} />;
  };
}