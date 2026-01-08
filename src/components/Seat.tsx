import React from "react";
import type { User } from "../types";

interface SeatProps {
  seatId: string;
  currentUser: User | null;
  onClick: (seatId: string) => void;
}

export const Seat: React.FC<SeatProps> = ({ seatId, currentUser, onClick }) => {
  const baseStyle =
    "w-16 h-16 sm:w-20 sm:h-20 m-1.5 sm:m-2 rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 cursor-pointer";
  const colorStyle = currentUser
    ? "bg-blue-500 text-white"
    : "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <div
      className={`${baseStyle} ${colorStyle}`}
      onClick={() => onClick(seatId)}
    >
      <span className="opacity-70 text-xs mb-1">{seatId}</span>
      <span className="text-center px-1 truncate w-full">
        {currentUser ? currentUser.name : "空席"}
      </span>
    </div>
  );
};
