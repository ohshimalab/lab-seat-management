import { useMemo } from "react";
import type { SeatState, SeatTimelineSlice, User } from "../types";

interface SeatCard {
  seatState: SeatState;
  user: User | null;
  timeline?: SeatTimelineSlice[];
}

interface Params {
  seatStates: Record<string, SeatState>;
  users: User[];
  todaySeatTimeline?: Record<string, SeatTimelineSlice[]>;
}

export const useSeatViewModel = ({
  seatStates,
  users,
  todaySeatTimeline = {},
}: Params) => {
  const { seatedUserIds, availableUsers, hasEmptySeat, seatCards } =
    useMemo(() => {
      const seatCardsNext: Record<string, SeatCard> = {};
      const userIds: string[] = [];

      Object.entries(seatStates).forEach(([seatId, seatState]) => {
        if (seatState.userId) userIds.push(seatState.userId);
        const user = seatState.userId
          ? users.find((u) => u.id === seatState.userId) || null
          : null;
        seatCardsNext[seatId] = {
          seatState,
          user,
          timeline: todaySeatTimeline[seatId],
        };
      });

      const seatedIdsUnique = Array.from(new Set(userIds));
      const available = users.filter(
        (user) => !seatedIdsUnique.includes(user.id)
      );
      const empty = Object.values(seatStates).some((s) => s.userId === null);

      return {
        seatedUserIds: seatedIdsUnique,
        availableUsers: available,
        hasEmptySeat: empty,
        seatCards: seatCardsNext,
      };
    }, [seatStates, users, todaySeatTimeline]);

  return { seatedUserIds, availableUsers, hasEmptySeat, seatCards };
};
