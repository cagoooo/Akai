/**
 * BulletinVisitorCounter — E2 公佈欄風格訪客計數器（純顯示元件）
 *
 * 設計：一張橫向便利貼，含：
 * - 左側：眼睛 emoji + 大數字（動畫過渡）
 * - 中央：訪客人次說明
 * - 右側：下一個里程碑進度（細條 + 進度）
 * - 頂部：藍色圖釘 + 右上膠帶裝飾
 *
 * v3.6.5 起：所有「增加訪客數 / 累計 analytics」邏輯已抽到
 *           lib/visitorTracker.ts → trackPageVisit()，由 App.tsx 開機時呼叫。
 *           這個元件只剩 onSnapshot 訂閱顯示。
 */

import { useEffect, useState } from 'react';
import { animate, m as motion, useMotionValue, useTransform } from 'framer-motion';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

interface VisitorStats {
  totalVisits: number;
  dailyVisits?: Record<string, number>;
  lastVisitAt?: string | null;
}

// 里程碑
const MILESTONES = [100, 500, 1000, 2000, 5000, 10000, 50000, 100000];

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [motionValue, value]);

  return <motion.span>{display}</motion.span>;
}

export function BulletinVisitorCounter() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [justUpdated, setJustUpdated] = useState(false);

  // 注意：這個元件已不再負責「增加訪客數」與「累計 context」。
  // 那些寫入工作已抽到 lib/visitorTracker.ts → trackPageVisit()，
  // 並在 App.tsx 開機時呼叫一次（不論落地頁是哪一個都會被計入）。
  // 本元件只負責訂閱 visitorStats/global 並顯示數字。
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        const { doc, onSnapshot } = await import('firebase/firestore');

        if (isFirebaseAvailable() && db) {
          unsubscribe = onSnapshot(
            doc(db, 'visitorStats', 'global'),
            (snapshot) => {
              if (cancelled) return;
              if (snapshot.exists()) {
                const data = snapshot.data() as VisitorStats;
                setTotalVisits((prev) => {
                  if (prev !== 0 && prev !== data.totalVisits) {
                    setJustUpdated(true);
                    setTimeout(() => setJustUpdated(false), 1800);
                  }
                  return data.totalVisits;
                });
                setLoading(false);
                try {
                  localStorage.setItem('totalVisits', String(data.totalVisits));
                } catch { /* ignore */ }
              }
            },
            (err) => {
              console.warn('[BulletinVisitorCounter] onSnapshot 失敗:', err);
              loadFromCache();
            }
          );
        } else {
          loadFromCache();
        }
      } catch (err) {
        console.warn('[BulletinVisitorCounter] 初始化失敗:', err);
        loadFromCache();
      }
    })();

    function loadFromCache() {
      setTotalVisits(parseInt(localStorage.getItem('totalVisits') || '0', 10));
      setLoading(false);
    }

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 計算下一個里程碑 + 進度百分比
  //
  // ⚠️ v3.6.99 修正：舊版用「上一個里程碑 → 下一個里程碑」的區間比例，
  // 導致 5,448 人朝 10,000 邁進時只顯示 8%（因為算的是 448/5000）。
  // 但條子兩端標的是 5,000 與 10,000，訪客眼睛讀到的是「5,448 快到一半了」，
  // 兩者對不起來 → 看起來就是「比例怪怪的」。
  // 改成對「下個里程碑」的絕對比例（5,448 / 10,000 = 54%），
  // 已達成的上一個里程碑改用軌道上的刻度標示，資訊不遺失。
  const lastMilestone = MILESTONES[MILESTONES.length - 1];
  const achievedAll = totalVisits >= lastMilestone;
  const nextMilestone = MILESTONES.find((m) => m > totalVisits) ?? lastMilestone;
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= totalVisits) ?? 0;

  const progress = achievedAll
    ? 100
    : Math.min(100, Math.max(0, (totalVisits / nextMilestone) * 100));
  // 已達成的里程碑在軌道上的位置（0 或超出範圍時不畫刻度）
  const prevMarkerPercent =
    !achievedAll && prevMilestone > 0 ? (prevMilestone / nextMilestone) * 100 : null;
  // 顯示用整數：還沒真的達標就不讓它寫 100%
  const progressLabel = achievedAll ? 100 : Math.min(99, Math.round(progress));
  const remaining = Math.max(0, nextMilestone - totalVisits);

  return (
    <div
      className="bulletin-visitor-counter sticker-card"
      data-tour="visitor-counter"
      style={{
        position: 'relative',
        background: tokens.note.yellow,
        border: '2.5px solid #1a1a1a',
        borderRadius: 10,
        padding: '14px 18px',
        boxShadow: '4px 4px 0 rgba(0,0,0,.22)',
        transform: 'rotate(-0.8deg)',
        maxWidth: 520,
        fontFamily: tokens.font.tc,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
      role="status"
      aria-live="polite"
    >
      <Pin
        color={tokens.pin[1]}
        size={16}
        style={{ top: -8, left: '50%', marginLeft: -8, zIndex: 10 }}
      />

      {/* 左：眼睛 + 數字 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          transition: 'transform .3s ease',
          transform: justUpdated ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <div
          style={{
            fontSize: 32,
            lineHeight: 1,
            filter: justUpdated ? 'drop-shadow(0 0 6px rgba(255,200,0,.8))' : 'none',
          }}
        >
          👀
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: tokens.muted2,
              letterSpacing: '0.2em',
              fontFamily: tokens.font.en,
              fontWeight: 700,
              marginBottom: 2,
              lineHeight: 1,
            }}
          >
            VISITORS
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: tokens.ink,
              fontFamily: tokens.font.en,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {loading ? '—' : <AnimatedNumber value={totalVisits} />}
          </div>
        </div>
      </div>

      {/* 右：里程碑進度 */}
      <div style={{ flex: 1, minWidth: 0 }} className="bulletin-visitor-progress">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: 10.5,
            color: tokens.muted2,
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          <span>下個里程碑</span>
          <span style={{ fontFamily: tokens.font.en, fontWeight: 900, color: tokens.accent }}>
            🏆 {nextMilestone.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            height: 8,
            background: 'rgba(0,0,0,.12)',
            borderRadius: 999,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,.18)',
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={nextMilestone}
          aria-valuenow={Math.min(totalVisits, nextMilestone)}
          aria-valuetext={
            achievedAll
              ? `已達成 ${nextMilestone.toLocaleString()} 人次`
              : `${totalVisits.toLocaleString()} / ${nextMilestone.toLocaleString()} 人次，還差 ${remaining.toLocaleString()} 人`
          }
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              // 進度極小時仍留一小截，避免看起來完全空白
              minWidth: progress > 0 ? 6 : 0,
              background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.red})`,
              borderRadius: 999,
              transition: 'width .8s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: '1px 0 0 rgba(0,0,0,.15)',
            }}
          />
          {/* 已達成的上一個里程碑刻度（例如 5,000）— 讓「走了多遠」與「已解鎖什麼」同時看得到 */}
          {prevMarkerPercent !== null && (
            <div
              aria-hidden="true"
              title={`已達成 ${prevMilestone.toLocaleString()}`}
              style={{
                position: 'absolute',
                top: -1,
                bottom: -1,
                left: `${prevMarkerPercent}%`,
                width: 2,
                background: 'rgba(0,0,0,.38)',
                transition: 'left .8s cubic-bezier(.34,1.56,.64,1)',
              }}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 6,
            fontSize: 9.5,
            color: tokens.muted,
            marginTop: 3,
            fontFamily: tokens.font.en,
            fontWeight: 600,
          }}
        >
          <span>0</span>
          <span
            style={{
              color: tokens.muted2,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              fontFamily: tokens.font.tc,
            }}
          >
            {achievedAll ? '已達成 🎉' : `${progressLabel}%・還差 ${remaining.toLocaleString()} 人`}
          </span>
          <span>{nextMilestone.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
