import type { AudienceProfile } from '@/lib/audienceProfile';

const schoolLevelLabel = {
  elementary: '國小',
  junior: '國中',
  senior: '高中',
} as const;

const teacherRoleLabel = {
  homeroom: '班級導師',
  subject: '科任老師',
  admin: '行政人員',
} as const;

const departmentLabel = {
  academic: '教務處',
  'student-affairs': '學務處',
  'general-affairs': '總務處',
  counseling: '輔導室',
  other: '其他處室',
} as const;

function profileLabel(profile: AudienceProfile) {
  if (profile.audience === 'student') return '學生／小朋友';
  return [
    profile.schoolLevel && schoolLevelLabel[profile.schoolLevel],
    profile.teacherRole && teacherRoleLabel[profile.teacherRole],
    profile.department && departmentLabel[profile.department],
  ].filter(Boolean).join('・');
}

export function AudienceProfileBadge({ profile, onReselect }: { profile: AudienceProfile; onReselect: () => void }) {
  return (
    <div className="audience-profile-badge" aria-label={`目前推薦身分：${profileLabel(profile)}`}>
      <span aria-hidden="true">📌</span>
      <span>依「{profileLabel(profile)}」推薦</span>
      <button type="button" onClick={onReselect} aria-label="重新設定推薦身分">重新設定</button>
    </div>
  );
}
