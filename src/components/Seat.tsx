import React from "react";
import type { SeatStatus, User, SeatTimelineSlice } from "../types";

interface SeatProps {
  seatId: string;
  currentUser: User | null;
  status: SeatStatus;
  onClick: (seatId: string) => void;
  isDroppable?: boolean;
  onDragStart?: (seatId: string) => void;
  onDragOver?: (seatId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (seatId: string) => void;
  onDragEnd?: () => void;
  timelineSlices?: SeatTimelineSlice[];
}

export const Seat: React.FC<SeatProps> = ({
  seatId,
  currentUser,
  status,
  onClick,
  isDroppable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  timelineSlices = [],
}) => {
  const baseStyle =
    "w-16 h-16 sm:w-20 sm:h-20 m-1.5 sm:m-2 rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 cursor-pointer";
  const colorStyle = !currentUser
    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
    : status === "away"
    ? "bg-amber-400 text-white"
    : "bg-blue-500 text-white";
  const dropStyle = isDroppable ? "ring-2 ring-dashed ring-indigo-400" : "";

  const stateToColor = (state: SeatTimelineSlice["state"]) => {
    if (state === "present") return "bg-blue-600";
    if (state === "away") return "bg-amber-500";
    return "bg-gray-300";
  };

  return (
    <div
      className={`${baseStyle} ${colorStyle} ${dropStyle}`}
      draggable={Boolean(currentUser)}
      onDragStart={() => onDragStart?.(seatId)}
      onDragOver={(event) => onDragOver?.(seatId, event)}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.(seatId);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => onClick(seatId)}
    >
      <span className="opacity-70 text-xs mb-1">{seatId}</span>
      <span className="text-center px-1 truncate w-full">
        {currentUser ? currentUser.name : "空席"}
      </span>
      {currentUser && status === "away" && (
        <span className="mt-0.5 text-[10px] font-semibold bg-black/20 px-1.5 py-0.5 rounded">
          離席中
        </span>
      )}
      {timelineSlices.length > 0 && (
        <div className="w-full mt-1 px-1" data-testid={`timeline-${seatId}`}>
          <div className="flex w-full h-2 rounded overflow-hidden bg-white/30">
            {timelineSlices.map((slice, idx) => (
              <div
                key={`${slice.start}-${idx}`}
                className={`${stateToColor(slice.state)} flex-1`}
                data-testid="timeline-slice"
                data-state={slice.state}
                title={`${new Date(slice.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${new Date(slice.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} : ${
                  slice.state === "present"
                    ? "在席"
                    : slice.state === "away"
                    ? "離席"
                    : "空席"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
