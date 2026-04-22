import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { getCategoryLabel, getCategoryKey } from './toolAdapter';

interface Props {
  selected: string | null;
  onChange: (cat: string | null) => void;
  categoryCounts: Record<string, number>;
}

/**
 * 公佈欄風格分類徽章列
 * 保留既有 selectedCategory state，單純替換視覺
 */
export function BulletinCategoryFilter({ selected, onChange, categoryCounts }: Props) {
  const categories = Object.keys(categoryCounts).sort(
    (a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0)
  );

  return (
    <section
      className="bulletin-category-filter"
      style={{
        padding: '10px 60px 20px',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <Tape color={tokens.note.pink} angle={-2} width={180}>
          <span style={{ fontSize: 13 }}>📌 分類 · CATEGORIES</span>
        </Tape>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <CategoryBadge
          label="全部"
          count={Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
          isActive={selected === null}
          onClick={() => onChange(null)}
          color={tokens.ink}
          bg="#fff"
        />
        {categories.map((cat) => {
          const catKey = getCategoryKey(cat);
          const C = tokens.cat[catKey];
          return (
            <CategoryBadge
              key={cat}
              label={getCategoryLabel(cat)}
              count={categoryCounts[cat] || 0}
              isActive={selected === cat}
              onClick={() => onChange(cat === selected ? null : cat)}
              color={C.fg}
              bg={C.bg}
              dot={C.dot}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryBadge({
  label,
  count,
  isActive,
  onClick,
  color,
  bg,
  dot,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color: string;
  bg: string;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: isActive ? color : bg,
        color: isActive ? '#fff' : color,
        border: `2px solid ${color}`,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: tokens.font.tc,
        cursor: 'pointer',
        boxShadow: isActive ? '3px 3px 0 rgba(0,0,0,.25)' : '2px 2px 0 rgba(0,0,0,.12)',
        transform: isActive ? 'translateY(-1px)' : 'none',
        transition: 'all .15s ease',
      }}
    >
      {dot && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isActive ? '#fff' : dot,
          }}
        />
      )}
      <span>{label}</span>
      <span
        style={{
          fontFamily: tokens.font.en,
          fontSize: 11,
          fontWeight: 900,
          opacity: 0.8,
        }}
      >
        {count}
      </span>
    </button>
  );
}
