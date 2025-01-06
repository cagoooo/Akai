import { Card, CardContent } from "@/components/ui/card";
import { teacherInfo } from "@/lib/data";
import { Newspaper } from "lucide-react";

export function TeacherIntro() {
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
          <div>
            <a 
              href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="造訪阿凱老師的個人網頁"
            >
              <h2 className="text-2xl font-bold group-hover:underline">{teacherInfo.name}</h2>
            </a>
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
      </CardContent>
    </Card>
  );
}