import { type EducationalTool } from "@/lib/data";
import { MessageSquare, Files, Sparkles, BookOpen } from "lucide-react";

interface PreviewGeneratorProps {
  tool: EducationalTool;
}

export function PreviewGenerator({ tool }: PreviewGeneratorProps) {
  const gradientId = `gradient-${tool.id}`;
  const iconGradientId = `icon-gradient-${tool.id}`;

  // 為不同工具設置不同的漸層色
  const getGradientColors = () => {
    switch (tool.id) {
      case 7: // 點「石」成金
        return {
          start: "#4F46E5",
          end: "#06B6D4"
        };
      case 8: // 12年教案有14
        return {
          start: "#059669",
          end: "#10B981"
        };
      default:
        return {
          start: "#6366F1",
          end: "#8B5CF6"
        };
    }
  };

  const { start, end } = getGradientColors();

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 定義漸層 */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={start} stopOpacity="0.1" />
          <stop offset="100%" stopColor={end} stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={iconGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>

      {/* 背景 */}
      <rect width="800" height="450" fill="#ffffff" />
      <rect width="800" height="450" fill={`url(#${gradientId})`} />

      {/* 工具特定的圖示和裝飾 */}
      {tool.id === 7 && (
        <g transform="translate(350, 175)">
          <circle cx="50" cy="50" r="40" fill={`url(#${iconGradientId})`} opacity="0.1" />
          <MessageSquare 
            x="30" 
            y="30" 
            width="40" 
            height="40" 
            stroke={`url(#${iconGradientId})`} 
            strokeWidth="2"
          />
          <Sparkles 
            x="60" 
            y="20" 
            width="30" 
            height="30" 
            stroke={`url(#${iconGradientId})`} 
            strokeWidth="2"
          />
        </g>
      )}

      {tool.id === 8 && (
        <g transform="translate(350, 175)">
          <circle cx="50" cy="50" r="40" fill={`url(#${iconGradientId})`} opacity="0.1" />
          <Files 
            x="30" 
            y="30" 
            width="40" 
            height="40" 
            stroke={`url(#${iconGradientId})`} 
            strokeWidth="2"
          />
          <BookOpen 
            x="60" 
            y="20" 
            width="30" 
            height="30" 
            stroke={`url(#${iconGradientId})`} 
            strokeWidth="2"
          />
        </g>
      )}

      {/* 工具名稱 */}
      <text
        x="400"
        y="300"
        fontFamily="system-ui"
        fontSize="24"
        fill="#1F2937"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {tool.title}
      </text>

      {/* 裝飾性圖案 */}
      <circle cx="200" cy="100" r="5" fill={start} opacity="0.5" />
      <circle cx="600" cy="350" r="5" fill={end} opacity="0.5" />
      <circle cx="150" cy="400" r="3" fill={start} opacity="0.3" />
      <circle cx="650" cy="50" r="3" fill={end} opacity="0.3" />
    </svg>
  );
}