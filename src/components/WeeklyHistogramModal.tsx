import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  TooltipProps,
  XAxis,
  LabelList,
} from "recharts";

interface WeekBar {
  weekKey: string;
  label: string;
  totalSeconds: number;
  formatted: string;
  isSelected: boolean;
}

interface UserBar {
  key: string;
  label: string;
  totalSeconds: number;
  formatted: string;
  isSelected: boolean;
}

interface Props {
  isOpen: boolean;
  weeks: WeekBar[];
  userBars: UserBar[];
  selectedWeekLabel: string;
  selectedWeekTotal: string;
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
  userBars,
  selectedWeekLabel,
  selectedWeekTotal,
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

  type ChartDatum = {
    key: string;
    label: string;
    total: number;
    formatted: string;
    isSelected: boolean;
  };

  const chartData: ChartDatum[] = useMemo(
    () =>
      userBars.map((bar) => ({
        key: bar.key,
        label: bar.label,
        total: bar.totalSeconds,
        formatted: bar.formatted,
        isSelected: bar.isSelected,
      })),
    [userBars]
  );

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0].payload as ChartDatum;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-sm">
        <div className="font-semibold text-gray-800">{item.label}</div>
        <div className="text-gray-600">合計 {item.formatted}</div>
      </div>
    );
  };

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
            <div className="h-64 px-2 overflow-x-auto">
              <BarChart
                width={Math.max(chartData.length * 110, 640)}
                height={256}
                data={chartData}
                margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
                barCategoryGap={16}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#4b5563" }}
                  interval={0}
                  height={32}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(16,185,129,0.08)" }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="formatted"
                    position="top"
                    content={(props) => {
                      const { x, y, width, value } = props;
                      if (
                        value == null ||
                        x == null ||
                        y == null ||
                        width == null
                      )
                        return null;
                      const centerX = x + width / 2;
                      return (
                        <text
                          x={centerX}
                          y={y - 6}
                          textAnchor="middle"
                          fill="#1f2937"
                          fontSize={11}
                          fontWeight={700}
                        >
                          {value as string}
                        </text>
                      );
                    }}
                  />
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      cursor="pointer"
                      fill={entry.isSelected ? "#10b981" : "#a7f3d0"}
                      stroke={entry.isSelected ? "#059669" : "#6ee7b7"}
                      strokeWidth={entry.isSelected ? 2 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
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
