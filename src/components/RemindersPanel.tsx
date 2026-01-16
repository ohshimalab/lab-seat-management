import React from "react";

interface Props {
  reminderTime: string;
  onChangeReminderTime: (value: string) => void;
  onResetReminderDate: () => void;
  reminderDuration: number;
  onChangeReminderDuration: (value: number) => void;
}

export const RemindersPanel: React.FC<Props> = ({
  reminderTime,
  onChangeReminderTime,
  onResetReminderDate,
  reminderDuration,
  onChangeReminderDuration,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
      <div className="text-sm font-semibold text-gray-700">
        帰宅リマインダー時刻
      </div>
      <input
        type="time"
        value={reminderTime}
        onChange={(e) => onChangeReminderTime(e.target.value)}
        className="border-2 border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold bg-white focus:border-indigo-500"
      />
      <span className="text-xs text-gray-600">
        デフォルト 20:00。一日一回だけ通知します。
      </span>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>再生時間 (秒)</span>
        <input
          type="number"
          min={1}
          max={120}
          value={reminderDuration}
          onChange={(e) =>
            onChangeReminderDuration(Math.max(5, Number(e.target.value) || 0))
          }
          className="w-20 border-2 border-gray-300 rounded-lg px-2 py-1 text-base font-bold bg-white focus:border-indigo-500"
        />
      </div>
      <button
        onClick={onResetReminderDate}
        className="ml-auto bg-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 active:scale-95"
      >
        今日のリマインダーをリセット
      </button>
    </div>
  );
};

export default RemindersPanel;
