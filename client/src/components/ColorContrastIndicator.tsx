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
        // 定義要檢查的區域，包含進度條和里程碑區域
        const zones = [
          { name: "頂部標題區", selector: "[data-tour='header-section']", bgClass: "bg-blue-50" },
          { name: "排行榜區域", selector: "[data-tour='tool-rankings']", bgClass: "bg-purple-50" },
          { name: "訪問計數器", selector: ".visitor-counter-card", bgClass: "bg-green-50" },
          { name: "工具卡片區", selector: "[data-tour='tools-grid']", bgClass: "bg-indigo-50" },
          { name: "表情故事區", selector: "[data-tour='emoji-storytelling']", bgClass: "bg-pink-50" },
          { name: "心情追蹤區", selector: "[data-tour='mood-tracker']", bgClass: "bg-orange-50" },
          { name: "進度面板區", selector: "[data-tour='progress-dashboard']", bgClass: "bg-teal-50" },
          { name: "成就列表區", selector: "[data-tour='achievements']", bgClass: "bg-amber-50" },
          { name: "診斷面板區", selector: "[data-tour='diagnostics']", bgClass: "bg-cyan-50" },
          { name: "SEO分析區", selector: "[data-tour='seo-analytics']", bgClass: "bg-red-50" },
          { name: "里程碑圖標", selector: ".milestone-icon", bgClass: "text-yellow-400" }
        ];

        const newResults = zones
          .map(zone => {
            const element = document.querySelector(zone.selector);
            if (!element) return null;

            try {
              const computedStyle = window.getComputedStyle(element);
              const backgroundColor = computedStyle.backgroundColor;
              const textColor = computedStyle.color;

              // 將RGB顏色轉換為HEX
              const rgbToHex = (rgb: string) => {
                try {
                  const values = rgb.match(/\d+/g);
                  if (!values || values.length < 3) return "#000000";
                  const [r, g, b] = values.map(Number);
                  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                } catch {
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
            } catch {
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

    // 監聽主題和DOM變化
    const observers = [
      new MutationObserver(checkContrast), // 主題變化觀察器
      new MutationObserver(checkContrast)  // DOM變化觀察器
    ];

    // 監聽主題變化
    observers[0].observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    // 監聽DOM變化
    observers[1].observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return (
    <TooltipProvider>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">色彩對比度檢測</h3>
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">正在分析顏色對比度...</p>
          ) : (
            results.map((result) => (
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
            ))
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}