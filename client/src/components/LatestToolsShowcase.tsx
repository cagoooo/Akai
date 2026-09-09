import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { EducationalTool } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';
import './latest-tools-showcase.css';

export function selectLatestTools(tools: EducationalTool[]) {
  const timestamp = (tool: EducationalTool) => {
    const value = Date.parse(tool.addedAt ?? '');
    return Number.isFinite(value) ? value : 0;
  };
  return [...tools].filter(tool => !tool.isInternal)
    .sort((a, b) => timestamp(b) - timestamp(a) || b.id - a.id).slice(0, 3);
}

export function LatestToolsShowcase({ tools, blocked, autoEligible, open, onOpenChange, onLocateTool }: {
  tools: EducationalTool[];
  blocked: boolean;
  autoEligible: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocateTool: (id: number) => void;
}) {
  const latest = useMemo(() => selectLatestTools(tools), [tools]);
  const signature = latest.map(tool => tool.id).join('-');
  const seen = useRef(new Set<string>());
  const trigger = useRef<HTMLButtonElement>(null);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const visible = open && !blocked;

  useEffect(() => {
    if (!visible || !signature) return;
    seen.current.add(signature);
    try { sessionStorage.setItem(`akai_latest_tools_v1:${signature}`, '1'); } catch { /* 本次頁面仍記住 */ }
    trackEvent('latest_tools_impression', { tool_ids: signature });
  }, [visible, signature]);

  useEffect(() => {
    if (blocked || !autoEligible || open || !signature || seen.current.has(signature)) return;
    try { if (sessionStorage.getItem(`akai_latest_tools_v1:${signature}`) === '1') return; } catch { /* 仍可展示 */ }
    const timer = window.setTimeout(() => onOpenChange(true), 1200);
    return () => window.clearTimeout(timer);
  }, [blocked, autoEligible, open, signature, onOpenChange]);

  if (!latest.length) return null;
  return <>
    <div className="latest-tools-entry">
      <button ref={trigger} type="button" disabled={blocked} onClick={() => onOpenChange(true)}>
        <span aria-hidden="true">📚</span> 最新上架 <span>看看最新 {latest.length} 個工具 →</span>
      </button>
    </div>
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent className="latest-tools-showcase" onCloseAutoFocus={event => {
        // 點卡片後由首頁負責定位；關閉介紹時回到重看入口。
        event.preventDefault();
        trigger.current?.focus({ preventScroll: true });
      }}>
        <div className="latest-tools-heading">
          <span className="latest-tools-label">阿凱老師的新工具展示架</span>
          <DialogTitle className="latest-tools-title">新上架，來翻翻看。</DialogTitle>
          <DialogDescription>為你的教學日常，帶來 {latest.length} 個新點子。挑一張卡片，看看能幫上什麼忙。</DialogDescription>
        </div>
        <div className="latest-tools-shelf">
          {latest.map((tool, index) => <button type="button" className="latest-tools-card" key={tool.id}
            onClick={() => {
              trackEvent('latest_tools_click', { tool_id: tool.id, rank: index + 1 });
              onOpenChange(false);
              onLocateTool(tool.id);
            }}>
            <div className="latest-tools-cover">
              {tool.previewUrl && !failedImages.includes(tool.id)
                ? <img src={`${import.meta.env.BASE_URL}previews/${tool.previewUrl.split('/').pop()}`} alt="" onError={() => setFailedImages(ids => [...ids, tool.id])} />
                : <span aria-hidden="true">📖</span>}
              <span className="latest-tools-number">新上架 · {String(index + 1).padStart(2, '0')}</span>
            </div>
            <strong>{tool.title}</strong>
            <p>{tool.description}</p>
            <span className="latest-tools-action">認識這個工具 →</span>
          </button>)}
        </div>
        <button className="latest-tools-dismiss" type="button" onClick={() => onOpenChange(false)}>先逛逛，稍後再看</button>
      </DialogContent>
    </Dialog>
  </>;
}
