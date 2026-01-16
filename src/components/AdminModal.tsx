import React from "react";
import type { MqttConfig, StaySession, User, UserCategory } from "../types";
import ImportExportPanel from "./ImportExportPanel";
import MembersPanel from "./MembersPanel";
import MQTTConfigForm from "./MQTTConfigForm";
import RemindersPanel from "./RemindersPanel";
import ModalShell from "./ModalShell";
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
    <ModalShell isOpen={isOpen} title="設定" onClose={onClose}>
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
    </ModalShell>
  );
};

export default AdminModal;
