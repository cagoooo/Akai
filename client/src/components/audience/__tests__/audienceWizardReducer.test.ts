import { describe, expect, it } from 'vitest';
import { audienceWizardReducer as reduce, initialAudienceWizardState, toAudienceProfile, PAIN_POINT_SELECTION_LIMIT } from '../audienceWizardReducer';

describe('audienceWizardReducer', () => {
  it('完成行政教師的完整選擇流程（含痛點步驟）', () => {
    let state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'teacher' });
    state = reduce(state, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
    state = reduce(state, { type: 'SELECT_TEACHER_ROLE', value: 'admin' });
    state = reduce(state, { type: 'SELECT_DEPARTMENT', value: 'academic' });
    expect(state.step).toBe('pain-points');
    state = reduce(state, { type: 'CONFIRM_PAIN_POINTS' });
    expect(state.step).toBe('results');
    expect(toAudienceProfile(state)).toEqual({ audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', department: 'academic' });
  });

  it('科任教師跳過處室，直接進痛點步驟再到結果', () => {
    let state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'teacher' });
    state = reduce(state, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
    state = reduce(state, { type: 'SELECT_TEACHER_ROLE', value: 'subject' });
    expect(state.step).toBe('pain-points');
    state = reduce(state, { type: 'CONFIRM_PAIN_POINTS' });
    expect(state.step).toBe('results');
    expect(toAudienceProfile(state)).toEqual({ audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject' });
  });

  it('學生直接進痛點步驟，勾選後帶進 profile，可返回起點', () => {
    let state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'student' });
    expect(state.step).toBe('pain-points');
    state = reduce(state, { type: 'TOGGLE_PAIN_POINT', value: 'student-practice' });
    state = reduce(state, { type: 'TOGGLE_PAIN_POINT', value: 'creative-learning' });
    state = reduce(state, { type: 'CONFIRM_PAIN_POINTS' });
    expect(state.step).toBe('results');
    expect(toAudienceProfile(state)).toEqual({ audience: 'student', painPoints: ['student-practice', 'creative-learning'] });
    // 從結果返回會回到痛點步驟並保留勾選
    const backToPains = reduce(state, { type: 'BACK' });
    expect(backToPains.step).toBe('pain-points');
    expect(backToPains.profile.painPoints).toEqual(['student-practice', 'creative-learning']);
    // 學生從痛點步驟再返回會回到起點
    expect(reduce(backToPains, { type: 'BACK' })).toEqual(initialAudienceWizardState);
  });

  it('痛點可重複切換移除，且不超過選擇上限', () => {
    let state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'student' });
    state = reduce(state, { type: 'TOGGLE_PAIN_POINT', value: 'student-practice' });
    state = reduce(state, { type: 'TOGGLE_PAIN_POINT', value: 'student-practice' }); // 再點一次移除
    expect(state.profile.painPoints).toEqual([]);
    // 連加超過上限
    const pains = ['student-practice', 'creative-learning', 'digital-literacy', 'language-learning'] as const;
    for (const p of pains) state = reduce(state, { type: 'TOGGLE_PAIN_POINT', value: p });
    expect(state.profile.painPoints).toHaveLength(PAIN_POINT_SELECTION_LIMIT);
    expect(state.profile.painPoints).toEqual(pains.slice(0, PAIN_POINT_SELECTION_LIMIT));
  });

  it('教師從痛點步驟返回會清掉痛點並回到前一個選擇步驟', () => {
    let state = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'teacher' });
    state = reduce(state, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
    state = reduce(state, { type: 'SELECT_TEACHER_ROLE', value: 'subject' });
    state = reduce(state, { type: 'TOGGLE_PAIN_POINT', value: 'classroom-management' });
    const back = reduce(state, { type: 'BACK' });
    expect(back.step).toBe('teacher-role');
    expect(back.profile.painPoints).toBeUndefined();
    expect(back.profile.teacherRole).toBeUndefined();
  });

  it('rejects choices that do not belong to the current step', () => {
    expect(reduce(initialAudienceWizardState, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' })).toBe(initialAudienceWizardState);
    const teacher = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'teacher' });
    expect(reduce(teacher, { type: 'SELECT_DEPARTMENT', value: 'academic' })).toBe(teacher);
    const level = reduce(teacher, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
    expect(reduce(level, { type: 'SELECT_DEPARTMENT', value: 'academic' })).toBe(level);
    // 不在痛點步驟時 TOGGLE_PAIN_POINT 不生效
    expect(reduce(level, { type: 'TOGGLE_PAIN_POINT', value: 'assessment' })).toBe(level);
  });
});
