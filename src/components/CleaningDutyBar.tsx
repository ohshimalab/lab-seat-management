import React from "react";

interface CleaningDutyBarProps {
  dutyUser: string | null;
  nextUser?: string | null;
}

export const CleaningDutyBar: React.FC<CleaningDutyBarProps> = ({
  dutyUser,
  nextUser,
}) => {
  if (!dutyUser) return null;

  return (
    <div className="bg-white text-gray-900 rounded-xl px-5 py-3 md:py-3.5 shadow-lg border border-gray-100 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl md:text-3xl shrink-0" aria-hidden="true">
          🧹
        </span>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="text-sm md:text-base font-bold text-gray-500">
            今週の掃除当番:
          </span>
          <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            {dutyUser}
          </span>
          <span className="text-sm md:text-base font-bold text-gray-700">
            さん
          </span>
        </div>
      </div>

      {nextUser && (
        <div className="text-xs md:text-sm text-gray-400 font-medium hidden sm:flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
          <span>⏩ 来週:</span>
          <span className="text-gray-700 font-bold">{nextUser} さん</span>
        </div>
      )}
    </div>
  );
};
