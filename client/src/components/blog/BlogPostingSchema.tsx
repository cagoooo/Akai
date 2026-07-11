import { Helmet } from 'react-helmet-async';

interface BlogPostingSchemaProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string; // ISO
  readingMinutes: number;
  body: string;
  tags?: string[];
  relatedTools?: Array<{
    id: number;
    title: string;
    description: string;
    url: string;
    category: string;
    tags?: string[];
  }>;
}

const SITE_URL = 'https://cagoooo.github.io/Akai';
const AUTHOR_NAME = '阿凱老師';
const AUTHOR_URL = 'https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5';
const PUBLISHER_NAME = '科技教育創新專區';
const PUBLISHER_LOGO = `${SITE_URL}/icon-512.png`;

/**
 * 為部落格文章內頁注入 schema.org BlogPosting JSON-LD。
 * Google / Bing 搜尋結果可顯示 rich snippet（作者、日期、reading time）。
 */
export function BlogPostingSchema({
  title,
  description,
  slug,
  publishedAt,
  readingMinutes,
  body,
  tags = [],
  relatedTools = [],
}: BlogPostingSchemaProps) {
  const url = `${SITE_URL}/blog/${slug}`;
  const wordCount = body.length; // 中文以字元數估算（en wordCount 不適用 CJK）
  const keywords = Array.from(
    new Set([
      ...tags,
      ...relatedTools.flatMap((tool) => [tool.title, ...(tool.tags || [])]),
      '阿凱老師',
      '科技教育創新專區',
      '石門國小',
      '教育工具',
    ].filter(Boolean))
  );
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: publishedAt,
    dateModified: publishedAt,
    inLanguage: 'zh-TW',
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    isAccessibleForFree: true,
    keywords: keywords.join(', '),
    image: `${SITE_URL}/og-preview.png`,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#akai`,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      jobTitle: '桃園市龍潭區石門國民小學教師 / 教育科技工具開發者',
      affiliation: {
        '@type': 'EducationalOrganization',
        name: '桃園市龍潭區石門國民小學',
        alternateName: 'Shih Men Elementary School',
        url: 'https://www.smes.tyc.edu.tw/',
      },
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: PUBLISHER_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
      },
    },
    about: relatedTools.map((tool) => ({
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/tool/${tool.id}#software`,
      name: tool.title,
      description: tool.description,
      url: `${SITE_URL}/tool/${tool.id}`,
      sameAs: tool.url,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web Browser',
      isAccessibleForFree: true,
      keywords: [tool.category, ...(tool.tags || [])].join(', '),
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
