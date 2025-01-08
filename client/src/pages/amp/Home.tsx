import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AmpHome() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            教育科技創新專區
          </h1>
          <p className="text-lg text-muted-foreground">
            探索 AI 驅動的個人化學習體驗
          </p>
        </div>

        {/* Feature Carousel */}
        <amp-carousel width="800"
                     height="400"
                     layout="responsive"
                     type="slides"
                     autoplay
                     delay="5000">
          <div className="card">
            <h3 className="card-title">AI 驅動學習</h3>
            <p className="card-content">
              運用人工智慧技術，提供個人化的學習建議和適應性課程內容
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">跨平台支援</h3>
            <p className="card-content">
              完整支援各種裝置，隨時隨地都能學習
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">即時分析</h3>
            <p className="card-content">
              提供詳細的學習數據分析，協助掌握學習進度
            </p>
          </div>
        </amp-carousel>

        {/* Feature Grid */}
        <div className="grid">
          <Card>
            <CardHeader>
              <CardTitle>最新教育工具</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="feature-list">
                <li>智慧翻譯助手</li>
                <li>課程編輯器</li>
                <li>討論區</li>
                <li>任務追蹤</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>平台特色</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="feature-list">
                <li>AI 驅動的個人化學習體驗</li>
                <li>跨平台相容性</li>
                <li>即時數據分析</li>
                <li>豐富的教學資源</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Structured Data for SEO */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "教育科技創新專區",
            "description": "探索AI驅動的個人化學習體驗，提供跨平台相容性、即時數據分析和豐富的教學資源。",
            "url": "https://smes.tyc.edu.tw",
            "sameAs": [
              "https://www.facebook.com/smestyc",
              "https://twitter.com/smestyc"
            ]
          })
        }} />
      </main>
    </div>
  );
}

export default AmpHome;