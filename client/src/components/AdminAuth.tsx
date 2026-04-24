/**
 * AdminAuth — 管理員驗證元件（E2 cork 公佈欄風格）
 *
 * 功能：
 * - 使用 Firebase Custom Claims 驗證管理員權限
 * - 整合 Google 登入
 * - 採 cork + 便利貼 + 圖釘視覺語彙與主站一致
 */

import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { tokens } from "@/design/tokens";
import { Pin } from "@/components/primitives/Pin";
import { Tape } from "@/components/primitives/Tape";

export function AdminAuth() {
    const { user, isAdmin, loading, signIn, logout } = useAuth();
    const [, setLocation] = useLocation();

    const handleLogin = async () => {
        try { await signIn(); } catch (error) { console.error("登入失敗", error); }
    };

    const handleLogout = async () => {
        await logout();
        setLocation("/");
    };

    // ── 載入中 ───────────────────────────────────
    if (loading) {
        return <CorkShell centered><LoadingCard /></CorkShell>;
    }

    // ── 情境 1：已登入且是管理員 → 儀表板 ────────
    if (user && isAdmin) {
        return (
            <div style={{ position: 'relative' }}>
                {/* 頂部右側 cork 風管理員資訊 + 登出 */}
                <div
                    style={{
                        position: 'fixed',
                        top: 30,
                        right: 16,
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                    }}
                >
                    <div
                        style={{
                            background: tokens.note.blue,
                            border: '2.5px solid #1a1a1a',
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 13,
                            fontWeight: 800,
                            color: tokens.ink,
                            boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
                            fontFamily: tokens.font.tc,
                            transform: 'rotate(-1deg)',
                        }}
                    >
                        👤 {user.displayName || user.email}
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            background: tokens.paper,
                            color: tokens.red,
                            border: `2.5px solid ${tokens.red}`,
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontFamily: tokens.font.tc,
                            boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'transform .15s ease, box-shadow .15s ease',
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.transform = 'translate(-2px,-2px)';
                            el.style.boxShadow = '4px 4px 0 rgba(0,0,0,.3)';
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.transform = '';
                            el.style.boxShadow = '2px 2px 0 rgba(0,0,0,.25)';
                        }}
                    >
                        🚪 登出
                    </button>
                </div>
                <AnalyticsDashboard />
            </div>
        );
    }

    // ── 情境 2：已登入但非管理員 → 無權限便利貼 ───
    if (user && !isAdmin) {
        return (
            <CorkShell centered>
                <div
                    className="sticker-card"
                    style={{
                        position: 'relative',
                        background: tokens.note.pink,
                        padding: '36px 32px 28px',
                        borderRadius: 4,
                        border: '2.5px solid #1a1a1a',
                        boxShadow: '6px 6px 0 rgba(0,0,0,.28), 0 22px 40px -8px rgba(0,0,0,.3)',
                        maxWidth: 460,
                        width: '100%',
                        fontFamily: tokens.font.tc,
                        transform: 'rotate(-1.5deg)',
                    }}
                >
                    <Pin color={tokens.pin[0]} size={22} style={{ top: -11, left: '50%', marginLeft: -11, zIndex: 10 }} />

                    <div style={{ textAlign: 'center', marginBottom: 18 }}>
                        <div style={{ fontSize: 56, marginBottom: 8 }}>🚫</div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: tokens.red, margin: 0, letterSpacing: '0.02em' }}>
                            無存取權限
                        </h1>
                    </div>

                    <div
                        style={{
                            background: 'rgba(255,255,255,.7)',
                            padding: '14px 16px',
                            borderLeft: `4px solid ${tokens.red}`,
                            marginBottom: 20,
                            fontSize: 14,
                            color: tokens.ink,
                            lineHeight: 1.65,
                        }}
                    >
                        抱歉，您的帳號 <strong>{user.email}</strong> 沒有管理員權限。
                        如需取得存取權，請聯絡阿凱老師。
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{
                                background: tokens.paper,
                                color: tokens.red,
                                border: `2.5px solid ${tokens.red}`,
                                padding: '10px 18px',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: '3px 3px 0 rgba(0,0,0,.25)',
                            }}
                        >
                            🔄 登出並切換帳號
                        </button>
                        <Link href="/">
                            <a
                                style={{
                                    textAlign: 'center',
                                    fontSize: 13,
                                    color: tokens.muted2,
                                    textDecoration: 'underline',
                                    fontFamily: 'inherit',
                                }}
                            >
                                ← 返回公佈欄首頁
                            </a>
                        </Link>
                    </div>
                </div>
            </CorkShell>
        );
    }

    // ── 情境 3：未登入 → 登入便利貼 ──────────────
    return (
        <CorkShell centered>
            <div
                className="sticker-card"
                style={{
                    position: 'relative',
                    background: tokens.note.yellow,
                    padding: '36px 32px 28px',
                    borderRadius: 4,
                    border: '2.5px solid #1a1a1a',
                    boxShadow: '6px 6px 0 rgba(0,0,0,.28), 0 22px 40px -8px rgba(0,0,0,.3)',
                    maxWidth: 460,
                    width: '100%',
                    fontFamily: tokens.font.tc,
                    transform: 'rotate(-1.5deg)',
                }}
            >
                <Pin color={tokens.red} size={22} style={{ top: -11, left: '50%', marginLeft: -11, zIndex: 10 }} />

                {/* 右上小膠帶：管理員專區 */}
                <div style={{ position: 'absolute', top: 10, right: -16 }}>
                    <Tape color={tokens.note.blue} angle={12} width={120}>
                        <span style={{ fontSize: 11 }}>🔒 ADMIN</span>
                    </Tape>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            margin: '0 auto 12px',
                            borderRadius: '50%',
                            background: tokens.navy,
                            border: '3px solid #1a1a1a',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '4px 4px 0 rgba(0,0,0,.3)',
                            fontSize: 36,
                        }}
                    >
                        🔑
                    </div>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 900,
                            color: tokens.ink,
                            margin: 0,
                            letterSpacing: '0.02em',
                        }}
                    >
                        <span
                            style={{
                                background: `linear-gradient(transparent 55%, ${tokens.olive} 55%, ${tokens.olive} 88%, transparent 88%)`,
                                padding: '0 6px',
                            }}
                        >
                            管理員登入
                        </span>
                    </h1>
                    <p
                        style={{
                            fontSize: 13.5,
                            color: tokens.muted2,
                            margin: '12px 0 0',
                            lineHeight: 1.6,
                        }}
                    >
                        請使用 Google 帳號登入以驗證身份
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    <button
                        type="button"
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            background: tokens.paper,
                            color: tokens.ink,
                            border: '2.5px solid #1a1a1a',
                            padding: '12px 18px',
                            borderRadius: 10,
                            fontSize: 15,
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontFamily: tokens.font.tc,
                            boxShadow: '3px 3px 0 rgba(0,0,0,.28)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            transition: 'transform .15s ease, box-shadow .15s ease',
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.transform = 'translate(-2px,-2px)';
                            el.style.boxShadow = '5px 5px 0 rgba(0,0,0,.32)';
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.transform = '';
                            el.style.boxShadow = '3px 3px 0 rgba(0,0,0,.28)';
                        }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            style={{ width: 22, height: 22 }}
                        />
                        使用 Google 登入
                    </button>
                </div>

                <div style={{ marginTop: 22, textAlign: 'center', paddingTop: 16, borderTop: '1px dashed rgba(74,58,32,.35)' }}>
                    <Link href="/">
                        <a
                            style={{
                                fontSize: 13,
                                color: tokens.muted2,
                                textDecoration: 'none',
                                fontFamily: tokens.font.tc,
                                fontWeight: 600,
                                borderBottom: `1px solid ${tokens.olive}`,
                                paddingBottom: 1,
                            }}
                        >
                            ← 返回公佈欄首頁
                        </a>
                    </Link>
                </div>
            </div>
        </CorkShell>
    );
}

