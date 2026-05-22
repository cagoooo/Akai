import { Link } from 'wouter';
import type { EducationalTool } from '@/lib/data';
import { getCategoryLabel } from '@/components/bulletin/toolAdapter';

interface BlogRelatedToolsProps {
  tools: EducationalTool[];
}

export function BlogRelatedTools({ tools }: BlogRelatedToolsProps) {
  if (!tools.length) return null;
  return (
    <section className="bp-related" aria-label="文章提到的工具">
      <div className="bp-related__label">🔗 文章提到的工具</div>
      <div className="bp-related__grid">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tool/${tool.id}`}
            className="bp-related-card"
          >
            <span className="bp-related-card__num">#{tool.id}</span>
            <span className="bp-related-card__title">{tool.title}</span>
            <span className="bp-related-card__cat">{getCategoryLabel(tool.category)}</span>
            <span className="bp-related-card__arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
