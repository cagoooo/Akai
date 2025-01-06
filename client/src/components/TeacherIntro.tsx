import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { teacherInfo } from "@/lib/data";
import { Newspaper, Settings2 } from "lucide-react";
import { LinkCustomizer, type LinkStyle } from "./LinkCustomizer";

export function TeacherIntro() {
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
    transition-all duration-200
    ${linkStyle.isUnderlineVisible ? "underline" : ""}
    ${!linkStyle.isUnderlineVisible && linkStyle.isHoverUnderline ? "hover:underline" : ""}
  `.trim();

  const linkStyles = {
    color: linkStyle.color,
    textDecorationLine: linkStyle.isUnderlineVisible ? "underline" : "none",
    textDecorationStyle: linkStyle.underlineStyle,
    textDecorationThickness: `${linkStyle.underlineThickness}px`,
    textUnderlineOffset: `${linkStyle.underlineOffset}px`,
    "--hover-color": linkStyle.hoverColor,
  } as React.CSSProperties;

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="p-3 rounded-full bg-primary-foreground/10"
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
                style={linkStyles}
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
            <p className="text-primary-foreground/80" role="doc-subtitle">{teacherInfo.title}</p>
          </div>
        </div>

        <p className="text-primary-foreground/90 mb-4">
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
              className="px-3 py-1 rounded-full text-sm bg-primary-foreground/10"
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