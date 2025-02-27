import { useState, useEffect } from "react";
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

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "載入中" }: LoadingScreenProps) {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}