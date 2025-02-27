
import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accessibility, Type, Zap, Contrast, Move } from "lucide-react";

export function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  // 應用無障礙設置
  const applySettings = () => {
    // 字體大小
    document.documentElement.style.fontSize = `${fontSize}%`;
    
    // 高對比度
    if (contrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    // 減少動畫
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
    
    // 閱讀友好字體
    if (dyslexicFont) {
      document.documentElement.classList.add("dyslexic-font");
    } else {
      document.documentElement.classList.remove("dyslexic-font");
    }
    
    // 保存設置到 localStorage
    localStorage.setItem("accessibility", JSON.stringify({
      fontSize,
      contrast,
      reducedMotion,
      dyslexicFont
    }));
  };
  
  // 重置設置
  const resetSettings = () => {
    setFontSize(100);
    setContrast(false);
    setReducedMotion(false);
    setDyslexicFont(false);
    document.documentElement.style.fontSize = "";
    document.documentElement.classList.remove("high-contrast", "reduced-motion", "dyslexic-font");
    localStorage.removeItem("accessibility");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="無障礙設定">
          <Accessibility className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>無障礙設定</DrawerTitle>
            <DrawerDescription>
              調整網站顯示以獲得更好的瀏覽體驗
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <h4 className="font-medium">字體大小</h4>
                </div>
                <span className="text-sm text-muted-foreground">{fontSize}%</span>
              </div>
              <Slider 
                value={[fontSize]} 
                min={75} 
                max={200} 
                step={5}
                onValueChange={(value) => setFontSize(value[0])} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="contrast" 
                  checked={contrast}
                  onCheckedChange={setContrast}
                />
                <div className="grid gap-1">
                  <label htmlFor="contrast" className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <span>高對比度模式</span>
                  </label>
                  <span className="text-sm text-muted-foreground">增強文字與背景對比度</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="reducedMotion" 
                  checked={reducedMotion}
                  onCheckedChange={setReducedMotion}
                />
                <div className="grid gap-1">
                  <label htmlFor="reducedMotion" className="flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    <span>減少動畫效果</span>
                  </label>
                  <span className="text-sm text-muted-foreground">降低頁面動畫和過渡效果</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="dyslexicFont" 
                  checked={dyslexicFont}
                  onCheckedChange={setDyslexicFont}
                />
                <div className="grid gap-1">
                  <label htmlFor="dyslexicFont" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>閱讀友好字體</span>
                  </label>
                  <span className="text-sm text-muted-foreground">使用更易於閱讀的字體</span>
                </div>
              </div>
            </div>
          </div>
          
          <DrawerFooter>
            <Button onClick={applySettings}>套用設定</Button>
            <Button variant="outline" onClick={resetSettings}>重置設定</Button>
            <DrawerClose asChild>
              <Button variant="ghost">關閉</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
