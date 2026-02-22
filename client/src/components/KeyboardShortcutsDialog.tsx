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
            <DialogContent className="sm:max-w-[550px] w-[95vw] bg-white text-slate-800 z-50 p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                {/* Header Section with Gradient */}
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-black drop-shadow-md">
                            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/30">
                                <Keyboard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            鍵盤快捷鍵
                        </DialogTitle>
                        <DialogDescription className="text-white/90 text-sm sm:text-base mt-2 font-medium">
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
                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${color} bg-white`}
                                    >
                                        <span className="text-sm sm:text-base font-medium">{description}</span>
                                        <kbd className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-white text-slate-700 border border-slate-200 rounded-lg shadow-[0_3px_0_0_rgba(148,163,184,0.4)]  tracking-wider">
                                            {key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex justify-end items-center rounded-b-2xl shadow-[inset_0_5px_10px_-10px_rgba(0,0,0,0.1)]">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow-[0_4px_0_0_rgba(67,56,202,1)] hover:shadow-[0_2px_0_0_rgba(67,56,202,1)] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
                    >
                        知道了！🔥
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
