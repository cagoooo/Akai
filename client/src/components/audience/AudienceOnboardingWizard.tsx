import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, ShieldCheck, X } from 'lucide-react';
import type { EducationalTool } from '@/lib/data';
import type { AudienceProfile, Department, PainPoint, SchoolLevel, TeacherRole } from '@/lib/audienceProfile';
import { buildAudienceSegmentKey, PAIN_POINT_LABELS } from '@/lib/audienceProfile';
import { recommendTools } from '@/lib/audienceRecommendation';
import { trackEvent, recordAudienceFunnelEvent, recordAudiencePainPointSelection, recordAudienceSelection, recordRecoImpression, recordRecoClick } from '@/lib/analytics';
import { AudienceRecommendationResults } from './AudienceRecommendationResults';
import { audienceWizardReducer, initialAudienceWizardState, toAudienceProfile, PAIN_POINT_SELECTION_LIMIT } from './audienceWizardReducer';

type Props = { open: boolean; tools: EducationalTool[]; onComplete: (profile: AudienceProfile) => void; onDismiss: () => void; onLocateTool: (toolId: number) => void; recentToolIds?: number[] };
const levels: [SchoolLevel, string][] = [['elementary', '國小老師'], ['junior', '國中老師'], ['senior', '高中老師']];
// P1-2 學生學段（只列有工具資料的國小／國中；影響推薦過濾）
const studentLevels: [SchoolLevel, string][] = [['elementary', '國小'], ['junior', '國中']];
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

