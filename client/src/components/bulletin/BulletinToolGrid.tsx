import { useMemo } from 'react';
import { BulletinToolCard } from './BulletinToolCard';
import type { EducationalTool } from '@/lib/data';

interface Props {
  tools: EducationalTool[];
}

/**
 * 拍立得工具網格：每張卡有略微隨機的傾斜與圖釘色，營造手工公佈欄感
 * 使用工具 ID 作為傾斜種子，確保每次渲染相同卡片的傾斜一致（避免閃爍）
 */
export function BulletinToolGrid({ tools }: Props) {
  // 依 ID 計算穩定的傾斜角度 (-3 ~ +3 度)
  const cardVariants = useMemo(() => {
    return tools.map((t) => ({
      tilt: (((t.id * 37) % 61) - 30) / 10,
      pinColorIndex: t.id % 6,
    }));
  }, [tools]);

  if (tools.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#8b7356',
          fontSize: 16,
          fontStyle: 'italic',
        }}
      >
        📌 公佈欄上還沒有符合條件的工具
      </div>
    );
  }

  return (
    <div
      className="bulletin-tool-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 28,
        padding: '20px 60px 60px',
        // 捲動對齊時保留上方呼吸空間，避免被固定在頂部的木條貼邊
        scrollMarginTop: 40,
      }}
      data-tour="tools-grid"
    >
      {tools.map((tool, i) => (
        <BulletinToolCard
          key={tool.id}
          tool={tool}
          tilt={cardVariants[i]?.tilt ?? 0}
          pinColorIndex={cardVariants[i]?.pinColorIndex ?? 0}
        />
      ))}
    </div>
  );
}
