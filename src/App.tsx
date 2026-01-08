import { useState, useMemo, useEffect } from "react";
import { Seat } from "./components/Seat";
import { UserSelectModal } from "./components/UserSelectModal";
import { ActionModal } from "./components/ActionModal";
import { AdminModal } from "./components/AdminModal";
import { TrainInfo } from "./components/TrainInfo";
import { NewsVideo } from "./components/NewsVideo";
import type { User, SeatLayout, UserCategory } from "./types";

// --- 初期レイアウト ---
const INITIAL_LAYOUT: SeatLayout[] = [
  { rowId: "R1", seats: ["R11", "R12", "R13", "R13"] },
  { rowId: "R2", seats: ["R21", "R22", "R23", "R24"] },
  { rowId: "R3", seats: ["R31", "R32", "R33", "R34"] },
  { rowId: "R4", seats: ["R41", "R42", "R43", "R44"] },
];

const DEFAULT_USERS: User[] = [
  { id: "u1", name: "Yamada", category: "Staff" },
  { id: "u2", name: "Tanaka", category: "M" },
];

const DEFAULT_SEATS: Record<string, string | null> = {};
INITIAL_LAYOUT.forEach((row) => {
  row.seats.forEach((seatId) => (DEFAULT_SEATS[seatId] = null));
});

function App() {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("lab-users-data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parsed.map((u: any) => ({
          ...u,
          category: u.category || "Other",
        }));
      } catch {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem("lab-users-data", JSON.stringify(users));
  }, [users]);

  const [seatStates, setSeatStates] = useState<Record<string, string | null>>(
    () => {
      const saved = localStorage.getItem("lab-seat-data");
      return saved ? JSON.parse(saved) : DEFAULT_SEATS;
    }
  );

  useEffect(() => {
    localStorage.setItem("lab-seat-data", JSON.stringify(seatStates));
  }, [seatStates]);

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const seatedUserIds = useMemo(
    () => Object.values(seatStates).filter((id): id is string => id !== null),
    [seatStates]
  );
  const availableUsers = useMemo(
    () => users.filter((user) => !seatedUserIds.includes(user.id)),
    [users, seatedUserIds]
  );

  const handleSeatClick = (seatId: string) => {
    const currentUserId = seatStates[seatId];
    setSelectedSeatId(seatId);
    if (currentUserId) setIsActionModalOpen(true);
    else setIsUserModalOpen(true);
  };

  const handleLeaveSeat = () => {
    if (!selectedSeatId) return;
    setSeatStates((prev) => ({ ...prev, [selectedSeatId]: null }));
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedSeatId) return;
    setSeatStates((prev) => ({ ...prev, [selectedSeatId]: user.id }));
    setIsUserModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleAddUser = (name: string, category: UserCategory) => {
    setUsers((prev) => [
      ...prev,
      { id: Date.now().toString(), name, category },
    ]);
  };

  const handleRemoveUser = (userId: string) => {
    setSeatStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === userId) next[key] = null;
      });
      return next;
    });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleReset = () => {
    if (confirm("全ての席状況をリセットしますか？"))
      setSeatStates(DEFAULT_SEATS);
  };

  const getSelectedUserName = () => {
    if (!selectedSeatId) return "";
    const userId = seatStates[selectedSeatId];
    return users.find((u) => u.id === userId)?.name || "";
  };

  return (
    <div className="h-screen bg-gray-50 p-2 md:p-3 select-none flex flex-col overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2 px-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          大島研究室
        </h1>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={handleReset}
            className="text-xs md:text-sm text-gray-400 hover:text-red-500 underline"
          >
            全席リセット
          </button>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-gray-800 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-gray-700 shadow-md"
          >
            ⚙ メンバー管理
          </button>
        </div>
      </div>
      <div className="flex flex-1 gap-3 md:gap-4 max-w-7xl mx-auto w-full h-full overflow-hidden">
        <div className="flex-1 min-w-0 bg-white p-4 md:p-5 rounded-xl shadow-lg h-full overflow-y-auto">
          {INITIAL_LAYOUT.map((row) => (
            <div
              key={row.rowId}
              className="mb-0.5 border-b border-gray-100 pb-4 last:border-0 last:mb-0"
            >
              <h2 className="text-xl font-semibold text-gray-500 mb-2 pl-2">
                {row.rowId} 列
              </h2>
              <div className="flex flex-wrap gap-2">
                {row.seats.map((seatId) => {
                  const currentUserId = seatStates[seatId];
                  const currentUser = currentUserId
                    ? users.find((u) => u.id === currentUserId) || null
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
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col gap-2">
          <div className="flex-1 min-h-0">
            <TrainInfo />
          </div>
          <div className="flex-1 min-h-0">
            <NewsVideo />
          </div>
        </div>
      </div>
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
