import React, { useMemo, useState } from "react";
import type { StaySession, User, UserCategory } from "../types";

interface Props {
  isOpen: boolean;
  users: User[];
  onAddUser: (name: string, category: UserCategory) => void;
  onRemoveUser: (userId: string) => void;
  sessions: StaySession[];
  onAddSession: (session: {
    userId: string;
    seatId: string;
    start: number;
    end: number | null;
  }) => void;
  onRemoveSession: (sessionId: string) => void;
  onClose: () => void;
}

export const AdminModal: React.FC<Props> = ({
  isOpen,
  users,
  onAddUser,
  onRemoveUser,
  sessions,
  onAddSession,
  onRemoveSession,
  onClose,
}) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserCategory, setNewUserCategory] = useState<UserCategory>("B");
  const [sessionUserId, setSessionUserId] = useState<string>("");
  const [sessionSeatId, setSessionSeatId] = useState<string>("");
  const [sessionStart, setSessionStart] = useState<string>("");
  const [sessionEnd, setSessionEnd] = useState<string>("");

  const sortedSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => (b.start || 0) - (a.start || 0))
      .slice(0, 50);
  }, [sessions]);

  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      map[u.id] = u.name;
    });
    return map;
  }, [users]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newUserName.trim()) return;
    onAddUser(newUserName.trim(), newUserCategory);
    setNewUserName("");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            メンバー管理
          </h2>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 active:scale-95 transition-transform"
          >
            閉じる
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
          <select
            value={newUserCategory}
            onChange={(e) => setNewUserCategory(e.target.value as UserCategory)}
            className="border-2 border-gray-300 rounded-lg px-3 py-2 text-base md:text-lg font-bold bg-white focus:border-blue-500 cursor-pointer"
          >
            <option value="Staff">Staff</option>
            <option value="D">D (博士)</option>
            <option value="M">M (修士)</option>
            <option value="B">B (学部)</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="名前を入力"
            className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-base md:text-lg focus:border-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newUserName.trim()}
            className="bg-green-500 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all whitespace-nowrap"
          >
            追加
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="p-2 font-medium">カテゴリー</th>
                <th className="p-2 font-medium">名前</th>
                <th className="p-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-bold ${
                        user.category === "Staff"
                          ? "bg-purple-100 text-purple-700"
                          : ""
                      } ${
                        user.category === "D" ? "bg-red-100 text-red-700" : ""
                      } ${
                        user.category === "M" ? "bg-blue-100 text-blue-700" : ""
                      } ${
                        user.category === "B"
                          ? "bg-green-100 text-green-700"
                          : ""
                      } ${
                        !user.category || user.category === "Other"
                          ? "bg-gray-100 text-gray-700"
                          : ""
                      }`}
                    >
                      {user.category || "Other"}
                    </span>
                  </td>
                  <td className="p-3 text-lg font-bold text-gray-700">
                    {user.name}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `「${user.name}」さんを削除してもよろしいですか？`
                          )
                        )
                          onRemoveUser(user.id);
                      }}
                      className="text-red-500 font-bold hover:underline px-2 py-1"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-gray-400 py-4">メンバーがいません</p>
          )}

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
                className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm md:text-base"
              />
              <input
                type="datetime-local"
                value={sessionEnd}
                onChange={(e) => setSessionEnd(e.target.value)}
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
                return (
                  <div
                    key={session.id || `${session.userId}-${session.start}`}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                  >
                    <div className="flex flex-col text-sm md:text-base text-gray-800">
                      <span className="font-bold">{name}</span>
                      <span className="text-gray-600">
                        席: {session.seatId}
                      </span>
                      <span className="text-gray-600">開始: {startStr}</span>
                      <span className="text-gray-600">終了: {endStr}</span>
                    </div>
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
                );
              })}
              {sortedSessions.length === 0 && (
                <div className="text-center text-gray-400 py-3">
                  履歴がありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
