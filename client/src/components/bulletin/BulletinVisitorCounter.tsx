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

import { useEffect, useMemo, useState } from 'react';
import { animate, m as motion, useMotionValue, useTransform } from 'framer-motion';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { estimateTimeToMilestone, getMilestoneProgress } from '@/lib/visitorMilestones';

interface VisitorStats {
  totalVisits: number;
  dailyVisits?: Record<string, number>;
  lastVisitAt?: string | null;
}

/** 估算成長速度時取最近幾天的 dailyVisits 平均 */
const VELOCITY_WINDOW_DAYS = 14;

/** 從 dailyVisits 算最近的每日平均訪客數；資料不足回傳 0（→ 不顯示預估） */
function averageDailyVisits(dailyVisits: Record<string, number> | undefined): number {
  if (!dailyVisits) return 0;
  const recent = Object.entries(dailyVisits)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, VELOCITY_WINDOW_DAYS)
    .map(([, count]) => count)
    .filter((count) => typeof count === 'number' && Number.isFinite(count) && count >= 0);
  // 少於 3 天資料就別亂估
  if (recent.length < 3) return 0;
  return recent.reduce((sum, count) => sum + count, 0) / recent.length;
}

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
  const [dailyVisits, setDailyVisits] = useState<Record<string, number> | undefined>(undefined);
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
                setDailyVisits(data.dailyVisits);
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

  // 里程碑進度改由 lib/visitorMilestones.ts 統一計算（與舊版 VisitorCounter 共用同一份級距與語意）
  const {
    nextMilestone,
    prevMilestone,
    progress,
    progressLabel,
    remaining,
    achievedAll,
    prevMarkerPercent,
  } = useMemo(() => getMilestoneProgress(totalVisits), [totalVisits]);

  // 以最近 14 天的平均成長速度估算還要多久達標，把靜態數字變成有盼頭的敘事
  const eta = useMemo(
    () => estimateTimeToMilestone(remaining, averageDailyVisits(dailyVisits)),
    [remaining, dailyVisits],
  );

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
          <span>{eta ? `下個里程碑・${eta}` : '下個里程碑'}</span>
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
