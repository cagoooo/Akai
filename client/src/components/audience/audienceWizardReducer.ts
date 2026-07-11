import type { AudienceProfile, AudienceType, Department, PainPoint, SchoolLevel, TeacherRole } from '@/lib/audienceProfile';

export type AudienceWizardStep = 'audience' | 'school-level' | 'teacher-role' | 'department' | 'pain-points' | 'thinking' | 'results';
export type AudienceWizardState = { step: AudienceWizardStep; profile: Partial<AudienceProfile> };
export type AudienceWizardAction =
  | { type: 'SELECT_AUDIENCE'; value: AudienceType }
  | { type: 'SELECT_SCHOOL_LEVEL'; value: SchoolLevel }
  | { type: 'SELECT_TEACHER_ROLE'; value: TeacherRole }
  | { type: 'SELECT_DEPARTMENT'; value: Department }
  | { type: 'TOGGLE_PAIN_POINT'; value: PainPoint }
  | { type: 'CONFIRM_PAIN_POINTS' }
  | { type: 'THINKING_DONE' }
  | { type: 'BACK' }
  | { type: 'RESET' };

export const initialAudienceWizardState: AudienceWizardState = { step: 'audience', profile: {} };

/** 勾選上限：避免使用者全選導致痛點訊號失去區辨力 */
export const PAIN_POINT_SELECTION_LIMIT = 3;

function togglePainPoint(current: PainPoint[] | undefined, value: PainPoint): PainPoint[] {
  const list = current ?? [];
  if (list.includes(value)) return list.filter((item) => item !== value);
  if (list.length >= PAIN_POINT_SELECTION_LIMIT) return list; // 達上限則忽略新增
  return [...list, value];
}

export function audienceWizardReducer(state: AudienceWizardState, action: AudienceWizardAction): AudienceWizardState {
  switch (action.type) {
    case 'SELECT_AUDIENCE':
      if (state.step !== 'audience') return state;
      // 學生與老師都先選學段：學生（國小／國中）→ 痛點；老師 → 職務（P1-2）
      return { step: 'school-level', profile: { audience: action.value } };
    case 'SELECT_SCHOOL_LEVEL':
      if (state.step !== 'school-level' || state.profile.audience === undefined) return state;
      return state.profile.audience === 'student'
        ? { step: 'pain-points', profile: { ...state.profile, schoolLevel: action.value } }
        : { step: 'teacher-role', profile: { ...state.profile, schoolLevel: action.value } };
    case 'SELECT_TEACHER_ROLE':
      if (state.step !== 'teacher-role' || state.profile.audience !== 'teacher' || !state.profile.schoolLevel) return state;
      return { step: action.value === 'admin' ? 'department' : 'pain-points', profile: { ...state.profile, teacherRole: action.value } };
    case 'SELECT_DEPARTMENT':
      if (state.step !== 'department' || state.profile.audience !== 'teacher' || state.profile.teacherRole !== 'admin') return state;
      return { step: 'pain-points', profile: { ...state.profile, department: action.value } };
    case 'TOGGLE_PAIN_POINT':
      if (state.step !== 'pain-points') return state;
      return { ...state, profile: { ...state.profile, painPoints: togglePainPoint(state.profile.painPoints, action.value) } };
    case 'CONFIRM_PAIN_POINTS':
      if (state.step !== 'pain-points') return state;
      return { step: 'thinking', profile: state.profile };
    case 'THINKING_DONE':
      if (state.step !== 'thinking') return state;
      return { step: 'results', profile: state.profile };
    case 'BACK':
      // 結果 / 思考中 返回都回到痛點步驟（思考只是過場，不當作可停留的一站）
      if (state.step === 'results' || state.step === 'thinking') return { step: 'pain-points', profile: state.profile };
      if (state.step === 'pain-points') {
        if (state.profile.audience === 'student') return { step: 'school-level', profile: omit(state.profile, 'schoolLevel', 'painPoints') };
        if (state.profile.teacherRole === 'admin') return { step: 'department', profile: omit(state.profile, 'department', 'painPoints') };
        return { step: 'teacher-role', profile: omit(state.profile, 'teacherRole', 'department', 'painPoints') };
      }
      if (state.step === 'department') return { step: 'teacher-role', profile: omit(state.profile, 'teacherRole', 'department', 'painPoints') };
      if (state.step === 'teacher-role') return { step: 'school-level', profile: omit(state.profile, 'schoolLevel', 'teacherRole', 'department', 'painPoints') };
      if (state.step === 'school-level') return initialAudienceWizardState;
      return state;
    case 'RESET': return initialAudienceWizardState;
  }
}

function omit(profile: Partial<AudienceProfile>, ...keys: (keyof AudienceProfile)[]): Partial<AudienceProfile> {
  const next = { ...profile };
  keys.forEach((key) => delete next[key]);
  return next;
}

export function toAudienceProfile(state: AudienceWizardState): AudienceProfile | null {
  const { audience, schoolLevel, teacherRole, department, painPoints } = state.profile;
  const withPains = (base: AudienceProfile): AudienceProfile =>
    painPoints && painPoints.length > 0 ? { ...base, painPoints } : base;
  if (audience === 'student') return withPains(schoolLevel ? { audience, schoolLevel } : { audience });
  if (audience !== 'teacher' || !schoolLevel || !teacherRole || (teacherRole === 'admin' && !department)) return null;
  return withPains({ audience, schoolLevel, teacherRole, ...(department ? { department } : {}) });
}
