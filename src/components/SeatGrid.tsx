import type React from "react";
import { useMemo } from "react";
import { Seat } from "./Seat";
import type {
  SeatLayout,
  SeatState,
  SeatStatus,
  StaySession,
  User,
  SeatTimelineSlice,
  SeatTimelineState,
} from "../types";

interface SeatGridProps {
  layout: SeatLayout[];
  seatStates: Record<string, SeatState>;
  users: User[];
  draggingSeatId: string | null;
  sessions: StaySession[];
  nowMs: number;
  onSeatClick: (seatId: string) => void;
  onSeatDragStart: (seatId: string) => void;
  onSeatDragOver: (
    seatId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => void;
  onSeatDrop: (seatId: string) => void;
  onSeatDragEnd: () => void;
}

interface SeatRowProps extends Omit<SeatGridProps, "layout"> {
  row: SeatLayout;
  seatCards: Record<
    string,
    {
      seatState: SeatState;
      user: User | null;
      timeline?: SeatTimelineSlice[];
    }
  >;
}

const SeatRow: React.FC<SeatRowProps> = ({
  row,
  seatStates,
  seatCards,
  users,
  draggingSeatId,
  onSeatClick,
  onSeatDragStart,
  onSeatDragOver,
  onSeatDrop,
  onSeatDragEnd,
}) => {
  return (
    <div className="mb-0.5 border-b border-gray-100 pb-4 last:border-0 last:mb-0">
      <h2 className="text-xl font-semibold text-gray-500 mb-2 pl-2">
        {row.rowId} 列
      </h2>
      <div className="flex flex-wrap gap-2">
        {row.seats.map((seatId) => {
          const card = seatCards?.[seatId];
          const seatState = card?.seatState ||
            seatStates[seatId] || {
              userId: null,
              status: "present" as SeatStatus,
              startedAt: null,
            };
          const currentUser = card?.user
            ? card.user
            : seatState.userId
            ? users.find((u) => u.id === seatState.userId) || null
            : null;
          const timeline = card?.timeline;
          return (
            <Seat
              key={seatId}
              seatId={seatId}
              currentUser={currentUser}
              status={seatState.status}
              onClick={onSeatClick}
              isDroppable={Boolean(draggingSeatId && draggingSeatId !== seatId)}
              onDragStart={onSeatDragStart}
              onDragOver={onSeatDragOver}
              onDrop={onSeatDrop}
              onDragEnd={onSeatDragEnd}
              timelineSlices={timeline}
            />
          );
        })}
      </div>
    </div>
  );
};

const TIMELINE_BUCKET_MINUTES = 30;

export const SeatGrid: React.FC<SeatGridProps> = (props) => {
  const { layout, seatStates, users, sessions, nowMs } = props;

  const todaySeatTimeline = useMemo(() => {
    const bucketMs = TIMELINE_BUCKET_MINUTES * 60 * 1000;
    const startOfDay = new Date(nowMs);
    startOfDay.setHours(0, 0, 0, 0);
    const dayStart = startOfDay.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const bucketCount = Math.max(1, Math.ceil((dayEnd - dayStart) / bucketMs));

    const base: Record<string, SeatTimelineSlice[]> = {};
    Object.keys(seatStates).forEach((seatId) => {
      base[seatId] = Array.from({ length: bucketCount }, (_, idx) => {
        const start = dayStart + idx * bucketMs;
        return {
          start,
          end: Math.min(start + bucketMs, dayEnd),
          state: "empty" as SeatTimelineState,
        };
      });
    });

    sessions.forEach((session) => {
      const slices = base[session.seatId];
      if (!slices) return;
      const effectiveStart = Math.max(session.start, dayStart);
      const rawEnd = session.end ?? nowMs;
      const effectiveEnd = Math.min(rawEnd, dayEnd);
      if (effectiveEnd <= dayStart || effectiveEnd <= effectiveStart) return;

      const startIdx = Math.max(
        0,
        Math.floor((effectiveStart - dayStart) / bucketMs)
      );
      const endIdx = Math.min(
        slices.length,
        Math.ceil((effectiveEnd - dayStart) / bucketMs)
      );

      for (let idx = startIdx; idx < endIdx; idx += 1) {
        const slice = slices[idx];
        if (slice) slice.state = "present";
      }
    });

    Object.entries(seatStates).forEach(([seatId, seat]) => {
      if (!seat?.userId || seat.status !== "away") return;
      const slices = base[seatId];
      if (!slices || slices.length === 0) return;
      const currentIdx = Math.min(
        slices.length - 1,
        Math.floor((nowMs - dayStart) / bucketMs)
      );
      const target = slices[currentIdx];
      if (target) target.state = "away";
    });

    return base;
  }, [seatStates, sessions, nowMs]);

  const seatCards = useMemo(() => {
    const cards: Record<
      string,
      {
        seatState: SeatState;
        user: User | null;
        timeline?: SeatTimelineSlice[];
      }
    > = {};
    Object.entries(seatStates).forEach(([seatId, seatState]) => {
      const user = seatState.userId
        ? users.find((u) => u.id === seatState.userId) || null
        : null;
      cards[seatId] = {
        seatState,
        user,
        timeline: todaySeatTimeline[seatId],
      };
    });
    return cards;
  }, [seatStates, todaySeatTimeline, users]);

  return (
    <>
      {layout.map((row) => (
        <SeatRow key={row.rowId} row={row} seatCards={seatCards} {...props} />
      ))}
    </>
  );
};
