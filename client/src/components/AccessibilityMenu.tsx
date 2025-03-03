
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
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [colorBlindMode, setColorBlindMode] = useState<string | null>(null);
  
  // 應用無障礙設置
  useEffect(() => {
    // 設置字體大小
    document.documentElement.style.fontSize = `${fontSize}%`;
    
    // 設置對比度
    if (contrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // 設置減少動畫
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // 設置閱讀友好字體
    if (dyslexicFont) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
    
    // 設置色盲模式
    document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (colorBlindMode) {
      document.documentElement.classList.add(colorBlindMode);
    }
    
    // 設置主題模式
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 無障礙 SVG 濾鏡 (添加到 DrawerContent 內)
  const renderColorBlindFilters = () => (
    <svg className="absolute w-0 h-0">
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix 
            type="matrix" 
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0" />
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix 
            type="matrix" 
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0" />
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix 
            type="matrix" 
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0" />
        </filter>
      </defs>
    </svg>
  );
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full">
          <Accessibility className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-sm mx-auto">
        {renderColorBlindFilters()}
        <DrawerHeader>
          <DrawerTitle>無障礙設置</DrawerTitle>
          <DrawerDescription>調整界面以提高可訪問性</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="font-size">字體大小</Label>
                <p className="text-sm text-muted-foreground">調整整體字體大小</p>
              </div>
              <span className="text-sm font-medium">{fontSize}%</span>
            </div>
            <Slider
              id="font-size"
              min={80}
              max={150}
              step={5}
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
            />
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast">高對比度</Label>
                <p className="text-sm text-muted-foreground">增強文字與背景的對比度</p>
              </div>
              <Switch
                id="high-contrast"
                checked={contrast}
                onCheckedChange={setContrast}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion">減少動畫</Label>
                <p className="text-sm text-muted-foreground">降低或移除動畫效果</p>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dyslexic-font">閱讀友好字體</Label>
                <p className="text-sm text-muted-foreground">使用更易於閱讀的字體</p>
              </div>
              <Switch
                id="dyslexic-font"
                checked={dyslexicFont}
                onCheckedChange={setDyslexicFont}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>主題模式</Label>
            <div className="flex gap-2">
              <Button 
                variant={themeMode === 'light' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setThemeMode('light')}
                className="flex-1"
              >
                <Type className="h-4 w-4 mr-2" />
                淺色
              </Button>
              <Button 
                variant={themeMode === 'auto' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setThemeMode('auto')}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                自動
              </Button>
              <Button 
                variant={themeMode === 'dark' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setThemeMode('dark')}
                className="flex-1"
              >
                <Contrast className="h-4 w-4 mr-2" />
                深色
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>色盲輔助模式</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={colorBlindMode === null ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setColorBlindMode(null)}
              >
                正常色彩
              </Button>
              <Button 
                variant={colorBlindMode === 'protanopia' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setColorBlindMode('protanopia')}
              >
                紅色盲模式
              </Button>
              <Button 
                variant={colorBlindMode === 'deuteranopia' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setColorBlindMode('deuteranopia')}
              >
                綠色盲模式
              </Button>
              <Button 
                variant={colorBlindMode === 'tritanopia' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setColorBlindMode('tritanopia')}
              >
                藍色盲模式
              </Button>
            </div>
          </div>
          
        </div>
        <DrawerFooter>
          <Button className="w-full" onClick={() => {
            setFontSize(100);
            setContrast(false);
            setReducedMotion(false);
            setDyslexicFont(false);
            setThemeMode('auto');
            setColorBlindMode(null);
          }}>
            <Move className="h-4 w-4 mr-2" />
            重置所有設置
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">關閉</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

    if (themeMode === 'auto') {
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
    }
    
    return () => {
      // 清理函數
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize, contrast, reducedMotion, dyslexicFont, themeMode, colorBlindMode]);

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
