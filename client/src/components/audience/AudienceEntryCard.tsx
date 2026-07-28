import { Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

/**
 * 首頁常駐的「找適合我的工具」入口。
 *
 * 為什麼需要：在這之前，推薦精靈**只有自動彈出這一條路**。訪客按了「稍後再說」，
 * 或這個瀏覽器 session 已經關過一次，首頁上就再也沒有任何地方能把它叫回來 ——
 * 使用者的感受是「我在網站上找不到選族群的地方」。
 *
 * 只在「還沒選過身分」時出現；已經選過的人上方有身分徽章與「重新設定」，
 * 不需要再多一張卡。
 */
export function AudienceEntryCard({ onStart }: { onStart: () => void }) {
    return (
        <div className="audience-entry-wrap">
            <button
                type="button"
                className="audience-entry"
                // 卡片內的 CTA 字樣是 aria-hidden 的裝飾，這裡補上完整的可及名稱
                aria-label="開啟推薦精靈，找出適合我的工具"
                onClick={() => {
                    trackEvent('audience_wizard_entry_click', { surface: 'home_card' });
                    onStart();
                }}
            >
                <span className="audience-entry__icon" aria-hidden="true"><Sparkles size={20} /></span>
                <span className="audience-entry__text">
                    <strong>不知道從哪個工具開始？</strong>
                    <small>花 20 秒說說你的身分與需求，幫你挑出最能幫上忙的幾個</small>
                </span>
                <span className="audience-entry__go" aria-hidden="true">找適合我的工具 →</span>
            </button>
        </div>
    );
}
