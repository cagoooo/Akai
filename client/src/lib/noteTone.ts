/**
 * 便利貼色調輪盤 —— 讓公佈欄上的卡片像「一疊手邊隨手抽的便利貼」，
 * 而不是左綠右藍的兩色棋盤格。
 *
 * 設計原則：
 * 1. 一次能看到的卡片盡量不撞色 —— 先把整個色盤洗牌再依序發，
 *    6 張卡就是 6 種顏色，滿版一眼看過去最繽紛。
 * 2. 每一批有自己的隨機感 —— 洗牌用 seed 決定，換一批推薦 / 換一題身分
 *    就會換一套排列，但同一批重新 render 時顏色不會亂跳（動畫才不會閃）。
 * 3. 接色盤時連傾斜角一起換，避免所有卡片同角度看起來像格線。
 */

/** 色盤大小；需與 tokens.css 的 [data-tone="0..5"] 對齊 */
export const NOTE_TONE_COUNT = 6;

/** 字串／數字 → 32-bit 正整數種子（FNV-1a 變體，穩定且分佈夠散） */
export function toneSeed(input: string | number): number {
    const text = String(input);
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

/** mulberry32：小巧的可重現亂數，同 seed 永遠給同一串 */
function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * 產生長度 count 的色調序列（值域 0..NOTE_TONE_COUNT-1）。
 * 每 NOTE_TONE_COUNT 張為一輪洗牌，同一輪內顏色不重複；
 * 跨輪銜接處也會避免和前一張同色，不會出現兩張並排撞色。
 */
export function noteToneSequence(count: number, seed: string | number): number[] {
    if (count <= 0) return [];
    const random = createRandom(toneSeed(seed));
    const result: number[] = [];

    while (result.length < count) {
        const bag = Array.from({ length: NOTE_TONE_COUNT }, (_, i) => i);
        // Fisher–Yates
        for (let i = bag.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        // 跨輪銜接：新一輪第一張若和上一張同色，跟第二張對調
        const previous = result[result.length - 1];
        if (previous !== undefined && bag[0] === previous && bag.length > 1) {
            [bag[0], bag[1]] = [bag[1], bag[0]];
        }
        result.push(...bag);
    }

    return result.slice(0, count);
}
