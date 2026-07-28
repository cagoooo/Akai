/**
 * 族群引導精靈的「作答草稿」（P0-1）
 *
 * 痛點：訪客選到一半關掉精靈、或被任何原因重新整理，原本的 RESET 會把
 * 已選的學段／職務／痛點全部清空，回來得從第一題重選 —— 使用者的感受是
 * 「我剛剛選的都不見了」。
 *
 * 作法：作答中的每一步都寫進 sessionStorage，重開精靈時自動接續，
 * 並在畫面上明講「已接續上次進度」＋給一個「重新開始」的出口。
 *
 * 為什麼是 sessionStorage 不是 localStorage：草稿只在「這一次來訪」有意義，
 * 隔天再來身分可能就變了（代課、換職務），不該把舊答案硬塞回去。
 */

import type { AudienceProfile, AudienceType, Department, PainPoint, SchoolLevel, TeacherRole } from '@/lib/audienceProfile';
import type { AudienceWizardState, AudienceWizardStep } from '@/components/audience/audienceWizardReducer';

const DRAFT_KEY = 'akai_audience_wizard_draft_v1';
/** 草稿保鮮期：同一次來訪內接續才合理，隔太久就當作沒有 */
const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

/** 只有「作答中」的步驟值得存；thinking／results 已經算完成，returning 是回訪首畫面 */
const RESUMABLE_STEPS: AudienceWizardStep[] = ['audience', 'school-level', 'teacher-role', 'department', 'pain-points'];

const AUDIENCE_VALUES: AudienceType[] = ['teacher', 'student'];
const SCHOOL_LEVELS: SchoolLevel[] = ['elementary', 'junior', 'senior'];
const TEACHER_ROLES: TeacherRole[] = ['homeroom', 'subject', 'admin'];
const DEPARTMENTS: Department[] = ['academic', 'student-affairs', 'general-affairs', 'counseling', 'other'];

/** 這一步是不是「已經選了東西、值得存」 */
export function isResumableDraft(state: AudienceWizardState): boolean {
    if (!RESUMABLE_STEPS.includes(state.step)) return false;
    // 停在第一題且什麼都沒選 → 沒有進度可救，不必存
    return state.step !== 'audience' || state.profile.audience !== undefined;
}

export function writeWizardDraft(state: AudienceWizardState): void {
    try {
        if (!isResumableDraft(state)) { clearWizardDraft(); return; }
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step: state.step, profile: state.profile, savedAt: Date.now() }));
    } catch {
        // 隱私模式 / 配額不足：草稿是加分功能，失敗就當作沒有
    }
}

export function clearWizardDraft(): void {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* 同上 */ }
}

/**
 * 讀回草稿。任何一個欄位不合法就整份丟掉 ——
 * 寧可讓使用者重選，也不要把壞掉的 state 灌進 reducer 卡在中間步驟。
 */
export function readWizardDraft(now: number = Date.now()): AudienceWizardState | null {
    let raw: string | null = null;
    try { raw = sessionStorage.getItem(DRAFT_KEY); } catch { return null; }
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as { step?: unknown; profile?: unknown; savedAt?: unknown };
        if (typeof parsed.savedAt !== 'number' || now - parsed.savedAt > DRAFT_TTL_MS) { clearWizardDraft(); return null; }
        if (typeof parsed.step !== 'string' || !RESUMABLE_STEPS.includes(parsed.step as AudienceWizardStep)) { clearWizardDraft(); return null; }
        if (typeof parsed.profile !== 'object' || parsed.profile === null) { clearWizardDraft(); return null; }

        const source = parsed.profile as Record<string, unknown>;
        const profile: Partial<AudienceProfile> = {};
        if (AUDIENCE_VALUES.includes(source.audience as AudienceType)) profile.audience = source.audience as AudienceType;
        if (SCHOOL_LEVELS.includes(source.schoolLevel as SchoolLevel)) profile.schoolLevel = source.schoolLevel as SchoolLevel;
        if (TEACHER_ROLES.includes(source.teacherRole as TeacherRole)) profile.teacherRole = source.teacherRole as TeacherRole;
        if (DEPARTMENTS.includes(source.department as Department)) profile.department = source.department as Department;
        if (Array.isArray(source.painPoints)) profile.painPoints = source.painPoints.filter((item): item is PainPoint => typeof item === 'string');

        const restored: AudienceWizardState = { step: parsed.step as AudienceWizardStep, profile };
        // 存進去時合法，讀回來也必須仍然合法（例如 profile 欄位被清掉就不該停在後面的步驟）
        if (!isResumableDraft(restored) || !isStepReachable(restored)) { clearWizardDraft(); return null; }
        return restored;
    } catch {
        clearWizardDraft();
        return null;
    }
}

/** 這個 step 在 reducer 的流程圖上是否真的走得到（防手改 storage 或舊版格式） */
function isStepReachable(state: AudienceWizardState): boolean {
    const { audience, schoolLevel, teacherRole } = state.profile;
    switch (state.step) {
        case 'audience': return true;
        case 'school-level': return audience !== undefined;
        case 'teacher-role': return audience === 'teacher' && schoolLevel !== undefined;
        case 'department': return audience === 'teacher' && schoolLevel !== undefined && teacherRole === 'admin';
        case 'pain-points':
            if (audience === 'student') return schoolLevel !== undefined;
            return audience === 'teacher' && schoolLevel !== undefined && teacherRole !== undefined;
        default: return false;
    }
}
