import React from "react";
import type { MqttConfig, StaySession, User, UserCategory } from "../types";
import ImportExportPanel from "./ImportExportPanel";
import MembersPanel from "./MembersPanel";
import MQTTConfigForm from "./MQTTConfigForm";
import RemindersPanel from "./RemindersPanel";
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
        <RemindersPanel
          reminderTime={reminderTime}
          onChangeReminderTime={onChangeReminderTime}
          onResetReminderDate={onResetReminderDate}
          reminderDuration={reminderDuration}
          onChangeReminderDuration={onChangeReminderDuration}
        />
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
