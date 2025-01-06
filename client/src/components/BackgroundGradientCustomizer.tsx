import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface GradientSettings {
  startColor: string;
  endColor: string;
  direction: string;
  opacity: number;
}

interface BackgroundGradientCustomizerProps {
  onChange?: (settings: GradientSettings) => void;
}

const defaultSettings: GradientSettings = {
  startColor: "#60A5FA",
  endColor: "#A78BFA",
  direction: "to-br",
  opacity: 0.1,
};

const directions = [
  { value: "to-r", label: "左到右" },
  { value: "to-l", label: "右到左" },
  { value: "to-t", label: "下到上" },
  { value: "to-b", label: "上到下" },
  { value: "to-tr", label: "左下到右上" },
  { value: "to-tl", label: "右下到左上" },
  { value: "to-br", label: "左上到右下" },
  { value: "to-bl", label: "右上到左下" },
];

export function BackgroundGradientCustomizer({ onChange }: BackgroundGradientCustomizerProps) {
  const [settings, setSettings] = useState<GradientSettings>(defaultSettings);

  const handleChange = (updates: Partial<GradientSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onChange?.(newSettings);
  };

  const gradientStyle = {
    backgroundImage: `linear-gradient(${settings.direction.replace('to-', 'to ')}, ${settings.startColor}, ${settings.endColor})`,
    opacity: settings.opacity,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>背景漸層設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 預覽區域 */}
        <div className="aspect-video w-full rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
          <div className="absolute inset-0" style={gradientStyle} />
        </div>

        <div className="space-y-4">
          {/* 起始顏色 */}
          <div className="space-y-2">
            <Label htmlFor="startColor">起始顏色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.startColor}
                onChange={(e) => handleChange({ startColor: e.target.value })}
                className="w-12 p-1 h-9"
              />
              <Input
                type="text"
                value={settings.startColor}
                onChange={(e) => handleChange({ startColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* 結束顏色 */}
          <div className="space-y-2">
            <Label htmlFor="endColor">結束顏色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.endColor}
                onChange={(e) => handleChange({ endColor: e.target.value })}
                className="w-12 p-1 h-9"
              />
              <Input
                type="text"
                value={settings.endColor}
                onChange={(e) => handleChange({ endColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* 方向選擇 */}
          <div className="space-y-2">
            <Label>漸層方向</Label>
            <Select
              value={settings.direction}
              onValueChange={(value) => handleChange({ direction: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇漸層方向" />
              </SelectTrigger>
              <SelectContent>
                {directions.map((direction) => (
                  <SelectItem key={direction.value} value={direction.value}>
                    {direction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 不透明度 */}
          <div className="space-y-2">
            <Label>不透明度</Label>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[settings.opacity]}
              onValueChange={([opacity]) => handleChange({ opacity })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
