import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 將RGB顏色轉換為相對亮度
function getLuminance(r: number, g: number, b: number): number {
  try {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  } catch (error) {
    console.error("Error calculating luminance:", error);
    return 0;
  }
}

// 將顏色字串轉換為RGB值
function parseColor(color: string): { r: number, g: number, b: number } {
  try {
    // 處理 hex 格式
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }

    // 處理 rgb/rgba 格式
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const [r, g, b] = match.map(Number);
      return { r, g, b };
    }

    throw new Error(`Invalid color format: ${color}`);
  } catch (error) {
    console.error("Error parsing color:", error);
    return { r: 0, g: 0, b: 0 };
  }
}

// 計算對比度
export function getContrastRatio(color1: string, color2: string): number {
  try {
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);

    return (brightest + 0.05) / (darkest + 0.05);
  } catch (error) {
    console.error("Error calculating contrast ratio:", error);
    return 1;
  }
}

// 檢查顏色對比度是否符合WCAG標準
export function meetsWCAGStandards(
  color1: string,
  color2: string,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false
): boolean {
  try {
    const ratio = getContrastRatio(color1, color2);

    if (level === "AAA") {
      return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }

    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  } catch (error) {
    console.error("Error checking WCAG standards:", error);
    return false;
  }
}

// 組合className工具函數
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 將RGB值轉換為HEX格式
function rgbToHex(r: number, g: number, b: number): string {
  try {
    const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.error("Error converting RGB to HEX:", error);
    return "#000000";
  }
}

// 獲取建議的背景色
export function getSuggestedBackgroundColor(
  foregroundColor: string,
  initialBgColor: string
): string {
  try {
    const fgRGB = parseColor(foregroundColor);
    const bgRGB = parseColor(initialBgColor);
    const contrastRatio = getContrastRatio(foregroundColor, initialBgColor);

    if (contrastRatio >= 4.5) {
      return initialBgColor;
    }

    const fgLuminance = getLuminance(fgRGB.r, fgRGB.g, fgRGB.b);
    const adjustment = fgLuminance > 0.5 ? -0.2 : 0.2;

    const newRGB = {
      r: Math.round(bgRGB.r * (1 + adjustment)),
      g: Math.round(bgRGB.g * (1 + adjustment)),
      b: Math.round(bgRGB.b * (1 + adjustment))
    };

    return rgbToHex(newRGB.r, newRGB.g, newRGB.b);
  } catch (error) {
    console.error("Error getting suggested background color:", error);
    return initialBgColor;
  }
}