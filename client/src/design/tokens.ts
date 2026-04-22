// Design tokens — TypeScript
// 對應 src/styles/tokens.css；需要程式中引用色值時使用

export const tokens = {
  // Paper & surfaces
  corkBg: '#c99a6c',
  paper: '#fefdfa',
  paperEdge: '#d8d4c8',
  ink: '#1a1a1a',
  inkSoft: '#3a3a3a',
  muted: '#8b7356',
  muted2: '#4a3a20',

  // School crest palette
  navy: '#1e3a8a',
  navyDeep: '#162a63',
  red: '#c7302a',
  sky: '#4aa4d9',
  accent: '#ea8a3e',
  accentDeep: '#c66a20',
  accentSoft: '#fef3e7',
  // 橄欖綠（Hero 主題色）— 與 cork 軟木塞底色搭配更協調
  olive: '#7a8c3a',
  oliveDeep: '#5a6a28',
  oliveSoft: '#e8edd0',

  // Sticky-note colors
  note: {
    yellow: '#fff3a8',
    yellowBright: '#fff27a',
    blue: '#c8e6ff',
    pink: '#ffd4d9',
    green: '#d4f4c7',
    orange: '#ffe4b8',
    purple: '#e8d4ff',
    rose: '#ffdbeb',
  },

  // Pin colors (used in rotation)
  pin: ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#c026d3', '#ea580c'] as const,

  // Category palettes
  cat: {
    communication: { bg: '#eff6ff', fg: '#1d4ed8', dot: '#3b82f6' },
    teaching:      { bg: '#ecfdf5', fg: '#047857', dot: '#10b981' },
    language:      { bg: '#f5f3ff', fg: '#6d28d9', dot: '#8b5cf6' },
    reading:       { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' },
    utilities:     { bg: '#f8fafc', fg: '#334155', dot: '#64748b' },
    games:         { bg: '#fdf2f8', fg: '#be185d', dot: '#ec4899' },
    interactive:   { bg: '#ecfeff', fg: '#0e7490', dot: '#06b6d4' },
  },

  font: {
    tc: "'Noto Sans TC', system-ui, sans-serif",
    en: "'Plus Jakarta Sans', sans-serif",
  },
} as const;

export type CategoryKey = keyof typeof tokens.cat | 'all';
