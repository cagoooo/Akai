import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { submitWish, type WishType } from "@/lib/wishingService";
import { m as motion, AnimatePresence } from "framer-motion";
import { tokens } from "@/design/tokens";
import { Pin } from "@/components/primitives/Pin";
import { Tape } from "@/components/primitives/Tape";

interface WishingWellDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * 許願池對話框 — E2 公佈欄風格
 * - cork 紙張底 + 膠帶標題 + 便利貼選項 + 投入小紅盒送出鈕
 * - 保留 submitWish（Firestore + LINE Bot）、?wish=1 分享連結所有邏輯
 */
export function WishingWellDialog({ open, onOpenChange }: WishingWellDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [type, setType] = useState<WishType>("suggestion");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?wish=1`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        toast({
            title: "已複製連結 🔗",
            description: "許願池專屬連結已複製到剪貼簿，可以分享給其他人囉！",
        });
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            toast({
                title: "請填寫內容",
                description: "便利貼還是空的喔！",
                variant: "destructive",
            });
            return;
        }
        if (type === "feedback" && rating === 0) {
            toast({
                title: "請給予評分",
                description: "使用回饋需要您的星等評價，幫助我們做得更好！",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitWish(user, {
                type,
                content,
                rating: type === "feedback" ? rating : undefined,
            });
            if (result) {
                toast({
                    title: "✨ 許願成功！",
                    description: "阿凱老師已經收到您的心聲了，感謝您的回饋與建議！",
                });
                setContent("");
                setRating(0);
                setType("suggestion");
                onOpenChange(false);
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            toast({
                title: "許願失敗",
                description: "哎呀，魔法陣似乎出了點問題，請稍後再試。",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 根據類型切換便利貼色（許願黃 / 回饋粉）
    const paperBg = type === "suggestion" ? tokens.note.yellowBright : tokens.note.pink;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="wish-dialog-cork"
                style={{
                    maxWidth: 560,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    boxShadow: "none",
                    overflow: "visible",
                    fontFamily: tokens.font.tc,
                }}
            >
                {/* 便利貼容器 */}
                <div
                    style={{
                        position: "relative",
                        background: paperBg,
                        padding: "28px 26px 24px",
                        borderRadius: 4,
                        boxShadow:
                            "0 4px 8px rgba(0,0,0,.15), 6px 6px 0 rgba(0,0,0,.22), 0 22px 40px -10px rgba(0,0,0,.3)",
                        border: "1px solid rgba(0,0,0,.08)",
                        transition: "background .3s ease",
                    }}
                >
                    <Pin color={tokens.red} size={22} style={{ top: -11, left: "50%", marginLeft: -11, zIndex: 10 }} />

                    {/* 頂部：標題膠帶 + 分享連結 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <Tape color={tokens.note.blue} angle={-2} width={220}>
                            <span style={{ fontSize: 14 }}>🪄 阿凱老師的許願池</span>
                        </Tape>

                        <button
                            type="button"
                            onClick={handleCopyLink}
                            title="複製許願池專屬連結"
                            aria-label="複製許願池專屬連結"
                            style={{
                                background: "#fff",
                                color: tokens.ink,
                                border: "2px solid #1a1a1a",
                                padding: "5px 12px",
                                borderRadius: 999,
                                fontSize: 11.5,
                                fontWeight: 800,
                                cursor: "pointer",
                                fontFamily: tokens.font.tc,
                                boxShadow: "2px 2px 0 rgba(0,0,0,.3)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            {linkCopied ? "✅ 已複製" : "🔗 分享連結"}
                        </button>
                    </div>

                    <p
                        style={{
                            margin: "0 0 20px",
                            fontSize: 14,
                            color: tokens.muted2,
                            lineHeight: 1.65,
                        }}
                    >
                        有想到的教學工具點子？還是想給我們一點鼓勵與建議呢？歡迎留下您的心聲！
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* 類型選擇：雙張便利貼 */}
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: tokens.ink,
                                marginBottom: 10,
                                letterSpacing: "0.05em",
                            }}
                        >
                            📌 您想傳達什麼樣的訊息呢？
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                marginBottom: 20,
                            }}
                        >
                            <TypeNote
                                selected={type === "suggestion"}
                                onClick={() => setType("suggestion")}
                                emoji="✨"
                                label="新工具許願"
                                bg={tokens.note.yellow}
                                activeBg={tokens.accent}
                                tilt={-1.5}
                            />
                            <TypeNote
                                selected={type === "feedback"}
                                onClick={() => setType("feedback")}
                                emoji="⭐"
                                label="使用回饋"
                                bg={tokens.note.pink}
                                activeBg={tokens.red}
                                tilt={1.8}
                            />
                        </div>

                        {/* 評分（只在 feedback 顯示） */}
                        <AnimatePresence mode="popLayout">
                            {type === "feedback" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    style={{ overflow: "hidden", marginBottom: 20 }}
                                >
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,.6)",
                                            border: "2px dashed rgba(74,58,32,.4)",
                                            borderRadius: 10,
                                            padding: "12px 16px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: tokens.ink,
                                                marginBottom: 8,
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            🌟 給予本網站的整體評分：
                                        </div>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const filled = (hoverRating || rating) >= star;
                                                return (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(star)}
                                                        aria-label={`${star} 顆星`}
                                                        style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            padding: 2,
                                                            fontSize: 30,
                                                            cursor: "pointer",
                                                            transition: "transform .15s ease",
                                                            filter: filled ? "none" : "grayscale(1) opacity(.35)",
                                                            transform: filled ? "scale(1.08)" : "scale(1)",
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        ⭐
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 內容輸入 */}
                        <div style={{ marginBottom: 20 }}>
                            <label
                                htmlFor="wish-content"
                                style={{
                                    display: "block",
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: tokens.ink,
                                    marginBottom: 8,
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {type === "suggestion" ? "✍️ 描述一下您心目中的夢幻教育工具吧" : "💬 有什麼話想對阿凱老師說呢"}
                            </label>
                            <textarea
                                id="wish-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={
                                    type === "suggestion"
                                        ? "例如：我希望有一個可以快速產生學習單的工具..."
                                        : "我覺得這個網站..."
                                }
                                rows={5}
                                style={{
                                    width: "100%",
                                    background: "#fffbea",
                                    border: "2px dashed #8b7356",
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    fontFamily: tokens.font.tc,
                                    color: tokens.ink,
                                    resize: "vertical",
                                    minHeight: 110,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = tokens.accent;
                                    e.currentTarget.style.background = "#fff";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "#8b7356";
                                    e.currentTarget.style.background = "#fffbea";
                                }}
                            />
                        </div>

                        {/* 送出按鈕 */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: isSubmitting ? tokens.muted : tokens.accent,
                                    color: "#fff",
                                    border: "2.5px solid #1a1a1a",
                                    padding: "12px 26px",
                                    borderRadius: 10,
                                    fontSize: 15,
                                    fontWeight: 900,
                                    cursor: isSubmitting ? "wait" : "pointer",
                                    fontFamily: tokens.font.tc,
                                    boxShadow: "4px 4px 0 rgba(0,0,0,.4)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    transition: "transform .15s ease, box-shadow .15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (isSubmitting) return;
                                    const el = e.currentTarget as HTMLButtonElement;
                                    el.style.transform = "translate(-2px,-2px)";
                                    el.style.boxShadow = "6px 6px 0 rgba(0,0,0,.4)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLButtonElement;
                                    el.style.transform = "";
                                    el.style.boxShadow = "4px 4px 0 rgba(0,0,0,.4)";
                                }}
                            >
                                {isSubmitting ? (
                                    <>⏳ 投入願望中…</>
                                ) : (
                                    <>📮 投入許願池</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── 類型選擇便利貼 ────────────────────────────────
interface TypeNoteProps {
    selected: boolean;
    onClick: () => void;
    emoji: string;
    label: string;
    bg: string;
    activeBg: string;
    tilt: number;
}

function TypeNote({ selected, onClick, emoji, label, bg, activeBg, tilt }: TypeNoteProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            style={{
                position: "relative",
                background: selected ? activeBg : bg,
                color: selected ? "#fff" : tokens.ink,
                border: `2.5px solid ${selected ? "#1a1a1a" : "rgba(0,0,0,.3)"}`,
                borderRadius: 8,
                padding: "18px 12px 16px",
                cursor: "pointer",
                fontFamily: tokens.font.tc,
                boxShadow: selected
                    ? "4px 4px 0 rgba(0,0,0,.35)"
                    : "2px 2px 0 rgba(0,0,0,.18)",
                transform: selected ? `rotate(${tilt}deg) translateY(-2px)` : `rotate(${tilt}deg)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                transition: "transform .2s ease, background .25s ease, box-shadow .2s ease",
            }}
        >
            <div style={{ fontSize: 32, lineHeight: 1 }}>{emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.04em" }}>{label}</div>
            {selected && (
                <div
                    style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        fontSize: 16,
                    }}
                >
                    ✓
                </div>
            )}
        </button>
    );
}
