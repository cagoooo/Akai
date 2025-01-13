import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const trivia = [
  {
    fact: "每個人的學習方式都是獨特的！研究顯示，有至少 7 種不同的學習風格。",
    icon: "🧠",
    category: "學習風格"
  },
  {
    fact: "短暫休息可以提升學習效率！每 25 分鐘學習後休息 5 分鐘，是最佳的學習節奏。",
    icon: "⏰",
    category: "時間管理"
  },
  {
    fact: "運用多感官學習可以提高記憶力！結合視覺、聽覺和動作學習，能增加 90% 的記憶保留率。",
    icon: "👀",
    category: "學習技巧"
  },
  {
    fact: "肢體動作能促進腦部發展！研究發現，運動可以增加腦部的神經連接，提升學習能力。",
    icon: "🏃‍♂️",
    category: "身心平衡"
  },
  {
    fact: "睡眠對學習至關重要！充足的睡眠可以幫助大腦整理和鞏固白天學習的知識。",
    icon: "😴",
    category: "健康習慣"
  },
  {
    fact: "音樂可以增強學習效果！古典音樂特別是莫札特的作品，能提高空間推理能力。",
    icon: "🎵",
    category: "學習環境"
  },
  {
    fact: "寫筆記不只是記錄！手寫筆記可以提高理解力和記憶力，比打字更有效。",
    icon: "✍️",
    category: "學習技巧"
  },
  {
    fact: "教導他人是最好的學習方式！解釋概念給他人聽，可以加深自己的理解。",
    icon: "👥",
    category: "學習方法"
  },
  {
    fact: "正向思維能提升學習效果！相信自己有能力學會新事物的人，學習速度更快。",
    icon: "🌟",
    category: "心理建設"
  },
  {
    fact: "環境會影響學習！找到適合自己的學習環境，可以提高專注力和效率。",
    icon: "🏡",
    category: "學習環境"
  }
];

export function TriviaDialog() {
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasSeenTrivia, setHasSeenTrivia] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    try {
      const hasSeenTriviaFlag = localStorage.getItem('hasSeenTrivia');
      if (hasSeenTriviaFlag === 'true') {
        setHasSeenTrivia(true);
      }
    } catch (error) {
      setError('Error accessing localStorage'); // Set error message
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  const handleDismiss = () => {
    try {
      setIsDismissed(true);
      localStorage.setItem('hasSeenTrivia', 'true');
    } catch (error) {
      setError('Error setting localStorage'); // Set error message
      console.error('Error setting localStorage:', error);
    }
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

  if (hasSeenTrivia) {
    return null;
  }

  // Added error handling
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check for potential index errors before accessing trivia array
  const currentTrivia = trivia[currentTriviaIndex] || { fact: "", icon: "", category: "" };


  return (
    <AnimatePresence mode="wait">
      {!isDismissed && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleDismiss}
          />

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
            <div className="absolute right-2 top-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted hover:scale-105 transition-all shadow-sm hover:shadow-md bg-background"
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

            <div className="pt-2">
              <div className="mb-4 mr-12">
                <Progress 
                  value={((currentTriviaIndex + 1) / trivia.length) * 100} 
                  className="h-2 bg-muted" 
                  />
              </div>

              <div className="text-center mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {currentTrivia.category}
                </span>
              </div>

              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">
                  {currentTrivia.icon}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-lg font-medium text-primary">你知道嗎？</h3>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {currentTriviaIndex + 1} / {trivia.length}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {currentTrivia.fact}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {trivia.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleJumpTo(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentTriviaIndex
                        ? "bg-primary"
                        : "bg-primary/30 hover:bg-primary/50"
                    }`}
                    aria-label={`跳轉至第 ${i + 1} 則提示`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-8 w-8"
                  aria-label="上一個提示"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-8 w-8"
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