export function AudienceOnboardingWizard({ open, tools, onComplete, onDismiss, onLocateTool, recentToolIds }: Props) {
  const [state, dispatch] = useReducer(audienceWizardReducer, initialAudienceWizardState);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRecommendationRef = useRef<HTMLButtonElement | null>(null);
  const reshufflePendingRef = useRef(false);
  const dismissedRef = useRef(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const completedRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);
  // P1-1「換一批」：累積已看過的工具 id，讓下一波推薦排除它們（同家族一併排除）
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const seenKeyRef = useRef('');
  const profile = toAudienceProfile(state);
  const profileKey = profile ? JSON.stringify(profile) : '';
  // profile 改變（回上一步改答案再確認）→ 清空已看清單，重新從第一波開始
  useEffect(() => {
    if (profileKey !== seenKeyRef.current) {
      seenKeyRef.current = profileKey;
      setSeenIds([]);
    }
  }, [profileKey]);
  const excludeSet = useMemo(() => new Set(seenIds), [seenIds]);
  const recentSet = useMemo(() => new Set(recentToolIds ?? []), [recentToolIds]);
  const recommendations = useMemo(
    () => (profile ? recommendTools(tools, profile, 6, excludeSet, recentSet) : []),
    [tools, profile, excludeSet, recentSet],
  );
  useEffect(() => {
    if (!reshufflePendingRef.current || state.step !== 'results') return;
    reshufflePendingRef.current = false;
    const frame = requestAnimationFrame(() => {
      firstRecommendationRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [recommendations, state.step]);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dispatch({ type: 'RESET' });
      completedRef.current = null;
      reshufflePendingRef.current = false;
      dismissedRef.current = false;
      setSeenIds([]);
      void recordAudienceFunnelEvent('opened');
      requestAnimationFrame(() => closeRef.current?.focus());
    }
    if (!open && wasOpenRef.current) {
      dispatch({ type: 'RESET' });
      completedRef.current = null;
      reshufflePendingRef.current = false;
      setSeenIds([]);
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
    const signature = JSON.stringify({ profile, toolIds: recommendations.map((r) => r.tool.id) });
    if (hasFiredImpression(signature)) return;
    markImpressionFired(signature);
    const segment = buildAudienceSegmentKey(profile);
    trackEvent('audience_reco_impression', {
      segment,
      pain_points: (profile.painPoints ?? []).join('|') || 'none',
      tool_ids: recommendations.map((r) => r.tool.id).join(','),
      slots: recommendations.map((r) => r.slot).join(','),
    });
    void recordAudienceFunnelEvent('resultsShown');
    // 同步聚合到 Firestore，供 admin 推薦成效 dashboard 計算 CTR（P1-6）
    void recordRecoImpression({ segment, toolIds: recommendations.map((r) => r.tool.id), surface: 'wizard' });
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
      void recordRecoClick({ segment, toolId, slot, matchedPains, painPoints: profile.painPoints, surface: 'wizard' });
    }
    onLocateTool(toolId);
  }, [profile, recommendations, onLocateTool]);
  const handleDismiss = useCallback(() => {
    if (!dismissedRef.current) {
      dismissedRef.current = true;
      void recordAudienceFunnelEvent('dismissed', state.step);
    }
    onDismiss();
  }, [onDismiss, state.step]);
  // P1-1：換一批 — 把目前這批加進「已看過」，下一波排除它們；看完一輪就重新洗牌
  const handleReshuffle = useCallback(() => {
    if (!profile || recommendations.length === 0) return;
    reshufflePendingRef.current = true;
    const currentIds = recommendations.map((r) => r.tool.id);
    const nextSeen = [...seenIds, ...currentIds];
    const nextBatch = recommendTools(tools, profile, 6, new Set(nextSeen), recentSet);
    trackEvent('audience_reco_reshuffle', {
      segment: buildAudienceSegmentKey(profile),
      seen_count: nextSeen.length,
      wrapped: nextBatch.length === 0,
    });
    void recordAudienceFunnelEvent('reshuffled');
    // 沒有更多沒看過的工具 → 清空重來，再洗一輪（無限換一批）
    setSeenIds(nextBatch.length === 0 ? [] : nextSeen);
  }, [profile, recommendations, seenIds, tools, recentSet]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); handleDismiss(); return; }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleDismiss]);
  useEffect(() => {
    if (state.step !== 'results' || !profile) return;
    const key = JSON.stringify(profile);
    if (completedRef.current === key) return;
    completedRef.current = key;
    onComplete(profile);
  }, [state.step, profile, onComplete]);
  if (!open) return null;
  const isStudent = state.profile.audience === 'student';
  const heading = state.step === 'audience' ? '先認識你，推薦會更準'
    : state.step === 'results' ? '為你準備的推薦工具'
    : state.step === 'pain-points' ? '你最想解決什麼？'
    : state.step === 'school-level' && isStudent ? '你現在是幾年級呢？'
    : '告訴我一點你的工作情境';
  const subheading = state.step === 'audience' ? '花 20 秒，找出最適合你使用的教育科技工具。'
    : state.step === 'pain-points' ? `勾選最想解決的情境（可複選，最多 ${PAIN_POINT_SELECTION_LIMIT} 個），推薦會更對症下藥。也可以直接略過。`
    : state.step === 'school-level' && isStudent ? '選你的學段，推薦會更符合你的程度。'
    : '每個選擇都能讓推薦更貼近日常需要。';
  return <div ref={dialogRef} className="audience-wizard" role="dialog" aria-modal="true" aria-label="找到適合你的教育工具" onMouseDown={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}>
    <div className="audience-wizard__paper" tabIndex={-1}>
      <span className="audience-wizard__pin audience-wizard__pin--top" aria-hidden="true" />
      <button ref={closeRef} type="button" className="audience-wizard__close" onClick={handleDismiss} aria-label="稍後再說"><X size={20} /></button>
      <div className="audience-wizard__progress" aria-label="引導進度"><span style={{ width: `${({ audience: 14, 'school-level': 30, 'teacher-role': 46, department: 60, 'pain-points': 76, thinking: 90, results: 100 } as Record<string, number>)[state.step]}%` }} /></div>
      {state.step !== 'audience' && state.step !== 'thinking' && <button type="button" className="audience-wizard__back" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft size={17} /> 上一步</button>}
      {state.step !== 'thinking' && <header><span className="audience-wizard__eyebrow">阿凱老師的工具小幫手</span><h1>{heading}</h1><p>{subheading}</p></header>}
      {state.step === 'audience' && <Choices choices={[['teacher', '我是老師', '依學段與職務推薦', GraduationCap], ['student', '我是學生／小朋友', '探索好用小工具與遊戲', BookOpen]]} onChoose={(value) => { void recordAudienceSelection('audience', value); dispatch({ type: 'SELECT_AUDIENCE', value: value as 'teacher' | 'student' }); }} />}
      {state.step === 'school-level' && (isStudent
        ? <Choices choices={studentLevels.map(([value, label]) => [value, label, '選你的學段', BookOpen])} onChoose={(value) => { void recordAudienceSelection('schoolLevels', value); dispatch({ type: 'SELECT_SCHOOL_LEVEL', value: value as SchoolLevel }); }} />
        : <Choices choices={levels.map(([value, label]) => [value, label, '選擇任教學段', ShieldCheck])} onChoose={(value) => { void recordAudienceSelection('schoolLevels', value); dispatch({ type: 'SELECT_SCHOOL_LEVEL', value: value as SchoolLevel }); }} />)}
      {state.step === 'teacher-role' && <Choices choices={roles.map(([value, label]) => [value, label, value === 'admin' ? '再選擇所屬處室' : '直接取得專屬推薦', ShieldCheck])} onChoose={(value) => { void recordAudienceSelection('teacherRoles', value); dispatch({ type: 'SELECT_TEACHER_ROLE', value: value as TeacherRole }); }} />}
      {state.step === 'department' && <Choices choices={departments.map(([value, label]) => [value, label, '取得行政工作推薦', ShieldCheck])} onChoose={(value) => { void recordAudienceSelection('departments', value); dispatch({ type: 'SELECT_DEPARTMENT', value: value as Department }); }} />}
      {state.step === 'pain-points' && <PainPointPicker
        options={state.profile.audience === 'student' ? studentPains : teacherPains}
        selected={state.profile.painPoints ?? []}
        onToggle={(value) => dispatch({ type: 'TOGGLE_PAIN_POINT', value })}
        onConfirm={() => { void recordAudiencePainPointSelection(state.profile.painPoints ?? []); dispatch({ type: 'CONFIRM_PAIN_POINTS' }); }}
      />}
      {state.step === 'thinking' && <ThinkingReveal
        profile={state.profile}
        toolCount={tools.length}
        onDone={() => dispatch({ type: 'THINKING_DONE' })}
      />}
      {state.step === 'results' && <AudienceRecommendationResults recommendations={recommendations} onLocateTool={handleLocate} onReshuffle={handleReshuffle} firstRecommendationRef={firstRecommendationRef} />}
      {state.step !== 'thinking' && <button type="button" className="audience-wizard__later" onClick={handleDismiss}>稍後再說，先逛逛</button>}
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

