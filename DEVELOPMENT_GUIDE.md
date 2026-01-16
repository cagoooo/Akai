# 詳細開發建議與實作指南

> 建立日期：2026-01-16  
> 適用版本：v2.1.0+  
> 作者：阿凱老師

本文件提供詳細的功能開發建議、技術實作方案和最佳實踐，供未來開發參考。

---

## 📑 目錄

1. [短期功能開發](#短期功能開發)
2. [中期架構優化](#中期架構優化)
3. [長期平台擴展](#長期平台擴展)
4. [技術實作範例](#技術實作範例)
5. [效能優化方案](#效能優化方案)
6. [安全性建議](#安全性建議)

---

## 🚀 短期功能開發

### 1. 鍵盤快捷鍵系統

#### 需求分析
- **目標用戶**：熟練的教師使用者
- **使用場景**：快速搜尋、瀏覽工具
- **價值主張**：提升操作效率 30%+

#### 技術實作

##### 方案一：自定義 Hook
```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在輸入框中觸發
      if (e.target instanceof HTMLInputElement) return;

      switch(e.key) {
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
          break;
        case 'Escape':
          document.querySelector<HTMLInputElement>('input[type="search"]')?.blur();
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) return; // 避免與瀏覽器搜尋衝突
          e.preventDefault();
          // 觸發收藏功能
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

##### 方案二：使用 React Hotkeys Hook
```typescript
// 安裝：npm install react-hotkeys-hook
import { useHotkeys } from 'react-hotkeys-hook';

function Home() {
  useHotkeys('/', () => searchRef.current?.focus());
  useHotkeys('escape', () => setSearchQuery(''));
  useHotkeys('f', () => toggleFavorite(currentToolId));
  useHotkeys('up,down', (e) => navigateTools(e.key));
}
```

#### UI 設計

##### 快捷鍵說明對話框
```typescript
// components/KeyboardShortcutsDialog.tsx
export function KeyboardShortcutsDialog() {
  const shortcuts = [
    { key: '/', description: '聚焦搜尋框' },
    { key: 'Esc', description: '清除搜尋' },
    { key: '↑/↓', description: '導航工具' },
    { key: 'Enter', description: '開啟工具' },
    { key: 'F', description: '切換收藏' },
    { key: '?', description: '顯示此說明' }
  ];

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>鍵盤快捷鍵</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex justify-between">
              <kbd className="px-2 py-1 bg-muted rounded">{key}</kbd>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 實作優先級
1. ✅ **P0**：`/` 聚焦搜尋
2. ✅ **P0**：`Esc` 清除搜尋
3. ⭐ **P1**：`↑/↓` 導航
4. ⭐ **P1**：`?` 顯示說明
5. ⭐ **P2**：`F` 切換收藏

---

### 2. 深色模式增強

#### 需求分析
- **目標**：提供更好的夜間瀏覽體驗
- **技術目標**：支援系統偏好、平滑過渡、顏色變體

#### 技術實作

##### 使用 CSS 變數
```css
/* index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
}

/* 平滑過渡 */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

##### ThemeProvider 實作
```typescript
// components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'system', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

#### 進階功能

##### 顏色變體切換
```typescript
const colorThemes = {
  blue: { primary: '221.2 83.2% 53.3%' },
  green: { primary: '142.1 76.2% 36.3%' },
  purple: { primary: '262.1 83.3% 57.8%' }
};
```

##### 圖片深色模式適應
```css
.dark img {
  filter: brightness(0.8) contrast(1.2);
}

/* 或使用 mix-blend-mode */
.dark img {
  mix-blend-mode: luminosity;
}
```

---

### 3. 統計儀表板開發

#### 資料架構

##### Firestore 資料模型
```typescript
interface ToolUsageStats {
  toolId: number;
  dailyClicks: {
    [date: string]: number; // "2026-01-16": 42
  };
  totalClicks: number;
  categoryClicks: {
    [category: string]: number;
  };
  hourlyDistribution: number[]; // 24 小時分佈
  lastUsedAt: Timestamp;
}

interface VisitorStats {
  totalVisits: number;
  dailyVisits: {
    [date: string]: number;
  };
  uniqueVisitors: number;
  returningVisitors: number;
}
```

#### 圖表實作

##### 使用趨勢線圖
```typescript
// components/UsageTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

export function UsageTrendChart({ data }: { data: ToolUsageStats[] }) {
  const chartData = useMemo(() => {
    // 整理最近 30 天的資料
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => ({
      date,
      clicks: data.reduce((sum, tool) => sum + (tool.dailyClicks[date] || 0), 0)
    }));
  }, [data]);

  return (
    <LineChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
    </LineChart>
  );
}
```

##### 熱門工具長條圖
```typescript
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

export function TopToolsChart({ tools }: { tools: ToolUsageStats[] }) {
  const topTools = tools
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 10)
    .map(tool => ({
      name: getToolName(tool.toolId),
      clicks: tool.totalClicks
    }));

  return (
    <BarChart width={600} height={300} data={topTools}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="clicks" fill="#8884d8" />
    </BarChart>
  );
}
```

---

## 🏗️ 中期架構優化

### 1. 測試覆蓋率提升

#### 單元測試範例

##### 使用 Vitest
```typescript
// __tests__/utils/categoryUtils.test.ts
import { describe, it, expect } from 'vitest';
import { getCategoryInfo, getCategoryEmoji } from '@/lib/categoryConstants';

describe('Category Utils', () => {
  it('should return correct category info', () => {
    const info = getCategoryInfo('teaching');
    expect(info.label).toBe('教學資源');
    expect(info.emoji).toBe('📚');
  });

  it('should return default for unknown category', () => {
    const info = getCategoryInfo('unknown' as any);
    expect(info.label).toBe('unknown');
  });
});
```

##### 元件測試
```typescript
// __tests__/components/ToolCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCard } from '@/components/ToolCard';

describe('ToolCard', () => {
  const mockTool = {
    id: 1,
    title: '測試工具',
    description: '測試描述',
    category: 'teaching',
    url: 'https://test.com'
  };

  it('should render tool information', () => {
    render(<ToolCard tool={mockTool} />);
    expect(screen.getByText('測試工具')).toBeInTheDocument();
    expect(screen.getByText('測試描述')).toBeInTheDocument();
  });

  it('should toggle favorite on click', () => {
    const onToggleFavorite = vi.fn();
    render(<ToolCard tool={mockTool} onToggleFavorite={onToggleFavorite} />);
    
    const favoriteButton = screen.getByRole('button', { name: /收藏/ });
    fireEvent.click(favoriteButton);
    
    expect(onToggleFavorite).toHaveBeenCalledWith(1);
  });
});
```

#### E2E 測試範例

##### 使用 Playwright
```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('search functionality', async ({ page }) => {
  await page.goto('http://localhost:5000');

  // 搜尋工具
  await page.fill('input[type="search"]', '客服');
  
  // 驗證結果
  const toolCards = await page.locator('.tool-card').count();
  expect(toolCards).toBeGreaterThan(0);

  // 驗證第一個結果
  const firstCard = page.locator('.tool-card').first();
  await expect(firstCard).toContainText('客服');
});
```

---

### 2. 程式碼品質提升

#### ESLint 嚴格規則
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

#### TypeScript 嚴格模式
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 🌐 長期平台擴展

### 1. 使用者認證系統

#### Firebase Authentication 整合

##### 初始化設定
```typescript
// lib/auth.ts
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return auth.onAuthStateChanged(callback);
}
```

##### AuthProvider Context
```typescript
// components/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '@/lib/auth';

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### 使用者資料同步

##### Firestore 資料結構
```typescript
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  favorites: number[]; // 收藏的工具 ID
  recentTools: number[]; // 最近使用
  achievements: string[]; // 成就 ID
  stats: {
    totalToolsUsed: number;
    totalVisits: number;
    joinedAt: Timestamp;
    lastActiveAt: Timestamp;
  };
}
```

##### 同步邏輯
```typescript
// lib/userService.ts
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function syncUserFavorites(uid: string, favorites: number[]) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    favorites,
    'stats.lastActiveAt': new Date()
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() as UserProfile : null;
}
```

---

### 2. 評論與評分系統

#### 資料庫設計

##### Firestore Collection
```typescript
interface ToolReview {
  reviewId: string;
  toolId: number;
  userId: string;
  userName: string;
  userPhotoURL: string;
  rating: number; // 1-5
  comment: string;
  likes: number;
  likedBy: string[]; // user IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

##### 安全規則
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /toolReviews/{reviewId} {
      // 任何人可讀
      allow read: if true;
      
      // 登入用戶可新增評論
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      
      // 只能編輯自己的評論
      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid;
      
      // 只能刪除自己的評論
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### UI 元件設計

##### 評分輸入
```typescript
// components/RatingInput.tsx
export function RatingInput({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="hover:scale-110 transition-transform"
        >
          <Star
            className={cn(
              "w-6 h-6",
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
```

##### 評論列表
```typescript
// components/ReviewList.tsx
export function ReviewList({ toolId }: { toolId: number }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', toolId],
    queryFn: () => getToolReviews(toolId)
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-4">
      {reviews?.map((review) => (
        <Card key={review.reviewId}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={review.userPhotoURL} />
                <AvatarFallback>{review.userName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{review.userName}</p>
                <div className="flex items-center gap-1">
                  <StarRating value={review.rating} readonly />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>{review.comment}</p>
            <div className="mt-2 flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {review.likes}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## ⚡ 效能優化方案

### 1. 圖片優化

#### 使用 WebP 格式
```bash
# 批量轉換 PNG 到 WebP
npm install -g cwebp
for file in client/public/previews/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

#### 響應式圖片
```tsx
<picture>
  <source srcSet="/previews/tool.webp" type="image/webp" />
  <source srcSet="/previews/tool.png" type="image/png" />
  <img src="/previews/tool.png" alt="Tool Preview" />
</picture>
```

### 2. 程式碼分割優化

#### 路由層級分割
```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const ToolDetail = lazy(() => import('@/pages/ToolDetail'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/tool/:id" element={<ToolDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. 快取策略

#### Service Worker 快取
```javascript
// public/sw.js
const CACHE_STATIC = 'static-v2.1.0';
const CACHE_DYNAMIC = 'dynamic-v2.1.0';

const staticAssets = [
  '/',
  '/index.html',
  '/logo.svg',
  '/previews/preview_communication_v2.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(staticAssets);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_DYNAMIC).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
```

---

## 🔒 安全性建議

### 1. Content Security Policy

#### HTTP Header 設定
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  img-src 'self' data: https:; 
  font-src 'self' https://fonts.gstatic.com; 
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
```

### 2. Firebase 安全規則範例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 訪問統計：所有人可讀，只有伺服器可寫
    match /stats/visitors {
      allow read: if true;
      allow write: if false;
    }
    
    // 工具評論：登入用戶可新增、修改自己的評論
    match /toolReviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // 使用者資料：只能存取自己的資料
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 📝 實作檢查清單

### 短期 (1-2 週)
- [ ] 實作鍵盤快捷鍵 (`/`, `Esc`)
- [ ] 新增快捷鍵說明對話框
- [ ] 深色模式系統偏好偵測
- [ ] 主題切換動畫
- [ ] 生成剩餘 4 張預覽圖

### 中期 (1 個月)
- [ ] 建立統計儀表板頁面
- [ ] 整合 Recharts 圖表庫
- [ ] 實作每日使用趨勢圖
- [ ] 實作熱門工具 TOP 10
- [ ] 擴展成就系統

### 長期 (2-3 個月)
- [ ] Firebase Authentication 整合
- [ ] Google 登入功能
- [ ] 使用者資料同步
- [ ] 評論與評分系統
- [ ] 評論點讚功能

---

*建立日期：2026-01-16*  
*適用版本：v2.1.0+*  
*建議定期檢視並更新本文件*
