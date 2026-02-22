import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, Search, Compass, MousePointerClick, HelpCircle } from "lucide-react";

interface KeyboardShortcut {
    key: string;
    description: string;
    category?: string;
    icon?: React.ReactNode;
    color?: string;
}

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    const shortcuts: KeyboardShortcut[] = [
        { key: '/', description: '聚焦搜尋框', category: '搜尋', icon: <Search className="w-4 h-4" />, color: 'bg-blue-100/80 text-blue-700 border-blue-200' },
        { key: 'Esc', description: '清除搜尋 / 關閉對話框', category: '搜尋', icon: <Search className="w-4 h-4" />, color: 'bg-blue-100/80 text-blue-700 border-blue-200' },
        { key: '↑ / ↓', description: '導航工具卡片', category: '瀏覽', icon: <Compass className="w-4 h-4" />, color: 'bg-emerald-100/80 text-emerald-700 border-emerald-200' },
        { key: 'Enter', description: '開啟選中的工具', category: '瀏覽', icon: <Compass className="w-4 h-4" />, color: 'bg-emerald-100/80 text-emerald-700 border-emerald-200' },
        { key: 'F', description: '切換收藏當前工具', category: '操作', icon: <MousePointerClick className="w-4 h-4" />, color: 'bg-purple-100/80 text-purple-700 border-purple-200' },
        { key: '?', description: '顯示此快捷鍵說明', category: '幫助', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-amber-100/80 text-amber-700 border-amber-200' }
    ];

    // 按類別分組
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        const category = shortcut.category || '其他';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(shortcut);
        return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] w-[95vw] glass-panel text-slate-800 z-50 p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
                {/* Header Section with Gradient */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none"></div>
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-white/10 rounded-full blur-[60px]" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="flex items-center gap-4 text-3xl sm:text-4xl font-black tracking-tighter drop-shadow-lg">
                            <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 spring-bounce hover:rotate-6">
                                <Keyboard className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </div>
                            鍵盤快捷鍵
                        </DialogTitle>
                        <DialogDescription className="text-white/90 text-sm sm:text-lg mt-3 font-semibold leading-relaxed">
                            化身鍵盤達人，讓操作如絲般順滑 🚀
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content Section */}
                <div className="space-y-6 p-6 sm:p-8 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                    {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                        <div key={category} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-bold text-slate-600 bg-slate-200/60 px-3 py-1 rounded-full shadow-inner inline-flex items-center">
                                    {shortcuts[0].icon}
                                    <span className="ml-2">{category}區</span>
                                </h3>
                                <div className="h-px bg-slate-200/80 flex-1 ml-2"></div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-1">
                                {shortcuts.map(({ key, description, color }) => (
                                    <div
                                        key={key}
                                        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 hover-float bouncy-active ${color} bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl`}
                                    >
                                        <span className="text-sm sm:text-base font-bold text-slate-700">{description}</span>
                                        <kbd className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black bg-white text-slate-800 border-2 border-slate-200 rounded-xl shadow-[0_4px_0_0_rgba(148,163,184,0.3)] tracking-widest bouncy-active">
                                            {key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="p-6 sm:p-8 bg-white/50 backdrop-blur-md border-t border-slate-100 flex justify-end items-center rounded-b-3xl">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-indigo-600 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-500 text-white font-black px-10 py-6 text-lg rounded-2xl clay-button bouncy-active shadow-xl shadow-indigo-200"
                    >
                        知道了！🔥
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
