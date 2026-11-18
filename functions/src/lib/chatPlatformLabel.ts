/**
 * Google Chat 通知一律標出平台名稱。
 * 同一個 Chat 空間會收到剛好學、班級小管家、PIRLS…等多個系統的通知，
 * 手機推播只顯示最外層 text，所以 text 與每張卡片標題都要看得出是哪個平台（2026-11-18 使用者要求）。
 * 統一格式：text 是「表情符號 【平台名】內容」，卡片標題是「原標題｜平台名」。
 */
export const PLATFORM_NAME = "阿凱老師教育工具集";

// 開頭的表情符號（含膚色、變體選擇字元、ZWJ 組合）與後面的空白
const LEADING_EMOJI = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍(?:\p{Extended_Pictographic})|\p{Emoji_Modifier})*\s*)+/u;

/** 摘要文字：已含平台名就不動；否則把「【平台名】」插在開頭表情符號之後 */
export function withPlatformText(text: string, platform: string = PLATFORM_NAME): string {
    const value = String(text ?? "");
    if (value.includes(platform)) return value;
    const emoji = value.match(LEADING_EMOJI)?.[0] ?? "";
    const rest = value.slice(emoji.length).trimStart();
    const spacer = emoji && !/\s$/.test(emoji) ? " " : "";
    return `${emoji}${spacer}【${platform}】${rest}`;
}

/** 卡片標題：已含平台名就不動；否則在標題後加「｜平台名」。不改動傳入的物件 */
export function withPlatformCards<T>(cardsV2: T[] | undefined, platform: string = PLATFORM_NAME): T[] | undefined {
    if (!Array.isArray(cardsV2)) return cardsV2;
    return cardsV2.map((entry: any) => {
        const title = entry?.card?.header?.title;
        if (typeof title !== "string" || title.includes(platform)) return entry;
        return {
            ...entry,
            card: {
                ...entry.card,
                header: { ...entry.card.header, title: `${title}｜${platform}` },
            },
        };
    });
}
