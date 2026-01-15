import { useCallback } from "react";
import type { SeatState, User, UserCategory } from "../types";

interface Params {
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  seatStates: Record<string, SeatState>;
  setSeatStates: React.Dispatch<React.SetStateAction<Record<string, SeatState>>>;
  endSession: (userId: string, seatId: string, endedAt: number) => void;
  finalizeAllSeats: (now: number) => void;
  createEmptySeatStates: () => Record<string, SeatState>;
}

export const useAdminActions = ({
  setUsers,
  seatStates,
  setSeatStates,
  endSession,
  finalizeAllSeats,
  createEmptySeatStates,
}: Params) => {
  const handleAddUser = useCallback(
    (name: string, category: UserCategory) => {
      setUsers((prev) => [
        ...prev,
        { id: Date.now().toString(), name, category },
      ]);
    },
    [setUsers]
  );

  const handleRemoveUser = useCallback(
    (userId: string) => {
      Object.keys(seatStates).forEach((seatId) => {
        const seat = seatStates[seatId];
        if (seat?.userId === userId) endSession(userId, seatId, Date.now());
      });
      setSeatStates((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key]?.userId === userId) {
            next[key] = { userId: null, status: "present", startedAt: null };
          }
        });
        return next;
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    },
    [endSession, seatStates, setSeatStates, setUsers]
  );

  const handleReset = useCallback(() => {
    if (confirm("全ての席状況をリセットしますか？")) {
      const now = Date.now();
      finalizeAllSeats(now);
      setSeatStates(createEmptySeatStates());
    }
  }, [createEmptySeatStates, finalizeAllSeats, setSeatStates]);

  return { handleAddUser, handleRemoveUser, handleReset };
};
