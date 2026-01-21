import React, { useState, useEffect, useRef } from "react";
import type { MqttConfig, StaySession, User, UserCategory } from "../types";
import ImportExportPanel from "./ImportExportPanel";
import MembersPanel from "./MembersPanel";
import MQTTConfigForm from "./MQTTConfigForm";
import RemindersPanel from "./RemindersPanel";
import ModalShell from "./ModalShell";
import SessionsEditor from "./SessionsEditor";

const LS_SPREADSHEET = "cleaningDuty.spreadsheetId";
const LS_CLIENT_ID = "cleaningDuty.clientId";
const LS_TOKEN = "cleaningDuty.accessToken";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (opts: {
            client_id: string;
            scope: string;
            callback: (resp: { error?: string; access_token?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

const CleaningSettings: React.FC = () => {
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    localStorage.getItem(LS_SPREADSHEET),
  );
  const [clientId, setClientId] = useState<string | null>(
    localStorage.getItem(LS_CLIENT_ID),
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(LS_TOKEN),
  );
  const tokenClientRef = useRef<{
    requestAccessToken: (opts?: { prompt?: string }) => void;
  } | null>(null);

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem(LS_TOKEN));
    window.addEventListener("cleaningDutyTokenChanged", onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cleaningDutyTokenChanged", onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const save = () => {
    if (spreadsheetId) localStorage.setItem(LS_SPREADSHEET, spreadsheetId);
    else localStorage.removeItem(LS_SPREADSHEET);
    if (clientId) localStorage.setItem(LS_CLIENT_ID, clientId);
    else localStorage.removeItem(LS_CLIENT_ID);
    setSpreadsheetId(localStorage.getItem(LS_SPREADSHEET));
    setClientId(localStorage.getItem(LS_CLIENT_ID));
  };

  const clearAll = () => {
    localStorage.removeItem(LS_SPREADSHEET);
    localStorage.removeItem(LS_CLIENT_ID);
    localStorage.removeItem(LS_TOKEN);
    setSpreadsheetId(null);
    setClientId(null);
    setToken(null);
    window.dispatchEvent(new Event("cleaningDutyTokenChanged"));
  };

  async function loadGsi() {
    if (window.google) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("GSI load failed"));
      document.head.appendChild(s);
    });
  }

  const signIn = async () => {
    if (!clientId) return alert("OAuth Client ID を先に保存してください。");
    await loadGsi();
    const google = window.google;
    if (!google?.accounts?.oauth2) return alert("google oauth2 not available");
    if (!tokenClientRef.current) {
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
        callback: (resp: { error?: string; access_token?: string }) => {
          if (resp.error) {
            alert(resp.error);
            return;
          }
          localStorage.setItem(LS_TOKEN, resp.access_token || "");
          setToken(resp.access_token || null);
          window.dispatchEvent(new Event("cleaningDutyTokenChanged"));
        },
      });
    }
    try {
      tokenClientRef.current.requestAccessToken({ prompt: "consent" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg);
    }
  };

  const signOut = async () => {
    const t = localStorage.getItem(LS_TOKEN);
    if (!t) return;
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${t}`, {
        method: "POST",
        headers: { "Content-type": "application/x-www-form-urlencoded" },
      });
    } catch {
      // ignore
    }
    localStorage.removeItem(LS_TOKEN);
    setToken(null);
    window.dispatchEvent(new Event("cleaningDutyTokenChanged"));
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm">Spreadsheet ID</label>
      <input
        className="border rounded px-3 py-1"
        value={spreadsheetId ?? ""}
        onChange={(e) => setSpreadsheetId(e.target.value)}
        placeholder="スプレッドシートID"
      />

      <label className="text-sm">OAuth Client ID</label>
      <input
        className="border rounded px-3 py-1"
        value={clientId ?? ""}
        onChange={(e) => setClientId(e.target.value)}
        placeholder="OAuth Client ID (Web application)"
      />

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={save}
        >
          保存
        </button>
        <button className="bg-gray-100 px-3 py-1 rounded" onClick={clearAll}>
          クリア
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={signIn}
        >
          サインイン
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={signOut}
        >
          サインアウト
        </button>
        <span className="text-sm text-gray-600">
          {token ? "サインイン済み" : "未サインイン"}
        </span>
      </div>

      <p className="text-xs text-gray-600">
        ※ ドメインをGoogle CloudでAuthorized JavaScript
        originsに追加してください。
      </p>
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
    | "members"
    | "sessions"
    | "data"
    | "cleaning";
  const [selectedTab, setSelectedTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "全て" },
    { key: "reminders", label: "リマインダー" },
    { key: "mqtt", label: "MQTT" },
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

          {selectedTab === "cleaning" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  掃除当番 (Google Sheets)
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  ブラウザ経由でSheets APIを使うためのOAuth Client
                  IDとSpreadsheet IDを設定します。
                  詳細は右パネルの「掃除当番」カードで署名・取得してください。
                </p>
                <CleaningSettings />
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
