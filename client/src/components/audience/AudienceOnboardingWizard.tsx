import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, ShieldCheck, X } from 'lucide-react';
import type { EducationalTool } from '@/lib/data';
import type { AudienceProfile, Department, PainPoint, SchoolLevel, TeacherRole } from '@/lib/audienceProfile';
import { buildAudienceSegmentKey } from '@/lib/audienceProfile';
import { recommendTools } from '@/lib/audienceRecommendation';
import { trackEvent, recordRecoImpression, recordRecoClick } from '@/lib/analytics';
import { AudienceRecommendationResults } from './AudienceRecommendationResults';
import { audienceWizardReducer, initialAudienceWizardState, toAudienceProfile, PAIN_POINT_SELECTION_LIMIT } from './audienceWizardReducer';

type Props = { open: boolean; tools: EducationalTool[]; onComplete: (profile: AudienceProfile) => void; onDismiss: () => void; onLocateTool: (toolId: number) => void };
const levels: [SchoolLevel, string][] = [['elementary', '國小老師'], ['junior', '國中老師'], ['senior', '高中老師']];
const roles: [TeacherRole, string][] = [['homeroom', '班級導師'], ['subject', '科任老師'], ['admin', '行政人員']];
const departments: [Department, string][] = [['academic', '教務處'], ['student-affairs', '學務處'], ['general-affairs', '總務處'], ['counseling', '輔導室'], ['other', '其他處室']];

// 痛點選項（emoji + 標籤），依 audience 呈現不同組合。value 對應 tools.json 的 audienceFit.painPoints
const teacherPains: [PainPoint, string, string][] = [
  ['lesson-planning', '📝', '備課與教學設計'],
  ['assessment', '✅', '出題與評量'],
  ['classroom-management', '🎯', '班級經營'],
  ['teacher-workload', '⚡', '減輕行政雜務'],
  ['communication', '💬', '親師溝通'],
  ['administration', '🗂️', '行政庶務'],
  ['reading-literacy', '📚', '閱讀素養'],
  ['creative-learning', '🎨', '創意教學'],
];
const studentPains: [PainPoint, string, string][] = [
  ['student-practice', '✏️', '自主練習'],
  ['creative-learning', '🎨', '動手創作'],
  ['digital-literacy', '💻', '數位素養'],
  ['language-learning', '🗣️', '語文學習'],
  ['reading-literacy', '📚', '閱讀理解'],
  ['presentation', '🎤', '上台報告'],
];

// P0-A：曝光去重存 sessionStorage（同一 profile 簽章一個瀏覽器 session 只計一次曝光），
// 避免關開精靈、上一步返回、dev StrictMode 重掛造成 dashboard 曝光分母灌水。
const IMPRESSION_DEDUP_PREFIX = 'akai_reco_imp_v1:';
function hasFiredImpression(signature: string): boolean {
  try { return sessionStorage.getItem(IMPRESSION_DEDUP_PREFIX + signature) === '1'; } catch { return false; }
}
function markImpressionFired(signature: string): void {
  try { sessionStorage.setItem(IMPRESSION_DEDUP_PREFIX + signature, '1'); } catch { /* ignore quota */ }
}

