import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teacherInfo } from "@/lib/data";
import { Newspaper, Settings2 } from "lucide-react";
import { LinkCustomizer, type LinkStyle } from "./LinkCustomizer";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherIntroProps {
  isLoading?: boolean;
}

export function TeacherIntro({ isLoading }: TeacherIntroProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
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
    <Card className="bg-primary text-primary-foreground overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div 
            className="p-3 rounded-full bg-primary-foreground/10 animate-pulse"
            role="img"
            aria-label="教師資訊圖標"
          >
            <Newspaper className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <a 
                href={linkUrl}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="造訪阿凱老師的個人網頁"
              >
                {linkText}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCustomizing(true)}
                aria-label="自定義連結樣式"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mt-2" role="doc-subtitle">
              {teacherInfo.title}
            </p>
          </div>
        </div>

        <p className="text-primary-foreground/90 mb-6 mt-6 text-lg md:text-xl leading-relaxed">
          {teacherInfo.description}
        </p>

        <div 
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="教師成就"
        >
          {teacherInfo.achievements.map((achievement, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 rounded-full text-base md:text-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
              role="listitem"
            >
              {achievement}
            </span>
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