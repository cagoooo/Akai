import type { AudienceProfile, AudienceType, Department, SchoolLevel, TeacherRole } from '@/lib/audienceProfile';

export type AudienceWizardStep = 'audience' | 'school-level' | 'teacher-role' | 'department' | 'results';
export type AudienceWizardState = { step: AudienceWizardStep; profile: Partial<AudienceProfile> };
export type AudienceWizardAction =
  | { type: 'SELECT_AUDIENCE'; value: AudienceType }
  | { type: 'SELECT_SCHOOL_LEVEL'; value: SchoolLevel }
  | { type: 'SELECT_TEACHER_ROLE'; value: TeacherRole }
  | { type: 'SELECT_DEPARTMENT'; value: Department }
  | { type: 'BACK' }
  | { type: 'RESET' };

export const initialAudienceWizardState: AudienceWizardState = { step: 'audience', profile: {} };

export function audienceWizardReducer(state: AudienceWizardState, action: AudienceWizardAction): AudienceWizardState {
  switch (action.type) {
    case 'SELECT_AUDIENCE':
      if (state.step !== 'audience') return state;
      return action.value === 'student'
        ? { step: 'results', profile: { audience: 'student' } }
        : { step: 'school-level', profile: { audience: 'teacher' } };
    case 'SELECT_SCHOOL_LEVEL':
      if (state.step !== 'school-level' || state.profile.audience !== 'teacher') return state;
      return { step: 'teacher-role', profile: { ...state.profile, schoolLevel: action.value } };
    case 'SELECT_TEACHER_ROLE':
      if (state.step !== 'teacher-role' || state.profile.audience !== 'teacher' || !state.profile.schoolLevel) return state;
      return { step: action.value === 'admin' ? 'department' : 'results', profile: { ...state.profile, teacherRole: action.value } };
    case 'SELECT_DEPARTMENT':
      if (state.step !== 'department' || state.profile.audience !== 'teacher' || state.profile.teacherRole !== 'admin') return state;
      return { step: 'results', profile: { ...state.profile, department: action.value } };
    case 'BACK':
      if (state.step === 'results' && state.profile.audience === 'student') return initialAudienceWizardState;
      if (state.step === 'results' && state.profile.teacherRole !== 'admin') return { step: 'teacher-role', profile: omit(state.profile, 'teacherRole', 'department') };
      if (state.step === 'results') return { step: 'department', profile: omit(state.profile, 'department') };
      if (state.step === 'department') return { step: 'teacher-role', profile: omit(state.profile, 'teacherRole', 'department') };
      if (state.step === 'teacher-role') return { step: 'school-level', profile: omit(state.profile, 'schoolLevel', 'teacherRole', 'department') };
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
  const { audience, schoolLevel, teacherRole, department } = state.profile;
  if (audience === 'student') return { audience };
  if (audience !== 'teacher' || !schoolLevel || !teacherRole || (teacherRole === 'admin' && !department)) return null;
  return { audience, schoolLevel, teacherRole, ...(department ? { department } : {}) };
}
