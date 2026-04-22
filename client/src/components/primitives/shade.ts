// 顏色加深 / 變亮小工具
export function shade(hex: string, pct: number): string {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + pct));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + pct));
  const b = Math.max(0, Math.min(255, (num & 0xff) + pct));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
