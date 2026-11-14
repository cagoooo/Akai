import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildAgentPrompt, ensurePromptTools, hasMainTool, type PromptPost, type PromptTool } from '@/blog/agentPrompt';
import { trackEvent } from '@/lib/analytics';
import { HOME_CATALOGUE_QUERY_KEY, fetchHomeCatalogue } from '@/lib/toolCatalogue';

interface Props {
  post: PromptPost;
  /** 首頁輕量目錄裡跟這篇文章有關的工具；文章頁剛打開時可能還是空的 */
  tools: readonly PromptTool[];
}

/** 把「之後才會拿到的文字」寫進剪貼簿。
 * Safari 要求寫入剪貼簿必須發生在點擊當下，所以優先用 ClipboardItem 先佔位、文字晚點補上；
 * 不支援時才等文字好了再 writeText。 */
async function writeLaterText(textPromise: Promise<string>): Promise<void> {
  if (typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard.write === 'function') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/plain': textPromise.then((text) => new Blob([text], { type: 'text/plain' })) }),
      ]);
      return;
    } catch {
      /* 某些瀏覽器的 ClipboardItem 不收 Promise，改走下面的 writeText */
    }
  }
  await navigator.clipboard.writeText(await textPromise);
}

/**
 * 浮動按鈕：複製這篇文章專屬的 AI 開發提示詞（含工具原始碼 repo 連結），
 * 讓讀者貼給自己的 AI 助手，規劃改良成適合自己情境的小工具。
 */
export function BlogAgentPromptCopier({ post, tools }: Props) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (loading) return;
    try {
      if (hasMainTool(post, tools)) {
        await navigator.clipboard.writeText(buildAgentPrompt(post, tools));
      } else {
        // v3.6.216：工具目錄還在下載時，先等它載入，避免提示詞只剩「文章介紹的 #N 工具」
        setLoading(true);
        const textPromise = ensurePromptTools(post, tools, () =>
          queryClient.fetchQuery({
            queryKey: HOME_CATALOGUE_QUERY_KEY,
            queryFn: fetchHomeCatalogue,
            staleTime: 5 * 60 * 1000,
          }),
        ).then((list) => buildAgentPrompt(post, list));
        await writeLaterText(textPromise);
      }
      setCopied(true);
      trackEvent('blog_agent_prompt_copy', { slug: post.slug, tool_id: post.toolIds[0] });
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* 剪貼簿被瀏覽器拒絕時安靜失敗 */
    } finally {
      setLoading(false);
    }
  };

  const label = loading ? '準備提示詞中…' : copied ? '已複製！貼給你的 AI 助手' : '複製 AI 開發提示詞';

  return (
    <button
      type="button"
      className={`bp-template-copier${copied ? ' is-copied' : ''}`}
      onClick={handleCopy}
      aria-busy={loading}
      title="複製這個工具的 AI 開發提示詞（含 GitHub 原始碼連結），貼給 ChatGPT、Claude、Gemini 等 AI 助手，做出你自己的版本"
      aria-label="複製這個工具的 AI 開發提示詞"
    >
      <span aria-hidden="true">{loading ? '⏳' : copied ? '✓' : '🤖'}</span>
      <span aria-live="polite">{label}</span>
    </button>
  );
}
