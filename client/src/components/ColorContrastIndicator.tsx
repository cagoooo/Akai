import { useEffect, useState } from "react";
import { getContrastRatio, meetsWCAGStandards } from "@/lib/utils/colorContrast";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ContrastResult {
  zoneName: string;
  backgroundColor: string;
  textColor: string;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
}

export function ColorContrastIndicator() {
  const [results, setResults] = useState<ContrastResult[]>([]);

  useEffect(() => {
    const checkContrast = () => {
      try {
        // 定義要檢查的區域
        const zones = [
          { name: "頂部標題區", selector: "div[data-tour='theme-toggle']", bgClass: "bg-blue-50" },
          { name: "排行榜區域", selector: "div[data-tour='tool-rankings']", bgClass: "bg-purple-50" },
          { name: "訪問計數器", selector: ".bg-green-50", bgClass: "bg-green-50" },
          { name: "工具卡片區", selector: "section[data-tour='tools-grid']", bgClass: "bg-indigo-50" },
          { name: "表情故事區", selector: "div[data-tour='emoji-storytelling']", bgClass: "bg-pink-50" },
          { name: "心情追蹤區", selector: "div[data-tour='mood-tracker']", bgClass: "bg-orange-50" },
          { name: "進度面板區", selector: "div[data-tour='progress-dashboard']", bgClass: "bg-teal-50" },
          { name: "成就列表區", selector: "div[data-tour='achievements']", bgClass: "bg-amber-50" },
          { name: "診斷面板區", selector: "div[data-tour='diagnostics']", bgClass: "bg-cyan-50" },
          { name: "SEO分析區", selector: "div[data-tour='seo-analytics']", bgClass: "bg-red-50" }
        ];

        const newResults = zones
          .map(zone => {
            const element = document.querySelector(zone.selector);
            if (!element) {
              console.warn(`Element not found for zone: ${zone.name}`);
              return null;
            }

            try {
              const computedStyle = window.getComputedStyle(element);
              const backgroundColor = computedStyle.backgroundColor;
              const textColor = computedStyle.color;

              // 將RGB顏色轉換為HEX
              const rgbToHex = (rgb: string) => {
                try {
                  const values = rgb.match(/\d+/g);
                  if (!values || values.length < 3) {
                    console.warn(`Invalid RGB format for ${zone.name}: ${rgb}`);
                    return "#000000";
                  }
                  const [r, g, b] = values.map(Number);
                  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                } catch (error) {
                  console.error(`Error converting RGB to HEX for ${zone.name}:`, error);
                  return "#000000";
                }
              };

              const bgHex = rgbToHex(backgroundColor);
              const textHex = rgbToHex(textColor);
              const ratio = getContrastRatio(bgHex, textHex);

              return {
                zoneName: zone.name,
                backgroundColor: bgHex,
                textColor: textHex,
                contrastRatio: ratio,
                meetsAA: meetsWCAGStandards(bgHex, textHex, "AA"),
                meetsAAA: meetsWCAGStandards(bgHex, textHex, "AAA")
              };
            } catch (error) {
              console.error(`Error processing zone ${zone.name}:`, error);
              return null;
            }
          })
          .filter((result): result is ContrastResult => result !== null);

        setResults(newResults);
      } catch (error) {
        console.error("Error in checkContrast:", error);
      }
    };

    // 初始檢查
    checkContrast();

    // 監聽主題變更
    const observer = new MutationObserver(checkContrast);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (results.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">色彩對比度檢測</h3>
        <p className="text-sm text-muted-foreground">正在分析顏色對比度...</p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">色彩對比度檢測</h3>
        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.zoneName} className="flex items-center justify-between">
              <span className="text-sm">{result.zoneName}</span>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant={result.meetsAA ? "default" : "destructive"}>
                      AA {result.meetsAA ? "✓" : "✗"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>對比度: {result.contrastRatio.toFixed(2)}</p>
                    <p>AA標準: {result.meetsAA ? "符合" : "不符合"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant={result.meetsAAA ? "default" : "secondary"}>
                      AAA {result.meetsAAA ? "✓" : "✗"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>對比度: {result.contrastRatio.toFixed(2)}</p>
                    <p>AAA標準: {result.meetsAAA ? "符合" : "不符合"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </TooltipProvider>
  );
}