/**
 * PageHead — 統一頁面 meta 元件（取代分散在 SEOHead / BulletinToolDetail / ToolDetail 三處的 og 標籤寫法）
 *
 * 三種模式自動切換：
 *   1. mode="home"        — 首頁（用 site-stats 的 OG 圖 + 「90+ 款國小教育工具」）
 *   2. mode="tool"        — 工具詳情頁（吃 tool prop，自動帶 ogPreviewUrl / previewUrl）
 *   3. mode="custom"      — 自訂頁（如許願池、索引神器，全部欄位自己傳）
 *
 * 所有 og:image 都會：
 *   - 自動補成絕對 URL（社群爬蟲必要）
 *   - 自動加 cacheVersion query string（防 LINE/FB 快取）
 *   - 自動推斷 og:image:secure_url（LINE 偏好）
 *
 * 使用範例：
 *   <PageHead mode="tool" tool={tool} />
 *   <PageHead mode="custom" title="工具索引神器" description="..." image="/og-custom.png" />
 *   <PageHead mode="home" />
 */

import { Helmet } from 'react-helmet-async';
import type { EducationalTool } from '@/lib/data';

const SITE_URL = 'https://cagoooo.github.io/Akai';
const DEFAULT_OG_FALLBACK = '/og-preview.png'; // 萬一 site-stats.json 讀不到的兜底

interface BaseProps {
  /** 強制 override 的 cache buster；不傳則自動讀 VITE_APP_VERSION */
  cacheVersion?: string;
  /** 是否為 article 類型（部落格 / 工具詳情頁建議 true，首頁/landing false） */
  isArticle?: boolean;
}

interface HomeProps extends BaseProps {
  mode: 'home';
  /** 從 useSiteStats 拿到的 ogImageAbsolute，沒拿到時 fallback 到 SITE_URL/og-preview.png */
  ogImage?: string;
  toolCount?: number;
}

interface ToolProps extends BaseProps {
  mode: 'tool';
  tool: Pick<EducationalTool, 'id' | 'title' | 'description' | 'url'> & {
    previewUrl?: string;
    ogPreviewUrl?: string;
    tags?: string[];
  };
}

interface CustomProps extends BaseProps {
  mode: 'custom';
  title: string;
  description: string;
  image?: string;
  /** 自訂頁的 path（決定 og:url / canonical），不傳則用當下 window.location.pathname */
  path?: string;
}

type Props = HomeProps | ToolProps | CustomProps;

