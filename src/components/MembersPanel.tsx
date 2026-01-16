import React, { useState } from "react";
import type { User, UserCategory } from "../types";

interface Props {
  users: User[];
  onAddUser: (name: string, category: UserCategory) => void;
  onRemoveUser: (userId: string) => void;
}

export const MembersPanel: React.FC<Props> = ({
  users,
  onAddUser,
  onRemoveUser,
}) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserCategory, setNewUserCategory] = useState<UserCategory>("B");

  const handleAdd = () => {
    if (!newUserName.trim()) return;
    onAddUser(newUserName.trim(), newUserCategory);
    setNewUserName("");
  };

  return (
    <>
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
            <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-sm font-bold ${
                    user.category === "Staff"
                      ? "bg-purple-100 text-purple-700"
                      : ""
                  } ${user.category === "D" ? "bg-red-100 text-red-700" : ""} ${
                    user.category === "M" ? "bg-blue-100 text-blue-700" : ""
                  } ${user.category === "B" ? "bg-green-100 text-green-700" : ""} ${
                    !user.category || user.category === "Other"
                      ? "bg-gray-100 text-gray-700"
                      : ""
                  }`}
                >
                  {user.category || "Other"}
                </span>
              </td>
              <td className="p-3 text-lg font-bold text-gray-700">{user.name}</td>
              <td className="p-3 text-right">
                <button
                  onClick={() => {
                    if (confirm(`「${user.name}」さんを削除してもよろしいですか？`))
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
    </>
  );
};

export default MembersPanel;
