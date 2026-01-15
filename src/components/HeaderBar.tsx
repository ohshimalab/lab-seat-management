import type { EnvTelemetryState } from "../hooks/useEnvTelemetry";
import { EnvInfo } from "./EnvInfo";

interface HeaderBarProps {
  envTelemetry: EnvTelemetryState;
  onOpenLeaderboard: () => void;
  onOpenRandom: () => void;
  onReset: () => void;
  onOpenAdmin: () => void;
}

export const HeaderBar = ({
  envTelemetry,
  onOpenLeaderboard,
  onOpenRandom,
  onReset,
  onOpenAdmin,
}: HeaderBarProps) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2 mb-2 px-2">
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          大島研究室
        </h1>
        <EnvInfo envTelemetry={envTelemetry} />
      </div>
      <div className="flex gap-2 md:gap-3">
        <button
          onClick={onOpenLeaderboard}
          className="bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-amber-400 shadow-md"
        >
          🏆 リーダーボード
        </button>
        <button
          onClick={onOpenRandom}
          className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-indigo-500 shadow-md"
        >
          🎲 ランダム着席
        </button>
        <button
          onClick={onReset}
          className="text-xs md:text-sm text-gray-400 hover:text-red-500 underline"
        >
          全席リセット
        </button>
        <button
          onClick={onOpenAdmin}
          className="bg-gray-800 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-gray-700 shadow-md"
        >
          ⚙ 設定
        </button>
      </div>
    </div>
  );
};
