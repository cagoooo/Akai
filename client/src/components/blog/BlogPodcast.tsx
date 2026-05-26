/**
 * BlogPodcast — 部落格文章 podcast 播放器
 *
 * 顯示位置：BlogHero 與正文 ReactMarkdown 之間
 * 條件：只在 /blog-podcasts/{slug}.mp3 真的存在時渲染
 * 設計：cork 風格便利貼，含 NotebookLM AI 生成 badge + 標準 HTML5 audio controls
 *
 * 檔案來源：透過 teaching-cockpit skill / NotebookLM MCP 生成的 podcast
 * 路徑慣例：H:\Akai\client\public\blog-podcasts\{slug}.mp3
 */

import { useEffect, useState } from 'react';
import { tokens } from '@/design/tokens';

interface BlogPodcastProps {
  slug: string;
}

export function BlogPodcast({ slug }: BlogPodcastProps) {
  const base = import.meta.env.BASE_URL || '/';
  const podcastUrl = `${base}blog-podcasts/${slug}.mp3`;
  const [exists, setExists] = useState<boolean | null>(null);
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    // HEAD 請求探測 podcast 是否存在
    fetch(podcastUrl, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        setExists(res.ok);
      })
      .catch(() => !cancelled && setExists(false));
    return () => {
      cancelled = true;
    };
  }, [podcastUrl]);

  // 不存在 → 不渲染（保持 layout 不變）
  if (!exists) return null;

  return (
    <aside
      data-testid="blog-podcast"
      style={{
        margin: '24px 0 32px',
        padding: '18px 22px',
        background: tokens.note.yellow,
        border: `2px solid ${tokens.ink}`,
        borderRadius: 10,
        boxShadow: '4px 4px 0 rgba(0,0,0,.18)',
        position: 'relative',
        fontFamily: tokens.font.tc,
      }}
      aria-label="本篇文章的 AI 生成 podcast"
    >
      {/* AI 生成 badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 800,
          color: tokens.muted2,
          letterSpacing: '0.08em',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: tokens.accent,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          🎙️ AI PODCAST
        </span>
        <span>由 NotebookLM 生成 · 兩位主持人對談形式</span>
      </div>

      {/* 標題 */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: tokens.ink,
          marginBottom: 8,
          letterSpacing: '0.02em',
        }}
      >
        🎧 聽 podcast 版本{duration && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: tokens.muted2 }}>（{duration}）</span>}
      </div>

      <div
        style={{
          fontSize: 12.5,
          color: tokens.muted2,
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        不想閱讀全文？聽兩位 AI 主持人用聊天方式解析這篇文章的重點，邊通勤邊吸收。
      </div>

      {/* HTML5 audio player */}
      <audio
        controls
        preload="metadata"
        src={podcastUrl}
        style={{
          width: '100%',
          borderRadius: 6,
        }}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (!isFinite(dur) || dur === 0) return;
          const m = Math.floor(dur / 60);
          const s = Math.floor(dur % 60);
          setDuration(`${m}:${String(s).padStart(2, '0')}`);
        }}
      >
        您的瀏覽器不支援 audio 元素，
        <a href={podcastUrl} download>
          點此下載 mp3
        </a>
      </audio>

      {/* 下載連結 */}
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <a
          href={podcastUrl}
          download
          style={{
            fontSize: 11,
            color: tokens.muted2,
            textDecoration: 'none',
            borderBottom: `1px dashed ${tokens.muted2}`,
          }}
        >
          ⬇ 下載 mp3 離線聽
        </a>
      </div>
    </aside>
  );
}
