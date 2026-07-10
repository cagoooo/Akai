import { useEffect, useMemo, useReducer, useRef } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, ShieldCheck, X } from 'lucide-react';
import type { EducationalTool } from '@/lib/data';
import type { AudienceProfile, Department, SchoolLevel, TeacherRole } from '@/lib/audienceProfile';
import { recommendTools } from '@/lib/audienceRecommendation';
import { AudienceRecommendationResults } from './AudienceRecommendationResults';
import { audienceWizardReducer, initialAudienceWizardState, toAudienceProfile } from './audienceWizardReducer';

type Props = { open: boolean; tools: EducationalTool[]; onComplete: (profile: AudienceProfile) => void; onDismiss: () => void; onLocateTool: (toolId: number) => void };
const levels: [SchoolLevel, string][] = [['elementary', '國小老師'], ['junior', '國中老師'], ['senior', '高中老師']];
const roles: [TeacherRole, string][] = [['homeroom', '班級導師'], ['subject', '科任老師'], ['admin', '行政人員']];
const departments: [Department, string][] = [['academic', '教務處'], ['student-affairs', '學務處'], ['general-affairs', '總務處'], ['counseling', '輔導室'], ['other', '其他處室']];

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
  const heading = state.step === 'audience' ? '先認識你，推薦會更準' : state.step === 'results' ? '為你準備的推薦工具' : '告訴我一點你的工作情境';
  return <div ref={dialogRef} className="audience-wizard" role="dialog" aria-modal="true" aria-label="找到適合你的教育工具" onMouseDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}>
    <div className="audience-wizard__paper" tabIndex={-1}>
      <span className="audience-wizard__pin audience-wizard__pin--top" aria-hidden="true" />
      <button ref={closeRef} type="button" className="audience-wizard__close" onClick={onDismiss} aria-label="稍後再說"><X size={20} /></button>
      <div className="audience-wizard__progress" aria-label="引導進度"><span style={{ width: `${({ audience: 20, 'school-level': 40, 'teacher-role': 60, department: 80, results: 100 } as Record<string, number>)[state.step]}%` }} /></div>
      {state.step !== 'audience' && <button type="button" className="audience-wizard__back" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft size={17} /> 上一步</button>}
      <header><span className="audience-wizard__eyebrow">阿凱老師的工具小幫手</span><h1>{heading}</h1><p>{state.step === 'audience' ? '花 20 秒，找出最適合你使用的教育科技工具。' : '每個選擇都能讓推薦更貼近日常需要。'}</p></header>
      {state.step === 'audience' && <Choices choices={[['teacher', '我是老師', '依學段與職務推薦', GraduationCap], ['student', '我是學生／小朋友', '探索好用小工具與遊戲', BookOpen]]} onChoose={(value) => dispatch({ type: 'SELECT_AUDIENCE', value: value as 'teacher' | 'student' })} />}
      {state.step === 'school-level' && <Choices choices={levels.map(([value, label]) => [value, label, '選擇任教學段', ShieldCheck])} onChoose={(value) => dispatch({ type: 'SELECT_SCHOOL_LEVEL', value: value as SchoolLevel })} />}
      {state.step === 'teacher-role' && <Choices choices={roles.map(([value, label]) => [value, label, value === 'admin' ? '再選擇所屬處室' : '直接取得專屬推薦', ShieldCheck])} onChoose={(value) => dispatch({ type: 'SELECT_TEACHER_ROLE', value: value as TeacherRole })} />}
      {state.step === 'department' && <Choices choices={departments.map(([value, label]) => [value, label, '取得行政工作推薦', ShieldCheck])} onChoose={(value) => dispatch({ type: 'SELECT_DEPARTMENT', value: value as Department })} />}
      {state.step === 'results' && <AudienceRecommendationResults recommendations={recommendations} onLocateTool={onLocateTool} />}
      <button type="button" className="audience-wizard__later" onClick={onDismiss}>稍後再說，先逛逛</button>
    </div>
  </div>;
}

function Choices({ choices, onChoose }: { choices: [string, string, string, typeof GraduationCap][]; onChoose: (value: string) => void }) {
  return <div className="audience-wizard__choices">{choices.map(([value, title, note, Icon], index) => <button key={value} type="button" className="audience-wizard__choice" onClick={() => onChoose(value)}>
    <span className="audience-wizard__pin" aria-hidden="true" /><Icon size={28} /><strong>{title}</strong><small>{note}</small><span>{index % 2 ? '選這個 →' : '開始選擇 →'}</span>
  </button>)}</div>;
}
