// 點擊熱力圖追蹤 Hook
// 記錄用戶在頁面上的點擊位置用於分析

import { isBrowserStorageAvailable } from '@/lib/browserStorage';

const CLICK_DATA_KEY = 'clickHeatmapData';

interface ClickPoint {
    x: number; // 相對於視窗寬度的百分比 (0-100)
    y: number; // 相對於文檔高度的百分比 (0-100)
    timestamp: number;
    page: string;
}

// 獲取點擊數據
export function getClickData(): ClickPoint[] {
    try {
        const data = localStorage.getItem(CLICK_DATA_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to load click data:', e);
    }
    return [];
}

// 清除點擊數據
export function clearClickData(): void {
    localStorage.removeItem(CLICK_DATA_KEY);
}

// 記錄點擊
function recordClick(event: MouseEvent): void {
    try {
        // 計算相對位置 (百分比)
        const x = (event.clientX / window.innerWidth) * 100;
        const y = ((event.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100;

        const clickPoint: ClickPoint = {
            x: Math.round(x * 10) / 10, // 保留一位小數
            y: Math.round(y * 10) / 10,
            timestamp: Date.now(),
            page: window.location.pathname
        };

        // 獲取現有數據
        const existingData = getClickData();

        // 限制最多保存 500 個點擊點
        if (existingData.length >= 500) {
            existingData.shift(); // 移除最舊的
        }

        existingData.push(clickPoint);
        localStorage.setItem(CLICK_DATA_KEY, JSON.stringify(existingData));
    } catch (e) {
        console.error('Failed to record click:', e);
    }
}

// 初始化點擊追蹤
export function initClickTracking(): () => void {
    // 瀏覽器不允許本機儲存時，每次點擊都會丟 SecurityError，乾脆不啟動（JAVASCRIPT-REACT-31）
    if (!isBrowserStorageAvailable()) {
        console.info('🎯 瀏覽器不允許本機儲存，點擊追蹤不啟動');
        return () => {};
    }
    document.addEventListener('click', recordClick);
    console.log('🎯 點擊追蹤已啟動');

    // 返回清理函數
    return () => {
        document.removeEventListener('click', recordClick);
        console.log('🎯 點擊追蹤已停止');
    };
}

// 獲取熱力圖數據（聚合點擊）
export function getHeatmapData(): { x: number; y: number; value: number }[] {
    const clicks = getClickData();

    // 將點擊聚合到 10x10 的網格中
    const gridSize = 5; // 5% 為一個格子
    const grid: Record<string, number> = {};

    clicks.forEach(click => {
        // 將座標對齊到網格
        const gridX = Math.floor(click.x / gridSize) * gridSize;
        const gridY = Math.floor(click.y / gridSize) * gridSize;
        const key = `${gridX}-${gridY}`;

        grid[key] = (grid[key] || 0) + 1;
    });

    // 轉換為熱力圖格式
    return Object.entries(grid).map(([key, value]) => {
        const [x, y] = key.split('-').map(Number);
        return { x, y, value };
    });
}

// 獲取首頁點擊數據統計
export function getClickStats() {
    const clicks = getClickData();
    const homeClicks = clicks.filter(c => c.page === '/' || c.page === '');

    // 按時間分組
    const hourlyClicks: Record<number, number> = {};
    homeClicks.forEach(click => {
        const hour = new Date(click.timestamp).getHours();
        hourlyClicks[hour] = (hourlyClicks[hour] || 0) + 1;
    });

    return {
        total: homeClicks.length,
        hourlyDistribution: hourlyClicks,
        lastUpdated: homeClicks.length > 0 ? Math.max(...homeClicks.map(c => c.timestamp)) : null
    };
}
