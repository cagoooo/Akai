/**
 * useSortOptions Hook 測試
 * 測試排序選項的各種功能
 */

import { renderHook, act } from '@testing-library/react';
import { useSortOptions, sortOptions, type SortOption } from '../useSortOptions';
import type { EducationalTool } from '@/lib/data';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 測試用工具資料
const mockTools: EducationalTool[] = [
  {
    id: 1,
    title: '線上即時客服',
    description: 'desc',
    url: 'url',
    icon: 'icon',
    category: 'communication',
  },
  {
    id: 2,
    title: '行政業務協調系統',
    description: 'desc',
    url: 'url',
    icon: 'icon',
    category: 'utilities',
  },
  {
    id: 3,
    title: '學生即時投票系統',
    description: 'desc',
    url: 'url',
    icon: 'icon',
    category: 'interactive',
  },
  {
    id: 4,
    title: 'PIRLS閱讀理解生成',
    description: 'desc',
    url: 'url',
    icon: 'icon',
    category: 'reading',
  },
  {
    id: 5,
    title: '校園點餐系統',
    description: 'desc',
    url: 'url',
    icon: 'icon',
    category: 'utilities',
  },
];

describe('useSortOptions', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('初始狀態', () => {
    it('預設排序應為 popular', () => {
      const { result } = renderHook(() => useSortOptions());
      expect(result.current.currentSort).toBe('popular');
    });

    it('應該返回所有排序選項', () => {
      const { result } = renderHook(() => useSortOptions());
      expect(result.current.sortOptions).toEqual(sortOptions);
      expect(result.current.sortOptions).toHaveLength(4);
    });

    it('排序選項應包含正確的配置', () => {
      expect(sortOptions).toContainEqual({ option: 'random', label: '隨機', icon: '🎲' });
      expect(sortOptions).toContainEqual({ option: 'popular', label: '熱門', icon: '🔥' });
      expect(sortOptions).toContainEqual({ option: 'name', label: '名稱', icon: '🔤' });
      expect(sortOptions).toContainEqual({ option: 'newest', label: '最新', icon: '✨' });
    });
  });

  describe('setCurrentSort', () => {
    it('應該能夠切換排序方式', () => {
      const { result } = renderHook(() => useSortOptions());

      act(() => {
        result.current.setCurrentSort('name');
      });
      expect(result.current.currentSort).toBe('name');

      act(() => {
        result.current.setCurrentSort('newest');
      });
      expect(result.current.currentSort).toBe('newest');

      act(() => {
        result.current.setCurrentSort('popular');
      });
      expect(result.current.currentSort).toBe('popular');
    });
  });

  describe('sortTools - 名稱排序', () => {
    it('應該按中文名稱排序', () => {
      const { result } = renderHook(() => useSortOptions());

      act(() => {
        result.current.setCurrentSort('name');
      });

      const sorted = result.current.sortTools(mockTools);

      // 驗證是按照名稱排序的
      for (let i = 0; i < sorted.length - 1; i++) {
        const comparison = sorted[i].title.localeCompare(sorted[i + 1].title, 'zh-TW');
        expect(comparison).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('sortTools - 最新排序', () => {
    it('應該按 ID 降序排序（ID 越大越新）', () => {
      const { result } = renderHook(() => useSortOptions());

      act(() => {
        result.current.setCurrentSort('newest');
      });

      const sorted = result.current.sortTools(mockTools);

      // 驗證 ID 是降序排列
      expect(sorted[0].id).toBe(5);
      expect(sorted[1].id).toBe(4);
      expect(sorted[2].id).toBe(3);
      expect(sorted[3].id).toBe(2);
      expect(sorted[4].id).toBe(1);
    });
  });

  describe('sortTools - 熱門排序', () => {
    it('應該按使用次數降序排序', () => {
      // 設置模擬的使用統計
      const mockStats = [
        { toolId: 1, totalClicks: 10 },
        { toolId: 2, totalClicks: 50 },
        { toolId: 3, totalClicks: 30 },
        { toolId: 4, totalClicks: 5 },
        { toolId: 5, totalClicks: 100 },
      ];
      localStorageMock.setItem('localToolsStats', JSON.stringify(mockStats));

      const { result } = renderHook(() => useSortOptions());

      act(() => {
        result.current.setCurrentSort('popular');
      });

      const sorted = result.current.sortTools(mockTools);

      // 驗證按點擊次數降序排列
      expect(sorted[0].id).toBe(5); // 100 clicks
      expect(sorted[1].id).toBe(2); // 50 clicks
      expect(sorted[2].id).toBe(3); // 30 clicks
      expect(sorted[3].id).toBe(1); // 10 clicks
      expect(sorted[4].id).toBe(4); // 5 clicks
    });

    it('沒有統計數據時應該保持原順序', () => {
      const { result } = renderHook(() => useSortOptions());

      act(() => {
        result.current.setCurrentSort('popular');
      });

      const sorted = result.current.sortTools(mockTools);

      // 所有工具的統計都是 0，應該保持穩定排序
      expect(sorted).toHaveLength(5);
    });
  });

  describe('sortTools - 隨機排序', () => {
    it('應該返回相同數量的工具', () => {
      const { result } = renderHook(() => useSortOptions());

      const sorted = result.current.sortTools(mockTools);
      expect(sorted).toHaveLength(mockTools.length);
    });

    it('應該包含所有原始工具', () => {
      const { result } = renderHook(() => useSortOptions());

      const sorted = result.current.sortTools(mockTools);
      const sortedIds = sorted.map((t) => t.id).sort();
      const originalIds = mockTools.map((t) => t.id).sort();

      expect(sortedIds).toEqual(originalIds);
    });

    it('不應該修改原始陣列', () => {
      const { result } = renderHook(() => useSortOptions());
      const originalTools = [...mockTools];

      result.current.sortTools(mockTools);

      expect(mockTools).toEqual(originalTools);
    });
  });
});
