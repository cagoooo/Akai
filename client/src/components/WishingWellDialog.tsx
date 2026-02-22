import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Wand2, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitWish, type WishType } from "@/lib/wishingService";
import { motion, AnimatePresence } from "framer-motion";

interface WishingWellDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WishingWellDialog({ open, onOpenChange }: WishingWellDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [type, setType] = useState<WishType>("suggestion");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            toast({
                title: "請填寫內容",
                description: "許願內容不能為空哦！",
                variant: "destructive"
            });
            return;
        }

        if (type === "feedback" && rating === 0) {
            toast({
                title: "請給予評分",
                description: "使用回饋需要您的星等評價，幫助我們做得更好！",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitWish(user, {
                type,
                content,
                rating: type === "feedback" ? rating : undefined
            });

            if (result) {
                toast({
                    title: "✨ 許願成功！",
                    description: "阿凱老師已經收到您的心聲了，感謝您的回饋與建議！",
                    style: {
                        background: 'linear-gradient(to right, #4f46e5, #ec4899)',
                        color: 'white',
                        border: 'none',
                    }
                });
                // 重置表單
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
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-0 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                {/* 背景裝飾 */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                        <Wand2 className="w-6 h-6 text-indigo-500 animate-pulse" />
                        阿凱老師的許願池
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 text-base">
                        有想到的教學工具點子？還是想給我們一點鼓勵與建議呢？
                        歡迎留下您的心聲！
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
                    <div className="space-y-3">
                        <Label className="text-base font-semibold text-slate-700">您想傳達什麼樣的訊息呢？</Label>
                        <RadioGroup
                            value={type}
                            onValueChange={(val) => setType(val as WishType)}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                                <Label
                                    htmlFor="suggestion"
                                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-indigo-50 hover:border-indigo-200 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 peer-data-[state=checked]:text-indigo-600 transition-all cursor-pointer"
                                >
                                    <Wand2 className="mb-2 h-6 w-6" />
                                    <span className="font-semibold text-base">新工具許願</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="feedback" id="feedback" className="peer sr-only" />
                                <Label
                                    htmlFor="feedback"
                                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-pink-50 hover:border-pink-200 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-50 peer-data-[state=checked]:text-pink-600 transition-all cursor-pointer"
                                >
                                    <Star className="mb-2 h-6 w-6" />
                                    <span className="font-semibold text-base">使用回饋</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {type === "feedback" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="space-y-3 overflow-hidden"
                            >
                                <Label className="text-base font-semibold text-slate-700">給予本網站的整體評分：</Label>
                                <div className="flex items-center gap-1 bg-slate-50 p-3 rounded-xl w-fit">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                className={`w-8 h-8 ${(hoverRating || rating) >= star
                                                        ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                                        : "text-slate-300"
                                                    } transition-colors duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        <Label htmlFor="content" className="text-base font-semibold text-slate-700">
                            {type === "suggestion" ? "描述一下您心目中的夢幻教育工具吧 ✨" : "有什麼話想對阿凱老師說的呢 💬"}
                        </Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === "suggestion" ? "例如：我希望有一個可以快速...的工具..." : "我覺得這個網站..."}
                            className="resize-none min-h-[120px] rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 shadow-sm"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full text-base sm:w-auto h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    施放許願魔法中...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    送出願望
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// DialogFooter helper definition within the file itself since it was missed from imports
const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"
