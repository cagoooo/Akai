import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

const trivia = [
  {
    fact: "每個人的學習方式都是獨特的！研究顯示，有至少 7 種不同的學習風格。",
    icon: "🧠"
  },
  {
    fact: "短暫休息可以提升學習效率！每 25 分鐘學習後休息 5 分鐘，是最佳的學習節奏。",
    icon: "⏰"
  },
  {
    fact: "運用多感官學習可以提高記憶力！結合視覺、聽覺和動作學習，能增加 90% 的記憶保留率。",
    icon: "👀"
  }
];

export function TriviaDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 檢查使用者是否是第一次訪問
    const hasSeenTrivia = localStorage.getItem('hasSeenTrivia');
    if (!hasSeenTrivia) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    // 記錄使用者已經看過提示
    localStorage.setItem('hasSeenTrivia', 'true');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>你知道嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                {trivia.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-sm">{item.fact}</p>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleDismiss}>
              知道了！
            </Button>
          </div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}