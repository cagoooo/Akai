import { describe, expect, it } from 'vitest';
import { audienceWizardReducer as reduce, initialAudienceWizardState, toAudienceProfile } from '../audienceWizardReducer';

describe('audienceWizardReducer', () => {
  it('完成行政教師的完整選擇流程', () => {
    let state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'teacher' });
    state = reduce(state, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
    state = reduce(state, { type: 'SELECT_TEACHER_ROLE', value: 'admin' });
    state = reduce(state, { type: 'SELECT_DEPARTMENT', value: 'academic' });
    expect(state.step).toBe('results');
    expect(toAudienceProfile(state)).toEqual({ audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', department: 'academic' });
  });
  it('學生不分年齡，直接前往結果並可返回', () => {
    const state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'student' });
    expect(state.step).toBe('results');
    expect(reduce(state, { type: 'BACK' })).toEqual(initialAudienceWizardState);
  });
  it('rejects choices that do not belong to the current step', () => {
    expect(reduce(initialAudienceWizardState, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' })).toBe(initialAudienceWizardState);
    const teacher = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'teacher' });
    expect(reduce(teacher, { type: 'SELECT_DEPARTMENT', value: 'academic' })).toBe(teacher);
    const level = reduce(teacher, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
    expect(reduce(level, { type: 'SELECT_DEPARTMENT', value: 'academic' })).toBe(level);
  });
});
