/**
 * remark-gfm 的舊瀏覽器相容版。
 *
 * 問題：mdast-util-gfm-autolink-literal 把純文字 email 轉成連結時，用了「往回看」正規表示式
 * `(?<=^|\s|\p{P}|\p{S})`。Safari 16.4（iOS 16.4）以前不支援這種寫法，建置後會變成
 * `new RegExp(...)` 在解析 Markdown 時才丟 SyntaxError，整頁被 ErrorBoundary 換成錯誤畫面
 * （2026-11-11 JAVASCRIPT-REACT-2A：Safari 16.3 Mac 開 /tool/46）。工具介紹頁與每篇部落格文章都會用到。
 *
 * 做法：瀏覽器支援往回看就照原本的 remark-gfm；不支援時，語法擴充照樣全部掛上，
 * 只拿掉 autolink literal 的 transforms（那一步才會建立出問題的正規表示式）。
 * 舊瀏覽器上表格、刪除線、註腳、待辦清單照常顯示；網址與 email 仍由語法層辨識成連結，
 * 只少了補強用的轉換（少數邊界情況的純文字連結不會自動轉換）。
 */
import remarkGfm, { type Options } from 'remark-gfm';
import { gfm } from 'micromark-extension-gfm';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';

export function supportsRegexLookbehind(): boolean {
  try {
    new RegExp('(?<=a)b');
    return true;
  } catch {
    return false;
  }
}

type PluginData = Record<string, unknown[] | undefined>;

/** 依瀏覽器能力選擇完整 remark-gfm 或去掉 autolink literal 轉換的相容版；測試可傳入 false 模擬舊 Safari。 */
export function createRemarkGfmSafe(lookbehindSupported: boolean = supportsRegexLookbehind()) {
  // this 是 unified 的 Processor；寫成 unknown 才能放進 react-markdown 的 remarkPlugins
  return function remarkGfmSafe(this: unknown, options?: Options) {
    if (lookbehindSupported) {
      (remarkGfm as unknown as (this: unknown, options?: Options) => void).call(this, options);
      return;
    }
    const data = (this as { data(): PluginData }).data();
    (data.micromarkExtensions ||= []).push(gfm(options));
    (data.fromMarkdownExtensions ||= []).push(
      gfmFromMarkdown().map((extension) =>
        extension.transforms ? { ...extension, transforms: [] } : extension,
      ),
    );
    (data.toMarkdownExtensions ||= []).push(gfmToMarkdown(options));
  };
}

const remarkGfmSafe = createRemarkGfmSafe();
export default remarkGfmSafe;
