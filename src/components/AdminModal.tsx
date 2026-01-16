import React, { useState } from "react";
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
  type TabKey = "all" | "reminders" | "mqtt" | "members" | "sessions" | "data";
  const [selectedTab, setSelectedTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "全て" },
    { key: "reminders", label: "リマインダー" },
    { key: "mqtt", label: "MQTT" },
    { key: "members", label: "メンバー" },
    { key: "sessions", label: "履歴" },
    { key: "data", label: "データ" },
  ];

  if (!isOpen) return null;

  return (
    <ModalShell isOpen={isOpen} title="設定" onClose={onClose}>
      <div className="flex gap-4 flex-1 min-h-0">
        <nav className="w-40 shrink-0">
          <ul className="flex flex-col gap-2">
            {tabs.map((t) => (
              <li key={t.key}>
                <button
                  onClick={() => setSelectedTab(t.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 ${
                    selectedTab === t.key
                      ? "bg-indigo-100 text-indigo-800"
                      : "text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 min-h-0">
          {selectedTab === "reminders" && (
            <RemindersPanel
              reminderTime={reminderTime}
              onChangeReminderTime={onChangeReminderTime}
              onResetReminderDate={onResetReminderDate}
              reminderDuration={reminderDuration}
              onChangeReminderDuration={onChangeReminderDuration}
            />
          )}

          {selectedTab === "all" && (
            <div className="space-y-4">
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
              </div>

              <ImportExportPanel
                exportData={exportData}
                onImportData={onImportData}
              />
            </div>
          )}

          {selectedTab === "mqtt" && (
            <MQTTConfigForm
              mqttConfig={mqttConfig}
              onChangeMqttConfig={onChangeMqttConfig}
            />
          )}

          {selectedTab === "members" && (
            <MembersPanel
              users={users}
              onAddUser={onAddUser}
              onRemoveUser={onRemoveUser}
            />
          )}

          {selectedTab === "sessions" && (
            <div className="overflow-y-auto flex-1 min-h-0 pr-2">
              <SessionsEditor
                users={users}
                sessions={sessions}
                onAddSession={onAddSession}
                onUpdateSession={onUpdateSession}
                onRemoveSession={onRemoveSession}
              />
            </div>
          )}

          {selectedTab === "data" && (
            <ImportExportPanel
              exportData={exportData}
              onImportData={onImportData}
            />
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default AdminModal;
