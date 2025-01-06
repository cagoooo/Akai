import { type EducationalTool } from "@/lib/data";
import { 
  MessageSquare, 
  Files, 
  Sparkles, 
  BookOpen, 
  MessageCircle,
  Lightbulb,
  Book,
  QrCode,
  Gamepad2
} from "lucide-react";

interface PreviewGeneratorProps {
  tool: EducationalTool;
}

export function PreviewGenerator({ tool }: PreviewGeneratorProps) {
  // 为不同工具设置不同的渐变色
  const getGradientColors = () => {
    switch (tool.category) {
      case 'communication':
        return {
          start: "#3B82F6",
          end: "#60A5FA"
        };
      case 'teaching':
        return {
          start: "#10B981",
          end: "#34D399"
        };
      case 'language':
        return {
          start: "#8B5CF6",
          end: "#A78BFA"
        };
      case 'reading':
        return {
          start: "#EAB308",
          end: "#FCD34D"
        };
      case 'utilities':
        return {
          start: "#6B7280",
          end: "#9CA3AF"
        };
      case 'games':
        return {
          start: "#EC4899",
          end: "#F472B6"
        };
      default:
        return {
          start: "#6366F1",
          end: "#8B5CF6"
        };
    }
  };

  const { start, end } = getGradientColors();
  const gradientId = `gradient-${tool.id}`;
  const iconGradientId = `icon-gradient-${tool.id}`;

  // 获取对应工具的图标组件
  const getToolIcon = () => {
    switch (tool.id) {
      case 1: return MessageCircle;
      case 2: return Lightbulb;
      case 3: return Book;
      case 4: return BookOpen;
      case 5: return QrCode;
      case 6: return Gamepad2;
      case 7: return MessageSquare;
      case 8: return Files;
      default: return MessageCircle;
    }
  };

  const Icon = getToolIcon();

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 定义渐变 */}
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

      {/* 主要图标区域 */}
      <g transform="translate(350, 175)">
        <circle cx="50" cy="50" r="40" fill={`url(#${iconGradientId})`} opacity="0.1" />
        {/* 主图标 */}
        <g transform="translate(30, 30)">
          <Icon stroke={`url(#${iconGradientId})`} strokeWidth="2" width="40" height="40" />
        </g>
        {/* 辅助图标 */}
        {tool.id === 7 && (
          <g transform="translate(60, 20)">
            <Sparkles stroke={`url(#${iconGradientId})`} strokeWidth="2" width="30" height="30" />
          </g>
        )}
        {tool.id === 8 && (
          <g transform="translate(60, 20)">
            <BookOpen stroke={`url(#${iconGradientId})`} strokeWidth="2" width="30" height="30" />
          </g>
        )}
      </g>

      {/* 工具名称 */}
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

      {/* 装饰元素 */}
      <circle cx="200" cy="100" r="5" fill={start} opacity="0.5" />
      <circle cx="600" cy="350" r="5" fill={end} opacity="0.5" />
      <circle cx="150" cy="400" r="3" fill={start} opacity="0.3" />
      <circle cx="650" cy="50" r="3" fill={end} opacity="0.3" />
    </svg>
  );
}