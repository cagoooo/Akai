/**
 * 引導漏斗計算（P0-5）
 *
 * `analytics/recoStats.funnel` 早就有每個步驟的累積次數，但面板只是把數字
 * 由大到小列出來 —— 看得到「有多少人做了什麼」，看不到「在哪一步掉最多人」。
 * 這支把它整理成有順序的漏斗，並算出每一步的留存與流失。
 *
 * 關鍵細節：**不是每個人都會走過每一步**。學生不選職務、非行政老師不選處室，
 * 把這兩步塞進主漏斗會算出假的巨大流失。所以主漏斗只放「人人必經」的步驟，
 * 分支步驟另外列，並以「它的上游」為分母。
 */

/** 人人必經的主線步驟，依實際流程順序 */
const MAIN_STEPS: { key: string; label: string }[] = [
    { key: 'opened', label: '開啟精靈' },
    { key: 'audienceSelected', label: '選了身分' },
    { key: 'schoolLevelSelected', label: '選了學段' },
    { key: 'painPointsConfirmed', label: '確認想解決的情境' },
    { key: 'resultsShown', label: '看到推薦結果' },
];

/** 分支步驟：只有部分人會經過，分母是它的上游步驟 */
const BRANCH_STEPS: { key: string; label: string; parentKey: string; note: string }[] = [
    { key: 'teacherRoleSelected', label: '選了職務', parentKey: 'schoolLevelSelected', note: '只有老師會走到' },
    { key: 'departmentSelected', label: '選了處室', parentKey: 'teacherRoleSelected', note: '只有行政人員會走到' },
];

export interface FunnelStep {
    key: string;
    label: string;
    count: number;
    /** 相對第一步（開啟精靈）的留存率 % */
    retention: number;
    /** 相對前一步流失掉的人數 */
    dropped: number;
    /** 相對前一步的流失率 % */
    dropRate: number;
    /** 這一步是不是整條漏斗流失最嚴重的一段 */
    isBiggestDrop: boolean;
}

export interface FunnelBranch {
    key: string;
    label: string;
    note: string;
    count: number;
    /** 相對上游步驟的比例 %（不是流失率，是「多少人走了這條分支」） */
    shareOfParent: number;
}

export interface AudienceFunnel {
    steps: FunnelStep[];
    branches: FunnelBranch[];
    /** 開啟 → 看到結果的整體完成率 % */
    completionRate: number;
    /** 樣本是否足夠到可以下判斷 */
    hasEnoughSample: boolean;
}

/**
 * 把 funnelDaily 依日期區間加總；days = null 代表用累積總量（傳入的 fallback）。
 * 回傳 null 表示該區間沒有任何資料，呼叫端應改用累積值並提示「每日資料累積中」。
 */
export function sumFunnelDaily(
    funnelDaily: Record<string, Record<string, number>> | undefined,
    days: number | null,
    now: Date = new Date(),
): Record<string, number> | null {
    if (days === null || !funnelDaily) return null;
    const from = new Date(now);
    from.setDate(from.getDate() - (days - 1)); // 含今天共 days 天
    const fromStr = toLocalDate(from);

    const acc: Record<string, number> = {};
    let matched = false;
    for (const [date, events] of Object.entries(funnelDaily)) {
        if (date < fromStr) continue;
        matched = true;
        for (const [event, count] of Object.entries(events)) {
            acc[event] = (acc[event] ?? 0) + (count ?? 0);
        }
    }
    return matched ? acc : null;
}

function toLocalDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * @param funnel 各步驟的累積次數
 * @param minSample 少於這個開啟數就不下「哪一步最該修」的判斷，避免被幾筆資料帶著走
 */
export function buildAudienceFunnel(funnel: Record<string, number> | undefined, minSample = 20): AudienceFunnel {
    const source = funnel ?? {};
    const opened = source.opened ?? 0;

    const raw = MAIN_STEPS.map((step) => ({ ...step, count: source[step.key] ?? 0 }));

    // 聚合寫入有先後（例如 resultsShown 已進帳、painPointsConfirmed 還在路上），
    // 單調遞減不保證成立。強制讓後面的步驟不超過前面，漏斗才不會出現「越走越多人」。
    let ceiling = Number.POSITIVE_INFINITY;
    const normalized = raw.map((step) => {
        const count = Math.min(step.count, ceiling);
        ceiling = count;
        return { ...step, count };
    });

    const drops = normalized.map((step, index) => (index === 0 ? 0 : normalized[index - 1].count - step.count));
    const maxDrop = Math.max(0, ...drops);
    // 樣本太少時不指認「最大流失」，避免拿 3 個人的資料去改流程
    const biggestDropIndex = opened >= minSample && maxDrop > 0 ? drops.indexOf(maxDrop) : -1;

    const steps: FunnelStep[] = normalized.map((step, index) => {
        const previous = index === 0 ? step.count : normalized[index - 1].count;
        const dropped = drops[index];
        return {
            key: step.key,
            label: step.label,
            count: step.count,
            retention: opened > 0 ? (step.count / opened) * 100 : 0,
            dropped,
            dropRate: previous > 0 ? (dropped / previous) * 100 : 0,
            isBiggestDrop: index === biggestDropIndex,
        };
    });

    const branches: FunnelBranch[] = BRANCH_STEPS.map((branch) => {
        const parent = source[branch.parentKey] ?? 0;
        const count = source[branch.key] ?? 0;
        return {
            key: branch.key,
            label: branch.label,
            note: branch.note,
            count,
            shareOfParent: parent > 0 ? (count / parent) * 100 : 0,
        };
    });

    return {
        steps,
        branches,
        completionRate: opened > 0 ? ((source.resultsShown ?? 0) / opened) * 100 : 0,
        hasEnoughSample: opened >= minSample,
    };
}
