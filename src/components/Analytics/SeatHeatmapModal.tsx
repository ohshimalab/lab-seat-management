import type { SeatLayout, StaySession } from "../../types";
import SeatHeatmap from "./SeatHeatmap";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  layout: SeatLayout[];
  sessions: StaySession[];
  nowMs: number;
  rangeStartMs: number;
  rangeEndMs: number;
}

export const SeatHeatmapModal = ({
  isOpen,
  onClose,
  layout,
  sessions,
  nowMs,
  rangeStartMs,
  rangeEndMs,
}: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[90%] max-w-4xl h-[80%] overflow-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-semibold">Seat Heatmap</h2>
          <button className="text-sm text-gray-600 px-2 py-1" onClick={onClose}>
            閉じる
          </button>
        </div>
        <div className="p-3">
          <SeatHeatmap
            layout={layout}
            sessions={sessions}
            nowMs={nowMs}
            rangeStartMs={rangeStartMs}
            rangeEndMs={rangeEndMs}
          />
        </div>
      </div>
    </div>
  );
};

export default SeatHeatmapModal;
