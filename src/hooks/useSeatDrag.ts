import { useState } from "react";
import type React from "react";
import type { SeatState } from "../types";

interface Params {
  seatStates: Record<string, SeatState>;
  setSeatStates: React.Dispatch<
    React.SetStateAction<Record<string, SeatState>>
  >;
  startSession: (userId: string, seatId: string, startedAt: number) => void;
  endSession: (userId: string, seatId: string, endedAt: number) => void;
}

export const useSeatDrag = ({
  seatStates,
  setSeatStates,
  startSession,
  endSession,
}: Params) => {
  const [draggingSeatId, setDraggingSeatId] = useState<string | null>(null);

  const handleSeatDragStart = (seatId: string) => {
    if (seatStates[seatId]?.userId) setDraggingSeatId(seatId);
  };

  const handleSeatDragEnd = () => {
    setDraggingSeatId(null);
  };

  const handleSeatDragOver = (
    seatId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!draggingSeatId || seatId === draggingSeatId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleSeatDrop = (targetSeatId: string) => {
    if (!draggingSeatId || draggingSeatId === targetSeatId) {
      setDraggingSeatId(null);
      return;
    }

    const sourceSeat = seatStates[draggingSeatId];
    const targetSeat = seatStates[targetSeatId];
    if (!sourceSeat?.userId) {
      setDraggingSeatId(null);
      return;
    }

    const now = Date.now();
    const userId = sourceSeat.userId;

    setSeatStates((prev) => {
      const from = prev[draggingSeatId];
      const to = prev[targetSeatId];
      if (!from?.userId) return prev;
      const next: Record<string, SeatState> = { ...prev };

      // Swap if target occupied, otherwise move into empty
      if (to?.userId) {
        next[draggingSeatId] = {
          userId: to.userId,
          status: to.status || "present",
          startedAt: now,
        };
        next[targetSeatId] = {
          userId: from.userId,
          status: from.status || "present",
          startedAt: now,
        };
      } else {
        next[draggingSeatId] = {
          userId: null,
          status: "present",
          startedAt: null,
        };
        next[targetSeatId] = {
          userId: from.userId,
          status: from.status || "present",
          startedAt: now,
        };
      }
      return next;
    });

    if (targetSeat?.userId) {
      endSession(userId, draggingSeatId, now);
      endSession(targetSeat.userId, targetSeatId, now);
      startSession(userId, targetSeatId, now);
      startSession(targetSeat.userId, draggingSeatId, now);
    } else {
      endSession(userId, draggingSeatId, now);
      startSession(userId, targetSeatId, now);
    }
    setDraggingSeatId(null);
  };

  return {
    draggingSeatId,
    handleSeatDragStart,
    handleSeatDragOver,
    handleSeatDrop,
    handleSeatDragEnd,
  };
};
