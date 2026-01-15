import { useEffect, useState } from "react";

const STORAGE_KEY = "lab-home-reminder-date";
const TIME_KEY = "lab-home-reminder-time";
const DURATION_KEY = "lab-home-reminder-duration";
const DEFAULT_TIME = "20:00";
const DEFAULT_DURATION = 15;
const BUFFER_MINUTES = 5;

const parseMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 20 * 60;
  return h * 60 + m;
};

interface HomeReminderParams {
  hasSeatedUser: boolean;
}

export const useHomeReminder = ({ hasSeatedUser }: HomeReminderParams) => {
  const [isHomeReminderOpen, setIsHomeReminderOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => {
    const saved = localStorage.getItem(TIME_KEY);
    return typeof saved === "string" && /^\d{2}:\d{2}$/.test(saved)
      ? saved
      : DEFAULT_TIME;
  });
  const [reminderDuration, setReminderDuration] = useState(() => {
    const saved = localStorage.getItem(DURATION_KEY);
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return Number.isNaN(parsed) || parsed <= 0 ? DEFAULT_DURATION : parsed;
  });

  useEffect(() => {
    const checkReminder = () => {
      if (!hasSeatedUser) return;
      const now = new Date();
      const dateKey = now.toISOString().slice(0, 10);
      const targetMinutes = parseMinutes(reminderTime);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const last = localStorage.getItem(STORAGE_KEY);
      const diff = nowMinutes - targetMinutes;
      if (diff >= 0 && diff <= BUFFER_MINUTES && last !== dateKey) {
        setIsHomeReminderOpen(true);
        localStorage.setItem(STORAGE_KEY, dateKey);
      }
    };

    checkReminder();
    const id = window.setInterval(checkReminder, 60 * 1000);
    return () => window.clearInterval(id);
  }, [reminderTime, hasSeatedUser]);

  useEffect(() => {
    localStorage.setItem(TIME_KEY, reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem(DURATION_KEY, String(reminderDuration));
  }, [reminderDuration]);

  const resetReminderDate = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    isHomeReminderOpen,
    reminderTime,
    reminderDuration,
    setReminderTime,
    setReminderDuration,
    resetReminderDate,
    closeHomeReminder: () => setIsHomeReminderOpen(false),
  };
};
