import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export type DatePreset =
  | 'today'
  | 'last7'
  | 'last14'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
  label: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** YYYY-MM-DD（本地時區） */
export function toDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** 依快速選項計算 from/to/label */
export function presetToRange(preset: DatePreset): DateRange {
  const now = new Date();
  const today = startOfDay(now);
  switch (preset) {
    case 'today':
      return { preset, from: today, to: endOfDay(now), label: '今天' };
    case 'last7': {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { preset, from, to: endOfDay(now), label: '最近 7 天' };
    }
    case 'last14': {
      const from = new Date(today);
      from.setDate(from.getDate() - 13);
      return { preset, from, to: endOfDay(now), label: '最近 14 天' };
    }
    case 'last30': {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { preset, from, to: endOfDay(now), label: '最近 30 天' };
    }
    case 'thisMonth': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { preset, from, to: endOfDay(now), label: '本月' };
    }
    case 'lastMonth': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { preset, from, to, label: '上月' };
    }
    case 'custom':
    default:
      // 沒有自訂日期時退回「最近 30 天」當作有效預設
      return presetToRange('last30');
  }
}

/** 把 dailyVisits ({ 'YYYY-MM-DD': n }) 篩選到指定範圍內，回傳排序好的 [date, count] 陣列 */
export function filterDailyVisits(
  dailyVisits: Record<string, number>,
  range: DateRange
): Array<[string, number]> {
  const fromStr = toDateStr(range.from);
  const toStr = toDateStr(range.to);
  return Object.entries(dailyVisits)
    .filter(([d]) => d >= fromStr && d <= toStr)
    .sort(([a], [b]) => a.localeCompare(b));
}

const PRESET_OPTIONS: Array<{ key: DatePreset; label: string }> = [
  { key: 'today', label: '今天' },
  { key: 'last7', label: '最近 7 天' },
  { key: 'last14', label: '最近 14 天' },
  { key: 'last30', label: '最近 30 天' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(toDateStr(value.from));
  const [customTo, setCustomTo] = useState(toDateStr(value.to));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomFrom(toDateStr(value.from));
    setCustomTo(toDateStr(value.to));
  }, [value.from, value.to]);

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const applyCustom = () => {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return;
    onChange({
      preset: 'custom',
      from: startOfDay(from),
      to: endOfDay(to),
      label: `${toDateStr(from)} ～ ${toDateStr(to)}`,
    });
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* 觸發按鈕 — cork 風格便利貼按鈕 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#fefdfa',
          color: '#1a1a1a',
          border: '2px solid #1a1a1a',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 800,
          fontFamily: "'Noto Sans TC', sans-serif",
          boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
          cursor: 'pointer',
          minWidth: 180,
          justifyContent: 'space-between',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <CalendarIcon className="h-4 w-4" />
          {value.label}
        </span>
        <ChevronDown
          className="h-4 w-4"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>

      {/* 下拉面板 */}
      {open && (
        <div
          role="dialog"
          aria-label="選擇日期範圍"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 50,
            background: '#fefdfa',
            border: '2px solid #1a1a1a',
            borderRadius: 10,
            padding: 14,
            boxShadow: '4px 4px 0 rgba(0,0,0,.2), 0 6px 18px rgba(0,0,0,.15)',
            minWidth: 280,
            fontFamily: "'Noto Sans TC', sans-serif",
          }}
        >
          {/* 快速選項 */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#7a8c3a',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              快速選擇
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 6,
              }}
            >
              {PRESET_OPTIONS.map((opt) => {
                const active = value.preset === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      onChange(presetToRange(opt.key));
                      setOpen(false);
                    }}
                    style={{
                      padding: '6px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: '1.5px solid #1a1a1a',
                      background: active ? '#7a8c3a' : '#fff',
                      color: active ? '#fff' : '#1a1a1a',
                      cursor: 'pointer',
                      boxShadow: active ? 'inset 0 2px 4px rgba(0,0,0,.2)' : '1px 1px 0 rgba(0,0,0,.15)',
                      textAlign: 'left',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 自訂範圍 */}
          <div style={{ borderTop: '1px dashed #c7b89a', paddingTop: 10 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#7a8c3a',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              自訂範圍
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                max={customTo}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  fontSize: 12,
                  border: '1.5px solid #1a1a1a',
                  borderRadius: 6,
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              />
              <span style={{ color: '#7a8c3a', fontWeight: 700 }}>～</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                min={customFrom}
                max={toDateStr(new Date())}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  fontSize: 12,
                  border: '1.5px solid #1a1a1a',
                  borderRadius: 6,
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              />
            </div>
            <button
              type="button"
              onClick={applyCustom}
              style={{
                width: '100%',
                padding: '6px 10px',
                background: '#ea8a3e',
                color: '#fff',
                border: '2px solid #1a1a1a',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '1px 1px 0 rgba(0,0,0,.25)',
              }}
            >
              套用自訂範圍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
