import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://akai-e693f.web.app';

/**
 * 結構化數據元件
 * 使用 JSON-LD 格式增強 SEO 結構化數據
 */

// 網站結構化數據
export function WebsiteSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "教育科技創新專區",
        "alternateName": "Akai 阿凱老師教育工具",
        "url": SITE_URL,
        "description": "探索創新教育工具，提升教學效率與學生參與度",
        "inLanguage": "zh-TW",
        "publisher": {
            "@type": "Person",
            "name": "阿凱老師",
            "url": SITE_URL
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}

// 教育軟體結構化數據
interface SoftwareSchemaProps {
    name: string;
    description: string;
    url: string;
    category: string;
    rating?: number;
    ratingCount?: number;
}

export function SoftwareApplicationSchema({
    name,
    description,
    url,
    category,
    rating = 4.5,
    ratingCount = 100
}: SoftwareSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": name,
        "description": description,
        "url": url,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "TWD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating.toString(),
            "ratingCount": ratingCount.toString(),
            "bestRating": "5",
            "worstRating": "1"
        },
        "author": {
            "@type": "Person",
            "name": "阿凱老師"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}

// 麵包屑導航結構化數據
interface BreadcrumbItem {
    name: string;
    url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}

// 常見問題結構化數據
interface FAQItem {
    question: string;
    answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}

// 組織結構化數據
export function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "教育科技創新專區",
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.png`,
        "description": "提供創新教育科技工具，協助教師提升教學效率",
        "sameAs": [
            "https://github.com/cagoooo/Akai"
        ],
        "founder": {
            "@type": "Person",
            "name": "阿凱老師"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}

// 工具詳情頁結構化數據 (SoftwareApplication + BreadcrumbList)
interface ToolDetailSchemaProps {
    tool: {
        title: string;
        description: string;
        url: string;
        category: string;
    };
}

export function ToolDetailSchema({ tool }: ToolDetailSchemaProps) {
    const siteUrl = 'https://cagoooo.github.io/Akai';

    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.title,
        "description": tool.description,
        "url": tool.url,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "TWD"
        },
        "author": {
            "@type": "Person",
            "name": "阿凱老師"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "首頁",
                "item": siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": tool.category,
                "item": `${siteUrl}?category=${tool.category}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": tool.title,
                "item": tool.url
            }
        ]
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(softwareSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>
        </Helmet>
    );
}

// 所有工具的結構化數據 (優化後：合併為單一 ItemList 避免 48 個腳本注入，並使用 useMemo 避免重複計算)
import { tools } from '@/lib/data';
import { useMemo } from 'react';

export function AllToolsSchema() {
    const schemaContent = useMemo(() => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "教育工具清單",
            "description": "阿凱老師開發的各式教育科技工具",
            "numberOfItems": tools.length,
            "itemListElement": tools.map((tool, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "SoftwareApplication",
                    "name": tool.title,
                    "description": tool.description,
                    "url": tool.url,
                    "applicationCategory": "EducationalApplication",
                    "operatingSystem": "Web Browser"
                }
            }))
        };
        return JSON.stringify(schema);
    }, []);

    return (
        <Helmet>
            <script type="application/ld+json">
                {schemaContent}
            </script>
        </Helmet>
    );
}
