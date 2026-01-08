import React, { useMemo } from 'react';
import type { User, UserCategory } from '../types';

interface Props {
  isOpen: boolean;
  users: User[];
  onSelect: (user: User) => void;
  onClose: () => void;
}

// カテゴリーの表示順序とラベル名
const CATEGORY_CONFIG: Record<UserCategory, string> = {
  'Staff': '教職員 (Staff)',
  'D': '博士課程 (Doctor)',
  'M': '修士課程 (Master)',
  'B': '学士課程 (Bachelor)',
  'Other': 'その他 (Other)',
};

export const UserSelectModal: React.FC<Props> = ({ isOpen, users, onSelect, onClose }) => {
  if (!isOpen) return null;

  // ユーザーをカテゴリーごとにグループ化するロジック
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const groupedUsers = useMemo(() => {
    const groups: Partial<Record<UserCategory, User[]>> = {};
    
    // 初期化
    (Object.keys(CATEGORY_CONFIG) as UserCategory[]).forEach(cat => {
      groups[cat] = [];
    });

    // 振り分け
    users.forEach(user => {
      // 古いデータでcategoryがない場合はOtherに入れる
      const cat = user.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat]?.push(user);
    });

    return groups;
  }, [users]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-2xl m-4 flex flex-col max-h-[90vh]">
        
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-2xl font-bold text-gray-800">誰が座りますか？</h2>
          <button 
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* ユーザーリスト（スクロール可能） */}
        <div className="overflow-y-auto p-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, label]) => {
            const catKey = key as UserCategory;
            const categoryUsers = groupedUsers[catKey] || [];

            if (categoryUsers.length === 0) return null;

            return (
              <div key={catKey} className="mb-6 last:mb-0">
                <h3 className="text-lg font-bold text-gray-500 mb-2 border-l-4 border-blue-500 pl-2">
                  {label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onSelect(user)}
                      className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-900 font-bold py-4 px-2 rounded-xl text-lg transition-all active:scale-95 shadow-sm truncate"
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

      </div>
    </div>
  );
};