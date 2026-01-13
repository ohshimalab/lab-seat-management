import React, { useMemo } from "react";
import type { User, UserCategory } from "../types";

interface Props {
  isOpen: boolean;
  users: User[];
  selectedUserId: string | null;
  assignedSeatId: string | null;
  hasAnySeat: boolean;
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<UserCategory, string> = {
  Staff: "教職員 (Staff)",
  D: "博士課程 (Doctor)",
  M: "修士課程 (Master)",
  B: "学士課程 (Bachelor)",
  Other: "その他 (Other)",
};

export const RandomSeatModal: React.FC<Props> = ({
  isOpen,
  users,
  selectedUserId,
  assignedSeatId,
  hasAnySeat,
  onSelectUser,
  onClose,
}) => {
  if (!isOpen) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const groupedUsers = useMemo(() => {
    const groups: Partial<Record<UserCategory, User[]>> = {};
    (Object.keys(CATEGORY_LABELS) as UserCategory[]).forEach((cat) => {
      groups[cat] = [];
    });
    users.forEach((user) => {
      const cat = user.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat]?.push(user);
    });
    return groups;
  }, [users]);

  const disabledSelect = !hasAnySeat || users.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-3xl shadow-2xl m-2 md:m-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            🎲 ランダム着席
          </h2>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-300 text-sm"
          >
            ✕ 閉じる
          </button>
        </div>

        {!hasAnySeat && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm md:text-base">
            空席がありません。席が空いてからお試しください。
          </div>
        )}

        <div className="overflow-y-auto p-1 md:p-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const catKey = key as UserCategory;
            const categoryUsers = groupedUsers[catKey] || [];
            if (categoryUsers.length === 0) return null;
            return (
              <div key={catKey} className="mb-6 last:mb-0">
                <h3 className="text-base md:text-lg font-bold text-gray-500 mb-2 border-l-4 border-purple-500 pl-2">
                  {label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  {categoryUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onSelectUser(user)}
                      disabled={disabledSelect}
                      className={`border-2 font-bold py-3 px-2 rounded-xl text-base md:text-lg transition-all active:scale-95 shadow-sm truncate ${
                        selectedUserId === user.id
                          ? "bg-purple-600 text-white border-purple-700"
                          : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900"
                      } ${
                        disabledSelect ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {user.name}
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

        <div className="mt-3 flex flex-col gap-2">
          <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm md:text-base">
            <div className="font-bold text-gray-700 mb-1">結果</div>
            {selectedUserId && assignedSeatId ? (
              <div className="text-gray-800">
                <span className="font-bold">{assignedSeatId}</span>{" "}
                に着席しました。
              </div>
            ) : (
              <div className="text-gray-500">
                メンバーを選択すると自動で席を決めます。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
