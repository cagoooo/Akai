import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AmpHome() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* AMP-compliant header */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold">
            教育科技創新專區
          </h1>
        </div>

        {/* AMP-optimized content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>歡迎來到教育科技創新專區</CardTitle>
            </CardHeader>
            <CardContent>
              <p>探索阿凱老師開發的教育工具，為您的教學增添創新的可能</p>
            </CardContent>
          </Card>

          {/* Static content for AMP version */}
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>最新教育工具</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4">
                  <li>智慧翻譯助手</li>
                  <li>課程編輯器</li>
                  <li>討論區</li>
                  <li>任務追蹤</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>網站特色</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4">
                  <li>AI 驅動的個人化學習體驗</li>
                  <li>跨平台相容性</li>
                  <li>即時數據分析</li>
                  <li>豐富的教學資源</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AmpHome;