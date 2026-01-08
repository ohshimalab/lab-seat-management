import React, { useState, useEffect } from "react";
import JapaneseHolidays from "japanese-holidays";
import type { TrainTime } from "../data/timetableTypes";
import { parseCSV } from "../utils/csvParser";

import weekdayCsvRaw from "../data/weekday.csv?raw";
import holidayCsvRaw from "../data/holiday.csv?raw";

const WALK_MINUTES = 10;

export const TrainInfo: React.FC = () => {
  const [nextTrains, setNextTrains] = useState<TrainTime[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scheduleType, setScheduleType] = useState<"Weekday" | "Holiday">(
    "Weekday"
  );

  const weekdayTimetable = parseCSV(weekdayCsvRaw);
  const holidayTimetable = parseCSV(holidayCsvRaw);

  useEffect(() => {
    const updateSchedule = () => {
      const now = new Date();
      setCurrentTime(now);

      const isHoliday = JapaneseHolidays.isHoliday(now);
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHolidaySchedule = isHoliday || isWeekend;

      setScheduleType(isHolidaySchedule ? "Holiday" : "Weekday");
      const currentTimetable = isHolidaySchedule
        ? holidayTimetable
        : weekdayTimetable;

      const targetTime = new Date(now.getTime() + WALK_MINUTES * 60000);
      const targetHour = targetTime.getHours();
      const targetMinute = targetTime.getMinutes();
      const targetTotalMinutes = targetHour * 60 + targetMinute;

      const upcoming = currentTimetable.filter((train) => {
        const trainTotalMinutes = train.hour * 60 + train.minute;
        return trainTotalMinutes >= targetTotalMinutes;
      });

      setNextTrains(upcoming.slice(0, 3));
    };

    updateSchedule();
    const intervalId = setInterval(updateSchedule, 30000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-800 text-white rounded-xl p-4 md:p-4 shadow-xl h-full flex flex-col">
      <div className="border-b border-gray-600 pb-2 mb-2">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-bold text-gray-200">🚇 学園都市発</h2>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              scheduleType === "Holiday"
                ? "bg-red-900 text-red-100 border-red-700"
                : "bg-gray-700 text-gray-300 border-gray-500"
            }`}
          >
            {scheduleType === "Holiday" ? "土休日ダイヤ" : "平日ダイヤ"}
          </span>
        </div>
        <span className="text-xs font-normal block text-gray-400 mt-1">
          三宮・新神戸・谷上方面
        </span>
        <div className="mt-1 text-right">
          <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded">
            徒歩 {WALK_MINUTES}分 考慮済
          </span>
        </div>
      </div>
      <div className="text-center mb-2">
        <div className="text-xs text-gray-400">現在時刻</div>
        <div className="text-2xl md:text-3xl font-mono font-bold tracking-widest">
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {nextTrains.length > 0 ? (
          nextTrains.map((train, index) => {
            const isFirst = index === 0;
            return (
              <div
                key={`${train.hour}-${train.minute}-${index}`}
                className={`flex items-center justify-between p-1 rounded-lg ${
                  isFirst
                    ? "bg-green-600 shadow-lg border border-green-400"
                    : "bg-gray-700"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-[11px] font-bold px-2 py-1 rounded ${
                      train.dest === "谷上"
                        ? "bg-orange-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {train.dest}行
                  </span>
                  {isFirst && (
                    // <span className="text-[11px] font-bold text-yellow-300">
                    //   NEXT
                    // </span>
                    <></>
                  )}
                </div>
                <div className="text-2xl font-mono font-bold">
                  {train.hour}:{train.minute.toString().padStart(2, "0")}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-6 col-span-full">
            本日の電車は終了しました
          </div>
        )}
      </div>
      <div className="text-center text-[11px] text-gray-500 mt-2">
        ※到着時刻ではなく発車時刻です
      </div>
    </div>
  );
};
