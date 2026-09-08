import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { resolveInternalLink } from '@/lib/resolveLink';
import { tokens } from '@/design/tokens';

export default function BulletinToolMarkdown({ description }: { description: string }) {
  return (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p style={{ margin: '0 0 14px 0' }}>{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: tokens.ink,
                        margin: '20px 0 12px 0',
                        paddingBottom: 6,
                        borderBottom: `2px dashed ${tokens.accent}`,
                        fontFamily: tokens.font.tc,
                        lineHeight: 1.35,
                      }}
                    >
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h2
                      style={{
                        fontSize: 19,
                        fontWeight: 900,
                        color: tokens.ink,
                        margin: '22px 0 12px 0',
                        paddingBottom: 6,
                        borderBottom: `2px dashed ${tokens.accent}`,
                        fontFamily: tokens.font.tc,
                        lineHeight: 1.35,
                      }}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: tokens.accent,
                        margin: '16px 0 8px 0',
                        fontFamily: tokens.font.tc,
                        lineHeight: 1.35,
                      }}
                    >
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: tokens.accent, fontWeight: 800 }}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ color: tokens.navy, fontStyle: 'normal', fontWeight: 700 }}>
                      {children}
                    </em>
                  ),
                  ul: ({ children }) => (
                    <ul
                      style={{
                        margin: '10px 0 14px 0',
                        paddingLeft: 4,
                        listStyle: 'none',
                      }}
                    >
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol style={{ margin: '10px 0 14px 0', paddingLeft: 24 }}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li
                      style={{
                        marginBottom: 8,
                        paddingLeft: 22,
                        position: 'relative',
                        lineHeight: 1.7,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          color: tokens.accent,
                          fontWeight: 900,
                          fontSize: 16,
                        }}
                      >
                        ▸
                      </span>
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={resolveInternalLink(href)}
                      style={{ color: tokens.accent, textDecoration: 'underline', fontWeight: 700 }}
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code
                      style={{
                        background: '#fff3d6',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 14,
                        fontFamily: 'Menlo, Consolas, monospace',
                        color: tokens.ink,
                        border: '1px solid #e8d49a',
                      }}
                    >
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      style={{
                        borderLeft: `3px solid ${tokens.accent}`,
                        background: '#fff8ec',
                        padding: '8px 14px',
                        margin: '12px 0',
                        color: tokens.muted2,
                        fontStyle: 'italic',
                      }}
                    >
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr
                      style={{
                        border: 'none',
                        borderTop: `1px dashed ${tokens.muted}`,
                        margin: '16px 0',
                      }}
                    />
                  ),
                }}
              >
                {description.replace(/\n/g, '\n\n')}
              </ReactMarkdown>
  );
}
