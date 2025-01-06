import { Card, CardContent } from "@/components/ui/card";
import { teacherInfo } from "@/lib/data";
import { Newspaper } from "lucide-react";

export function TeacherIntro() {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-primary-foreground/10">
            <Newspaper className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{teacherInfo.name}</h2>
            <p className="text-primary-foreground/80">{teacherInfo.title}</p>
          </div>
        </div>
        
        <p className="text-primary-foreground/90 mb-4">
          {teacherInfo.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {teacherInfo.achievements.map((achievement, index) => (
            <span 
              key={index}
              className="px-3 py-1 rounded-full text-sm bg-primary-foreground/10"
            >
              {achievement}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
