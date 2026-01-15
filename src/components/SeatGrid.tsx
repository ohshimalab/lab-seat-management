import type React from "react";
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
}

const SeatRow: React.FC<SeatRowProps> = ({
  row,
  seatStates,
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
          const seatState = seatStates[seatId] || {
            userId: null,
            status: "present" as SeatStatus,
            startedAt: null,
          };
          const currentUser = seatState.userId
            ? users.find((u) => u.id === seatState.userId) || null
            : null;
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
              timelineSlices={todaySeatTimeline[seatId]}
            />
          );
        })}
      </div>
    </div>
  );
};

export const SeatGrid: React.FC<SeatGridProps> = (props) => {
  const { layout } = props;
  return (
    <>
      {layout.map((row) => (
        <SeatRow key={row.rowId} row={row} {...props} />
      ))}
    </>
  );
};
