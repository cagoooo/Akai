import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { type EducationalTool } from "@/lib/data";
import { PreviewGenerator } from "@/components/PreviewGenerator";
import { useCustomizationTutorial } from "./CustomizationTutorial";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface IconCustomizerProps {
  tool: EducationalTool;
  onCustomizationChange?: (customization: IconCustomization) => void;
}

export interface IconCustomization {
  size: number;
  primaryColor: string;
  secondaryColor: string;
  opacity: number;
}

const defaultCustomization: IconCustomization = {
  size: 1,
  primaryColor: "",
  secondaryColor: "",
  opacity: 0.1,
};

// 根據工具類別獲取默認主要顏色
function getDefaultPrimaryColor(tool: EducationalTool): string {
  const categoryColors: Record<string, string> = {
    communication: "#3B82F6", // 藍色
    teaching: "#10B981",      // 綠色
    language: "#8B5CF6",      // 紫色
    reading: "#F59E0B",       // 黃色
    utilities: "#6B7280",     // 灰色
    games: "#EC4899",         // 粉色
  };
  return categoryColors[tool.category] || "#3B82F6";
}

// 根據工具類別獲取默認次要顏色
function getDefaultSecondaryColor(tool: EducationalTool): string {
  const categoryColors: Record<string, string> = {
    communication: "#93C5FD", // 淺藍色
    teaching: "#86EFAC",      // 淺綠色
    language: "#C4B5FD",      // 淺紫色
    reading: "#FCD34D",       // 淺黃色
    utilities: "#D1D5DB",     // 淺灰色
    games: "#FBCFE8",         // 淺粉色
  };
  return categoryColors[tool.category] || "#93C5FD";
}

export function IconCustomizer({ tool, onCustomizationChange }: IconCustomizerProps) {
  const [customization, setCustomization] = useState<IconCustomization>(defaultCustomization);
  const { startTutorial, hasSeenTutorial } = useCustomizationTutorial();

  useEffect(() => {
    if (!hasSeenTutorial) {
      startTutorial();
    }
  }, [hasSeenTutorial, startTutorial]);

  const handleChange = (updates: Partial<IconCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomization(newCustomization);
    onCustomizationChange?.(newCustomization);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>圖標自定義</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={startTutorial}
            aria-label="查看教學"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div 
          className="aspect-video w-full bg-muted rounded-lg overflow-hidden mb-6"
          data-customization="preview"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <PreviewGenerator 
            tool={tool} 
            customization={customization}
          />
        </div>

        <div className="space-y-4">
          <div 
            className="space-y-2"
            data-customization="size-control"
          >
            <Label htmlFor="size">圖標大小</Label>
            <Slider
              id="size"
              min={0.5}
              max={2}
              step={0.1}
              value={[customization.size]}
              onValueChange={([size]) => handleChange({ size })}
            />
          </div>

          <div 
            className="space-y-2"
            data-customization="primary-color"
          >
            <Label htmlFor="primaryColor">主要顏色</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={customization.primaryColor || getDefaultPrimaryColor(tool)}
                onChange={(e) => handleChange({ primaryColor: e.target.value })}
                className="w-12 p-1 h-9"
              />
              <Input
                type="text"
                value={customization.primaryColor || getDefaultPrimaryColor(tool)}
                onChange={(e) => handleChange({ primaryColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div 
            className="space-y-2"
            data-customization="secondary-color"
          >
            <Label htmlFor="secondaryColor">次要顏色</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={customization.secondaryColor || getDefaultSecondaryColor(tool)}
                onChange={(e) => handleChange({ secondaryColor: e.target.value })}
                className="w-12 p-1 h-9"
              />
              <Input
                type="text"
                value={customization.secondaryColor || getDefaultSecondaryColor(tool)}
                onChange={(e) => handleChange({ secondaryColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div 
            className="space-y-2"
            data-customization="opacity-control"
          >
            <Label htmlFor="opacity">背景不透明度</Label>
            <Slider
              id="opacity"
              min={0}
              max={1}
              step={0.05}
              value={[customization.opacity]}
              onValueChange={([opacity]) => handleChange({ opacity })}
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label>快速主題</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "深藍主題", primary: "#1E40AF", secondary: "#93C5FD" },
                { name: "活力橙", primary: "#EA580C", secondary: "#FDBA74" },
                { name: "綠色生態", primary: "#15803D", secondary: "#86EFAC" },
                { name: "紫色靈感", primary: "#7E22CE", secondary: "#D8B4FE" },
                { name: "經典黑白", primary: "#18181B", secondary: "#E4E4E7" }
              ].map((theme) => (
                <Tooltip key={theme.name}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-8 h-8 p-0 rounded-full overflow-hidden"
                      onClick={() => handleChange({ primaryColor: theme.primary, secondaryColor: theme.secondary })}
                    >
                      <div className="w-full h-full" style={{ 
                        background: `linear-gradient(135deg, ${theme.primary} 50%, ${theme.secondary} 50%)` 
                      }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{theme.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getDefaultPrimaryColor(tool: EducationalTool) {
  switch (tool.category) {
    case 'communication': return "#3B82F6";
    case 'teaching': return "#10B981";
    case 'language': return "#8B5CF6";
    case 'reading': return "#EAB308";
    case 'utilities': return "#6B7280";
    case 'games': return "#EC4899";
    case 'interactive': return "#06B6D4";
    default: return "#6366F1";
  }
}

function getDefaultSecondaryColor(tool: EducationalTool) {
  switch (tool.category) {
    case 'communication': return "#60A5FA";
    case 'teaching': return "#34D399";
    case 'language': return "#A78BFA";
    case 'reading': return "#FCD34D";
    case 'utilities': return "#9CA3AF";
    case 'interactive': return "#22D3EE";
    case 'games': return "#F472B6";
    default: return "#8B5CF6";
  }
}