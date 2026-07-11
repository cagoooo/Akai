import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { tools } from '@/lib/data';

const SITE_URL = 'https://cagoooo.github.io/Akai';
const AUTHOR_URL = 'https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5';
const SCHOOL_NAME = '桃園市龍潭區石門國民小學';
const SITE_NAME = '科技教育創新專區';

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: `阿凱老師 · ${SITE_NAME}`,
    alternateName: ['阿凱老師教育工具集', 'Akai Educational Tools'],
    url: `${SITE_URL}/`,
    description: '阿凱老師在石門國小教學現場打造的免費教育科技工具集，收錄課堂互動、AI 教案、閱讀評量、語文寫作、教育遊戲與校園行政工具。',
    inLanguage: 'zh-TW',
    publisher: { '@id': `${SITE_URL}/#organization` },
    creator: { '@id': `${SITE_URL}/#akai` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

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
  rating,
  ratingCount,
}: SoftwareSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: category || 'EducationalApplication',
    operatingSystem: 'Web Browser',
    isAccessibleForFree: true,
    inLanguage: 'zh-TW',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
      availability: 'https://schema.org/InStock',
    },
    ...(rating && ratingCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    author: { '@id': `${SITE_URL}/#akai` },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ['阿凱老師教育工具集', 'Akai Educational Tools'],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/og-preview.png`,
    description: `${SCHOOL_NAME}阿凱老師建立的科技教育工具與教學情境長文專區，提供免費、免註冊、可直接用於國小教學現場的工具。`,
    sameAs: [
      AUTHOR_URL,
      'https://github.com/cagoooo',
      'https://github.com/cagoooo/Akai',
    ],
    founder: { '@id': `${SITE_URL}/#akai` },
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#akai`,
    name: '阿凱老師',
    alternateName: ['Akai', 'cagoooo'],
    url: `${SITE_URL}/`,
    sameAs: [AUTHOR_URL, 'https://github.com/cagoooo'],
    jobTitle: '國小教師 / 教育科技工具開發者',
    worksFor: {
      '@type': 'EducationalOrganization',
      name: SCHOOL_NAME,
      alternateName: 'Shih Men Elementary School',
      url: 'https://www.smes.tyc.edu.tw/',
    },
    knowsAbout: [
      '國小資訊教育',
      'AI 教育應用',
      '教育科技工具開發',
      'PIRLS 閱讀理解',
      '課堂互動',
      '校園行政數位化',
      'React',
      'Firebase',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
    </Helmet>
  );
}

interface ToolDetailSchemaProps {
  tool: {
    id?: number;
    title: string;
    description: string;
    url: string;
    category: string;
    tags?: string[];
  };
}

export function ToolDetailSchema({ tool }: ToolDetailSchemaProps) {
  const detailUrl = tool.id ? `${SITE_URL}/tool/${tool.id}` : tool.url;
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${detailUrl}#software`,
    name: tool.title,
    description: tool.description,
    url: detailUrl,
    sameAs: tool.url,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    isAccessibleForFree: true,
    inLanguage: 'zh-TW',
    keywords: [tool.category, ...(tool.tags || [])].join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
      availability: 'https://schema.org/InStock',
    },
    author: { '@id': `${SITE_URL}/#akai` },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool.category,
        item: `${SITE_URL}/?category=${encodeURIComponent(tool.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.title,
        item: detailUrl,
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}

export function AllToolsSchema() {
  const schemaContent = useMemo(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#tools`,
      name: '阿凱老師教育工具清單',
      description: '科技教育創新專區收錄的免費國小教育工具清單。',
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          '@id': `${SITE_URL}/tool/${tool.id}#software`,
          name: tool.title,
          description: tool.description,
          url: `${SITE_URL}/tool/${tool.id}`,
          sameAs: tool.url,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web Browser',
          isAccessibleForFree: true,
        },
      })),
    };
    return JSON.stringify(schema);
  }, []);

  return (
    <Helmet>
      <script type="application/ld+json">{schemaContent}</script>
    </Helmet>
  );
}
