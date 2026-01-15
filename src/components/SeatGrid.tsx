import type React from "react";
import { useMemo } from "react";
import { Seat } from "./Seat";
import type {
  SeatLayout,
  SeatState,
  SeatStatus,
  User,
  SeatTimelineSlice,
} from "../types";

interface SeatGridProps {
  layout: SeatLayout[];
  seatStates: Record<string, SeatState>;
  users: User[];
  draggingSeatId: string | null;
  todaySeatTimeline: Record<string, SeatTimelineSlice[]>;
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
  todaySeatTimeline,
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
          const timeline = card?.timeline || todaySeatTimeline[seatId];
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

export const SeatGrid: React.FC<SeatGridProps> = (props) => {
  const { layout, seatStates, users, todaySeatTimeline } = props;

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
