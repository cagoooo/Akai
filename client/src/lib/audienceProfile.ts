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
export const PAIN_POINTS = [
  'lesson-planning',
  'assessment',
  'classroom-management',
  'student-practice',
  'teacher-workload',
  'communication',
  'administration',
  'meeting-productivity',
  'content-creation',
  'presentation',
  'language-learning',
  'reading-literacy',
  'digital-literacy',
  'creative-learning',
  'event-management',
  'it-support',
  'media-production',
  'professional-learning',
  'accessibility',
  'resource-discovery',
] as const;

export type AudienceType = (typeof AUDIENCE_TYPES)[number];
export type SchoolLevel = (typeof SCHOOL_LEVELS)[number];
export type TeacherRole = (typeof TEACHER_ROLES)[number];
export type Department = (typeof DEPARTMENTS)[number];
export type PainPoint = (typeof PAIN_POINTS)[number];

/** 痛點的簡短中文標籤（推薦理由、精靈 chip、dashboard 共用） */
export const PAIN_POINT_LABELS: Record<PainPoint, string> = {
  'lesson-planning': '備課與教學設計',
  assessment: '出題與評量',
  'classroom-management': '班級經營',
  'student-practice': '自主練習',
  'teacher-workload': '減輕行政雜務',
  communication: '親師溝通',
  administration: '行政庶務',
  'meeting-productivity': '開會效率',
  'content-creation': '內容製作',
  presentation: '上台報告',
  'language-learning': '語文學習',
  'reading-literacy': '閱讀素養',
  'digital-literacy': '數位素養',
  'creative-learning': '創意學習',
  'event-management': '活動籌辦',
  'it-support': '資訊支援',
  'media-production': '影音製作',
  'professional-learning': '專業成長',
  accessibility: '無障礙輔助',
  'resource-discovery': '資源探索',
};

export interface AudienceProfile {
  audience: AudienceType;
  schoolLevel?: SchoolLevel;
  teacherRole?: TeacherRole;
  department?: Department;
  /** 使用者在推薦精靈勾選的「想解決的痛點」（可複選，可為空） */
  painPoints?: PainPoint[];
}

export interface AudienceFit {
  audiences: AudienceType[];
  schoolLevels?: SchoolLevel[];
  teacherRoles?: TeacherRole[];
  departments?: Department[];
  painPoints: PainPoint[];
  priority: number;
  reasons: Partial<Record<AudienceType | TeacherRole | Department, string>>;
}

export function buildAudienceSegmentKey(profile: AudienceProfile): string {
  return [profile.audience, profile.schoolLevel, profile.teacherRole, profile.department]
    .filter(Boolean)
    .join('_');
}