export function AudienceOnboardingWizard({ open, tools, onComplete, onDismiss, onLocateTool }: Props) {
  const [state, dispatch] = useReducer(audienceWizardReducer, initialAudienceWizardState);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const completedRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);
  const profile = toAudienceProfile(state);
  const recommendations = useMemo(() => profile ? recommendTools(tools, profile, 6) : [], [tools, profile]);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dispatch({ type: 'RESET' });
      completedRef.current = null;
      requestAnimationFrame(() => closeRef.current?.focus());
    }
    if (!open && wasOpenRef.current) {
      dispatch({ type: 'RESET' });
      completedRef.current = null;
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open]);
  // P0-4 埋點 + P0-A 修正：曝光每個「profile 簽章」在同一瀏覽器 session 內只計一次。
  // 用 sessionStorage（非 useRef）去重 → 關掉再開、從結果按上一步再回來、
  // dev StrictMode 重掛，都不會重複灌 dashboard 的曝光分母（CTR 才準確）。
  useEffect(() => {
    if (state.step !== 'results' || !profile || recommendations.length === 0) return;
    const signature = JSON.stringify(profile);
    if (hasFiredImpression(signature)) return;
    markImpressionFired(signature);
    const segment = buildAudienceSegmentKey(profile);
    trackEvent('audience_reco_impression', {
      segment,
      pain_points: (profile.painPoints ?? []).join('|') || 'none',
      tool_ids: recommendations.map((r) => r.tool.id).join(','),
      slots: recommendations.map((r) => r.slot).join(','),
    });
    // 同步聚合到 Firestore，供 admin 推薦成效 dashboard 計算 CTR（P1-6）
    recordRecoImpression({ segment, toolIds: recommendations.map((r) => r.tool.id) });
  }, [state.step, profile, recommendations]);
  // P0-4：推薦點擊埋點（含 slot / 名次 / 命中痛點數），再交給既有的定位邏輯
  const handleLocate = useCallback((toolId: number) => {
    if (profile) {
      const rank = recommendations.findIndex((r) => r.tool.id === toolId);
      const rec = rank >= 0 ? recommendations[rank] : undefined;
      const segment = buildAudienceSegmentKey(profile);
      const slot = rec?.slot ?? 'unknown';
      const matchedPains = rec?.matchedPainPoints ?? 0;
      trackEvent('audience_reco_click', { segment, tool_id: toolId, slot, rank: rank + 1, matched_pains: matchedPains });
      // 同步聚合到 Firestore（P1-6）
      recordRecoClick({ segment, toolId, slot, matchedPains });
    }
    onLocateTool(toolId);
  }, [profile, recommendations, onLocateTool]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onDismiss(); return; }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onDismiss]);
  useEffect(() => {
    if (state.step !== 'results' || !profile) return;
    const key = JSON.stringify(profile);
    if (completedRef.current === key) return;
    completedRef.current = key;
    onComplete(profile);
  }, [state.step, profile, onComplete]);
  if (!open) return null;
  const heading = state.step === 'audience' ? '先認識你，推薦會更準'
    : state.step === 'results' ? '為你準備的推薦工具'
    : state.step === 'pain-points' ? '你最想解決什麼？'
    : '告訴我一點你的工作情境';
  const subheading = state.step === 'audience' ? '花 20 秒，找出最適合你使用的教育科技工具。'
    : state.step === 'pain-points' ? `勾選最想解決的情境（可複選，最多 ${PAIN_POINT_SELECTION_LIMIT} 個），推薦會更對症下藥。也可以直接略過。`
    : '每個選擇都能讓推薦更貼近日常需要。';
  return <div ref={dialogRef} className="audience-wizard" role="dialog" aria-modal="true" aria-label="找到適合你的教育工具" onMouseDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}>
    <div className="audience-wizard__paper" tabIndex={-1}>
      <span className="audience-wizard__pin audience-wizard__pin--top" aria-hidden="true" />
      <button ref={closeRef} type="button" className="audience-wizard__close" onClick={onDismiss} aria-label="稍後再說"><X size={20} /></button>
      <div className="audience-wizard__progress" aria-label="引導進度"><span style={{ width: `${({ audience: 16, 'school-level': 34, 'teacher-role': 52, department: 68, 'pain-points': 84, results: 100 } as Record<string, number>)[state.step]}%` }} /></div>
      {state.step !== 'audience' && <button type="button" className="audience-wizard__back" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft size={17} /> 上一步</button>}
      <header><span className="audience-wizard__eyebrow">阿凱老師的工具小幫手</span><h1>{heading}</h1><p>{subheading}</p></header>
      {state.step === 'audience' && <Choices choices={[['teacher', '我是老師', '依學段與職務推薦', GraduationCap], ['student', '我是學生／小朋友', '探索好用小工具與遊戲', BookOpen]]} onChoose={(value) => dispatch({ type: 'SELECT_AUDIENCE', value: value as 'teacher' | 'student' })} />}
      {state.step === 'school-level' && <Choices choices={levels.map(([value, label]) => [value, label, '選擇任教學段', ShieldCheck])} onChoose={(value) => dispatch({ type: 'SELECT_SCHOOL_LEVEL', value: value as SchoolLevel })} />}
      {state.step === 'teacher-role' && <Choices choices={roles.map(([value, label]) => [value, label, value === 'admin' ? '再選擇所屬處室' : '直接取得專屬推薦', ShieldCheck])} onChoose={(value) => dispatch({ type: 'SELECT_TEACHER_ROLE', value: value as TeacherRole })} />}
      {state.step === 'department' && <Choices choices={departments.map(([value, label]) => [value, label, '取得行政工作推薦', ShieldCheck])} onChoose={(value) => dispatch({ type: 'SELECT_DEPARTMENT', value: value as Department })} />}
      {state.step === 'pain-points' && <PainPointPicker
        options={state.profile.audience === 'student' ? studentPains : teacherPains}
        selected={state.profile.painPoints ?? []}
        onToggle={(value) => dispatch({ type: 'TOGGLE_PAIN_POINT', value })}
        onConfirm={() => dispatch({ type: 'CONFIRM_PAIN_POINTS' })}
      />}
      {state.step === 'results' && <AudienceRecommendationResults recommendations={recommendations} onLocateTool={handleLocate} />}
      <button type="button" className="audience-wizard__later" onClick={onDismiss}>稍後再說，先逛逛</button>
    </div>
  </div>;
}

function PainPointPicker({ options, selected, onToggle, onConfirm }: {
  options: [PainPoint, string, string][];
  selected: PainPoint[];
  onToggle: (value: PainPoint) => void;
  onConfirm: () => void;
}) {
  const atLimit = selected.length >= PAIN_POINT_SELECTION_LIMIT;
  return <div className="audience-wizard__pains">
    <div className="audience-wizard__pain-chips" role="group" aria-label="想解決的情境">
      {options.map(([value, emoji, label]) => {
        const active = selected.includes(value);
        return <button
          key={value}
          type="button"
          className={`audience-wizard__pain-chip${active ? ' is-active' : ''}`}
          aria-pressed={active}
          disabled={!active && atLimit}
          onClick={() => onToggle(value)}
        ><span aria-hidden="true">{emoji}</span> {label}</button>;
      })}
    </div>
    <button type="button" className="audience-wizard__pain-confirm" onClick={onConfirm}>
      {selected.length > 0 ? `看推薦結果（已選 ${selected.length} 個）→` : '略過，直接看推薦 →'}
    </button>
  </div>;
}

function Choices({ choices, onChoose }: { choices: [string, string, string, typeof GraduationCap][]; onChoose: (value: string) => void }) {
  return <div className="audience-wizard__choices">{choices.map(([value, title, note, Icon], index) => <button key={value} type="button" className="audience-wizard__choice" onClick={() => onChoose(value)}>
    <span className="audience-wizard__pin" aria-hidden="true" /><Icon size={28} /><strong>{title}</strong><small>{note}</small><span>{index % 2 ? '選這個 →' : '開始選擇 →'}</span>
  </button>)}</div>;
}
