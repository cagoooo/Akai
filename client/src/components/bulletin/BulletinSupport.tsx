import { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { notifyEngagementAfterHomeEntry, trackEvent } from '@/lib/analytics';
import { useScrollMoving } from './useScrollMoving';

/** 阿凱老師的 BobaMe 贊助頁（AnyoneLab 平台，新台幣、可匯回台灣銀行帳戶） */
export const SUPPORT_URL = 'https://cagoo.bobaboba.me';

export type SupportSource = 'floating' | 'footer';

/**
 * 「請阿凱老師喝杯珍奶」說明窗
 *
 * 設計原則（2026-11-23 規劃）：
 * - 點入口先看說明、再自己決定要不要前往 BobaMe，不直接跳付款頁
 * - 寫清楚：工具永久免費、錢用在哪、純屬心意沒有交換條件
 * - 學生不用贊助；不放學校名稱與校徽（贊助是阿凱老師個人名義）
 * - 視覺沿用教室公佈欄：便利貼 + 膠帶 + 圖釘 + ink 厚邊
 */
export function SupportDialog({
  open,
  onOpenChange,
  source,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: SupportSource;
  /** 關閉後要把鍵盤焦點還給哪顆按鈕（打開說明窗的那顆） */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(40, 26, 10, .55)',
            zIndex: 60,
          }}
        />
        <DialogPrimitive.Content
          className="bulletin-support-dialog"
          onCloseAutoFocus={(event) => {
            if (!returnFocusRef?.current) return;
            event.preventDefault();
            returnFocusRef.current.focus({ preventScroll: true });
          }}
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(-0.6deg)',
            width: 'min(460px, calc(100vw - 32px))',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
            background: tokens.note.yellowSoft,
            border: `2.5px solid ${tokens.ink}`,
            borderRadius: 6,
            boxShadow: '6px 6px 0 rgba(0,0,0,.35), 0 20px 40px -10px rgba(0,0,0,.4)',
            padding: '34px 26px 24px',
            zIndex: 61,
            fontFamily: tokens.font.tc,
            color: tokens.ink,
          }}
        >
          <Pin color={tokens.red} size={16} style={{ top: -8, left: '50%', marginLeft: -8, zIndex: 2 }} />

          <DialogPrimitive.Close
            aria-label="關閉"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `2px solid ${tokens.ink}`,
              background: tokens.paper,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
              padding: 0,
              color: tokens.ink,
            }}
          >
            ×
          </DialogPrimitive.Close>

          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div aria-hidden="true" style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>🧋</div>
            <DialogPrimitive.Title
              style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: '0.02em' }}
            >
              請阿凱老師喝杯珍奶
            </DialogPrimitive.Title>
          </div>

          {/* 用 Radix 的 Description 標記說明區塊：自己寫 aria-describedby 會被 Radix 判定「缺 Description」而 console.warn（Sentry JAVASCRIPT-REACT-3C） */}
          <DialogPrimitive.Description asChild>
          <div style={{ fontSize: 15, lineHeight: 1.75 }}>
            <p style={{ margin: '0 0 12px' }}>
              這裡的每個工具都<strong style={{ background: `linear-gradient(transparent 60%, ${tokens.note.yellowBright} 60%)` }}>免費使用，以後也會一直免費</strong>。
              如果某個工具幫你省下了時間，歡迎請阿凱老師喝杯珍奶 😊
            </p>

            <div
              style={{
                background: tokens.paper,
                border: `2px dashed ${tokens.muted}`,
                borderRadius: 6,
                padding: '12px 14px',
                margin: '0 0 12px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: tokens.muted2, marginBottom: 6 }}>
                💡 珍奶錢會用在
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
                <li>AI 功能呼叫模型的費用</li>
                <li>雲端主機、資料庫等網站營運費用</li>
                <li>持續開發新的免費教學工具</li>
              </ul>
            </div>

            <p style={{ margin: '0 0 6px', fontSize: 13, color: tokens.muted2 }}>
              贊助純屬個人心意，沒有任何交換條件；不贊助也能使用全部功能。
            </p>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: tokens.muted2 }}>
              🎒 同學們不用贊助喔，把工具用好、學得開心就是最好的支持！
            </p>
          </div>
          </DialogPrimitive.Description>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('support_click', { source });
              void notifyEngagementAfterHomeEntry({ type: 'support_click', stage: 'go_bobame', source });
            }}
            className="bulletin-support-cta"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 52,
              padding: '12px 18px',
              background: `linear-gradient(180deg, ${tokens.note.yellowBright}, ${tokens.accent})`,
              border: `2.5px solid ${tokens.ink}`,
              borderRadius: 10,
              boxShadow: '4px 4px 0 rgba(0,0,0,.35)',
              color: tokens.ink,
              fontSize: 16,
              fontWeight: 900,
              textDecoration: 'none',
              transform: 'rotate(-0.8deg)',
              transition: 'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s',
            }}
          >
            🧋 前往 BobaMe 請喝珍奶 ↗
          </a>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Tape color={tokens.note.pink} angle={1.5} width={250}>
              <span style={{ fontSize: 12 }}>BobaMe 平台・信用卡付款・一杯 NT$100 起</span>
            </Tape>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * 右下角浮動「珍奶」小按鈕：疊在「回到頂部」上方，捲動超過 500px 才出現（首屏不打擾）。
 */
