import { useState, useMemo, useEffect } from 'react';
import { Seat } from './components/Seat';
import { UserSelectModal } from './components/UserSelectModal';
import { ActionModal } from './components/ActionModal';
import { AdminModal } from './components/AdminModal';
import type { SeatData, User, SeatLayout, UserCategory } from './types';

// --- 初期レイアウト ---
const INITIAL_LAYOUT: SeatLayout[] = [
  { rowId: 'R1', seats: ['R11', 'R12', 'R13' ] },
  { rowId: 'R2', seats: ['R21', 'R22', 'R23', 'R24'] },
  { rowId: 'R3', seats: ['R31', 'R32', 'R33', 'R34'] },
  { rowId: 'R3', seats: ['R31', 'R32', 'R33', 'R34'] },

];

// 初回起動時のデフォルトユーザー（カテゴリー付き）
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Dr. Pham', category: 'Staff' },
  { id: 'u2', name: 'Tanaka', category: 'M' },
  { id: 'u3', name: 'Suzuki', category: 'M' },
  { id: 'u4', name: 'Yamada', category: 'B' },
  { id: 'u5', name: 'Kato', category: 'B' },
  { id: 'u6', name: 'Watanabe', category: 'D' },
];

// 初回起動時のデフォルト座席
const DEFAULT_SEATS: Record<string, string | null> = {};
INITIAL_LAYOUT.forEach(row => {
  row.seats.forEach(seatId => DEFAULT_SEATS[seatId] = null);
});

function App() {
  // --- ユーザー状態管理 ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lab-users-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // ★互換性対応: 古いデータ(categoryがない)場合のために補完
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parsed.map((u: any) => ({
          ...u,
          category: u.category || 'Other' 
        }));
      } catch {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('lab-users-data', JSON.stringify(users));
  }, [users]);

  // --- 座席状態管理 ---
  const [seatStates, setSeatStates] = useState<Record<string, string | null>>(() => {
    const saved = localStorage.getItem('lab-seat-data');
    return saved ? JSON.parse(saved) : DEFAULT_SEATS;
  });

  useEffect(() => {
    localStorage.setItem('lab-seat-data', JSON.stringify(seatStates));
  }, [seatStates]);

  // --- モーダル状態 ---
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // --- 計算ロジック ---
  const seatedUserIds = useMemo(() => {
    return Object.values(seatStates).filter((id): id is string => id !== null);
  }, [seatStates]);

  const availableUsers = useMemo(() => {
    // ユーザーリストをカテゴリー順(Staff -> D -> M -> B -> Other)などでソートしたい場合はここでsortを入れる
    return users.filter(user => !seatedUserIds.includes(user.id));
  }, [users, seatedUserIds]);

  // --- イベントハンドラ ---
  const handleSeatClick = (seatId: string) => {
    const currentUserId = seatStates[seatId];
    setSelectedSeatId(seatId);
    if (currentUserId) {
      setIsActionModalOpen(true);
    } else {
      setIsUserModalOpen(true);
    }
  };

  const handleLeaveSeat = () => {
    if (!selectedSeatId) return;
    setSeatStates(prev => ({ ...prev, [selectedSeatId]: null }));
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedSeatId) return;
    setSeatStates(prev => ({ ...prev, [selectedSeatId]: user.id }));
    setIsUserModalOpen(false);
    setSelectedSeatId(null);
  };

  // --- 管理機能ロジック ---
  // ★変更: category引数を追加
  const handleAddUser = (name: string, category: UserCategory) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: name,
      category: category // ★保存
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleRemoveUser = (userId: string) => {
    setSeatStates(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] === userId) next[key] = null;
      });
      return next;
    });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleReset = () => {
    if (confirm("全ての席状況をリセットしますか？")) {
      setSeatStates(DEFAULT_SEATS);
    }
  };

  const getSelectedUserName = () => {
    if (!selectedSeatId) return "";
    const userId = seatStates[selectedSeatId];
    return users.find(u => u.id === userId)?.name || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 select-none">
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">
          研究室 席管理ボード
        </h1>
        
        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-red-500 underline"
          >
            全席リセット
          </button>
          <button 
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 shadow-md"
          >
            ⚙ メンバー管理
          </button>
        </div>
      </div>

      {/* 座席エリア */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        {INITIAL_LAYOUT.map((row) => (
          <div key={row.rowId} className="mb-6 border-b border-gray-100 pb-4 last:border-0">
            <h2 className="text-xl font-semibold text-gray-500 mb-2 pl-2">
              {row.rowId} 列
            </h2>
            <div className="flex flex-wrap gap-2">
              {row.seats.map((seatId) => {
                const currentUserId = seatStates[seatId];
                const currentUser = currentUserId 
                  ? users.find(u => u.id === currentUserId) || null 
                  : null;

                return (
                  <Seat
                    key={seatId}
                    seatId={seatId}
                    currentUser={currentUser}
                    onClick={handleSeatClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 各種モーダル */}
      <UserSelectModal 
        isOpen={isUserModalOpen}
        users={availableUsers}
        onSelect={handleUserSelect}
        onClose={() => setIsUserModalOpen(false)}
      />

      <ActionModal
        isOpen={isActionModalOpen}
        seatId={selectedSeatId || ""}
        userName={getSelectedUserName()}
        onLeave={handleLeaveSeat}
        onClose={() => setIsActionModalOpen(false)}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        users={users}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}

export default App;