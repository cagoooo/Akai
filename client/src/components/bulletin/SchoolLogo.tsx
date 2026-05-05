import { CSSProperties } from 'react';

interface SchoolLogoProps {
  style?: CSSProperties;
  /** 是否預載入（only above-the-fold 用 true） */
  eager?: boolean;
}

/**
 * 石門國小校徽 — WebP 優先、PNG fallback。
 * 原圖已預縮至 256×256（PNG 22KB / WebP 17KB）。
 */
export function SchoolLogo({ style, eager = false }: SchoolLogoProps) {
  const base = import.meta.env.BASE_URL;
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}assets/school-logo.webp`} />
      <img
        src={`${base}assets/school-logo.png`}
        alt="石門國小校徽"
        width={256}
        height={256}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchPriority: 'high' as const } : {})}
        style={style}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </picture>
  );
}
