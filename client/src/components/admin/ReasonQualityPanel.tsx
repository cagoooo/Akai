/**
 * 推薦理由體檢面板（P1-3，2026-07-28）
 *
 * `audienceFit.reasons` 是人工寫死的字串，122 個工具 × 最多 9 種理由鍵。
 * 過去沒有任何機制會抓到「理由寫得很漂亮但其實不太適合」的漂移 —— 只有訪客默默不點。
 *
 * 這個面板把四種訊號攤開來：太久沒複查 / 太空泛 / 沒對到題 / 點擊率偏低，
 * 直接回答「這 N 條推薦理由該重寫了」。
 * 前三種離線就算得出來（`npm run validate:audience` 也會印），
 * 第四種需要 Firestore 的 analytics/recoStats。
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  REASON_ISSUE_LABEL,
  analyzeReasonQuality,
  type ReasonIssue,
  type ReasonIssueKind,
  type ToolReasonInput,
  type ToolRecoStat,
} from '@/lib/reasonQuality';

const KIND_ORDER: ReasonIssueKind[] = ['low-ctr', 'off-topic', 'vague', 'stale'];

/** reasons 的鍵 → 中文標籤，跟推薦精靈的用語一致 */
const REASON_KEY_LABEL: Record<string, string> = {
  teacher: '老師',
  student: '學生',
  homeroom: '導師',
  subject: '科任',
  admin: '行政',
  academic: '教務處',
  'student-affairs': '學務處',
  'general-affairs': '總務處',
  counseling: '輔導室',
  other: '其他處室',
};

export function ReasonQualityPanel() {
  const [tools, setTools] = useState<ToolReasonInput[] | null>(null);
  const [stats, setStats] = useState<Record<string, ToolRecoStat> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<ReasonIssueKind | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.BASE_URL || '/';
      const res = await fetch(`${base}api/tools.json`);
      if (!res.ok) throw new Error(`tools.json 讀取失敗（${res.status}）`);
      setTools((await res.json()) as ToolReasonInput[]);

      // CTR 訊號是加分項：Firestore 讀不到也要能顯示前三種訊號
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        if (isFirebaseAvailable() && db) {
          const { doc, getDoc } = await import('firebase/firestore');
          const snap = await getDoc(doc(db, 'analytics', 'recoStats'));
          const data = snap.exists() ? (snap.data() as { tools?: Record<string, ToolRecoStat> }) : {};
          setStats(data.tools);
        }
      } catch {
        setStats(undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const issues = useMemo(
    () => (tools ? analyzeReasonQuality(tools, stats) : []),
    [tools, stats],
  );

  const counts = useMemo(() => {
    const acc: Record<ReasonIssueKind, number> = { stale: 0, vague: 0, 'off-topic': 0, 'low-ctr': 0 };
    for (const issue of issues) for (const kind of issue.kinds) acc[kind] += 1;
    return acc;
  }, [issues]);

  const visible = useMemo(
    () => (kindFilter === 'all' ? issues : issues.filter((i) => i.kinds.includes(kindFilter))),
    [issues, kindFilter],
  );

  const totalReasons = useMemo(() => {
    if (!tools) return 0;
    return tools.reduce(
      (sum, tool) => sum + Object.values(tool.audienceFit?.reasons ?? {}).filter((r) => (r ?? '').trim()).length,
      0,
    );
  }, [tools]);

  if (loading) return <p className="text-sm text-muted-foreground">推薦理由體檢載入中…</p>;
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <p className="font-bold text-destructive">推薦理由體檢讀取失敗</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-3 rounded-md border px-3 py-1.5 font-medium">
          重新整理
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base font-black">🩺 推薦理由體檢</h3>
          <p className="text-sm text-muted-foreground">
            {totalReasons} 條理由中有 <b>{issues.length}</b> 條建議重寫
            {stats === undefined && <span className="ml-1">（Firestore 未連線，本次未計入點擊率訊號）</span>}
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-md border px-3 py-1.5 text-sm font-medium">
          重新整理
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
          全部 {issues.length}
        </FilterChip>
        {KIND_ORDER.map((kind) => (
          <FilterChip key={kind} active={kindFilter === kind} onClick={() => setKindFilter(kind)}>
            {REASON_ISSUE_LABEL[kind]} {counts[kind]}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm">
          ✅ 這個分類目前沒有需要重寫的理由。
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((issue) => (
            <IssueRow key={`${issue.toolId}-${issue.reasonKey}`} issue={issue} />
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function IssueRow({ issue }: { issue: ReasonIssue }) {
  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <a
          href={`${import.meta.env.BASE_URL || '/'}tool/${issue.toolId}`}
          target="_blank"
          rel="noreferrer"
          className="font-black underline underline-offset-2"
        >
          #{issue.toolId} {issue.toolTitle}
        </a>
        <span className="rounded-full bg-muted px-2 py-0.5 font-bold">
          {REASON_KEY_LABEL[issue.reasonKey] ?? issue.reasonKey}
        </span>
        {issue.kinds.map((kind) => (
          <span key={kind} className="rounded-full border px-2 py-0.5 font-bold">
            {REASON_ISSUE_LABEL[kind]}
          </span>
        ))}
      </div>
      <p className="mt-2 text-sm">「{issue.reason}」</p>
      <p className="mt-1 text-xs text-muted-foreground">{issue.detail}</p>
    </li>
  );
}
