import type React from "react";
import { SeatGrid } from "./SeatGrid";
import { TrainInfo } from "./TrainInfo";
import { TodayInfo } from "./TodayInfo";
import { CleaningDutyBar } from "./CleaningDutyBar";
import { PanelCard } from "./PanelCard";
import type { SeatLayout, SeatState, StaySession, User } from "../types";

interface MainPanelsProps {
  layout: SeatLayout[];
  seatStates: Record<string, SeatState>;
  users: User[];
  draggingSeatId: string | null;
  sessions: StaySession[];
  nowMs: number;
  cleaningDutyUser?: string | null;
  nextCleaningDutyUser?: string | null;
  onSeatClick: (seatId: string) => void;
  onSeatDragStart: (seatId: string) => void;
  onSeatDragOver: (
    seatId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  onSeatDrop: (seatId: string) => void;
  onSeatDragEnd: () => void;
}

export const MainPanels = ({
  layout,
  seatStates,
  users,
  draggingSeatId,
  sessions,
  nowMs,
  cleaningDutyUser,
  nextCleaningDutyUser,
  onSeatClick,
  onSeatDragStart,
  onSeatDragOver,
  onSeatDrop,
  onSeatDragEnd,
}: MainPanelsProps) => {
  return (
    <div className="flex flex-1 gap-3 md:gap-4 max-w-7xl mx-auto w-full h-full overflow-hidden">
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <PanelCard scroll="y">
          <SeatGrid
            layout={layout}
            seatStates={seatStates}
            users={users}
            draggingSeatId={draggingSeatId}
            sessions={sessions}
            nowMs={nowMs}
            onSeatClick={onSeatClick}
            onSeatDragStart={onSeatDragStart}
            onSeatDragOver={onSeatDragOver}
            onSeatDrop={onSeatDrop}
            onSeatDragEnd={onSeatDragEnd}
          />
        </PanelCard>
      </div>
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col gap-2.5">
        <div className="flex-1 min-h-0 overflow-hidden">
          <TrainInfo />
        </div>
        {cleaningDutyUser && (
          <CleaningDutyBar
            dutyUser={cleaningDutyUser}
            nextUser={nextCleaningDutyUser}
          />
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TodayInfo />
        </div>
      </div>
    </div>
  );
};
