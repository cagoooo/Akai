import { describe, expect, it } from 'vitest';
import { validateAudienceFit } from '@/lib/audienceValidation';

describe('validateAudienceFit', () => {
  it('允許跨學段與跨職務的老師工具', () => {
    expect(
      validateAudienceFit({
        audiences: ['teacher'],
        schoolLevels: ['elementary', 'junior', 'senior'],
        teacherRoles: ['homeroom', 'subject', 'admin'],
        departments: ['academic', 'student-affairs'],
        painPoints: ['meeting-notes'],
        priority: 90,
        reasons: { teacher: '適合不同學段與職務的老師使用' },
      }),
    ).toEqual([]);
  });

  it('拒絕學生工具設定老師職務', () => {
    expect(
      validateAudienceFit({
        audiences: ['student'],
        teacherRoles: ['homeroom'],
        painPoints: ['practice'],
        priority: 60,
        reasons: { student: '協助學生練習' },
      }),
    ).toContain('非老師工具不可設定 teacherRoles');
  });

  it('分別回報空痛點、超出範圍的優先度與空理由', () => {
    const errors = validateAudienceFit({
      audiences: ['teacher'],
      painPoints: [],
      priority: 101,
      reasons: {},
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        'painPoints 至少需要一項',
        'priority 必須介於 0 到 100',
        '至少需要一則非空白理由',
      ]),
    );
  });

  it('拒絕不符合格式的痛點鍵與重複陣列值', () => {
    const errors = validateAudienceFit({
      audiences: ['teacher', 'teacher'],
      schoolLevels: ['elementary', 'elementary'],
      painPoints: ['Meeting Notes', 'Meeting Notes'],
      priority: 50,
      reasons: { teacher: '適合老師' },
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        'audiences 不可包含重複值',
        'schoolLevels 不可包含重複值',
        'painPoints 不可包含重複值',
        'painPoints 只能使用小寫英數與 dash',
      ]),
    );
  });

  it('只有行政職務或未限定老師職務時可設定處室', () => {
    expect(
      validateAudienceFit({
        audiences: ['teacher'],
        teacherRoles: ['subject'],
        departments: ['academic'],
        painPoints: ['curriculum-planning'],
        priority: 70,
        reasons: { subject: '協助科任老師備課' },
      }),
    ).toContain('departments 僅可用於行政職務或未限定老師職務的工具');

    expect(
      validateAudienceFit({
        audiences: ['teacher'],
        departments: ['academic'],
        painPoints: ['school-management'],
        priority: 80,
        reasons: { academic: '協助教務行政' },
      }),
    ).toEqual([]);
  });

  it('拒絕列舉以外的值', () => {
    const errors = validateAudienceFit({
      audiences: ['parent'],
      schoolLevels: ['college'],
      teacherRoles: ['principal'],
      departments: ['library'],
      painPoints: ['planning'],
      priority: 50,
      reasons: { parent: '家長使用' },
    } as never);

    expect(errors).toEqual(
      expect.arrayContaining([
        'audiences 包含無效值：parent',
        'schoolLevels 包含無效值：college',
        'teacherRoles 包含無效值：principal',
        'departments 包含無效值：library',
        'reasons 包含無效鍵：parent',
      ]),
    );
  });
});
