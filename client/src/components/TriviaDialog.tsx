import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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

  const handlePrevious = () => {
    setCurrentTriviaIndex((prev) =>
      prev === 0 ? trivia.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentTriviaIndex((prev) =>
      (prev + 1) % trivia.length
    );
  };

  const handleJumpTo = (index: number) => {
    setCurrentTriviaIndex(index);
  };

  return (
    <AnimatePresence mode="wait">
      {!isDismissed && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleDismiss}
          />

          {/* 對話框 */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative w-full max-w-lg mx-4 bg-background rounded-lg shadow-2xl border p-6"
            role="dialog"
            aria-label="學習小提示"
          >
            {/* 關閉按鈕 - 添加懸停提示 */}
            <div className="absolute right-2 top-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted hover:scale-105 transition-all"
                      onClick={handleDismiss}
                      aria-label="關閉提示"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>關閉知識小提示</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* 內容區域 - 為進度條添加左側 margin 避開關閉按鈕 */}
            <div className="pt-2">
              {/* 進度條 */}
              <div className="mb-4 mr-12"> {/* 添加右側 margin 避開關閉按鈕 */}
                <Progress 
                  value={((currentTriviaIndex + 1) / trivia.length) * 100} 
                  className="h-2"
                  aria-label={`提示進度：${currentTriviaIndex + 1}/${trivia.length}`}
                />
              </div>

              {/* 圖示動畫 */}
              <motion.div
                key={currentTriviaIndex}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="text-4xl text-center mb-4"
              >
                {trivia[currentTriviaIndex].icon}
              </motion.div>

              {/* 文字內容 */}
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-medium text-primary">你知道嗎？</h3>
                  <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {currentTriviaIndex + 1} / {trivia.length}
                  </span>
                </div>
                <motion.p
                  key={currentTriviaIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-muted-foreground text-base leading-relaxed"
                >
                  {trivia[currentTriviaIndex].fact}
                </motion.p>
              </div>
            </div>

            {/* 導航按鈕和進度指示器 */}
            <div className="flex items-center justify-between mt-6">
              <TooltipProvider>
                <div className="flex gap-3">
                  {trivia.map((_, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => handleJumpTo(i)}
                          animate={{
                            scale: i === currentTriviaIndex ? [1, 0.8, 1] : 1,
                            opacity: i === currentTriviaIndex ? 1 : 0.5,
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: i === currentTriviaIndex ? Infinity : 0,
                          }}
                          className={`w-3 h-3 rounded-full transition-colors duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            i === currentTriviaIndex
                              ? "bg-primary"
                              : "bg-primary/30 hover:bg-primary/50"
                          }`}
                          aria-label={`跳轉至第 ${i + 1} 則提示`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>第 {i + 1} 則提示</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-8 w-8 hover:bg-primary/10"
                  aria-label="上一個提示"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-8 w-8 hover:bg-primary/10"
                  aria-label="下一個提示"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}