// ── 小工具：cork 背景 shell（木框 + 軟木塞） ──────
function CorkShell({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
    return (
        <div
            className="cork-bg"
            style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                paddingTop: 18,
                paddingBottom: 18,
                fontFamily: tokens.font.tc,
                display: centered ? 'flex' : 'block',
                alignItems: centered ? 'center' : undefined,
                justifyContent: centered ? 'center' : undefined,
                padding: centered ? '50px 20px' : undefined,
            }}
        >
            {/* 上下木條 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, height: 18, zIndex: 20, pointerEvents: 'none',
                    background: 'repeating-linear-gradient(90deg, #7c4f2a, #7c4f2a 40px, #6b4220 40px, #6b4220 42px, #8a5a32 42px, #8a5a32 90px, #6b4220 90px, #6b4220 92px)',
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.3), 0 2px 6px rgba(0,0,0,.2)',
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    bottom: 0, left: 0, right: 0, height: 18, zIndex: 20, pointerEvents: 'none',
                    background: 'repeating-linear-gradient(90deg, #7c4f2a, #7c4f2a 40px, #6b4220 40px, #6b4220 42px, #8a5a32 42px, #8a5a32 90px, #6b4220 90px, #6b4220 92px)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,.3), 0 -2px 6px rgba(0,0,0,.2)',
                }}
            />
            {children}
        </div>
    );
}

// ── 載入中卡片 ──────────────────────────────────
function LoadingCard() {
    return (
        <div
            style={{
                background: tokens.note.yellow,
                border: '2.5px solid #1a1a1a',
                borderRadius: 4,
                padding: '30px 40px',
                boxShadow: '4px 4px 0 rgba(0,0,0,.25)',
                textAlign: 'center',
                fontFamily: tokens.font.tc,
                position: 'relative',
                transform: 'rotate(-2deg)',
            }}
        >
            <Pin color={tokens.red} size={20} style={{ top: -10, left: '50%', marginLeft: -10 }} />
            <div style={{ fontSize: 36, marginBottom: 10, animation: 'spin 1.5s linear infinite' }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: tokens.ink, marginBottom: 4 }}>
                正在驗證權限…
            </div>
            <div style={{ fontSize: 12, color: tokens.muted2 }}>
                請稍候，正在確認管理員身份
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
