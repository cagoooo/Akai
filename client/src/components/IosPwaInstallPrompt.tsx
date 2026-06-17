/**
 * IosPwaInstallPrompt — iOS Safari「加到主畫面」引導 toast
 *
 * iOS 不支援 beforeinstallprompt（Android Chrome 才有），加到桌面要點分享 → 加到主畫面
 * 是隱藏功能，老師多半不知道。這個元件主動提示。
 *
 * 觸發條件（全部符合才顯示）：
 *   1. 使用者是 iOS Safari（不是 Chrome / Firefox iOS — 它們不支援加桌面）
 *   2. 站不是已經以 standalone 模式跑（沒安裝過）
 *   3. 使用者**第二次**訪問（避免第一次就煩使用者）
 *   4. 一週內沒提示過（避免每次都跳）
 *
 * 設計：cork 風藍色便利貼從畫面底部滑入，附「不再提示」「教學」「關閉」三按鈕
 */

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

const VISIT_KEY = 'akai-visit-count';
const DISMISS_KEY = 'akai-ios-pwa-prompt-dismissed-at';
const DISMISS_DAYS = 14;

function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  // Safari on iOS（不是 Chrome / Firefox / Line / FB in-app）
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Line|FBAN|FBAV|Instagram/.test(ua);
  return isIos && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari 用 navigator.standalone（非標準但 iOS 專用）
  return (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
}

function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function bumpVisitCount() {
  try {
    const next = getVisitCount() + 1;
    localStorage.setItem(VISIT_KEY, String(next));
  } catch { /* ignore */ }
}

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const diff = Date.now() - parseInt(ts, 10);
    return diff < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch { /* ignore */ }
}

export function IosPwaInstallPrompt() {
  const [show, setShow] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    bumpVisitCount();
    if (!isIosSafari() || isStandalone() || wasDismissedRecently() || getVisitCount() < 2) return;
    // 延遲 4 秒再跳，給使用者先看內容
    const handle = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(handle);
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    markDismissed();
    setShow(false);
  };

  return (
    <>
      <div
        role="dialog"
        aria-label="加到主畫面提示"
        style={{
          position: 'fixed',
          left: 12,
          right: 12,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          zIndex: 9999,
          background: tokens.note.blue,
          border: `2.5px solid ${tokens.ink}`,
          borderRadius: 12,
          padding: '14px 16px',
          boxShadow: '0 10px 26px -6px rgba(0,0,0,.32), 5px 6px 0 rgba(0,0,0,.22)',
          fontFamily: tokens.font.tc,
          animation: 'akai-slide-up 0.32s cubic-bezier(.4,1.4,.6,1)',
          maxWidth: 540,
          margin: '0 auto',
        }}
      >
        <Pin color="#2563eb" size={16} style={{ top: -8, left: 24, marginLeft: 0 }} />
        <Pin color="#2563eb" size={16} style={{ top: -8, right: 24 }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28, lineHeight: 1, flex: 'none' }}>📱</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 14, color: tokens.ink, display: 'block', marginBottom: 2 }}>
              加到主畫面，下次秒開
            </strong>
            <p style={{ fontSize: 12, color: tokens.muted2, margin: 0, lineHeight: 1.5 }}>
              點 Safari 下方 <strong>分享 ⬆️</strong> → 找「加到主畫面」→ 變 App 一樣
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button
            type="button"
            onClick={() => setShowHowTo(true)}
            style={{
              flex: 1,
              padding: '7px 10px',
              fontSize: 12,
              fontWeight: 800,
              color: '#fff',
              background: tokens.accent,
              border: `2px solid ${tokens.ink}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: tokens.font.tc,
              boxShadow: '2px 2px 0 rgba(0,0,0,.22)',
            }}
          >
            👀 看圖示教學
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: '7px 10px',
              fontSize: 12,
              fontWeight: 700,
              color: tokens.muted2,
              background: '#fff',
              border: `2px solid ${tokens.ink}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: tokens.font.tc,
              boxShadow: '2px 2px 0 rgba(0,0,0,.14)',
            }}
          >
            稍後再說
          </button>
        </div>
      </div>

      {/* HowTo 教學 overlay */}
      {showHowTo && (
        <div
          onClick={() => setShowHowTo(false)}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            fontFamily: tokens.font.tc,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: tokens.paper,
              border: `2.5px solid ${tokens.ink}`,
              borderRadius: 12,
              padding: '20px 22px',
              maxWidth: 380,
              width: '100%',
              boxShadow: '5px 6px 0 rgba(0,0,0,.28)',
              transform: 'rotate(-0.5deg)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: tokens.ink, margin: '0 0 12px' }}>
              📱 三步加到主畫面（30 秒）
            </h3>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: tokens.muted2, lineHeight: 1.7 }}>
              <li>點 Safari 下方中間的 <strong>分享按鈕</strong>（⬆️ 一個方框配箭頭）</li>
              <li>往下滑找 <strong>「加到主畫面」</strong> 選項</li>
              <li>點右上「<strong>加入</strong>」→ 主畫面多一顆「<strong>科技教育創新專區</strong>」App icon</li>
            </ol>
            <p style={{ fontSize: 12, color: tokens.muted2, marginTop: 14, fontStyle: 'italic' }}>
              💡 之後從主畫面打開就是全螢幕 App，**不會有 Safari 網址列**佔空間。
            </p>
            <button
              type="button"
              onClick={() => { setShowHowTo(false); handleDismiss(); }}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 800,
                color: '#fff',
                background: tokens.accent,
                border: `2px solid ${tokens.ink}`,
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: tokens.font.tc,
                boxShadow: '3px 3px 0 rgba(0,0,0,.22)',
              }}
            >
              知道了，去試試 ✨
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes akai-slide-up {
          from { transform: translateY(120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
