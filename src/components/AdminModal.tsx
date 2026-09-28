import React, { useState } from "react";
import type { MqttConfig, StaySession, User, UserCategory } from "../types";
import ImportExportPanel from "./ImportExportPanel";
import MembersPanel from "./MembersPanel";
import MQTTConfigForm from "./MQTTConfigForm";
import RemindersPanel from "./RemindersPanel";
import ModalShell from "./ModalShell";
import SessionsEditor from "./SessionsEditor";
import { useCleaningDuty } from "../hooks/useCleaningDuty";

interface CleaningSettingsProps {
  users?: User[];
}

const CleaningSettings: React.FC<CleaningSettingsProps> = ({ users = [] }) => {
  const {
    thisWeek,
    nextWeek,
    members,
    currentIndex,
    isCompletedThisWeek,
    addMember,
    removeMember,
    moveMember,
    setCurrentIndex,
    nextDuty,
    prevDuty,
    completeThisWeek,
    resetThisWeekCompletion,
  } = useCleaningDuty();

  const [newMemberName, setNewMemberName] = useState("");

  const handleAdd = () => {
    if (newMemberName.trim()) {
      addMember(newMemberName.trim());
      setNewMemberName("");
    }
  };

  const unusedLabUsers = users.filter((u) => !members.includes(u.name));

  return (
    <div className="flex flex-col gap-4">
      {/* Current & Next Duty Card */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl p-4 shadow-md">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <div className="text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🧹</span> 今週の掃除当番
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {thisWeek ? `${thisWeek} さん` : "（未設定）"}
            </div>
            {nextWeek && (
              <div className="text-xs text-teal-100 mt-1">
                ⏩ 来週の予定: <span className="font-semibold text-white">{nextWeek} さん</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isCompletedThisWeek
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "bg-amber-400 text-amber-950 font-extrabold"
              }`}
            >
              {isCompletedThisWeek ? "✓ 今週の掃除完了" : "未完了（リマインド中）"}
            </span>

            <div className="flex gap-1.5">
              {isCompletedThisWeek ? (
                <button
                  type="button"
                  onClick={resetThisWeekCompletion}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-2.5 py-1 rounded-md transition cursor-pointer"
                  title="未完了状態に戻して再度リマインドします"
                >
                  未完了に戻す
                </button>
              ) : (
                <button
                  type="button"
                  onClick={completeThisWeek}
                  className="bg-white text-teal-800 font-bold hover:bg-emerald-50 text-xs px-2.5 py-1 rounded-md shadow-xs transition cursor-pointer"
                  title="今週の掃除を完了として登録します"
                >
                  完了にする
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-teal-500/50 flex flex-wrap justify-between items-center text-xs text-teal-100">
          <div>毎週月曜日に自動で次の一人へ繰り上げられます。</div>
          {members.length > 1 && (
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <button
                type="button"
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-md transition cursor-pointer"
                onClick={prevDuty}
                title="前の担当者に戻す"
              >
                ◀ 前の人
              </button>
              <button
                type="button"
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-md transition cursor-pointer"
                onClick={nextDuty}
                title="次の担当者に交代"
              >
                次の人へ交代 ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rotation List */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs font-bold text-gray-800">
              ローテーション順序 ({members.length}名)
            </div>
            <div className="text-[11px] text-gray-500">
              矢印で並び替えできます。名前クリックまたは「担当にする」で今週の担当者を直接変更できます。
            </div>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-xs text-gray-400 py-3 text-center">
            メンバーが登録されていません
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-3 max-h-56 overflow-y-auto pr-1">
            {members.map((name, index) => {
              const isCurrent = index === currentIndex;
              return (
                <div
                  key={`${name}-${index}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border transition ${
                    isCurrent
                      ? "bg-teal-50 border-teal-300 font-bold text-teal-900 shadow-xs"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-gray-400 w-5">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`text-xs text-left hover:underline cursor-pointer ${
                        isCurrent ? "font-bold text-teal-700" : ""
                      }`}
                      title="この人を今週の担当者に設定"
                    >
                      {name}
                    </button>
                    {isCurrent && (
                      <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        今週
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className="text-[11px] text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded font-medium transition cursor-pointer"
                        title="今週の担当に指定"
                      >
                        担当にする
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveMember(index, index - 1)}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1 text-xs cursor-pointer"
                      title="上へ"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === members.length - 1}
                      onClick={() => moveMember(index, index + 1)}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30 px-1 text-xs cursor-pointer"
                      title="下へ"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-gray-400 hover:text-red-600 px-1 text-xs ml-1 cursor-pointer"
                      title="ローテーションから削除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Member UI */}
        {unusedLabUsers.length > 0 && (
          <div className="mb-2.5 pt-2 border-t border-gray-200">
            <div className="text-[11px] text-gray-500 mb-1.5">
              研究室メンバーから追加（クリックで追加）:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unusedLabUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addMember(user.name)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-2.5 py-1 rounded-md hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700 transition font-medium cursor-pointer"
                >
                  + {user.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="border rounded-lg px-3 py-1.5 text-xs flex-1 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="メンバー名を入力（例: 山田）"
          />
          <button
            type="button"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
            onClick={handleAdd}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
};

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
  envTempThresholds?: { high: number; low: number };
  onChangeEnvTempThresholds?: (t: { high: number; low: number }) => void;
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
    },
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
  envTempThresholds,
  onChangeEnvTempThresholds,
  sessions,
  onAddSession,
  onUpdateSession,
  onRemoveSession,
  exportData,
  onImportData,
  onClose,
}) => {
  type TabKey =
    | "all"
    | "reminders"
    | "mqtt"
    | "env"
    | "cleaning"
    | "members"
    | "sessions"
    | "data";
  const [selectedTab, setSelectedTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "全て" },
    { key: "reminders", label: "リマインダー" },
    { key: "mqtt", label: "MQTT" },
    { key: "env", label: "環境" },
    { key: "cleaning", label: "掃除当番" },
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
                  type="button"
                  onClick={() => setSelectedTab(t.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer ${
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

              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
                <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <span>🧹</span> 掃除当番ローテーション
                </div>
                <CleaningSettings users={users} />
              </div>

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

          {selectedTab === "cleaning" && (
            <div className="space-y-4">
              <CleaningSettings users={users} />
            </div>
          )}

          {selectedTab === "env" && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  環境閾値 (温度)
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  温度が高い/低いときに温度表示をハイライトします。閾値は小数で設定できます。
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">高温閾値 (°C)</label>
                  <input
                    className="border rounded px-3 py-1"
                    type="number"
                    step="0.1"
                    value={envTempThresholds?.high ?? 26.0}
                    onChange={(e) => {
                      const high = parseFloat(e.target.value) || 26.0;
                      const low = envTempThresholds?.low ?? 20.0;
                      onChangeEnvTempThresholds?.({ high, low });
                    }}
                    id="env-high-input"
                  />

                  <label className="text-sm">低温閾値 (°C)</label>
                  <input
                    className="border rounded px-3 py-1"
                    type="number"
                    step="0.1"
                    value={envTempThresholds?.low ?? 20.0}
                    onChange={(e) => {
                      const low = parseFloat(e.target.value) || 20.0;
                      const high = envTempThresholds?.high ?? 26.0;
                      onChangeEnvTempThresholds?.({ high, low });
                    }}
                    id="env-low-input"
                  />
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
                    onClick={() => {
                      const high = envTempThresholds?.high ?? 26.0;
                      const low = envTempThresholds?.low ?? 20.0;
                      onChangeEnvTempThresholds?.({ high, low });
                    }}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="bg-gray-100 px-3 py-1 rounded cursor-pointer"
                    onClick={() => {
                      const high = 26.0;
                      const low = 20.0;
                      onChangeEnvTempThresholds?.({ high, low });
                    }}
                  >
                    リセット
                  </button>
                </div>
              </div>
            </div>
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
