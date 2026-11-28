import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { EducationalTool } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';
import './latest-tools-showcase.css';

const thumbnailPaths = JSON.parse(import.meta.env.VITE_LATEST_TOOL_PREVIEWS ?? '{}') as Record<string, string>;
const originalPreview = (tool: EducationalTool) => tool.previewUrl
  ? `${import.meta.env.BASE_URL}previews/${tool.previewUrl.split('/').pop()}` : undefined;
const shelfPreview = (tool: EducationalTool) => thumbnailPaths[tool.id]
  ? `${import.meta.env.BASE_URL}${thumbnailPaths[tool.id]}` : originalPreview(tool);

export function selectLatestTools(tools: EducationalTool[]) {
  const timestamp = (tool: EducationalTool) => {
    const value = Date.parse(tool.addedAt ?? '');
    return Number.isFinite(value) ? value : 0;
  };
  return [...tools].filter(tool => !tool.isInternal)
    .sort((a, b) => timestamp(b) - timestamp(a) || b.id - a.id).slice(0, 3);
}

/** 這一批新工具「已經提示過」：記在 localStorage，回訪不再提示，直到有新工具上架（批次簽章改變）。 */
const SEEN_KEY = (signature: string) => `akai_latest_tools_seen_v2:${signature}`;
/** 這一批新工具「已經打開展示架看過」：入口按鈕的 NEW 標記看過就拿掉。 */
const OPENED_KEY = (signature: string) => `akai_latest_tools_opened_v2:${signature}`;
/** 小提示自動收起的時間：讓它出現一下就好，不一直佔著畫面。 */
export const LATEST_NUDGE_AUTO_HIDE_MS = 12_000;
/** 訪客停手後再等多久才滑出小提示。 */
export const LATEST_NUDGE_DELAY_MS = 1_200;

function readFlag(key: string): boolean {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}
function writeFlag(key: string) {
  try { localStorage.setItem(key, '1'); } catch { /* 無痕或封鎖儲存：本次頁面仍記住 */ }
}

/**
 * 最新上架展示架。
 *
 * 2026-11-28 改版（使用者回饋「常被突然跳出的三張卡片嚇到、干擾閱讀」）：
 * - 不再自動彈出蓋滿畫面的大視窗；改成角落滑出一張小便利貼「📚 新上架 N 個工具」，
 *   不搶焦點、不鎖捲動、不加遮罩，12 秒後自己收起，按「看看」才打開展示架。
 * - 同一批新工具只提示一次（localStorage），回訪不再提示，有新工具上架才會再出現。
 * - 頁首的「最新上架」入口沒看過前帶 NEW 標記，隨時能手動打開。
 */
export function LatestToolsShowcase({ tools, blocked, autoEligible, open, onOpenChange, onLocateTool, onNudgeVisibleChange }: {
  tools: EducationalTool[];
  blocked: boolean;
  autoEligible: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocateTool: (id: number) => void;
  /** 小提示出現／收起時通知首頁，讓「第一次來嗎？」導覽卡等它收起再出現 */
  onNudgeVisibleChange?: (visible: boolean) => void;
}) {
  const latest = useMemo(() => selectLatestTools(tools), [tools]);
  const signature = latest.map(tool => tool.id).join('-');
  const seen = useRef(new Set<string>());
  const trigger = useRef<HTMLButtonElement>(null);
  const preloaded = useRef(new Map<string, HTMLLinkElement>());
  const [failedThumbnails, setFailedThumbnails] = useState<number[]>([]);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const visible = open && !blocked;
  const [nudge, setNudge] = useState(false);
  const nudgeShown = nudge && !blocked && !open;
  const [opened, setOpened] = useState(() => (signature ? readFlag(OPENED_KEY(signature)) : false));
  useEffect(() => { setOpened(signature ? readFlag(OPENED_KEY(signature)) : false); }, [signature]);

  useEffect(() => { onNudgeVisibleChange?.(nudgeShown); }, [nudgeShown, onNudgeVisibleChange]);

  useEffect(() => {
    // 小提示出現或展示架打開時，才預先下載這三張封面
    if (!nudgeShown && !visible) return;
    for (const tool of latest) {
      const src = shelfPreview(tool);
      if (!src || preloaded.current.has(src)) continue;
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.setAttribute('as', 'image');
      preload.fetchPriority = 'high';
      preload.href = src;
      preloaded.current.set(src, preload);
      document.head.appendChild(preload);
    }
  }, [latest, nudgeShown, visible]);

  useEffect(() => {
    const links = preloaded.current;
    return () => { links.forEach(link => link.remove()); links.clear(); };
  }, []);

  useEffect(() => {
    if (!visible || !signature) return;
    seen.current.add(signature);
    writeFlag(SEEN_KEY(signature));
    writeFlag(OPENED_KEY(signature));
    setOpened(true);
    setNudge(false);
    trackEvent('latest_tools_impression', { tool_ids: signature });
  }, [visible, signature]);

  // 自動提示：只滑出角落小便利貼，不自動打開大視窗
  useEffect(() => {
    if (blocked || !autoEligible || open || nudge || !signature || seen.current.has(signature)) return;
    if (readFlag(SEEN_KEY(signature))) return;
    const timer = window.setTimeout(() => {
      seen.current.add(signature);
      writeFlag(SEEN_KEY(signature));
      setNudge(true);
      trackEvent('latest_tools_nudge_impression', { tool_ids: signature });
    }, LATEST_NUDGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [blocked, autoEligible, open, nudge, signature]);

  useEffect(() => {
    if (!nudge) return;
    const timer = window.setTimeout(() => setNudge(false), LATEST_NUDGE_AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [nudge]);

  // 工具目錄還沒載入時先佔住入口的位置，載入後入口出現才不會把英雄區往下推
  if (!tools.length) return <div className="latest-tools-entry latest-tools-entry--pending" aria-hidden="true" />;
  if (!latest.length) return null;
  return <>
    <div className="latest-tools-entry">
      <button ref={trigger} type="button" disabled={blocked} onClick={() => onOpenChange(true)}>
        <span aria-hidden="true">📚</span> 最新上架
        {!opened && <em className="latest-tools-new">NEW</em>}
        <span>看看最新 {latest.length} 個工具 →</span>
      </button>
    </div>
    {nudgeShown && <aside className="latest-tools-nudge" aria-label="新上架工具提示">
      <button type="button" className="latest-tools-nudge__open" onClick={() => {
        trackEvent('latest_tools_nudge_click', { tool_ids: signature });
        onOpenChange(true);
      }}>
        <span className="latest-tools-nudge__icon" aria-hidden="true">📚</span>
        <span className="latest-tools-nudge__text">
          <strong>新上架 {latest.length} 個工具</strong>
          <small>最新：{latest[0].title.split('｜')[0]}</small>
        </span>
        <span className="latest-tools-nudge__go">看看 →</span>
      </button>
      <button type="button" className="latest-tools-nudge__close" aria-label="關閉新上架提示"
        onClick={() => setNudge(false)}>×</button>
    </aside>}
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
                ? <img src={failedThumbnails.includes(tool.id) ? originalPreview(tool) : shelfPreview(tool)}
                    alt="" loading="eager" fetchPriority="high" decoding="async" width={640} height={640}
                    onError={() => {
                      if (thumbnailPaths[tool.id] && !failedThumbnails.includes(tool.id)) {
                        setFailedThumbnails(ids => [...ids, tool.id]);
                      } else setFailedImages(ids => [...ids, tool.id]);
                    }} />
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
