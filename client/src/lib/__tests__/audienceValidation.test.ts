import { describe, expect, it } from 'vitest';
import { validateAudienceFit } from '@/lib/audienceValidation';

describe('validateAudienceFit', () => {
  it.each([
    [undefined, '客群資料必須是非 null 物件'],
    [null, '客群資料必須是非 null 物件'],
  ])('輸入為 %s 時回報穩定錯誤且不拋例外', (input, expectedError) => {
    expect(() => validateAudienceFit(input)).not.toThrow();
    expect(validateAudienceFit(input)).toContain(expectedError);
  });

  it('回報缺少的必要欄位', () => {
    expect(validateAudienceFit({ audiences: ['teacher'] })).toEqual(
      expect.arrayContaining([
        '缺少必要欄位：painPoints',
        '缺少必要欄位：priority',
        '缺少必要欄位：reasons',
      ]),
    );
  });

  it('回報錯誤欄位型別且不拋例外', () => {
    const input = {
      audiences: 'teacher',
      schoolLevels: 'elementary',
      teacherRoles: [1],
      departments: false,
      painPoints: ['practice', null],
      priority: '90',
      reasons: [],
    };

    expect(() => validateAudienceFit(input)).not.toThrow();
    expect(validateAudienceFit(input)).toEqual(
      expect.arrayContaining([
        'audiences 必須是字串陣列',
        'schoolLevels 必須是字串陣列',
        'teacherRoles 必須是字串陣列',
        'departments 必須是字串陣列',
        'painPoints 必須是字串陣列',
        'priority 必須是數字',
        'reasons 必須是物件',
      ]),
    );
  });

  it('拒絕空 audiences 與明確存在的空選填陣列', () => {
    const errors = validateAudienceFit({
      audiences: [],
      schoolLevels: [],
      teacherRoles: [],
      departments: [],
      painPoints: ['practice'],
      priority: 60,
      reasons: { student: '協助學生練習' },
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        'audiences 至少需要一項',
        'schoolLevels 若無限制請省略欄位',
        'teacherRoles 若無限制請省略欄位',
        'departments 若無限制請省略欄位',
      ]),
    );
  });

  it('學生客群需要學生理由，不能只提供行政理由', () => {
    expect(
      validateAudienceFit({
        audiences: ['student'],
        painPoints: ['practice'],
        priority: 60,
        reasons: { admin: '方便管理者設定活動' },
      }),
    ).toContain('學生客群至少需要一則非空白的學生理由');
  });

  it('老師客群需要老師、職務或處室理由，不能只提供學生理由', () => {
    expect(
      validateAudienceFit({
        audiences: ['teacher'],
        painPoints: ['lesson-planning'],
        priority: 80,
        reasons: { student: '協助學生練習' },
      }),
    ).toContain('老師客群至少需要一則非空白的老師、職務或處室理由');
  });

  it('同時面向老師與學生時，兩邊都必須有可用理由', () => {
    expect(
      validateAudienceFit({
        audiences: ['teacher', 'student'],
        schoolLevels: ['elementary'],
        painPoints: ['classroom-activity'],
        priority: 75,
        reasons: { teacher: '方便老師帶領活動', student: '   ' },
      }),
    ).toContain('學生客群至少需要一則非空白的學生理由');

    expect(
      validateAudienceFit({
        audiences: ['teacher', 'student'],
        schoolLevels: ['elementary'],
        painPoints: ['classroom-activity'],
        priority: 75,
        reasons: { student: '讓學生參與活動' },
      }),
    ).toContain('老師客群至少需要一則非空白的老師、職務或處室理由');
  });

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
