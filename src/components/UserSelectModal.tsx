import React, { useMemo } from "react";
import type { User, UserCategory } from "../types";

interface Props {
  isOpen: boolean;
  users: User[];
  stayDurations: Record<string, string>;
  onSelect: (user: User) => void;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<UserCategory, string> = {
  Staff: "教職員 (Staff)",
  D: "博士課程 (Doctor)",
  M: "修士課程 (Master)",
  B: "学士課程 (Bachelor)",
  Other: "その他 (Other)",
};

export const UserSelectModal: React.FC<Props> = ({
  isOpen,
  users,
  stayDurations,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const groupedUsers = useMemo(() => {
    const groups: Partial<Record<UserCategory, User[]>> = {};
    (Object.keys(CATEGORY_CONFIG) as UserCategory[]).forEach((cat) => {
      groups[cat] = [];
    });
    users.forEach((user) => {
      const cat = user.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat]?.push(user);
    });
    return groups;
  }, [users]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-3xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            誰が座りますか？
          </h2>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-300 text-sm"
          >
            ✕ 閉じる
          </button>
        </div>
        <div className="overflow-y-auto p-1 md:p-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, label]) => {
            const catKey = key as UserCategory;
            const categoryUsers = groupedUsers[catKey] || [];
            if (categoryUsers.length === 0) return null;
            return (
              <div key={catKey} className="mb-6 last:mb-0">
                <h3 className="text-base md:text-lg font-bold text-gray-500 mb-2 border-l-4 border-blue-500 pl-2">
                  {label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  {categoryUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onSelect(user)}
                      className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-900 font-bold py-3 px-2 rounded-xl text-base md:text-lg transition-all active:scale-95 shadow-sm truncate"
                    >
                      {user.name} ({stayDurations[user.id] || "0m"})
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              選択可能なメンバーがいません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
