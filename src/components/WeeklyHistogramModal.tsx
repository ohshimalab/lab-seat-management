import React from "react";

interface WeekBar {
  weekKey: string;
  label: string;
  totalSeconds: number;
  formatted: string;
  isSelected: boolean;
}

interface Props {
  isOpen: boolean;
  weeks: WeekBar[];
  maxSeconds: number;
  selectedWeekLabel: string;
  selectedWeekTotal: string;
  onSelectWeek: (weekKey: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  disablePrevWeek: boolean;
  disableNextWeek: boolean;
  disableThisWeek: boolean;
  onClose: () => void;
}

export const WeeklyHistogramModal: React.FC<Props> = ({
  isOpen,
  weeks,
  maxSeconds,
  selectedWeekLabel,
  selectedWeekTotal,
  onSelectWeek,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  disablePrevWeek,
  disableNextWeek,
  disableThisWeek,
  onClose,
}) => {
  if (!isOpen) return null;

  const empty = weeks.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-4xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              週別滞在時間ヒストグラム
            </h2>
            <div className="text-sm text-gray-600 flex gap-2 items-center">
              <span className="font-semibold">選択中:</span>
              <span className="font-mono px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">
                {selectedWeekLabel}
              </span>
              <span className="text-gray-500">合計 {selectedWeekTotal}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPrevWeek}
              disabled={disablePrevWeek}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm border ${
                disablePrevWeek
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 border-gray-200 hover:bg-gray-300"
              }`}
            >
              ＜ 前の週
            </button>
            <button
              onClick={onThisWeek}
              disabled={disableThisWeek}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm border ${
                disableThisWeek
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
              }`}
            >
              今週
            </button>
            <button
              onClick={onNextWeek}
              disabled={disableNextWeek}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm border ${
                disableNextWeek
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-800 text-white border-gray-800 hover:bg-gray-700"
              }`}
            >
              次の週 ＞
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {empty ? (
            <div className="text-center text-gray-500 py-10">
              データがありません
            </div>
          ) : (
            <div className="h-64 flex items-end gap-3 px-2" role="list">
              {weeks.map((week) => {
                const ratio = Math.max(0, week.totalSeconds) / maxSeconds;
                const heightPercent = Math.max(6, Math.round(ratio * 100));
                return (
                  <button
                    key={week.weekKey}
                    onClick={() => onSelectWeek(week.weekKey)}
                    role="listitem"
                    className={`flex flex-col items-center justify-end gap-2 flex-1 min-w-[80px] p-2 rounded-lg border transition-all ${
                      week.isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                    aria-label={`${week.label} ${week.formatted}`}
                  >
                    <div
                      className="w-full bg-emerald-500 rounded-t-md"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <div className="text-sm font-mono font-bold text-gray-800">
                      {week.formatted}
                    </div>
                    <div className="text-[11px] text-gray-600 text-center leading-tight">
                      {week.label}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>合計週数: {weeks.length}</span>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-300 text-sm"
          >
            ✕ 閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