// ── 「為你量身思考中」過場（專屬族群的分析動畫） ─────────────────────────
const LEVEL_SHORT: Record<SchoolLevel, string> = { elementary: '國小', junior: '國中', senior: '高中' };
const ROLE_SHORT: Record<TeacherRole, string> = { homeroom: '導師', subject: '科任老師', admin: '行政人員' };
const DEPT_SHORT: Record<Department, string> = { academic: '教務處', 'student-affairs': '學務處', 'general-affairs': '總務處', counseling: '輔導室', other: '其他處室' };

/** 產生對使用者可讀的族群短標籤，例如「國小科任老師」「國小教務處行政人員」「學生／小朋友」 */
function userSegmentLabel(profile: Partial<AudienceProfile>): string {
  if (profile.audience === 'student') return '學生／小朋友';
  const lvl = profile.schoolLevel ? LEVEL_SHORT[profile.schoolLevel] : '';
  if (profile.teacherRole === 'admin') {
    const dept = profile.department ? DEPT_SHORT[profile.department] : '';
    return `${lvl}${dept}行政人員`;
  }
  const role = profile.teacherRole ? ROLE_SHORT[profile.teacherRole] : '老師';
  return `${lvl}${role}`;
}

type ThinkingStep = { icon: string; text: string };
function buildThinkingSteps(profile: Partial<AudienceProfile>, toolCount: number): ThinkingStep[] {
  const seg = userSegmentLabel(profile);
  const pains = (profile.painPoints ?? []).map((p) => PAIN_POINT_LABELS[p]).filter(Boolean);
  return [
    { icon: '🔎', text: `讀取你的身分：${seg}` },
    pains.length > 0
      ? { icon: '🎯', text: `鎖定你在意的：${pains.join('、')}` }
      : { icon: '🧭', text: '為你張羅各種好用的小工具' },
    { icon: '📚', text: `比對 ${toolCount} 個教育工具的適配度` },
    { icon: '🔥', text: '參考排行榜熱門與這週趨勢' },
    { icon: '✨', text: '排出最適合你的 6 個' },
  ];
}

const THINKING_STEP_MS = 520;

function ThinkingReveal({ profile, toolCount, onDone }: { profile: Partial<AudienceProfile>; toolCount: number; onDone: () => void }) {
  const steps = useMemo(() => buildThinkingSteps(profile, toolCount), [profile, toolCount]);
  const [active, setActive] = useState(0); // 已「打勾完成」的步驟數
  const doneRef = useRef(false);
  const finish = useCallback(() => { if (!doneRef.current) { doneRef.current = true; onDone(); } }, [onDone]);

  useEffect(() => {
    const reduce = typeof window === 'undefined' || !window.matchMedia
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { finish(); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < steps.length; i += 1) {
      timers.push(setTimeout(() => setActive(i + 1), (i + 1) * THINKING_STEP_MS));
    }
    timers.push(setTimeout(finish, steps.length * THINKING_STEP_MS + 560));
    return () => timers.forEach(clearTimeout);
  }, [steps.length, finish]);

  const seg = userSegmentLabel(profile);
  return (
    <section className="audience-wizard__thinking" aria-live="polite" aria-label="正在為你量身推薦">
      <div className="audience-wizard__thinking-orb" aria-hidden="true">
        <span className="audience-wizard__thinking-emoji">💡</span>
      </div>
      <div className="audience-wizard__thinking-tape">為你量身推薦中</div>
      <h2 className="audience-wizard__thinking-title">正在為「{seg}」挑工具…</h2>
      <ol className="audience-wizard__thinking-steps">
        {steps.map((s, i) => {
          const state = i < active ? 'done' : i === active ? 'current' : 'pending';
          return (
            <li key={i} className={`audience-wizard__thinking-step is-${state}`}>
              <span className="audience-wizard__thinking-icon" aria-hidden="true">{state === 'done' ? '✓' : s.icon}</span>
              <span className="audience-wizard__thinking-text">{s.text}</span>
            </li>
          );
        })}
      </ol>
      <button type="button" className="audience-wizard__thinking-skip" onClick={finish}>直接看推薦 →</button>
    </section>
  );
}
