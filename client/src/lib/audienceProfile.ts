export const AUDIENCE_TYPES = ['teacher', 'student'] as const;
export const SCHOOL_LEVELS = ['elementary', 'junior', 'senior'] as const;
export const TEACHER_ROLES = ['homeroom', 'subject', 'admin'] as const;
export const DEPARTMENTS = [
  'academic',
  'student-affairs',
  'general-affairs',
  'counseling',
  'other',
] as const;

export type AudienceType = (typeof AUDIENCE_TYPES)[number];
export type SchoolLevel = (typeof SCHOOL_LEVELS)[number];
export type TeacherRole = (typeof TEACHER_ROLES)[number];
export type Department = (typeof DEPARTMENTS)[number];

export interface AudienceProfile {
  audience: AudienceType;
  schoolLevel?: SchoolLevel;
  teacherRole?: TeacherRole;
  department?: Department;
}

export interface AudienceFit {
  audiences: AudienceType[];
  schoolLevels?: SchoolLevel[];
  teacherRoles?: TeacherRole[];
  departments?: Department[];
  painPoints: string[];
  priority: number;
  reasons: Partial<Record<AudienceType | TeacherRole | Department, string>>;
}

export function buildAudienceSegmentKey(profile: AudienceProfile): string {
  return [profile.audience, profile.schoolLevel, profile.teacherRole, profile.department]
    .filter(Boolean)
    .join('_');
}
