/**
 * 資料適配器：把現有 EducationalTool 映射到拍立得設計所需的視覺資料
 *
 * 設計原則：
 * - 不改動原本的 tools.json schema（避免破壞其他元件）
 * - 本地做 emoji、分類名稱、URL 的正規化
 */

import type { EducationalTool } from '@/lib/data';
import type { CategoryKey } from '@/design/tokens';

/** 分類 → 代表性 emoji */
const CATEGORY_EMOJI: Record<string, string> = {
  communication: '💬',
  teaching: '📚',
  language: '✍️',
  reading: '📖',
  utilities: '🛠️',
  games: '🎮',
  interactive: '🎯',
};

/** 分類英文鍵 → 中文顯示名稱 */
const CATEGORY_LABEL: Record<string, string> = {
  communication: '溝通互動',
  teaching: '教學設計',
  language: '語文寫作',
  reading: '語文閱讀',
  utilities: '實用工具',
  games: '教育遊戲',
  interactive: '互動體驗',
};

/** 某些工具 icon 名稱 → 更貼切的 emoji（可擴充） */
const ICON_TO_EMOJI: Record<string, string> = {
  MessageSquare: '💬',
  MessageCircle: '💬',
  Sparkles: '✨',
  Lightbulb: '💡',
  BookOpen: '📖',
  Book: '📚',
  Gamepad2: '🎮',
  QrCode: '📱',
  Palette: '🎨',
  Music: '🎵',
  Calculator: '🧮',
  Bot: '🤖',
  Gift: '🎁',
  Utensils: '🍽️',
  Wand2: '🪄',
  Star: '⭐',
  Trophy: '🏆',
  Camera: '📷',
  Video: '🎬',
  Mic: '🎤',
  Heart: '💝',
  Crown: '👑',
  Map: '🗺️',
  Clock: '⏰',
  Brain: '🧠',
  Feather: '🪶',
  Rocket: '🚀',
};

/** 安全處理 URL：沒 protocol 自動加 https://，LINE Bot 等特殊 URL 保留原樣 */
export function normalizeUrl(url: string): string {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.toLowerCase().includes('line bot') || url.startsWith('#')) return '#';
  return `https://${url}`;
}

/** 取得工具的代表 emoji：優先使用 icon 對應，其次退回分類 emoji */
export function getToolEmoji(tool: EducationalTool): string {
  if (tool.icon && ICON_TO_EMOJI[tool.icon]) {
    return ICON_TO_EMOJI[tool.icon];
  }
  return CATEGORY_EMOJI[tool.category] || '📌';
}

/** 取得分類的中文顯示名稱 */
export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABEL[cat] || cat;
}

/** 驗證分類鍵是否在 design tokens 可接受範圍內 */
export function getCategoryKey(cat: string): Exclude<CategoryKey, 'all'> {
  const valid: Array<Exclude<CategoryKey, 'all'>> = [
    'communication',
    'teaching',
    'language',
    'reading',
    'utilities',
    'games',
    'interactive',
  ];
  if (valid.includes(cat as Exclude<CategoryKey, 'all'>)) {
    return cat as Exclude<CategoryKey, 'all'>;
  }
  return 'utilities';
}
