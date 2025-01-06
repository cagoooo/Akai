import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTriviaIndex((prev) => (prev + 1) % trivia.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
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

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTriviaIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                <p className="text-lg font-medium">你知道嗎？</p>
                <p className="text-muted-foreground">
                  {trivia[currentTriviaIndex].fact}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-4">
              <motion.div
                animate={{
                  scale: [1, 0.8, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{
                  scale: [1, 0.8, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.2,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{
                  scale: [1, 0.8, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.4,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </div>

            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
