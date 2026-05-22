/**
 * BlogCodeBlock — react-markdown 內 fenced code block 的渲染器
 *
 * 用 react-syntax-highlighter 的 PrismLight + 註冊常用語言（避免引入完整 Prism）
 * theme 用 vscDarkPlus，配合 .bp-article pre 已有的圓角 / shadow / padding
 */
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('xml', markup);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml);
SyntaxHighlighter.registerLanguage('sql', sql);

interface BlogCodeBlockProps {
  language?: string;
  code: string;
}

export function BlogCodeBlock({ language, code }: BlogCodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language || 'text'}
      style={vscDarkPlus}
      customStyle={{
        margin: '24px 0',
        padding: '18px 20px',
        borderRadius: 10,
        fontSize: 13.5,
        lineHeight: 1.6,
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        boxShadow: '0 4px 12px -4px rgba(0,0,0,.2)',
      }}
      codeTagProps={{
        style: {
          fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
          fontSize: 13.5,
        },
      }}
      showLineNumbers={code.split('\n').length > 6}
      lineNumberStyle={{
        minWidth: '2.5em',
        paddingRight: '1em',
        color: '#6b5e4a',
        opacity: 0.6,
        userSelect: 'none',
      }}
    >
      {code.replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
}
