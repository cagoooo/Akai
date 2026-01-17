/**
 * 工具更新通知 Hook
 * 追蹤新工具並通知用戶
 */

import { useState, useEffect, useCallback } from 'react';
import { tools, type EducationalTool } from '@/lib/data';

const LAST_SEEN_VERSION_KEY = 'akai-last-seen-version';
const DISMISSED_TOOLS_KEY = 'akai-dismissed-new-tools';

// 工具版本 - 每次新增工具時更新此數字
export const CURRENT_TOOLS_VERSION = tools.length;

interface NewToolsState {
    newTools: EducationalTool[];
    hasNewTools: boolean;
    lastSeenVersion: number;
}

export function useNewToolsNotification() {
    const [state, setState] = useState<NewToolsState>({
        newTools: [],
        hasNewTools: false,
        lastSeenVersion: CURRENT_TOOLS_VERSION,
    });

    // 初始化：檢查是否有新工具
    useEffect(() => {
        try {
            const lastSeenStr = localStorage.getItem(LAST_SEEN_VERSION_KEY);
            const dismissedStr = localStorage.getItem(DISMISSED_TOOLS_KEY);

            const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0;
            const dismissedIds: number[] = dismissedStr ? JSON.parse(dismissedStr) : [];

            if (lastSeen < CURRENT_TOOLS_VERSION) {
                // 找出新工具（ID 大於上次看到的版本）
                const newTools = tools.filter(
                    tool => tool.id > lastSeen && !dismissedIds.includes(tool.id)
                );

                setState({
                    newTools,
                    hasNewTools: newTools.length > 0,
                    lastSeenVersion: lastSeen,
                });
            }
        } catch (e) {
            console.error('Failed to load new tools state:', e);
        }
    }, []);

    // 標記所有新工具為已讀
    const markAllAsRead = useCallback(() => {
        try {
            localStorage.setItem(LAST_SEEN_VERSION_KEY, CURRENT_TOOLS_VERSION.toString());
            localStorage.removeItem(DISMISSED_TOOLS_KEY);
            setState({
                newTools: [],
                hasNewTools: false,
                lastSeenVersion: CURRENT_TOOLS_VERSION,
            });
        } catch (e) {
            console.error('Failed to mark tools as read:', e);
        }
    }, []);

    // 關閉單一工具通知
    const dismissTool = useCallback((toolId: number) => {
        try {
            const dismissedStr = localStorage.getItem(DISMISSED_TOOLS_KEY);
            const dismissed: number[] = dismissedStr ? JSON.parse(dismissedStr) : [];

            if (!dismissed.includes(toolId)) {
                dismissed.push(toolId);
                localStorage.setItem(DISMISSED_TOOLS_KEY, JSON.stringify(dismissed));
            }

            setState(prev => {
                const remaining = prev.newTools.filter(t => t.id !== toolId);
                return {
                    ...prev,
                    newTools: remaining,
                    hasNewTools: remaining.length > 0,
                };
            });
        } catch (e) {
            console.error('Failed to dismiss tool:', e);
        }
    }, []);

    return {
        ...state,
        markAllAsRead,
        dismissTool,
        currentVersion: CURRENT_TOOLS_VERSION,
    };
}
