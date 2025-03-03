import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { type EducationalTool } from "@/lib/data";
import { PreviewGenerator } from "@/components/PreviewGenerator";
import { useCustomizationTutorial } from "./CustomizationTutorial";
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
        </motion.div>

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
              onValueChange={(value) => handleChange({ size: value[0] })}
            />
          </div>

          <div 
            className="space-y-2"
            data-customization="color-control"
          >
            <Label htmlFor="primary-color">主要顏色</Label>
            <div className="grid grid-cols-6 gap-2">
              {[
                "#3B82F6", // 藍色
                "#10B981", // 綠色
                "#8B5CF6", // 紫色
                "#F59E0B", // 黃色
                "#6B7280", // 灰色
                "#EC4899", // 粉色
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 rounded-full border-2 ${customization.primaryColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange({ primaryColor: color })}
                  aria-label={`選擇顏色 ${color}`}
                />
              ))}
            </div>
          </div>

          <div 
            className="space-y-2"
            data-customization="secondary-color-control"
          >
            <Label htmlFor="secondary-color">次要顏色</Label>
            <div className="grid grid-cols-6 gap-2">
              {[
                "#93C5FD", // 淺藍色
                "#86EFAC", // 淺綠色
                "#C4B5FD", // 淺紫色
                "#FCD34D", // 淺黃色
                "#D1D5DB", // 淺灰色
                "#FBCFE8", // 淺粉色
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 rounded-full border-2 ${customization.secondaryColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange({ secondaryColor: color })}
                  aria-label={`選擇次要顏色 ${color}`}
                />
              ))}
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
              onValueChange={(value) => handleChange({ opacity: value[0] })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}