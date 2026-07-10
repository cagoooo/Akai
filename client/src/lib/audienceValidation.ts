import {
  AUDIENCE_TYPES,
  DEPARTMENTS,
  SCHOOL_LEVELS,
  TEACHER_ROLES,
} from './audienceProfile';

const PAIN_POINT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OPTIONAL_ARRAY_FIELDS = ['schoolLevels', 'teacherRoles', 'departments'] as const;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: UnknownRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function readStringArray(
  record: UnknownRecord,
  field: string,
  errors: string[],
  required: boolean,
): string[] | undefined {
  if (!hasOwn(record, field)) {
    if (required) errors.push(`缺少必要欄位：${field}`);
    return undefined;
  }

  const value = record[field];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    errors.push(`${field} 必須是字串陣列`);
    return undefined;
  }

  return value;
}

function validateUnique(values: readonly string[] | undefined, field: string, errors: string[]): void {
  if (values && new Set(values).size !== values.length) {
    errors.push(`${field} 不可包含重複值`);
  }
}

function validateEnumValues(
  values: readonly string[] | undefined,
  allowedValues: readonly string[],
  field: string,
  errors: string[],
): void {
  for (const value of values ?? []) {
    if (!allowedValues.includes(value)) {
      errors.push(`${field} 包含無效值：${value}`);
    }
  }
}

function hasUsableReason(reasons: UnknownRecord, keys: readonly string[]): boolean {
  return keys.some((key) => typeof reasons[key] === 'string' && reasons[key].trim().length > 0);
}

export function validateAudienceFit(input: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return ['客群資料必須是非 null 物件'];
  }

  const audiences = readStringArray(input, 'audiences', errors, true);
  const schoolLevels = readStringArray(input, 'schoolLevels', errors, false);
  const teacherRoles = readStringArray(input, 'teacherRoles', errors, false);
  const departments = readStringArray(input, 'departments', errors, false);
  const painPoints = readStringArray(input, 'painPoints', errors, true);

  for (const field of OPTIONAL_ARRAY_FIELDS) {
    const value = input[field];
    if (Array.isArray(value) && value.length === 0) {
      errors.push(`${field} 若無限制請省略欄位`);
    }
  }

  validateUnique(audiences, 'audiences', errors);
  validateUnique(schoolLevels, 'schoolLevels', errors);
  validateUnique(teacherRoles, 'teacherRoles', errors);
  validateUnique(departments, 'departments', errors);
  validateUnique(painPoints, 'painPoints', errors);

  validateEnumValues(audiences, AUDIENCE_TYPES, 'audiences', errors);
  validateEnumValues(schoolLevels, SCHOOL_LEVELS, 'schoolLevels', errors);
  validateEnumValues(teacherRoles, TEACHER_ROLES, 'teacherRoles', errors);
  validateEnumValues(departments, DEPARTMENTS, 'departments', errors);

  if (audiences?.length === 0) {
    errors.push('audiences 至少需要一項');
  }

  const hasValidAudiences = Boolean(
    audiences?.length && audiences.every((value) => (AUDIENCE_TYPES as readonly string[]).includes(value)),
  );
  const includesTeacher = audiences?.includes('teacher') ?? false;
  if (hasValidAudiences && !includesTeacher && schoolLevels?.length) {
    errors.push('非老師工具不可設定 schoolLevels');
  }
  if (hasValidAudiences && !includesTeacher && teacherRoles?.length) {
    errors.push('非老師工具不可設定 teacherRoles');
  }
  if (hasValidAudiences && !includesTeacher && departments?.length) {
    errors.push('非老師工具不可設定 departments');
  }
  if (departments?.length && teacherRoles?.length && !teacherRoles.includes('admin')) {
    errors.push('departments 僅可用於行政職務或未限定老師職務的工具');
  }

  if (painPoints?.length === 0) {
    errors.push('painPoints 至少需要一項');
  }
  if (painPoints?.some((painPoint) => !PAIN_POINT_PATTERN.test(painPoint))) {
    errors.push('painPoints 只能使用小寫英數與 dash');
  }

  if (!hasOwn(input, 'priority')) {
    errors.push('缺少必要欄位：priority');
  } else if (typeof input.priority !== 'number') {
    errors.push('priority 必須是數字');
  } else if (!Number.isFinite(input.priority) || input.priority < 0 || input.priority > 100) {
    errors.push('priority 必須介於 0 到 100');
  }

  let reasons: UnknownRecord | undefined;
  if (!hasOwn(input, 'reasons')) {
    errors.push('缺少必要欄位：reasons');
  } else if (!isRecord(input.reasons)) {
    errors.push('reasons 必須是物件');
  } else {
    reasons = input.reasons;
  }

  if (reasons) {
    const validReasonKeys: readonly string[] = [...AUDIENCE_TYPES, ...TEACHER_ROLES, ...DEPARTMENTS];
    for (const [key, value] of Object.entries(reasons)) {
      if (!validReasonKeys.includes(key)) {
        errors.push(`reasons 包含無效鍵：${key}`);
      }
      if (typeof value !== 'string') {
        errors.push(`reasons 的值必須是字串：${key}`);
      }
    }

    if (!hasUsableReason(reasons, validReasonKeys)) {
      errors.push('至少需要一則非空白理由');
    }
    if (audiences?.includes('student') && !hasUsableReason(reasons, ['student'])) {
      errors.push('學生客群至少需要一則非空白的學生理由');
    }
    const teacherReasonKeys = ['teacher', ...TEACHER_ROLES, ...DEPARTMENTS];
    if (audiences?.includes('teacher') && !hasUsableReason(reasons, teacherReasonKeys)) {
      errors.push('老師客群至少需要一則非空白的老師、職務或處室理由');
    }
  }

  return errors;
}