export function BulletinSupportButton() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const moving = useScrollMoving();
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openDialog = () => {
    setOpen(true);
    trackEvent('support_open', { source: 'floating' });
    void notifyEngagementAfterHomeEntry({ type: 'support_click', stage: 'open', source: 'floating' });
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        data-moving={moving ? '1' : undefined}
        onClick={openDialog}
        aria-label="請阿凱老師喝杯珍奶（贊助說明）"
        title="請阿凱老師喝杯珍奶"
        className="bulletin-support-fab"
        tabIndex={visible ? 0 : -1}
        aria-hidden={visible ? undefined : true}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 98,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: tokens.note.yellowBright,
          border: `2.5px solid ${tokens.ink}`,
          cursor: 'pointer',
          boxShadow: '3px 3px 0 rgba(0,0,0,.35), 0 10px 20px -4px rgba(0,0,0,.25)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 30,
          fontSize: 26,
          lineHeight: 1,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transform: visible ? 'translateY(0) rotate(5deg)' : 'translateY(20px) rotate(5deg)',
          transition: 'opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .2s',
          padding: 0,
        }}
      >
        <span aria-hidden="true">🧋</span>
      </button>
      <SupportDialog open={open} onOpenChange={setOpen} source="floating" returnFocusRef={fabRef} />
    </>
  );
}

/**
 * 頁尾第四張便利貼「SUPPORT」：點了打開同一個說明窗。
 */
export function FooterSupportNote({ noteStyle }: { noteStyle: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const noteRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={noteRef}
        type="button"
        className="sticker-card"
        onClick={() => {
          setOpen(true);
          trackEvent('support_open', { source: 'footer' });
          void notifyEngagementAfterHomeEntry({ type: 'support_click', stage: 'open', source: 'footer' });
        }}
        aria-label="請阿凱老師喝杯珍奶（贊助說明）"
        style={{
          ...noteStyle,
          border: 'none',
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        <Pin color={tokens.pin[3]} size={14} style={{ top: -7, left: '50%', marginLeft: -7 }} />
        <div style={{ fontSize: 12, color: tokens.muted2, marginBottom: 8, letterSpacing: '0.1em' }}>
          🧋 SUPPORT
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: tokens.ink, lineHeight: 1.3 }}>
          請阿凱老師喝杯珍奶
        </div>
        <div style={{ fontSize: 11, color: tokens.navy, marginTop: 4, textDecoration: 'underline' }}>
          工具永久免費・自由贊助 →
        </div>
      </button>
      <SupportDialog open={open} onOpenChange={setOpen} source="footer" returnFocusRef={noteRef} />
    </>
  );
}
