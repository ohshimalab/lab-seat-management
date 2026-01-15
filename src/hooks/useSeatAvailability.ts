import { useMemo } from "react";
import type { SeatState, User } from "../types";

interface Params {
  seatStates: Record<string, SeatState>;
  users: User[];
}

export const useSeatAvailability = ({ seatStates, users }: Params) => {
  return useMemo(() => {
    const seatedUserIds: string[] = [];
    Object.values(seatStates).forEach((seat) => {
      if (seat.userId) seatedUserIds.push(seat.userId);
    });
    const seatedIdsUnique = Array.from(new Set(seatedUserIds));
    const availableUsers = users.filter(
      (user) => !seatedIdsUnique.includes(user.id)
    );
    const hasEmptySeat = Object.values(seatStates).some(
      (s) => s.userId === null
    );
    return { seatedUserIds: seatedIdsUnique, availableUsers, hasEmptySeat };
  }, [seatStates, users]);
};
