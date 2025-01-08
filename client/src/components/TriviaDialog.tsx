import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  },
  {
    fact: "肢體動作能促進腦部發展！研究發現，運動可以增加腦部的神經連接，提升學習能力。",
    icon: "🏃‍♂️"
  },
  {
    fact: "睡眠對學習至關重要！充足的睡眠可以幫助大腦整理和鞏固白天學習的知識。",
    icon: "😴"
  }
];

export function TriviaDialog() {
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleNext = () => {
    setCurrentTriviaIndex((prev) => (prev + 1) % trivia.length);
  };

  return (
    <AnimatePresence mode="wait">
      {!isDismissed && (
        <>
          {/* 固定的背景遮罩層 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999]"
            style={{ pointerEvents: "all" }}
          />

          {/* 提示對話框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: "easeOut"
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl mx-auto bg-background rounded-lg shadow-2xl border p-6 z-[100000]"
            role="dialog"
            aria-label="學習小提示"
            style={{ pointerEvents: "all" }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-10 w-10 rounded-full border shadow-md bg-background hover:bg-muted transition-colors"
              onClick={handleDismiss}
              aria-label="關閉提示"
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-4xl text-center mb-4"
            >
              {trivia[currentTriviaIndex].icon}
            </motion.div>

            <div className="space-y-4 text-center">
              <h3 className="text-lg font-medium text-primary">你知道嗎？</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {trivia[currentTriviaIndex].fact}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {trivia.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i === currentTriviaIndex ? [1, 0.8, 1] : 1,
                      opacity: i === currentTriviaIndex ? 1 : 0.3,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: i === currentTriviaIndex ? Infinity : 0,
                    }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="text-sm"
              >
                下一個提示
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}