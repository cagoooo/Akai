/**
 * RecommendationStatsPanel — 客群推薦精靈成效解析（admin only，P1-6）
 *
 * 資料源：analytics/recoStats 單一聚合 doc（由 recordRecoImpression / recordRecoClick 寫入）
 * 呈現：
 * - KPI：總曝光 / 總點擊 / 整體 CTR / 痛點點擊佔比
 * - 分眾表：每個客群 segment 的曝光、點擊、CTR
 * - 工具表：每個工具被推薦的曝光、點擊、CTR，標記「常被推卻沒人點」
 * - slot 點擊分布：哪種推薦理由（熱門 / 痛點 / 職務…）最能帶動點擊
 *
 * 用途：形成「量測 → 調權重 → 再量測」閉環，指導 POPULARITY_WEIGHT / PAINPOINT_WEIGHT 等調參。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Target, MousePointer, Eye, Percent } from 'lucide-react';

type Counter = { imp?: number; clk?: number };
type DailyCounter = { imp?: number; clk?: number; painClk?: number };
interface RecoStats {
  totalImpressions?: number;
  totalClicks?: number;
  painClicks?: number;
  tools?: Record<string, Counter>;
  segments?: Record<string, Counter>;
  slotClicks?: Record<string, number>;
  daily?: Record<string, DailyCounter>;
  funnel?: Record<string, number>;
  dismissedAtStep?: Record<string, number>;
  selections?: Record<string, Record<string, number>>;
  painPointClicks?: Record<string, number>;
  surfaces?: Record<string, Counter>;
}

type RangeKey = 'all' | 'last7' | 'last30';
const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: 'all', label: '全部', days: null },
  { key: 'last7', label: '近 7 日', days: 7 },
  { key: 'last30', label: '近 30 日', days: 30 },
];

function localDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
/** 從 daily buckets 加總指定天數內的曝光/點擊/痛點點擊；days=null 代表全部 */
function sumDaily(daily: Record<string, DailyCounter> | undefined, days: number | null): { imp: number; clk: number; painClk: number } {
  const acc = { imp: 0, clk: 0, painClk: 0 };
  if (!daily) return acc;
  let fromStr: string | null = null;
  if (days !== null) {
    const from = new Date();
    from.setDate(from.getDate() - (days - 1)); // 含今天共 days 天
    fromStr = localDateStr(from);
  }
  for (const [date, c] of Object.entries(daily)) {
    if (fromStr !== null && date < fromStr) continue;
    acc.imp += c.imp ?? 0;
    acc.clk += c.clk ?? 0;
    acc.painClk += c.painClk ?? 0;
  }
  return acc;
}

// segment key = [audience, schoolLevel, teacherRole, department].filter(Boolean).join('_')
const TOKEN_LABEL: Record<string, string> = {
  teacher: '老師', student: '學生',
  elementary: '國小', junior: '國中', senior: '高中',
  homeroom: '導師', subject: '科任', admin: '行政',
  academic: '教務', 'student-affairs': '學務', 'general-affairs': '總務', counseling: '輔導', other: '其他處室',
};
function describeSegment(key: string): string {
  const parts = key.split('_').map((t) => TOKEN_LABEL[t] ?? t);
  return parts.join('・');
}

const SLOT_LABEL: Record<string, string> = {
  painpoint: '🎯 命中需求', popular: '🔥 熱門排行', role: '👤 貼近職務',
  stage: '📚 同學段', discovery: '✨ 為你發掘', universal: '⭐ 廣受好評', unknown: '其他',
};

const FUNNEL_LABEL: Record<string, string> = {
  opened: '開啟精靈', painPointsConfirmed: '確認痛點', resultsShown: '看到推薦結果',
  dismissed: '中途離開', reshuffled: '換一批推薦',
};
const STEP_LABEL: Record<string, string> = {
  audience: '選身分', 'school-level': '選學段', 'teacher-role': '選職務',
  department: '選處室', 'pain-points': '選痛點', thinking: '推薦計算中', results: '推薦結果',
};
const SELECTION_GROUP_LABEL: Record<string, string> = {
  audience: '身分', schoolLevels: '學段', teacherRoles: '職務', departments: '行政處室', painPoints: '想解決的情境',
};
const SELECTION_VALUE_LABEL: Record<string, string> = {
  ...TOKEN_LABEL,
  'lesson-planning': '備課與教材', assessment: '評量與測驗', 'classroom-management': '班級經營',
  'student-practice': '學生練習', 'teacher-workload': '減輕行政負擔', communication: '親師溝通',
  administration: '行政工作', 'reading-literacy': '閱讀素養', 'creative-learning': '創意學習',
  'digital-literacy': '數位素養', 'language-learning': '語言學習', presentation: '簡報表達',
};

