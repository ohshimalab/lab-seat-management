import React from "react";
import type { MqttConfig, StaySession, User, UserCategory } from "../types";
import ImportExportPanel from "./ImportExportPanel";
import MembersPanel from "./MembersPanel";
import MQTTConfigForm from "./MQTTConfigForm";
import SessionsEditor from "./SessionsEditor";

interface Props {
  isOpen: boolean;
  users: User[];
  onAddUser: (name: string, category: UserCategory) => void;
  onRemoveUser: (userId: string) => void;
  reminderTime: string;
  onChangeReminderTime: (value: string) => void;
  onResetReminderDate: () => void;
  reminderDuration: number;
  onChangeReminderDuration: (value: number) => void;
  mqttConfig: MqttConfig;
  onChangeMqttConfig: (config: MqttConfig) => void;
  sessions: StaySession[];
  onAddSession: (session: {
    userId: string;
    seatId: string;
    start: number;
    end: number | null;
  }) => void;
  onUpdateSession: (
    sessionId: string,
    payload: {
      userId: string;
      seatId: string;
      start: number;
      end: number | null;
    }
  ) => void;
  onRemoveSession: (sessionId: string) => void;
  exportData: string;
  onImportData: (text: string) => { success: boolean; message?: string };
  onClose: () => void;
}

export const AdminModal: React.FC<Props> = ({
  isOpen,
  users,
  onAddUser,
  onRemoveUser,
  reminderTime,
  onChangeReminderTime,
  onResetReminderDate,
  reminderDuration,
  onChangeReminderDuration,
  mqttConfig,
  onChangeMqttConfig,
  sessions,
  onAddSession,
  onUpdateSession,
  onRemoveSession,
  exportData,
  onImportData,
  onClose,
}) => {
  if (!isOpen) return null;

  // import/export handled by ImportExportPanel

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-3xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">設定</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 active:scale-95 transition-transform"
          >
            閉じる
          </button>
        </div>
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
                onChangeReminderDuration(
                  Math.max(5, Number(e.target.value) || 0)
                )
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
        <MQTTConfigForm
          mqttConfig={mqttConfig}
          onChangeMqttConfig={onChangeMqttConfig}
        />
        <MembersPanel
          users={users}
          onAddUser={onAddUser}
          onRemoveUser={onRemoveUser}
        />
        <div className="overflow-y-auto flex-1 pr-2">
          {/* Members table moved to MembersPanel */}

          <SessionsEditor
            users={users}
            sessions={sessions}
            onAddSession={onAddSession}
            onUpdateSession={onUpdateSession}
            onRemoveSession={onRemoveSession}
          />

          <ImportExportPanel
            exportData={exportData}
            onImportData={onImportData}
          />
        </div>
      </div>
    </div>
  );
};
