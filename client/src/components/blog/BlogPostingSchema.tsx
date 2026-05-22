import { Helmet } from 'react-helmet-async';

interface BlogPostingSchemaProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string; // ISO
  readingMinutes: number;
  body: string;
  tags?: string[];
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
}: BlogPostingSchemaProps) {
  const url = `${SITE_URL}/blog/${slug}`;
  const wordCount = body.length; // 中文以字元數估算（en wordCount 不適用 CJK）
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: publishedAt,
    dateModified: publishedAt,
    inLanguage: 'zh-TW',
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    keywords: tags.join(', '),
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      jobTitle: '教育科技創新者 · 國小資訊教師',
      affiliation: {
        '@type': 'EducationalOrganization',
        name: '桃園市龍潭區石門國民小學',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
      },
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
