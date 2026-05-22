import { useEffect, useState } from 'react';

export interface Section {
  id: string;
  label: string;
}

/**
 * IntersectionObserver-based scrollspy。
 * 取「最頂端可見」的 heading id；視口 12% ~ 30% 區間為主觸發帶。
 */
export function useActiveSection(sections: Section[]): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);

  useEffect(() => {
    if (!sections.length) {
      setActiveId(undefined);
      return;
    }
    setActiveId(sections[0]?.id);
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: [0, 1] }
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
    // sections 由父層 memo；以序列簽章為 dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join('|')]);

  return activeId;
}
