import { useState, Suspense, lazy } from 'react';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';
import { tokens } from '@/design/tokens';

const WishingWellDialog = lazy(() =>
  import('@/components/WishingWellDialog').then((m) => ({ default: m.WishingWellDialog }))
);

// 固定的示範願望牆（實際提交仍透過 WishingWellDialog 寫入 Firestore 並推 LINE）
const SAMPLE_WISHES = [
  { text: '希望有一個可以自動產生學習單的工具！', name: '小陳老師' },
  { text: '點石成金真的救了我的評語撰寫 🙌', name: '靜芳老師' },
  { text: '請做一個家長會座位表生成器～', name: '雅婷主任' },
  { text: '貓咪圖鑑可以加進自然課教材嗎？', name: '佳穎老師' },
];

/**
 * 🪄 許願池：預覽便利貼牆 + CTA 開啟真正的 WishingWellDialog（有 Firestore + LINE 推播）
 */
export function BulletinWishPool() {
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const colors = [tokens.note.yellow, tokens.note.blue, tokens.note.pink, tokens.note.green];
  const tilts = [-3, 2, -1.5, 1.2];

  return (
    <div data-tour="wish-pool">
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Tape color={tokens.note.green} angle={2} width={180}>
          <span style={{ fontSize: 14 }}>🪄 許願池 · WISHES</span>
        </Tape>
      </div>

      {/* CTA 卡片：點擊開啟真實的 WishingWellDialog */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,.92)',
          border: '2.5px solid #1a1a1a',
          borderRadius: 12,
          padding: 16,
          boxShadow: '4px 4px 0 rgba(0,0,0,.3)',
          marginBottom: 20,
          transform: 'rotate(-0.5deg)',
          cursor: 'pointer',
          fontFamily: tokens.font.tc,
          textAlign: 'left',
          transition: 'transform .15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(-0.5deg) translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(-0.5deg)';
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              flex: 1,
              border: '2px dashed #8b7356',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              background: '#fffbea',
              color: tokens.muted,
              fontStyle: 'italic',
            }}
          >
            寫下你的教學許願…（點擊投入）
          </div>
          <div
            style={{
              background: tokens.accent,
              color: '#fff',
              border: '2px solid #1a1a1a',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'inherit',
              boxShadow: '2px 2px 0 #1a1a1a',
            }}
          >
            投入 ✨
          </div>
        </div>
      </button>

      <div className="bulletin-wish-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {SAMPLE_WISHES.map((w, i) => {
          const tilt = tilts[i % tilts.length];
          const isHover = hoverIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                position: 'relative',
                transform: isHover ? 'rotate(0deg) translateY(-8px)' : `rotate(${tilt}deg)`,
                transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)',
                paddingTop: 8,
                zIndex: isHover ? 5 : 'auto',
              }}
            >
              <div
                style={{
                  background: colors[i % colors.length],
                  padding: 14,
                  boxShadow: isHover
                    ? '0 3px 2px rgba(0,0,0,.06), 0 18px 30px -10px rgba(0,0,0,.28), 0 40px 60px -30px rgba(0,0,0,.22)'
                    : '0 2px 3px rgba(0,0,0,.12), 4px 4px 0 rgba(0,0,0,.2)',
                  minHeight: 100,
                  clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)',
                  transition: 'box-shadow .35s',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#1a1a1a',
                    fontFamily: tokens.font.tc,
                  }}
                >
                  「{w.text}」
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#4a3a20',
                    marginTop: 8,
                    fontStyle: 'italic',
                    fontFamily: tokens.font.tc,
                  }}
                >
                  — {w.name}
                </div>
              </div>
              <Pin color={tokens.pin[i % tokens.pin.length]} size={14} style={{ top: 1, right: 12 }} />
            </div>
          );
        })}
      </div>

      {open && (
        <Suspense fallback={null}>
          <WishingWellDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </div>
  );
}
