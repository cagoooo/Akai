import { beforeEach, describe, expect, it } from 'vitest';
import { clearWizardDraft, isResumableDraft, readWizardDraft, writeWizardDraft } from '../audienceWizardDraft';
import type { AudienceWizardState } from '@/components/audience/audienceWizardReducer';

const DRAFT_KEY = 'akai_audience_wizard_draft_v1';

const midway: AudienceWizardState = {
    step: 'pain-points',
    profile: { audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject', painPoints: ['assessment'] },
};

const collegeMidway: AudienceWizardState = {
    step: 'pain-points',
    profile: { audience: 'student', schoolLevel: 'college', painPoints: ['presentation'] },
};

describe('audienceWizardDraft', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('存得起來也讀得回來（選到一半的進度不會消失）', () => {
        writeWizardDraft(midway);
        expect(readWizardDraft()).toEqual(midway);
    });

    it('可恢復大學學生的學段草稿', () => {
        writeWizardDraft(collegeMidway);
        expect(readWizardDraft()).toEqual(collegeMidway);
    });

    it('停在第一題什麼都沒選不算進度，不寫草稿', () => {
        writeWizardDraft({ step: 'audience', profile: {} });
        expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
        expect(isResumableDraft({ step: 'audience', profile: {} })).toBe(false);
    });

    it('已經看到結果就不留草稿（那一輪已經完成）', () => {
        writeWizardDraft(midway);
        writeWizardDraft({ step: 'results', profile: midway.profile });
        expect(readWizardDraft()).toBeNull();
    });

    it('超過保鮮期的草稿視為沒有', () => {
        writeWizardDraft(midway);
        expect(readWizardDraft(Date.now() + 3 * 60 * 60 * 1000)).toBeNull();
        expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it('走不到的步驟（手改 storage）整份丟掉，不讓 reducer 卡在中間', () => {
        // 停在處室選擇，卻沒有 teacherRole=admin → 流程上到不了這一步
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step: 'department', profile: { audience: 'teacher' }, savedAt: Date.now() }));
        expect(readWizardDraft()).toBeNull();
    });

    it('壞掉的 JSON 不會炸，直接當作沒有草稿', () => {
        sessionStorage.setItem(DRAFT_KEY, '{ not json');
        expect(readWizardDraft()).toBeNull();
    });

    it('不認識的欄位值會被濾掉', () => {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
            step: 'pain-points',
            profile: { audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject', department: '不存在的處室' },
            savedAt: Date.now(),
        }));
        const restored = readWizardDraft();
        expect(restored?.profile.department).toBeUndefined();
        expect(restored?.profile.teacherRole).toBe('subject');
    });

    it('clear 之後就讀不到了', () => {
        writeWizardDraft(midway);
        clearWizardDraft();
        expect(readWizardDraft()).toBeNull();
    });
});
