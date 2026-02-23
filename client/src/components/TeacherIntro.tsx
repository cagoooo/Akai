import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teacherInfo } from "@/lib/data";
import { Newspaper, Settings2 } from "lucide-react";
import { LinkCustomizer, type LinkStyle } from "./LinkCustomizer";
import { Skeleton } from "@/components/ui/skeleton";
import { m as motion, AnimatePresence } from 'framer-motion';

const emojiAnimationVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

interface TeacherIntroProps {
  isLoading?: boolean;
}

export function TeacherIntro({ isLoading }: TeacherIntroProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [currentMoodIndex, setCurrentMoodIndex] = useState(0);
  const [linkStyle, setLinkStyle] = useState<LinkStyle>({
    color: "#3B82F6",
    hoverColor: "#2563EB",
    underlineStyle: "solid",
    underlineOffset: 4,
    underlineThickness: 1,
    isUnderlineVisible: true,
    isHoverUnderline: false,
  });
  const [linkText, setLinkText] = useState(teacherInfo.name);
  const [linkUrl, setLinkUrl] = useState("https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5");

  // Cycle through teacher moods with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoodIndex((prevIndex) => (prevIndex + 1) % teacherInfo.moods.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentMood = teacherInfo.moods[currentMoodIndex];

  const linkClass = `
    text-4xl md:text-5xl lg:text-6xl font-extrabold
    bg-clip-text text-transparent
    bg-gradient-to-r from-white to-white/80
    hover:from-white hover:to-primary-foreground/60
    transition-all duration-300
    hover:scale-105 transform
    ${linkStyle.isUnderlineVisible ? "hover:after:w-full" : ""}
    relative
    after:absolute after:bottom-0 after:left-0 
    after:h-0.5 after:bg-white
    after:transition-all after:duration-300
    after:w-0
    tracking-wide
    leading-tight
  `.trim();

  if (isLoading) {
    return (
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      {/* 強化後的漸層背景，提高對比度 */}
      <div className="absolute inset-0 bg-blue-700" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-95" />

      <CardContent className="relative z-10 py-4 sm:py-5 px-4 sm:px-6 text-white">
        {/* 頂部：圖標 + 名字 + 狀態 */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div
            className="p-2.5 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Newspaper className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" aria-hidden="true" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={linkUrl}
                className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent hover:from-yellow-200 hover:to-white transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="造訪阿凱老師的個人網頁"
              >
                {linkText}
              </a>
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="p-1 rounded-full hover:bg-white/10"
                onClick={() => setIsCustomizing(true)}
                aria-label="自定義連結樣式"
              >
                <Settings2 className="h-4 w-4 text-white/60" />
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMoodIndex}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                variants={emojiAnimationVariants}
                className="flex items-center gap-2 mt-1 text-sm sm:text-base"
                role="doc-subtitle"
              >
                <motion.span
                  className="text-lg sm:text-xl"
                  animate={{
                    rotate: [0, -10, 10, -5, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                >
                  {currentMood.emoji}
                </motion.span>
                <span className="font-semibold text-yellow-300">教育科技創新者</span>
                <span className="text-white/60 text-xs sm:text-sm">({currentMood.description})</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 描述文字：移除動畫以加速渲染 */}
        <p className="text-white/95 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 pl-0 sm:pl-1 font-medium">
          {teacherInfo.description}
        </p>

        {/* 成就標籤 */}
        <div
          className="flex flex-wrap gap-1.5 sm:gap-2"
          role="list"
          aria-label="教師成就"
        >
          {teacherInfo.achievements.map((achievement, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255,255,255,0.25)"
              }}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/15 backdrop-blur-sm border border-white/20 text-white/95 transition-colors duration-200"
              role="listitem"
            >
              {achievement}
            </motion.span>
          ))}
        </div>

        <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>自定義阿凱老師連結樣式</DialogTitle>
            </DialogHeader>
            <LinkCustomizer
              defaultText={linkText}
              defaultUrl={linkUrl}
              onChange={setLinkStyle}
              onLinkChange={(text, url) => {
                setLinkText(text);
                setLinkUrl(url);
              }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}