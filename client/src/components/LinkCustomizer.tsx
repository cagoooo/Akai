import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface LinkStyle {
  color: string;
  hoverColor: string;
  underlineStyle: "none" | "solid" | "dotted" | "dashed" | "wavy";
  underlineOffset: number;
  underlineThickness: number;
  isUnderlineVisible: boolean;
  isHoverUnderline: boolean;
}

interface LinkCustomizerProps {
  onChange?: (style: LinkStyle) => void;
  defaultText?: string;
  defaultUrl?: string;
  onLinkChange?: (text: string, url: string) => void;
}

const defaultStyle: LinkStyle = {
  color: "#3B82F6",
  hoverColor: "#2563EB",
  underlineStyle: "solid",
  underlineOffset: 4,
  underlineThickness: 1,
  isUnderlineVisible: true,
  isHoverUnderline: false,
};

const underlineStyles = [
  { value: "none", label: "無" },
  { value: "solid", label: "實線" },
  { value: "dotted", label: "點線" },
  { value: "dashed", label: "虛線" },
  { value: "wavy", label: "波浪線" },
];

export function LinkCustomizer({ 
  onChange,
  defaultText = "連結文字",
  defaultUrl = "https://example.com",
  onLinkChange,
}: LinkCustomizerProps) {
  const [style, setStyle] = useState<LinkStyle>(defaultStyle);
  const [linkText, setLinkText] = useState(defaultText);
  const [linkUrl, setLinkUrl] = useState(defaultUrl);

  const handleStyleChange = (updates: Partial<LinkStyle>) => {
    const newStyle = { ...style, ...updates };
    setStyle(newStyle);
    onChange?.(newStyle);
  };

  const handleTextChange = (text: string) => {
    setLinkText(text);
    onLinkChange?.(text, linkUrl);
  };

  const handleUrlChange = (url: string) => {
    setLinkUrl(url);
    onLinkChange?.(linkText, url);
  };

  const previewClass = cn(
    "transition-all duration-200",
    {
      [`hover:text-[${style.hoverColor}]`]: style.hoverColor !== style.color,
      "hover:underline": style.isHoverUnderline && !style.isUnderlineVisible,
      "underline": style.isUnderlineVisible,
    }
  );

  const previewStyle = {
    color: style.color,
    textDecorationLine: style.isUnderlineVisible ? "underline" : "none",
    textDecorationStyle: style.underlineStyle,
    textDecorationThickness: `${style.underlineThickness}px`,
    textUnderlineOffset: `${style.underlineOffset}px`,
    "--hover-color": style.hoverColor,
  } as React.CSSProperties;

  return (
    <Card>
      <CardHeader>
        <CardTitle>連結自定義</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 預覽區域 */}
        <div className="p-4 rounded-lg bg-muted flex items-center justify-center">
          <a
            href={linkUrl}
            className={previewClass}
            style={previewStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkText}
          </a>
        </div>

        <div className="space-y-4">
          {/* 連結文字和URL */}
          <div className="space-y-2">
            <Label htmlFor="linkText">連結文字</Label>
            <Input
              id="linkText"
              value={linkText}
              onChange={(e) => handleTextChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">連結網址</Label>
            <Input
              id="linkUrl"
              value={linkUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          {/* 顏色設定 */}
          <div className="space-y-2">
            <Label htmlFor="linkColor">連結顏色</Label>
            <div className="flex gap-2">
              <Input
                id="linkColor"
                type="color"
                value={style.color}
                onChange={(e) => handleStyleChange({ color: e.target.value })}
                className="w-12 p-1 h-9"
              />
              <Input
                type="text"
                value={style.color}
                onChange={(e) => handleStyleChange({ color: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoverColor">滑鼠移入顏色</Label>
            <div className="flex gap-2">
              <Input
                id="hoverColor"
                type="color"
                value={style.hoverColor}
                onChange={(e) => handleStyleChange({ hoverColor: e.target.value })}
                className="w-12 p-1 h-9"
              />
              <Input
                type="text"
                value={style.hoverColor}
                onChange={(e) => handleStyleChange({ hoverColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* 底線設定 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="isUnderlineVisible">顯示底線</Label>
              <Switch
                id="isUnderlineVisible"
                checked={style.isUnderlineVisible}
                onCheckedChange={(checked) => handleStyleChange({ isUnderlineVisible: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="isHoverUnderline">滑鼠移入時顯示底線</Label>
              <Switch
                id="isHoverUnderline"
                checked={style.isHoverUnderline}
                onCheckedChange={(checked) => handleStyleChange({ isHoverUnderline: checked })}
              />
            </div>
          </div>

          {(style.isUnderlineVisible || style.isHoverUnderline) && (
            <>
              <div className="space-y-2">
                <Label>底線樣式</Label>
                <Select
                  value={style.underlineStyle}
                  onValueChange={(value) => handleStyleChange({ 
                    underlineStyle: value as LinkStyle["underlineStyle"]
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇底線樣式" />
                  </SelectTrigger>
                  <SelectContent>
                    {underlineStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>底線位移</Label>
                <Slider
                  min={0}
                  max={12}
                  step={1}
                  value={[style.underlineOffset]}
                  onValueChange={([value]) => handleStyleChange({ underlineOffset: value })}
                />
              </div>

              <div className="space-y-2">
                <Label>底線粗細</Label>
                <Slider
                  min={1}
                  max={4}
                  step={0.5}
                  value={[style.underlineThickness]}
                  onValueChange={([value]) => handleStyleChange({ underlineThickness: value })}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
