import { useState, useEffect } from "react";
import type { SeatLayout, StaySession } from "../../types";
import { useSeatTotals } from "../../hooks/useAnalytics";

interface Props {
  layout: SeatLayout[];
  sessions: StaySession[];
  rangeStartMs: number;
  rangeEndMs: number;
  nowMs: number;
}

function formatHours(seconds: number) {
  return (seconds / 3600).toFixed(1);
}

function colorForValue(value: number, max: number) {
  if (max <= 0) return "bg-gray-100";
  const p = Math.min(1, value / max);
  if (p > 0.8) return "bg-blue-900 text-white";
  if (p > 0.6) return "bg-blue-700 text-white";
  if (p > 0.4) return "bg-blue-500 text-white";
  if (p > 0.2) return "bg-blue-300 text-black";
  return "bg-blue-100 text-black";
}

export const SeatHeatmap = ({
  layout,
  sessions,
  rangeStartMs,
  rangeEndMs,
  nowMs,
}: Props) => {
  const initialStart = (() => {
    const d = new Date(rangeStartMs);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const initialEnd = (() => {
    const d = new Date(rangeEndMs);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  })();

  const [startMs, setStartMs] = useState(initialStart);
  const [endMs, setEndMs] = useState(initialEnd);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const totals = useSeatTotals(sessions, startMs, endMs, nowMs);
  const values = Object.values(totals).map((t) => t.seconds);
  const max = values.length ? Math.max(...values) : 0;
  const [showHours, setShowHours] = useState(true);

  function exportCsv() {
    const rows = ["seatId,合計時間(時間),セッション数"];
    for (const row of layout) {
      for (const seatId of row.seats) {
        const ag = totals[seatId] ?? { seconds: 0, count: 0 };
        rows.push(`${seatId},${(ag.seconds / 3600).toFixed(2)},${ag.count}`);
      }
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seat-heatmap-${new Date(startMs).toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const toLocalDatetime = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const fromLocalDatetime = (s: string) => {
    if (!s) return Date.now();
    return new Date(s).getTime();
  };

  const presetRanges: Record<string, () => { start: number; end: number }> = {
    今週: () => {
      const d = new Date(nowMs);
      const day = d.getDay();
      const daysSinceMonday = (day + 6) % 7; // 0 when Monday
      const monday = new Date(d);
      monday.setDate(d.getDate() - daysSinceMonday);
      monday.setHours(0, 0, 0, 0);
      return { start: monday.getTime(), end: nowMs };
    },
    先週: () => {
      const d = new Date(nowMs);
      const day = d.getDay();
      const daysSinceMonday = (day + 6) % 7;
      const thisMonday = new Date(d);
      thisMonday.setDate(d.getDate() - daysSinceMonday);
      thisMonday.setHours(0, 0, 0, 0);
      const prevMonday = new Date(
        thisMonday.getTime() - 1000 * 60 * 60 * 24 * 7
      );
      const prevSundayEnd = new Date(
        prevMonday.getTime() + 1000 * 60 * 60 * 24 * 7 - 1
      );
      return { start: prevMonday.getTime(), end: prevSundayEnd.getTime() };
    },
    昨日: () => {
      const d = new Date(nowMs);
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const e = new Date(d);
      e.setHours(23, 59, 59, 999);
      return { start, end: e.getTime() };
    },
    今日: () => {
      const d = new Date(nowMs);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const e = new Date(nowMs);
      e.setHours(23, 59, 59, 999);
      return { start, end: e.getTime() };
    },
  };

  const presetKeys = ["今日", "昨日", "今週", "先週"];

  const applyPreset = (k: string) => {
    const fn = presetRanges[k];
    if (!fn) return;
    const { start, end } = fn();
    setStartMs(start);
    setEndMs(end);
    setActivePreset(k);
  };

  useEffect(() => {
    // Default to 今日 on first render
    applyPreset("今日");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const humanRange = (sMs: number, eMs: number) => {
    const d1 = new Date(sMs);
    const d2 = new Date(eMs);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const f = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return `${f(d1)} — ${f(d2)}`;
  };

  return (
    <div className="p-3">
      <h3 className="text-lg font-semibold mb-3">座席ヒートマップ</h3>

      <div className="mb-3 space-y-2">
        {/* Presets row: compact segmented buttons + active range + export */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded bg-gray-100 p-0.5">
            {presetKeys.map((k) => {
              const range = presetRanges[k];
              if (!range) return null;
              const r = range();
              return (
                <button
                  key={k}
                  aria-pressed={activePreset === k}
                  aria-current={activePreset === k}
                  title={humanRange(r.start, r.end)}
                  onClick={() => applyPreset(k)}
                  className={`px-2 py-0.5 text-xs rounded ${
                    activePreset === k
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-gray-600">
            {activePreset ? humanRange(startMs, endMs) : ""}
          </div>

          <div className="ml-auto">
            <button
              className="btn btn-sm bg-gray-200 px-2 py-1 rounded text-xs"
              onClick={exportCsv}
            >
              CSV をエクスポート
            </button>
          </div>
        </div>

        {/* Date inputs row: labeled, compact, aligned */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <label className="text-sm w-12">開始</label>
            <input
              aria-label="開始日時"
              type="datetime-local"
              value={toLocalDatetime(startMs)}
              onChange={(e) => {
                setStartMs(fromLocalDatetime(e.target.value));
                setActivePreset(null);
              }}
              className="text-sm border rounded px-2 py-1 w-44"
            />
          </div>

          <div className="flex items-center gap-1">
            <label className="text-sm w-12">終了</label>
            <input
              aria-label="終了日時"
              type="datetime-local"
              value={toLocalDatetime(endMs)}
              onChange={(e) => {
                setEndMs(fromLocalDatetime(e.target.value));
                setActivePreset(null);
              }}
              className="text-sm border rounded px-2 py-1 w-44"
            />
          </div>

          <div className="flex items-center gap-2 text-sm ml-auto">
            <div className="flex items-center gap-1">
              <div className="text-sm mr-1">表示</div>
              <button
                type="button"
                title="表示の切替: 時間 = 合計滞在時間, セッション数 = 期間内の滞在イベント数"
                aria-label="表示の説明"
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="sr-only">
                  表示の説明:
                  時間は合計滞在時間（時間単位）、セッション数はイベント数
                </span>
              </button>
            </div>

            <div
              role="tablist"
              aria-label="表示切替"
              className="inline-flex rounded bg-gray-100 p-1"
            >
              <button
                role="tab"
                aria-selected={showHours}
                aria-pressed={showHours}
                title="時間で表示"
                onClick={() => setShowHours(true)}
                className={`px-2 py-1 text-sm rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                  showHours ? "bg-white font-semibold shadow" : "text-gray-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>時間</span>
              </button>

              <button
                role="tab"
                aria-selected={!showHours}
                aria-pressed={!showHours}
                title="セッション数で表示"
                onClick={() => setShowHours(false)}
                className={`px-2 py-1 text-sm rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                  !showHours ? "bg-white font-semibold shadow" : "text-gray-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span>セッション数</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 overflow-auto">
        {layout.map((row) => (
          <div key={row.rowId} className="flex gap-2 items-start">
            <div className="w-12 text-sm font-medium pt-1 sticky left-0 bg-white z-10 shrink-0">
              {row.rowId}
            </div>
            <div className="flex gap-2">
              {row.seats.map((seatId) => {
                const ag = totals[seatId] ?? { seconds: 0, count: 0 };
                const cls = colorForValue(ag.seconds, max);
                return (
                  <div
                    key={seatId}
                    title={`${seatId}：${formatHours(
                      ag.seconds
                    )}時間（セッション ${ag.count} 件)`}
                    className={`w-28 h-14 rounded flex items-center justify-center text-sm ${cls}`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-mono opacity-90">
                        {seatId}
                      </div>
                      <div className="text-sm font-semibold">
                        {showHours
                          ? `${formatHours(ag.seconds)}時間`
                          : `${ag.count}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatHeatmap;
