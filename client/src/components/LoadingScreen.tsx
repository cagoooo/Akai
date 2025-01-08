import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "載入中" }: LoadingScreenProps) {
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
    }, 500);
  };

  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentTriviaIndex((prev) => (prev + 1) % trivia.length);
      setIsVisible(true);
    }, 500);
  };

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AnimatePresence mode="wait">
              {!isDismissed && isVisible && (
                <motion.div
                  key={currentTriviaIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 1,
                    ease: "easeInOut"
                  }}
                  className="relative w-full space-y-4"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
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
                    className="text-4xl"
                  >
                    {trivia[currentTriviaIndex].icon}
                  </motion.div>

                  <div className="space-y-2">
                    <p className="text-lg font-medium text-primary">你知道嗎？</p>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {trivia[currentTriviaIndex].fact}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 0.8, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
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
              )}
            </AnimatePresence>

            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}