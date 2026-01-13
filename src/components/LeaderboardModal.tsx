import React from "react";
import type { User } from "../types";

interface LeaderboardRow {
  userId: string;
  name: string;
  seconds: number;
  formatted: string;
  rank: number;
}

interface Props {
  isOpen: boolean;
  weekLabel: string;
  rows: LeaderboardRow[];
  users: User[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  disableThisWeek: boolean;
  disablePrevWeek: boolean;
  disableNextWeek: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  weekLabel,
  rows,
  users,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  disableThisWeek,
  disablePrevWeek,
  disableNextWeek,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalUsers = users.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-3xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              滞在時間ランキング
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">週:</span>
              <span className="font-mono px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">
                {weekLabel}
              </span>
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

        <div className="overflow-y-auto flex-1">
          {rows.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              データがありません
            </div>
          ) : (
            <div className="space-y-2" role="list">
              {rows.map((row) => (
                <div
                  key={row.userId}
                  role="listitem"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center">
                      {row.rank}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-900 truncate">
                        {row.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {row.seconds > 0 ? "累計滞在" : "データなし"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-gray-800">
                      {row.formatted}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {row.seconds} 秒
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>メンバー: {totalUsers}人</span>
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
