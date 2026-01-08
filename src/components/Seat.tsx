import React from 'react';
import type { User } from '../types';

interface SeatProps {
  seatId: string;
  currentUser: User | null; // 座っている人（いなければnull）
  onClick: (seatId: string) => void;
}

export const Seat: React.FC<SeatProps> = ({ seatId, currentUser, onClick }) => {
  // 空席かどうかで色を変える
  // 空席: bg-gray-200, 使用中: bg-blue-500
  const baseStyle = "w-20 h-20 m-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold shadow-md transition-transform active:scale-95 cursor-pointer";
  const colorStyle = currentUser 
    ? "bg-blue-500 text-white" 
    : "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <div 
      className={`${baseStyle} ${colorStyle}`}
      onClick={() => onClick(seatId)}
    >
      {/* 席番号を表示 (例: R11) */}
      <span className="opacity-70 text-xs mb-1">{seatId}</span>
      
      {/* 名前を表示 (いなければ "空席") */}
      <span className="text-center px-1 truncate w-full">
        {currentUser ? currentUser.name : "空席"}
      </span>
    </div>
  );
};