import type { ReactNode } from "react";

export interface StickyStatCardProps {
  color: string;        // 便利貼底色
  tilt: number;         // 傾斜角度
  pinColor: string;     // 圖釘顏色
  label: string;        // 標題（如「總訪問量」）
  value: string;        // 主數字
  icon: ReactNode;
  delta: string;        // 比較文字
  deltaColor: string;   // 比較文字顏色
}

export function StickyStatCard({ color, tilt, pinColor, label, value, icon, delta, deltaColor }: StickyStatCardProps) {
  return (
    <div
      className="sticker-card"
      style={{
        position: 'relative',
        background: color,
        padding: '16px 18px 14px',
        borderRadius: 6,
        border: '2px solid #1a1a1a',
        boxShadow: '3px 3px 0 rgba(0,0,0,.22), 0 10px 20px -6px rgba(0,0,0,.22)',
        transform: `rotate(${tilt}deg)`,
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      {/* 頂部立體圖釘 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          marginLeft: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, #ffffff, ${pinColor} 55%, #000000)`,
          boxShadow: '0 2px 4px rgba(0,0,0,.35), inset -1px -1px 2px rgba(0,0,0,.3)',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '30%',
            width: '22%',
            height: '22%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.8)',
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold mb-1" style={{ color: '#4a3a20', letterSpacing: '0.03em' }}>
            {label}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black truncate" style={{ color: '#1a1a1a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {value}
          </h3>
          <p className="text-xs sm:text-sm mt-1 font-bold" style={{ color: deltaColor }}>
            {delta}
          </p>
        </div>
        {/* icon 框 */}
        <div
          className="shrink-0 grid place-items-center"
          style={{
            width: 48,
            height: 48,
            background: 'rgba(255,255,255,.7)',
            border: '2px solid #1a1a1a',
            borderRadius: '50%',
            color: '#1a1a1a',
            boxShadow: '2px 2px 0 rgba(0,0,0,.2)',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