function ctr(clk: number, imp: number): number {
  return imp > 0 ? (clk / imp) * 100 : 0;
}
function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function RecommendationStatsPanel() {
  const [stats, setStats] = useState<RecoStats | null>(null);
  const [toolTitles, setToolTitles] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { db, isFirebaseAvailable } = await import('@/lib/firebase');
      if (!isFirebaseAvailable() || !db) {
        setError('Firestore 未連線');
        setLoading(false);
        return;
      }
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'analytics', 'recoStats'));
      setStats(snap.exists() ? (snap.data() as RecoStats) : {});
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // 工具標題（給工具表用），靜態 tools.json 足夠
    (async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${base}api/tools.json`);
        if (!res.ok) return;
        const tools = (await res.json()) as Array<{ id: number; title: string }>;
        setToolTitles(new Map(tools.map((t) => [t.id, t.title])));
      } catch {
        /* 標題缺失時退回顯示 #id */
      }
    })();
  }, [load]);

  const totalImp = stats?.totalImpressions ?? 0;
  const totalClk = stats?.totalClicks ?? 0;
  const painClk = stats?.painClicks ?? 0;

  // P0-D：KPI 依所選區間計算。「全部」用 top-level 累計（含 daily buckets 上線前的歷史）；
  // 「近 7/30 日」用 daily buckets 加總（時間維度只回溯到 daily 開始累積之後）。
  const ranged = useMemo(() => {
    const opt = RANGE_OPTIONS.find((o) => o.key === range) ?? RANGE_OPTIONS[0];
    if (opt.days === null) return { imp: totalImp, clk: totalClk, painClk };
    return sumDaily(stats?.daily, opt.days);
  }, [range, stats, totalImp, totalClk, painClk]);
  const rangedCtr = ctr(ranged.clk, ranged.imp);
  const hasDaily = !!stats?.daily && Object.keys(stats.daily).length > 0;

  const segmentRows = useMemo(() => {
    const entries = Object.entries(stats?.segments ?? {});
    return entries
      .map(([key, c]) => ({ key, label: describeSegment(key), imp: c.imp ?? 0, clk: c.clk ?? 0 }))
      .sort((a, b) => b.imp - a.imp || b.clk - a.clk);
  }, [stats]);

  const toolRows = useMemo(() => {
    const entries = Object.entries(stats?.tools ?? {});
    return entries
      .map(([id, c]) => {
        const imp = c.imp ?? 0;
        const clk = c.clk ?? 0;
        return { id: Number(id), title: toolTitles.get(Number(id)) ?? `#${id}`, imp, clk, rate: ctr(clk, imp) };
      })
      .sort((a, b) => b.imp - a.imp || b.clk - a.clk);
  }, [stats, toolTitles]);

  const slotRows = useMemo(() => {
    const entries = Object.entries(stats?.slotClicks ?? {});
    const total = entries.reduce((s, [, v]) => s + (v ?? 0), 0);
    return entries
      .map(([slot, clk]) => ({ slot, label: SLOT_LABEL[slot] ?? slot, clk: clk ?? 0, share: total > 0 ? (clk / total) * 100 : 0 }))
      .sort((a, b) => b.clk - a.clk);
  }, [stats]);

  const funnelRows = useMemo(() => Object.entries(stats?.funnel ?? {})
    .map(([key, count]) => ({ key, label: FUNNEL_LABEL[key] ?? key, count: count ?? 0 }))
    .sort((a, b) => b.count - a.count), [stats]);
  const dismissalRows = useMemo(() => Object.entries(stats?.dismissedAtStep ?? {})
    .map(([key, count]) => ({ key, label: STEP_LABEL[key] ?? key, count: count ?? 0 }))
    .sort((a, b) => b.count - a.count), [stats]);
  const selectionGroups = useMemo(() => Object.entries(stats?.selections ?? {})
    .map(([group, values]) => ({
      group,
      label: SELECTION_GROUP_LABEL[group] ?? group,
      values: Object.entries(values)
        .map(([value, count]) => ({ value, label: SELECTION_VALUE_LABEL[value] ?? value, count: count ?? 0 }))
        .sort((a, b) => b.count - a.count),
    })), [stats]);
  const painClickRows = useMemo(() => Object.entries(stats?.painPointClicks ?? {})
    .map(([key, count]) => ({ key, label: SELECTION_VALUE_LABEL[key] ?? key, count: count ?? 0 }))
    .sort((a, b) => b.count - a.count), [stats]);
  const surfaceRows = useMemo(() => Object.entries(stats?.surfaces ?? {})
    .map(([key, value]) => ({ key, label: key === 'wizard' ? '首次推薦精靈' : key === 'strip' ? '首頁常駐推薦' : key, imp: value.imp ?? 0, clk: value.clk ?? 0 }))
    .sort((a, b) => b.imp - a.imp), [stats]);

  // 「常被推卻沒人點」：曝光量前段（≥ 全站平均曝光）但 CTR 偏低（< 整體 CTR 的一半）
  const overallCtr = ctr(totalClk, totalImp);
  const avgImp = toolRows.length > 0 ? toolRows.reduce((s, r) => s + r.imp, 0) / toolRows.length : 0;
  const isColdStar = (r: { imp: number; rate: number }) => r.imp >= Math.max(avgImp, 3) && r.rate < overallCtr / 2;

  const kpiCard = (icon: React.ReactNode, label: string, value: string, hint?: string) => (
    <div style={{ background: 'rgba(255,255,255,.7)', border: '2px solid #1a1a1a', borderRadius: 10, boxShadow: '3px 3px 0 rgba(0,0,0,.16)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b5a35', fontSize: 12, fontWeight: 800 }}>{icon}{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#2c2412', marginTop: 4 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: '#8a7a55', marginTop: 2 }}>{hint}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2c2412', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Target className="h-5 w-5" /> 推薦精靈成效
          </h3>
          <p style={{ fontSize: 12, color: '#6b5a35', marginTop: 2 }}>客群 onboarding 的曝光 / 點擊 / CTR，指導推薦權重調參</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-1">重新整理</span>
        </Button>
      </div>

      {error && <Card><CardContent className="py-6 text-center text-sm text-red-600">讀取失敗：{error}</CardContent></Card>}

      {!error && totalImp === 0 && !loading && (
        <Card><CardContent className="py-8 text-center text-sm text-slate-500">
          還沒有推薦精靈的曝光資料 📊<br />
          <span className="text-xs opacity-70">使用者完成一次「客群推薦精靈」後，這裡就會長出資料。</span>
        </CardContent></Card>
      )}

      {totalImp > 0 && (
        <>
          {/* P0-D 區間切換：KPI 依「全部 / 近 7 日 / 近 30 日」重算，用來對照調權重前後的 CTR 變化 */}
          <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.6)', border: '2px solid #1a1a1a', borderRadius: 10, boxShadow: '2px 2px 0 rgba(0,0,0,.16)' }}>
            {RANGE_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setRange(o.key)}
                style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  border: '2px solid ' + (range === o.key ? '#1a1a1a' : 'transparent'),
                  background: range === o.key ? '#7a8c3a' : 'transparent',
                  color: range === o.key ? '#fff' : '#5a4a2a',
                }}
              >{o.label}</button>
            ))}
          </div>
          {range !== 'all' && !hasDaily && (
            <div style={{ fontSize: 12, color: '#b45309' }}>（尚無每日資料；時間維度自 P0-D 上線後才開始累積）</div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiCard(<Eye className="h-3.5 w-3.5" />, '曝光', ranged.imp.toLocaleString(), '推薦結果被看到的次數')}
            {kpiCard(<MousePointer className="h-3.5 w-3.5" />, '點擊', ranged.clk.toLocaleString(), '推薦卡片被點的次數')}
            {kpiCard(<Percent className="h-3.5 w-3.5" />, 'CTR', fmtPct(rangedCtr), '點擊 ÷ 曝光')}
            {kpiCard(<Target className="h-3.5 w-3.5" />, '痛點點擊佔比', ranged.clk > 0 ? fmtPct((ranged.painClk / ranged.clk) * 100) : '—', '命中痛點的點擊比例')}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">精靈流程與離開位置</CardTitle>
                <CardDescription>用來找出使用者在哪個步驟流失，以及「換一批」是否真的有幫助。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {funnelRows.length === 0 ? <div className="text-slate-500">新版流程資料尚在累積。</div> : funnelRows.map((row) => <div key={row.key} className="flex justify-between border-b border-amber-100 pb-1"><span>{row.label}</span><strong>{row.count.toLocaleString()}</strong></div>)}
                {dismissalRows.length > 0 && <div className="pt-2"><div className="mb-1 text-xs font-bold text-amber-800">中途離開的位置</div>{dismissalRows.map((row) => <div key={row.key} className="flex justify-between text-xs"><span>{row.label}</span><span>{row.count.toLocaleString()}</span></div>)}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">推薦版位與痛點回應</CardTitle>
                <CardDescription>比較首次精靈與首頁常駐推薦的效果，並找出最常促成點擊的痛點。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {surfaceRows.map((row) => <div key={row.key} className="flex justify-between border-b border-amber-100 pb-1"><span>{row.label}</span><span>曝光 {row.imp}／點擊 {row.clk}／{fmtPct(ctr(row.clk, row.imp))}</span></div>)}
                {painClickRows.length > 0 && <div className="pt-2"><div className="mb-1 text-xs font-bold text-amber-800">帶來點擊的使用者痛點</div>{painClickRows.map((row) => <div key={row.key} className="flex justify-between text-xs"><span>{row.label}</span><span>{row.count.toLocaleString()}</span></div>)}</div>}
              </CardContent>
            </Card>
          </div>

          {selectionGroups.length > 0 && <Card>
            <CardHeader><CardTitle className="text-base">客群與需求選擇分布</CardTitle><CardDescription>每個數字都是匿名加總，不保存個人的帳號或選擇紀錄。</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectionGroups.map((group) => <div key={group.group}><div className="mb-1 text-sm font-bold">{group.label}</div>{group.values.map((value) => <div key={value.value} className="flex justify-between border-b border-amber-100 py-1 text-xs"><span>{value.label}</span><span>{value.count.toLocaleString()}</span></div>)}</div>)}
            </CardContent>
          </Card>}

          <Card>
            <CardHeader><CardTitle className="text-base">分眾成效（累計）</CardTitle><CardDescription>各客群的曝光、點擊與 CTR（依曝光排序；下方三表為全期累計，不受上方區間切換影響）</CardDescription></CardHeader>
            <CardContent>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b5a35', borderBottom: '2px solid #d8ccae' }}>
                      <th style={{ padding: '6px 8px' }}>客群</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>曝光</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>點擊</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentRows.map((r) => (
                      <tr key={r.key} style={{ borderBottom: '1px solid #ece3cd' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700 }}>{r.label}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.imp.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.clk.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtPct(ctr(r.clk, r.imp))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">推薦理由（slot）帶動點擊分布</CardTitle>
              <CardDescription>哪種「為什麼推」的徽章最能讓使用者點下去</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {slotRows.length === 0 && <div className="text-sm text-slate-500">尚無點擊資料</div>}
                {slotRows.map((r) => (
                  <div key={r.slot} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 100, fontSize: 13, fontWeight: 700 }}>{r.label}</span>
                    <div style={{ flex: 1, height: 16, background: '#ece3cd', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${r.share}%`, height: '100%', background: '#7a8c3a' }} />
                    </div>
                    <span style={{ width: 96, textAlign: 'right', fontSize: 12 }}>{r.clk} 次（{fmtPct(r.share)}）</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">工具被推薦成效</CardTitle>
              <CardDescription>
                依曝光排序；<span style={{ color: '#b45309', fontWeight: 800 }}>橘底</span>= 常被推卻沒人點（曝光高但 CTR 偏低，可考慮改 reason 或降權）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b5a35', borderBottom: '2px solid #d8ccae', position: 'sticky', top: 0, background: '#faf5e8' }}>
                      <th style={{ padding: '6px 8px' }}>工具</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>曝光</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>點擊</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toolRows.map((r) => {
                      const cold = isColdStar(r);
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #ece3cd', background: cold ? 'rgba(251,191,36,.22)' : undefined }}>
                          <td style={{ padding: '6px 8px', fontWeight: 700 }}>
                            <span style={{ color: '#9a8a6a', fontSize: 11 }}>#{r.id}</span> {r.title}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.imp.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.clk.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtPct(r.rate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
