import { useEffect, useMemo, useState } from "react";
import type React from "react";
import type { SeatState, StaySession, User } from "../types";

const formatDateKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getWeekStartKey = (date: Date) => {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-based week start
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + diff);
  return formatDateKey(weekStart);
};

const formatStayDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h${mins}m` : `${mins}m`;
};

const formatWeekLabel = (weekKey: string) => {
  const start = new Date(`${weekKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const toLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${toLabel(start)} - ${toLabel(end)}`;
};

const SESSIONS_KEY = "lab-stay-sessions";
const newSessionId = () =>
  `sess-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const loadStayData = () => {
  const current = getWeekStartKey(new Date());
  const fallback = {
    weekKey: current,
    data: {} as Record<string, Record<string, number>>,
  };
  const raw = localStorage.getItem("lab-stay-data");
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as
      | { weekKey: string; data: Record<string, Record<string, number>> }
      | { weekKey: string; totals: Record<string, number> };
    if ("data" in parsed && parsed.data) {
      return {
        weekKey: parsed.weekKey || current,
        data: parsed.data,
      };
    }
    if ("totals" in parsed && parsed.weekKey) {
      return {
        weekKey: parsed.weekKey,
        data: { [parsed.weekKey]: parsed.totals },
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const loadSessions = () => {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [] as StaySession[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (
            !item ||
            typeof item.userId !== "string" ||
            typeof item.seatId !== "string" ||
            typeof item.start !== "number"
          ) {
            return null;
          }
          const endValue =
            typeof item.end === "number" || item.end === null ? item.end : null;
          return {
            id: typeof item.id === "string" ? item.id : newSessionId(),
            userId: item.userId,
            seatId: item.seatId,
            start: item.start,
            end: endValue,
          } as StaySession;
        })
        .filter((v): v is StaySession => Boolean(v));
    }
    return [];
  } catch {
    return [];
  }
};

const migrateTotalsToSessions = () => {
  const legacy = loadStayData();
  const sessions: StaySession[] = [];
  Object.entries(legacy.data || {}).forEach(([weekKey, totals]) => {
    if (!totals) return;
    const startMs = new Date(`${weekKey}T00:00:00`).getTime();
    Object.entries(totals).forEach(([userId, seconds]) => {
      if (!seconds) return;
      const durationMs = seconds * 1000;
      sessions.push({
        id: newSessionId(),
        userId,
        seatId: "unknown",
        start: startMs,
        end: startMs + durationMs,
      });
    });
  });
  return sessions;
};

const aggregateWeekUserTotals = (sessions: StaySession[], nowMs: number) => {
  const map: Record<string, Record<string, number>> = {};
  sessions.forEach((session) => {
    if (!session.start) return;
    const end = session.end ?? nowMs;
    if (end <= session.start) return;
    const seconds = Math.floor((end - session.start) / 1000);
    const week = getWeekStartKey(new Date(session.start));
    const weekTotals = map[week] || {};
    weekTotals[session.userId] = (weekTotals[session.userId] || 0) + seconds;
    map[week] = weekTotals;
  });
  return map;
};

interface StayTrackingParams {
  users: User[];
  seatStates: Record<string, SeatState>;
  setSeatStates: React.Dispatch<
    React.SetStateAction<Record<string, SeatState>>
  >;
  createEmptySeatStates: () => Record<string, SeatState>;
}

export function useStayTracking({
  users,
  seatStates,
  setSeatStates,
  createEmptySeatStates,
}: StayTrackingParams) {
  const initialWeekKey = getWeekStartKey(new Date());
  const initialSessions = (() => {
    const stored = loadSessions();
    if (stored.length > 0) return stored;
    return migrateTotalsToSessions();
  })();

  const initialTotals = aggregateWeekUserTotals(initialSessions, Date.now());
  const initialSelectedWeekKey = (() => {
    const available = Object.entries(initialTotals)
      .filter(([, totals]) =>
        Object.values(totals || {}).some((value) => (value || 0) > 0)
      )
      .map(([key]) => key)
      .sort();
    return available[available.length - 1] || initialWeekKey;
  })();

  const [weekKey, setWeekKey] = useState<string>(initialWeekKey);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(
    initialSelectedWeekKey
  );
  const [sessions, setSessions] = useState<StaySession[]>(initialSessions);
  const [lastResetDate, setLastResetDate] = useState<string | null>(() => {
    return localStorage.getItem("lab-last-reset-date");
  });

  const nowMs = Date.now();

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (lastResetDate) {
      localStorage.setItem("lab-last-reset-date", lastResetDate);
    }
  }, [lastResetDate]);

  const weekUserTotals = useMemo(
    () => aggregateWeekUserTotals(sessions, nowMs),
    [sessions, nowMs]
  );

  const selectedWeekTotals = useMemo(() => {
    return weekUserTotals[selectedWeekKey] || {};
  }, [weekUserTotals, selectedWeekKey]);

  const weekTotals = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(weekUserTotals).forEach(([key, totals]) => {
      const sum = Object.values(totals || {}).reduce(
        (acc, value) => acc + (value || 0),
        0
      );
      map[key] = sum;
    });
    return map;
  }, [weekUserTotals]);

  const leaderboardRows = useMemo(() => {
    const rows = users.map((user) => {
      const seconds = selectedWeekTotals[user.id] || 0;
      return {
        userId: user.id,
        name: user.name,
        seconds,
        formatted: formatStayDuration(seconds),
      };
    });
    rows.sort((a, b) => {
      if (a.seconds === b.seconds) return a.name.localeCompare(b.name);
      return b.seconds - a.seconds;
    });
    return rows;
  }, [users, selectedWeekTotals]);

  const sortedWeekKeys = useMemo(() => {
    const keys = Object.keys(weekTotals).filter((key) => weekTotals[key] > 0);
    keys.sort();
    return keys;
  }, [weekTotals]);

  useEffect(() => {
    if (
      !sortedWeekKeys.includes(selectedWeekKey) &&
      sortedWeekKeys.length > 0
    ) {
      setSelectedWeekKey(sortedWeekKeys[sortedWeekKeys.length - 1]);
    }
  }, [sortedWeekKeys, selectedWeekKey]);

  const selectedWeekLabel = useMemo(
    () => formatWeekLabel(selectedWeekKey),
    [selectedWeekKey]
  );

  const currentIndex = sortedWeekKeys.indexOf(selectedWeekKey);
  const disablePrevWeek = currentIndex <= 0;
  const disableNextWeek =
    currentIndex === -1 || currentIndex >= sortedWeekKeys.length - 1;
  const thisWeekKey = getWeekStartKey(new Date());
  const disableThisWeek = !sortedWeekKeys.includes(thisWeekKey);

  const stayDurationDisplay = useMemo(() => {
    const map: Record<string, string> = {};
    const currentTotals = weekUserTotals[weekKey] || {};
    users.forEach((user) => {
      const seconds = currentTotals[user.id] || 0;
      map[user.id] = formatStayDuration(seconds);
    });
    return map;
  }, [users, weekUserTotals, weekKey]);

  const selectedWeekTotalFormatted = formatStayDuration(
    Object.values(selectedWeekTotals).reduce((acc, v) => acc + v, 0)
  );

  const handlePrevWeek = () => {
    setSelectedWeekKey((prev) => {
      const idx = sortedWeekKeys.indexOf(prev);
      if (idx <= 0) return prev;
      return sortedWeekKeys[idx - 1];
    });
  };

  const handleNextWeek = () => {
    setSelectedWeekKey((prev) => {
      const idx = sortedWeekKeys.indexOf(prev);
      if (idx === -1 || idx >= sortedWeekKeys.length - 1) return prev;
      return sortedWeekKeys[idx + 1];
    });
  };

  const handleThisWeek = () => {
    const current = getWeekStartKey(new Date());
    if (!sortedWeekKeys.includes(current)) return;
    setSelectedWeekKey(current);
  };

  const startSession = (userId: string, seatId: string, startedAt: number) => {
    setSessions((prev) => [
      ...prev,
      { id: newSessionId(), userId, seatId, start: startedAt, end: null },
    ]);
  };

  const endSession = (userId: string, seatId: string, endedAt: number) => {
    setSessions((prev) => {
      let changed = false;
      const next = prev.map((session) => {
        if (
          session.userId === userId &&
          session.seatId === seatId &&
          session.end === null
        ) {
          changed = true;
          return { ...session, end: endedAt };
        }
        return session;
      });
      return changed ? next : prev;
    });
  };

  const addSessionManual = (
    userId: string,
    seatId: string,
    start: number,
    end: number | null
  ) => {
    if (!userId || !seatId || !start) return false;
    if (end !== null && end <= start) return false;
    setSessions((prev) => [
      ...prev,
      { id: newSessionId(), userId, seatId, start, end },
    ]);
    return true;
  };

  const removeSession = (sessionId: string) => {
    if (!sessionId) return;
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  useEffect(() => {
    const checkAndReset = () => {
      const now = new Date();
      const nowMs = now.getTime();
      const todayKey = formatDateKey(now);
      const currentWeekKey = getWeekStartKey(now);

      if (currentWeekKey !== weekKey) {
        setSessions((prev) => {
          const closed = prev.map((session) => {
            if (
              session.end === null &&
              seatStates[session.seatId]?.userId === session.userId
            ) {
              return { ...session, end: nowMs };
            }
            return session;
          });
          const reopened: StaySession[] = [];
          Object.entries(seatStates).forEach(([seatId, seat]) => {
            if (seat?.userId) {
              reopened.push({
                id: newSessionId(),
                userId: seat.userId,
                seatId,
                start: nowMs,
                end: null,
              });
            }
          });
          return [...closed, ...reopened];
        });
        setWeekKey(currentWeekKey);
        setSeatStates((prev) => {
          const next = { ...prev } as Record<string, SeatState>;
          Object.keys(next).forEach((seatId) => {
            const seat = next[seatId];
            if (seat?.userId) {
              next[seatId] = {
                ...seat,
                startedAt: nowMs,
                status: seat.status || "present",
              } as SeatState;
            }
          });
          return next;
        });
      }

      const isAfterSix = now.getHours() >= 6;
      if (isAfterSix && lastResetDate !== todayKey) {
        setSessions((prev) =>
          prev.map((session) => {
            if (
              session.end === null &&
              seatStates[session.seatId]?.userId === session.userId
            ) {
              return { ...session, end: nowMs };
            }
            return session;
          })
        );
        setSeatStates(createEmptySeatStates());
        setLastResetDate(todayKey);
      }
    };

    checkAndReset();
    const intervalId = setInterval(checkAndReset, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [
    weekKey,
    seatStates,
    lastResetDate,
    setSeatStates,
    createEmptySeatStates,
  ]);

  return {
    weekKey,
    selectedWeekKey,
    selectedWeekTotals,
    selectedWeekLabel,
    selectedWeekTotalFormatted,
    leaderboardRows,
    sortedWeekKeys,
    disablePrevWeek,
    disableNextWeek,
    disableThisWeek,
    stayDurationDisplay,
    startSession,
    endSession,
    addSessionManual,
    removeSession,
    sessions,
    handlePrevWeek,
    handleNextWeek,
    handleThisWeek,
    setSelectedWeekKey,
  };
}
