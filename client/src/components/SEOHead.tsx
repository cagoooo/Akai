import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

const DEFAULT_TITLE = '教育科技創新專區 | Akai 艾凱老師';
const DEFAULT_DESCRIPTION = '探索 8 種創新教育工具，提升教學效率與學生參與度。包含 AI 學生評語產生器、互動式投票系統、課堂計時工具等實用教育科技工具。';
const DEFAULT_KEYWORDS = [
    '教育科技',
    '教學工具',
    'AI 教育',
    '學生評語',
    '課堂管理',
    '互動投票',
    '教師資源',
    '數位學習'
];
const SITE_URL = 'https://akai-e693f.web.app';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * SEO Head 元件
 * 動態設定頁面的 meta 標籤，優化搜尋引擎可見度
 */
export function SEOHead({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'website',
    author = '艾凱老師',
    publishedTime,
    modifiedTime
}: SEOHeadProps) {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} | 教育科技創新專區`;

    return (
        <Helmet>
            {/* 基本 Meta 標籤 */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <meta name="author" content={author} />
            <link rel="canonical" href={url} />

            {/* Open Graph (Facebook, LinkedIn) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content="教育科技創新專區" />
            <meta property="og:locale" content="zh_TW" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* 文章專用 (如有發佈時間) */}
            {publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}

            {/* 額外優化 */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="theme-color" content="#3b82f6" />
        </Helmet>
    );
}

/**
 * 工具頁面專用 SEO
 */
interface ToolSEOProps {
    toolName: string;
    toolDescription: string;
    toolUrl: string;
    category: string;
}

export function ToolSEO({ toolName, toolDescription, toolUrl, category }: ToolSEOProps) {
    return (
        <SEOHead
            title={toolName}
            description={toolDescription}
            keywords={[toolName, category, '教育工具', '教學資源', '艾凱老師']}
            url={toolUrl}
            type="product"
        />
    );
}
