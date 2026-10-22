import { useState } from 'react';
import { buildAgentPrompt, type PromptPost, type PromptTool } from '@/blog/agentPrompt';
import { trackEvent } from '@/lib/analytics';

interface Props {
  post: PromptPost;
  /** 首頁輕量目錄；還沒載入時提示詞只附工具編號與總 repo */
  tools: readonly PromptTool[];
}

/**
 * 浮動按鈕：複製這篇文章專屬的 AI 開發提示詞（含工具原始碼 repo 連結），
 * 讓讀者貼給自己的 AI 助手，規劃改良成適合自己情境的小工具。
 */
export function BlogAgentPromptCopier({ post, tools }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildAgentPrompt(post, tools));
      setCopied(true);
      trackEvent('blog_agent_prompt_copy', { slug: post.slug, tool_id: post.toolIds[0] });
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* 剪貼簿被瀏覽器拒絕時安靜失敗 */
    }
  };

  return (
    <button
      type="button"
      className={`bp-template-copier${copied ? ' is-copied' : ''}`}
      onClick={handleCopy}
      title="複製這個工具的 AI 開發提示詞（含 GitHub 原始碼連結），貼給 ChatGPT、Claude、Gemini 等 AI 助手，做出你自己的版本"
      aria-label="複製這個工具的 AI 開發提示詞"
    >
      <span aria-hidden="true">{copied ? '✓' : '🤖'}</span>
      <span aria-live="polite">{copied ? '已複製！貼給你的 AI 助手' : '複製 AI 開發提示詞'}</span>
    </button>
  );
}
