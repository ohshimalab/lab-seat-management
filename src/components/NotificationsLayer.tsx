import React from "react";

interface NotificationsLayerProps {
  weeklyGreetingOpen: boolean;
  weekendFarewellOpen: boolean;
  firstArrivalOpen: boolean;
  firstArrivalName: string | null;
  combinedOpen?: boolean;
  combinedName?: string | null;
  cleaningDutyArrivalOpen?: boolean;
  cleaningDutyArrivalName?: string | null;
  cleaningDutyDepartureOpen?: boolean;
  cleaningDutyDepartureName?: string | null;
  cleaningDutyFinishedToastOpen?: boolean;
  cleaningDutyFinishedName?: string | null;
  onHideWeeklyGreeting: () => void;
  onHideWeekendFarewell: () => void;
  onHideFirstArrival: () => void;
  onHideCombined?: () => void;
  onHideCleaningDutyArrival?: () => void;
  onHideCleaningDutyDeparture?: () => void;
  onHideCleaningDutyFinishedToast?: () => void;
  onCompleteCleaningDuty?: () => void;
}

export const NotificationsLayer: React.FC<NotificationsLayerProps> = ({
  weeklyGreetingOpen,
  weekendFarewellOpen,
  firstArrivalOpen,
  firstArrivalName,
  combinedOpen,
  combinedName,
  cleaningDutyArrivalOpen,
  cleaningDutyArrivalName,
  cleaningDutyDepartureOpen,
  cleaningDutyDepartureName,
  cleaningDutyFinishedToastOpen,
  cleaningDutyFinishedName,
  onHideWeeklyGreeting,
  onHideWeekendFarewell,
  onHideFirstArrival,
  onHideCombined,
  onHideCleaningDutyArrival,
  onHideCleaningDutyDeparture,
  onHideCleaningDutyFinishedToast,
  onCompleteCleaningDuty,
}) => {
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

      {/* Cleaning Duty Arrival Toast */}
      {cleaningDutyArrivalOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-20 flex items-center gap-3 rounded-full bg-teal-600 px-5 py-3 text-white shadow-2xl border border-teal-400/40 animate-bounce-once">
            <span className="text-2xl" aria-hidden="true">
              🧹
            </span>
            <span className="font-semibold tracking-tight">
              {cleaningDutyArrivalName
                ? `${cleaningDutyArrivalName}さん、今週の掃除当番です！よろしくお願いします。`
                : "今週の掃除当番です！よろしくお願いします。"}
            </span>
            <button
              type="button"
              onClick={onHideCleaningDutyArrival}
              className="text-sm font-bold text-white/80 hover:text-white ml-1"
              aria-label="当番通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Cleaning Duty Departure Prompt (今週の掃除当番は終わりましたか？) */}
      {cleaningDutyDepartureOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-20 flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-teal-800 px-6 py-4 text-white shadow-2xl border border-teal-500/60 animate-bounce-once">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" aria-hidden="true">
                🧹
              </span>
              <span className="font-bold text-sm sm:text-base tracking-tight">
                {cleaningDutyDepartureName
                  ? `${cleaningDutyDepartureName}さん、`
                  : ""}
                今週の掃除当番は終わりましたか？
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => {
                  onCompleteCleaningDuty?.();
                  onHideCleaningDutyDeparture?.();
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="掃除完了として登録（今週はこれ以降通知されません）"
              >
                <span>✓</span> 終わった
              </button>
              <button
                type="button"
                onClick={onHideCleaningDutyDeparture}
                className="bg-teal-900/90 hover:bg-teal-900 text-teal-100 hover:text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-teal-600 transition active:scale-95 cursor-pointer"
              >
                終わってない
              </button>
              <button
                type="button"
                onClick={onHideCleaningDutyDeparture}
                className="text-sm text-white/60 hover:text-white ml-1 p-1"
                aria-label="当番確認を閉じる"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cleaning Duty Finished Confirmation Toast */}
      {cleaningDutyFinishedToastOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pointer-events-none">
          <div className="pointer-events-auto mt-20 flex items-center gap-3 rounded-full bg-emerald-700 px-5 py-3 text-white shadow-2xl border border-emerald-400/50">
            <span className="text-xl" aria-hidden="true">
              ✨
            </span>
            <span className="font-semibold text-sm tracking-tight">
              {cleaningDutyFinishedName ? `${cleaningDutyFinishedName}さん、` : ""}
              お疲れ様でした！今週の掃除当番を完了にしました（今週は通知を停止します）。
            </span>
            <button
              type="button"
              onClick={onHideCleaningDutyFinishedToast}
              className="text-sm font-bold text-white/80 hover:text-white"
              aria-label="完了通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
