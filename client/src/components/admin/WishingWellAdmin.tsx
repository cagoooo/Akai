import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, CheckCircle2, MessageSquare, Lightbulb, Clock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWishes, updateWishStatus, deleteWish, type Wish } from "@/lib/wishingService";

export function WishingWellAdmin() {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchWishes = async () => {
        setLoading(true);
        try {
            const data = await getWishes();
            setWishes(data);
        } catch (error) {
            toast({
                title: "讀取失敗",
                description: "無法取得許願池資料",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishes();
    }, []);

    const handleStatusChange = async (id: string, currentStatus: string) => {
        if (currentStatus === "processed") return;
        try {
            await updateWishStatus(id, "processed");
            setWishes(wishes.map(w => w.id === id ? { ...w, status: "processed" } : w));
            toast({
                title: "狀態已更新",
                description: "許願已標記為處理完成",
            });
        } catch (error) {
            toast({
                title: "更新失敗",
                description: "無法更新許願狀態",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("確定要刪除這筆許願記錄嗎？此動作無法復原。")) return;

        try {
            await deleteWish(id);
            setWishes(wishes.filter(w => w.id !== id));
            toast({
                title: "刪除成功",
                description: "已移除該筆許願紀錄",
            });
        } catch (error) {
            toast({
                title: "刪除失敗",
                description: "無法刪除許願記錄",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (wishes.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-700">目前還沒有人許願</p>
                    <p className="text-sm">等待老師們提供更多寶貴的建議！</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishes.map((wish) => (
                    <Card key={wish.id} className={`flex flex-col overflow-hidden transition-all ${wish.status === 'processed' ? 'bg-slate-50/50 border-slate-200 opacity-80' : 'bg-white border-indigo-100 shadow-sm hover:shadow-md'}`}>
                        <CardHeader className="pb-3 px-4 pt-4 relative">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2">
                                    {wish.type === 'suggestion' ? (
                                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                            <Lightbulb className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            {wish.type === 'suggestion' ? '新工具許願' : '使用回饋'}
                                            <Badge variant={wish.status === 'pending' ? 'default' : 'secondary'} className={wish.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}>
                                                {wish.status === 'pending' ? '待處理' : '已處理'}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {wish.createdAt?.toDate().toLocaleString() || '未知時間'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 flex-1 flex flex-col">
                            <div className="flex-1 space-y-3">
                                {wish.type === 'feedback' && wish.rating && (
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < wish.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                                    {wish.content}
                                </div>

                                <div className="flex items-center gap-2 mt-auto pt-3 text-xs text-slate-500 border-t border-slate-100">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">{wish.userName || '訪客'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                                {wish.status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                        onClick={() => handleStatusChange(wish.id, wish.status)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        標記處理
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(wish.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    刪除
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