/** 把相對路徑補成絕對 URL（社群爬蟲必要） */
function toAbsolute(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${SITE_URL}${path}`;
}

/** 把工具的 previewUrl 解析成「正確 base path + 加 cache version」的 URL */
function resolveToolImage(tool: ToolProps['tool'], version: string): string | undefined {
  // 優先用 ogPreviewUrl（1200×630 設計過），fallback 用 previewUrl（1024×1024 卡片）
  const raw = tool.ogPreviewUrl || tool.previewUrl;
  if (!raw) return undefined;
  const abs = toAbsolute(raw);
  if (!abs) return undefined;
  return `${abs}?v=${encodeURIComponent(version)}`;
}

export function PageHead(props: Props) {
  const version =
    props.cacheVersion ||
    String(import.meta.env.VITE_APP_VERSION || Date.now());

  // ── Tool mode ──
  if (props.mode === 'tool') {
    const { tool, isArticle = true } = props;
    const title = `${tool.title} · 阿凱老師教育工具`;
    const description = tool.description;
    const url = `${SITE_URL}/tool/${tool.id}`;
    const image = resolveToolImage(tool, version);
    const keywords = ['教育工具', tool.title, '阿凱老師', '石門國小', ...(tool.tags || [])].join(',');

    // Schema.org SoftwareApplication：讓 Google 搜尋結果出現星星評分 + 富片段
    // applicationCategory 對應到 GoogleSearch 認可的 EducationalApplication
    // offers price = 0 表示完全免費
    const softwareSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': `${url}#software`,
      name: tool.title,
      description: tool.description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web Browser',
      url,
      sameAs: tool.url,
      image: image || undefined,
      isAccessibleForFree: true,
      educationalUse: ['teaching', 'classroom activity', 'elementary education'],
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'teacher',
      },
      author: {
        '@type': 'Person',
        '@id': `${SITE_URL}/#akai`,
        name: '阿凱老師',
        affiliation: {
          '@type': 'EducationalOrganization',
          name: '桃園市龍潭區石門國民小學',
          alternateName: 'Shih Men Elementary School',
          url: 'https://www.smes.tyc.edu.tw/',
        },
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TWD',
        availability: 'https://schema.org/InStock',
      },
      keywords: keywords,
      inLanguage: 'zh-TW',
      // 簡化的 aggregateRating — 統一給「目前無評分但活躍中」訊息，未來接 toolReviews 真實統計
      // 暫不寫 aggregateRating（除非有真實評分，否則 Google 會降權處理）
    };

    return (
      <Helmet>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content={isArticle ? 'article' : 'website'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="科技教育創新專區" />
        <meta property="og:locale" content="zh_TW" />
        {image && <meta property="og:image" content={image} />}
        {image && <meta property="og:image:secure_url" content={image} />}
        {image && tool.ogPreviewUrl && <meta property="og:image:width" content="1200" />}
        {image && tool.ogPreviewUrl && <meta property="og:image:height" content="630" />}
        {image && !tool.ogPreviewUrl && tool.previewUrl && (
          <>
            <meta property="og:image:width" content="1024" />
            <meta property="og:image:height" content="1024" />
          </>
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}

        {/* Schema.org SoftwareApplication — Google rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify(softwareSchema)}
        </script>
      </Helmet>
    );
  }

  // ── Custom mode ──
  if (props.mode === 'custom') {
    const { title, description, image, path } = props;
    const pathPart = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const url = `${SITE_URL}${pathPart.startsWith('/Akai') ? pathPart.replace(/^\/Akai/, '') : pathPart}`;
    const finalImage = image ? `${toAbsolute(image)}?v=${encodeURIComponent(version)}` : undefined;

    return (
      <Helmet>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="科技教育創新專區" />
        <meta property="og:locale" content="zh_TW" />
        {finalImage && <meta property="og:image" content={finalImage} />}
        {finalImage && <meta property="og:image:secure_url" content={finalImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {finalImage && <meta name="twitter:image" content={finalImage} />}
      </Helmet>
    );
  }

  // ── Home mode ──
  // 首頁主要 meta 已寫在 client/index.html（避免 SSR vs CSR 不一致），
  // 這裡只在 React mount 後補上 cache-busted og:image（最新版本），
  // 並用 react-helmet-async 確保 SPA route 切換時還能正確切回首頁 meta。
  const { ogImage, toolCount } = props;
  const homeImage = toAbsolute(ogImage || DEFAULT_OG_FALLBACK);
  const versionedImage = homeImage ? `${homeImage}?v=${encodeURIComponent(version)}` : undefined;
  const displayCount = toolCount && toolCount >= 100 ? `${Math.floor(toolCount / 10) * 10}+` : '90+';
  const title = `科技教育創新專區 · 阿凱老師｜${displayCount} 款國小教育工具`;
  const description = `阿凱老師（桃園市石門國小）親手打造 ${displayCount} 款教育科技工具：課堂互動、AI 教案、閱讀評量、語文寫作、教育遊戲一站搞定，100% 免費無廣告。`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/`} />
      {versionedImage && <meta property="og:image" content={versionedImage} />}
      {versionedImage && <meta property="og:image:secure_url" content={versionedImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {versionedImage && <meta name="twitter:image" content={versionedImage} />}
    </Helmet>
  );
}
