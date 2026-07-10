import {
  AUDIENCE_TYPES,
  DEPARTMENTS,
  SCHOOL_LEVELS,
  TEACHER_ROLES,
  type AudienceFit,
} from './audienceProfile';

const PAIN_POINT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateUnique(
  values: readonly string[] | undefined,
  field: string,
  errors: string[],
): void {
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

export function validateAudienceFit(audienceFit: AudienceFit): string[] {
  const errors: string[] = [];
  const { audiences, schoolLevels, teacherRoles, departments, painPoints, priority, reasons } =
    audienceFit;

  validateUnique(audiences, 'audiences', errors);
  validateUnique(schoolLevels, 'schoolLevels', errors);
  validateUnique(teacherRoles, 'teacherRoles', errors);
  validateUnique(departments, 'departments', errors);
  validateUnique(painPoints, 'painPoints', errors);

  validateEnumValues(audiences, AUDIENCE_TYPES, 'audiences', errors);
  validateEnumValues(schoolLevels, SCHOOL_LEVELS, 'schoolLevels', errors);
  validateEnumValues(teacherRoles, TEACHER_ROLES, 'teacherRoles', errors);
  validateEnumValues(departments, DEPARTMENTS, 'departments', errors);

  const includesTeacher = audiences.includes('teacher');
  if (!includesTeacher && schoolLevels !== undefined) {
    errors.push('非老師工具不可設定 schoolLevels');
  }
  if (!includesTeacher && teacherRoles !== undefined) {
    errors.push('非老師工具不可設定 teacherRoles');
  }
  if (!includesTeacher && departments !== undefined) {
    errors.push('非老師工具不可設定 departments');
  }
  if (departments !== undefined && teacherRoles !== undefined && !teacherRoles.includes('admin')) {
    errors.push('departments 僅可用於行政職務或未限定老師職務的工具');
  }

  if (painPoints.length === 0) {
    errors.push('painPoints 至少需要一項');
  }
  if (painPoints.some((painPoint) => !PAIN_POINT_PATTERN.test(painPoint))) {
    errors.push('painPoints 只能使用小寫英數與 dash');
  }
  if (!Number.isFinite(priority) || priority < 0 || priority > 100) {
    errors.push('priority 必須介於 0 到 100');
  }

  const validReasonKeys: readonly string[] = [...AUDIENCE_TYPES, ...TEACHER_ROLES, ...DEPARTMENTS];
  for (const key of Object.keys(reasons)) {
    if (!validReasonKeys.includes(key)) {
      errors.push(`reasons 包含無效鍵：${key}`);
    }
  }
  if (!Object.values(reasons).some((reason) => typeof reason === 'string' && reason.trim())) {
    errors.push('至少需要一則非空白理由');
  }

  return errors;
}
