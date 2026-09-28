import React, { useState, useEffect, useMemo } from "react";
import { PanelCard } from "./PanelCard";
import {
  getAnniversariesForDate,
  saveCustomAnniversary,
  deleteCustomAnniversary,
  fetchWikiAnniversaries,
  formatDateKey,
  type AnniversaryItem,
} from "../data/todayEvents";

export const TodayInfo: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customEmoji, setCustomEmoji] = useState("🎉");
  const [refreshKey, setRefreshKey] = useState(0);

  const [wikiEvents, setWikiEvents] = useState<AnniversaryItem[]>([]);
  const [isLoadingWiki, setIsLoadingWiki] = useState(false);

  // Keep today's date in sync periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][
    selectedDate.getDay()
  ];

  const isToday =
    selectedDate.getFullYear() === currentDate.getFullYear() &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getDate() === currentDate.getDate();

  // Fetch Wikipedia anniversaries for the selected date
  useEffect(() => {
    let isCancelled = false;
    Promise.resolve().then(() => {
      if (!isCancelled) {
        setIsLoadingWiki(true);
      }
    });

    fetchWikiAnniversaries(month, day)
      .then((items) => {
        if (!isCancelled) {
          setWikiEvents(items);
          setIsLoadingWiki(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setWikiEvents([]);
          setIsLoadingWiki(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [month, day]);

  // Combine local custom/fixed anniversaries with Wikipedia anniversaries
  // Avoid duplicate titles
  const localAnniversaries = useMemo(() => {
    // depend on refreshKey to re-fetch when custom anniversaries are added/deleted
    if (refreshKey < 0) return [];
    return getAnniversariesForDate(selectedDate);
  }, [selectedDate, refreshKey]);
  const combinedAnniversaries: AnniversaryItem[] = [...localAnniversaries];

  for (const wikiItem of wikiEvents) {
    const isDuplicate = combinedAnniversaries.some(
      (item) =>
        item.title.toLowerCase().includes(wikiItem.title.toLowerCase()) ||
        wikiItem.title.toLowerCase().includes(item.title.toLowerCase()),
    );
    if (!isDuplicate) {
      combinedAnniversaries.push(wikiItem);
    }
  }

  const activeItem: AnniversaryItem | undefined = combinedAnniversaries[0];

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleResetToToday = () => {
    setSelectedDate(new Date());
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const key = formatDateKey(selectedDate);
    saveCustomAnniversary(key, {
      title: customTitle.trim(),
      description: customDesc.trim(),
      emoji: customEmoji || "🎉",
      category: "lab",
    });

    setCustomTitle("");
    setCustomDesc("");
    setIsCustomModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteCustom = (id: string) => {
    const key = formatDateKey(selectedDate);
    deleteCustomAnniversary(key, id);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <PanelCard tone="light" className="flex flex-col h-full overflow-hidden">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl md:text-3xl" aria-hidden="true">
            📅
          </span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
              今日は何の日？
            </h2>
            <div className="text-sm md:text-base font-bold text-indigo-600">
              {month}月{day}日（{dayOfWeek}）
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isToday && (
            <button
              type="button"
              onClick={handleResetToToday}
              className="text-xs md:text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
              title="今日の日付に戻る"
            >
              今日
            </button>
          )}
          <button
            type="button"
            onClick={handlePrevDay}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm md:text-base font-bold transition cursor-pointer"
            title="前日を見る"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={handleNextDay}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm md:text-base font-bold transition cursor-pointer"
            title="翌日を見る"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="text-xs md:text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg transition ml-1 cursor-pointer"
            title="研究室の記念日を追加"
          >
            + 記念日
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-center min-h-0">
        {activeItem ? (
          <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/80 to-purple-50/70 border border-indigo-100/90 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-5xl md:text-6xl shrink-0 p-2.5 bg-white rounded-2xl shadow-sm border border-indigo-50/80">
                {activeItem.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                  <span className="text-xs md:text-sm font-extrabold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                    今日は
                  </span>
                  <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">
                    {activeItem.title}
                  </h3>
                  {activeItem.category === "lab" && (
                    <span className="text-xs bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                      研究室記念日
                    </span>
                  )}
                  {activeItem.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustom(activeItem.id)}
                      className="ml-auto text-gray-400 hover:text-red-500 text-base px-1.5 cursor-pointer"
                      title="この記念日を削除"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {activeItem.description && (
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium mt-2">
                    {activeItem.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : isLoadingWiki ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <span className="text-2xl animate-spin mb-2">⏳</span>
            <p className="text-xs text-gray-500 font-medium">記念日を読み込み中...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <span className="text-3xl mb-2">📅</span>
            <p className="text-xs font-semibold text-gray-500">
              この日の記念日は登録されていません
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              右上の「+ 記念日」から研究室の予定や記念日を登録できます
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Anniversary Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-5 animate-scale-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800">
                {month}月{day}日の記念日を追加
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCustom} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  記念日・イベント名
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: 〇〇先輩の誕生日 / ゼミ発表日"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  アイコン (絵文字)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    className="w-16 text-center text-lg border border-gray-300 rounded-lg py-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                    maxLength={3}
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {["🎉", "🎂", "💻", "☕", "🏆", "🍕", "🚀"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCustomEmoji(em)}
                        className="text-base p-1 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  詳細・メッセージ（省略可）
                </label>
                <textarea
                  rows={2}
                  placeholder="例: みんなでお祝いしましょう！"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PanelCard>
  );
};
