import { useMemo } from 'react';
import type { Section } from './useActiveSection';

/**
 * 把純文字 heading slugify 成 id。
 * 規則：保留中文 / 英數 / 連字號，其他字元（含空白、標點、emoji）→ `-`，多個連續 `-` 收斂、頭尾 trim。
 * 同一篇文章內若出現重複 slug，給後者加 `-2` / `-3` 後綴避免 id 衝突。
 */
/**
 * 規則：保留 ASCII 英數 + CJK 漢字 (U+4E00-U+9FFF) + 連字號；其他字元 → `-`，多 `-` 收斂。
 * 不使用 `\p{L}` Unicode property escape 以兼容舊 TS target。
 */
export function slugifyHeading(text: string): string {
  const cleaned = text
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9一-鿿-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return cleaned || 'section';
}

/**
 * 從 markdown body 抽出所有 H2 標題，產生 sections 陣列。
 * 與 ReactMarkdown h2 renderer 使用同一個 slugify 函式，確保 id 對齊。
 */
export function useExtractedSections(markdown: string | undefined): Section[] {
  return useMemo(() => {
    if (!markdown) return [];
    const lines = markdown.split('\n');
    const sections: Section[] = [];
    const used = new Map<string, number>();
    let inFence = false;
    for (const raw of lines) {
      const line = raw.trimEnd();
      // 跳過 ``` code fence 內的內容（避免抓到註解或範例 ##）
      if (/^```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) continue;
      const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
      if (!m) continue;
      // 去掉 markdown 內聯標記（**bold** / `code` / [text](url)）以拿純文字 label
      const label = m[1]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .trim();
      let id = slugifyHeading(label);
      const seen = used.get(id) || 0;
      if (seen > 0) id = `${id}-${seen + 1}`;
      used.set(id, seen + 1);
      sections.push({ id, label });
    }
    return sections;
  }, [markdown]);
}
