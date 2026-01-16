import React, { useMemo, useState } from "react";
import type { StaySession, User } from "../types";

interface Props {
  users: User[];
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
}

export const SessionsEditor: React.FC<Props> = ({
  users,
  sessions,
  onAddSession,
  onUpdateSession,
  onRemoveSession,
}) => {
  const [sessionUserId, setSessionUserId] = useState<string>("");
  const [sessionSeatId, setSessionSeatId] = useState<string>("");
  const [sessionStart, setSessionStart] = useState<string>("");
  const [sessionEnd, setSessionEnd] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string>("");
  const [editSeatId, setEditSeatId] = useState<string>("");
  const [editStart, setEditStart] = useState<string>("");
  const [editEnd, setEditEnd] = useState<string>("");

  const sortedSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => (b.start || 0) - (a.start || 0))
      .slice(0, 50);
  }, [sessions]);

  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => (map[u.id] = u.name));
    return map;
  }, [users]);

  const toInputValue = (value: number) => {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const parseDateInput = (value: string) => {
    if (!value) return null;
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  };

  const handleAddSession = () => {
    const startMs = parseDateInput(sessionStart);
    const endMs = sessionEnd ? parseDateInput(sessionEnd) : null;
    if (!sessionUserId || !sessionSeatId || startMs === null) return;
    if (endMs !== null && endMs <= startMs) return;
    onAddSession({
      userId: sessionUserId,
      seatId: sessionSeatId,
      start: startMs,
      end: endMs,
    });
    setSessionSeatId("");
    setSessionStart("");
    setSessionEnd("");
  };

  const beginEdit = (session: StaySession) => {
    if (!session.id) return;
    setEditingId(session.id);
    setEditUserId(session.userId);
    setEditSeatId(session.seatId);
    setEditStart(toInputValue(session.start));
    setEditEnd(session.end ? toInputValue(session.end) : "");
  };

  const handleUpdateSession = () => {
    if (!editingId) return;
    const startMs = parseDateInput(editStart);
    const endMs = editEnd ? parseDateInput(editEnd) : null;
    if (!editUserId || !editSeatId || startMs === null) return;
    if (endMs !== null && endMs <= startMs) return;
    onUpdateSession(editingId, {
      userId: editUserId,
      seatId: editSeatId,
      start: startMs,
      end: endMs,
    });
    setEditingId(null);
    setEditUserId("");
    setEditSeatId("");
    setEditStart("");
    setEditEnd("");
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">履歴管理</h3>
        <span className="text-sm text-gray-500">最近50件まで表示</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 mb-3 bg-gray-50 p-3 rounded-lg">
        <select
          value={sessionUserId}
          onChange={(e) => setSessionUserId(e.target.value)}
          className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm md:text-base bg-white"
        >
          <option value="">ユーザーを選択</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={sessionSeatId}
          onChange={(e) => setSessionSeatId(e.target.value)}
          placeholder="席ID (例: R11)"
          className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm md:text-base"
        />
        <input
          type="datetime-local"
          value={sessionStart}
          onChange={(e) => setSessionStart(e.target.value)}
          aria-label="session-start"
          className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm md:text-base"
        />
        <input
          type="datetime-local"
          value={sessionEnd}
          onChange={(e) => setSessionEnd(e.target.value)}
          aria-label="session-end"
          className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm md:text-base"
        />
        <button
          onClick={handleAddSession}
          disabled={!sessionUserId || !sessionSeatId || !sessionStart}
          className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          追加
        </button>
      </div>

      <div className="space-y-2">
        {sortedSessions.map((session) => {
          const startStr = new Date(session.start).toLocaleString();
          const endStr = session.end
            ? new Date(session.end).toLocaleString()
            : "進行中";
          const name = userNameMap[session.userId] || session.userId;
          const isEditing = editingId === session.id;
          const rowKey = session.id || `${session.userId}-${session.start}`;
          return (
            <div
              key={rowKey}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
            >
              {isEditing ? (
                <div className="flex flex-col gap-2 w-full md:flex-col md:items-end md:gap-3">
                  <div className="flex flex-col gap-2 w-full md:flex-row md:items-end md:gap-3">
                    <select
                      value={editUserId}
                      onChange={(e) => setEditUserId(e.target.value)}
                      aria-label="edit-user"
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editSeatId}
                      onChange={(e) => setEditSeatId(e.target.value)}
                      aria-label="edit-seat"
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm"
                    />
                    <input
                      type="datetime-local"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      aria-label="edit-start"
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm"
                    />
                    <input
                      type="datetime-local"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      aria-label="edit-end"
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full md:flex-row md:items-end md:gap-3">
                    <div className="flex gap-2 justify-end w-full md:w-auto">
                      <button
                        onClick={handleUpdateSession}
                        className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 font-bold px-3 py-1.5 rounded-lg text-sm hover:underline"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col text-sm md:text-base text-gray-800 flex-1">
                  <span className="font-bold">{name}</span>
                  <span className="text-gray-600">席: {session.seatId}</span>
                  <span className="text-gray-600">開始: {startStr}</span>
                  <span className="text-gray-600">終了: {endStr}</span>
                </div>
              )}
              {!isEditing && (
                <div className="flex items-center gap-3 ml-3">
                  <button
                    onClick={() => session.id && beginEdit(session)}
                    className="text-blue-600 font-bold hover:underline text-sm"
                    disabled={!session.id}
                  >
                    編集
                  </button>
                  <button
                    onClick={() =>
                      confirm("この履歴を削除しますか？") &&
                      session.id &&
                      onRemoveSession(session.id)
                    }
                    className="text-red-500 font-bold hover:underline text-sm"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {sortedSessions.length === 0 && (
          <div className="text-center text-gray-400 py-3">履歴がありません</div>
        )}
      </div>
    </div>
  );
};

export default SessionsEditor;
