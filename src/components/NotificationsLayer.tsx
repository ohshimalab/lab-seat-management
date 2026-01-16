interface NotificationsLayerProps {
  weeklyGreetingOpen: boolean;
  weekendFarewellOpen: boolean;
  firstArrivalOpen: boolean;
  firstArrivalName: string | null;
  combinedOpen?: boolean;
  combinedName?: string | null;
  onHideWeeklyGreeting: () => void;
  onHideWeekendFarewell: () => void;
  onHideFirstArrival: () => void;
  onHideCombined?: () => void;
}

export const NotificationsLayer = ({
  weeklyGreetingOpen,
  weekendFarewellOpen,
  firstArrivalOpen,
  firstArrivalName,
  combinedOpen,
  combinedName,
  onHideWeeklyGreeting,
  onHideWeekendFarewell,
  onHideFirstArrival,
  onHideCombined,
}: NotificationsLayerProps) => {
  return (
    <>
      {combinedOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-10 flex items-center gap-3 rounded-full bg-amber-600 px-4 py-3 text-white shadow-xl">
            <span className="text-xl" aria-hidden="true">
              🚀
            </span>
            <span className="font-semibold tracking-tight">
              {combinedName
                ? `${combinedName}さん、今日の一番乗り！今週も頑張りましょう！`
                : "今日の一番乗り！今週も頑張りましょう！"}
            </span>
            <button
              type="button"
              onClick={onHideCombined}
              className="text-sm font-bold text-white/80 hover:text-white"
              aria-label="通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {weeklyGreetingOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-14 flex items-center gap-3 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-xl">
            <span className="text-xl" aria-hidden="true">
              💪
            </span>
            <span className="font-semibold tracking-tight">
              今週も頑張りましょう！
            </span>
            <button
              type="button"
              onClick={onHideWeeklyGreeting}
              className="text-sm font-bold text-white/80 hover:text-white"
              aria-label="通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {firstArrivalOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-6 flex items-center gap-3 rounded-full bg-amber-600 px-4 py-3 text-white shadow-xl">
            <span className="text-xl" aria-hidden="true">
              🚀
            </span>
            <span className="font-semibold tracking-tight">
              {firstArrivalName
                ? `${firstArrivalName}さん、今日の一番乗り！`
                : "今日の一番乗り！"}
            </span>
            <button
              type="button"
              onClick={onHideFirstArrival}
              className="text-sm font-bold text-white/80 hover:text-white"
              aria-label="通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {weekendFarewellOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-28 flex items-center gap-3 rounded-full bg-sky-700 px-4 py-3 text-white shadow-xl">
            <span className="text-xl" aria-hidden="true">
              🙌
            </span>
            <span className="font-semibold tracking-tight">
              今週もお疲れ様でした
            </span>
            <button
              type="button"
              onClick={onHideWeekendFarewell}
              className="text-sm font-bold text-white/80 hover:text-white"
              aria-label="通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
