import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface KeyboardShortcut {
    key: string;
    description: string;
    category?: string;
}

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    const shortcuts: KeyboardShortcut[] = [
        { key: '/', description: '聚焦搜尋框', category: '搜尋' },
        { key: 'Esc', description: '清除搜尋 / 關閉對話框', category: '搜尋' },
        { key: '↑ / ↓', description: '導航工具卡片', category: '瀏覽' },
        { key: 'Enter', description: '開啟選中的工具', category: '瀏覽' },
        { key: 'F', description: '切換收藏當前工具', category: '操作' },
        { key: '?', description: '顯示此快捷鍵說明', category: '幫助' }
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        鍵盤快捷鍵
                    </DialogTitle>
                    <DialogDescription>
                        使用鍵盤快捷鍵提升操作效率
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                        <div key={category}>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {shortcuts.map(({ key, description }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">{description}</span>
                                        <kbd className="px-3 py-1.5 text-xs font-semibold bg-muted border border-border rounded shadow-sm">
                                            {key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => onOpenChange(false)}>
                        關閉
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
