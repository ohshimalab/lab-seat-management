import type React from "react";
import { SeatGrid } from "./SeatGrid";
import { TrainInfo } from "./TrainInfo";
import { NewsVideo } from "./NewsVideo";
import { PanelCard } from "./PanelCard";
import type { SeatLayout, SeatState, SeatTimelineSlice, User } from "../types";

interface MainPanelsProps {
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

export const MainPanels = ({
  layout,
  seatStates,
  users,
  draggingSeatId,
  todaySeatTimeline,
  onSeatClick,
  onSeatDragStart,
  onSeatDragOver,
  onSeatDrop,
  onSeatDragEnd,
}: MainPanelsProps) => {
  return (
    <div className="flex flex-1 gap-3 md:gap-4 max-w-7xl mx-auto w-full h-full overflow-hidden">
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <PanelCard className="overflow-y-auto">
          <SeatGrid
            layout={layout}
            seatStates={seatStates}
            users={users}
            draggingSeatId={draggingSeatId}
            todaySeatTimeline={todaySeatTimeline}
            onSeatClick={onSeatClick}
            onSeatDragStart={onSeatDragStart}
            onSeatDragOver={onSeatDragOver}
            onSeatDrop={onSeatDrop}
            onSeatDragEnd={onSeatDragEnd}
          />
        </PanelCard>
      </div>
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col gap-2">
        <PanelCard className="flex-1 min-h-0">
          <TrainInfo />
        </PanelCard>
        <PanelCard className="flex-1 min-h-0">
          <NewsVideo />
        </PanelCard>
      </div>
    </div>
  );
};
