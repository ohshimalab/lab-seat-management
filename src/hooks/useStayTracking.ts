import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const getMinuteNow = () => Math.floor(Date.now() / 60000) * 60000;
import type React from "react";
import type { SeatState, StaySession, User } from "../types";

type StrikeRecord = {
  lastActiveDate: string | null;
  streakCount: number;
  lastCongratulatedDate: string | null;
};

type Notification = {
  id: string;
  text: string;
  userId?: string;
  date: string;
};

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

const formatStayDurationMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.ceil(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return hours > 0 ? `${hours}h${mins}m` : `${mins}m`;
};

const formatStayDuration = (seconds: number) => {
  const minutes = Math.ceil(seconds / 60);
  return formatStayDurationMinutes(minutes);
};

const formatWeekLabel = (weekKey: string) => {
  const start = new Date(`${weekKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const toLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${toLabel(start)} - ${toLabel(end)}`;
};

const RESET_START_HOUR = 22;
const RESET_START_MINUTE = 30;
const RESET_END_HOUR = 6;

const isWithinResetWindow = (date: Date) => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const isAfterStart =
    hour > RESET_START_HOUR ||
    (hour === RESET_START_HOUR && minute >= RESET_START_MINUTE);
  const isBeforeEnd = hour < RESET_END_HOUR;
  return isAfterStart || isBeforeEnd;
};

const getResetWindowKey = (date: Date) => {
  if (!isWithinResetWindow(date)) return null;
  const hour = date.getHours();
  const minute = date.getMinutes();
  const isAfterStart =
    hour > RESET_START_HOUR ||
    (hour === RESET_START_HOUR && minute >= RESET_START_MINUTE);
  if (isAfterStart) return formatDateKey(date);
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return formatDateKey(prev);
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

const computeSelectedWeekFromSessions = (
  sessions: StaySession[],
  nowMs: number
) => {
  const totals = aggregateWeekUserTotals(sessions, nowMs);
  const available = Object.entries(totals)
    .filter(([, weekTotals]) =>
      Object.values(weekTotals || {}).some((value) => (value || 0) > 0)
    )
    .map(([key]) => key)
    .sort();
  if (available.length === 0) return getWeekStartKey(new Date(nowMs));
  return available[available.length - 1];
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

  const nowRef = useRef<number | null>(null);
  const nowMs = useSyncExternalStore(
    (onStoreChange) => {
      const tick = () => {
        const next = getMinuteNow();
        if (nowRef.current !== next) {
          nowRef.current = next;
          onStoreChange();
        }
      };
      const id = setInterval(tick, 60 * 1000);
      return () => clearInterval(id);
    },
    () => {
      if (nowRef.current === null) {
        nowRef.current = getMinuteNow();
      } else {
        const snapshot = getMinuteNow();
        if (snapshot !== nowRef.current) {
          nowRef.current = snapshot;
        }
      }
      return nowRef.current;
    },
    () => nowRef.current ?? getMinuteNow()
  );

  const [weekKey, setWeekKey] = useState<string>(initialWeekKey);
  const [sessions, setSessions] = useState<StaySession[]>(initialSessions);
  const [strikes, setStrikes] = useState<Record<string, StrikeRecord>>(() => {
    try {
      const raw = localStorage.getItem("lab-strike-data");
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, StrikeRecord>;
      return parsed || {};
    } catch {
      return {};
    }
  });
  const [pendingNotifications, setPendingNotifications] = useState<
    Notification[]
  >([]);
  const strikesRef = useRef<Record<string, StrikeRecord>>(strikes);

  useEffect(() => {
    strikesRef.current = strikes;
  }, [strikes]);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(() => {
    return computeSelectedWeekFromSessions(initialSessions, nowMs);
  });
  const [lastResetDate, setLastResetDate] = useState<string | null>(() => {
    return localStorage.getItem("lab-last-reset-date");
  });

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem("lab-strike-data", JSON.stringify(strikes));
    } catch {
      // ignore
    }
  }, [strikes]);

  useEffect(() => {
    if (lastResetDate) {
      localStorage.setItem("lab-last-reset-date", lastResetDate);
    }
  }, [lastResetDate]);

  const weekUserTotals = useMemo(
    () => aggregateWeekUserTotals(sessions, nowMs),
    [sessions, nowMs]
  );

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

  const sortedWeekKeys = useMemo(() => {
    const keys = Object.keys(weekTotals).filter((key) => weekTotals[key] > 0);
    keys.sort();
    return keys;
  }, [weekTotals]);

  const activeSelectedWeekKey = useMemo(() => {
    if (sortedWeekKeys.includes(selectedWeekKey)) return selectedWeekKey;
    if (sortedWeekKeys.length > 0)
      return sortedWeekKeys[sortedWeekKeys.length - 1];
    return selectedWeekKey;
  }, [selectedWeekKey, sortedWeekKeys]);

  const selectedWeekTotals = useMemo(() => {
    return weekUserTotals[activeSelectedWeekKey] || {};
  }, [weekUserTotals, activeSelectedWeekKey]);

  const leaderboardRows = useMemo(() => {
    const rows = users.map((user) => {
      const seconds = selectedWeekTotals[user.id] || 0;
      const minutes = Math.ceil(seconds / 60);
      return {
        userId: user.id,
        name: user.name,
        seconds,
        minutes,
        formatted: formatStayDurationMinutes(minutes),
      };
    });

    rows.sort((a, b) => {
      if (a.minutes === b.minutes) return a.name.localeCompare(b.name);
      return b.minutes - a.minutes;
    });

    return rows.reduce<
      Array<{
        userId: string;
        name: string;
        seconds: number;
        minutes: number;
        formatted: string;
        rank: number;
      }>
    >((acc, row) => {
      const previous = acc[acc.length - 1];
      const rank = !previous
        ? 1
        : row.minutes === previous.minutes
        ? previous.rank
        : previous.rank + 1;
      acc.push({ ...row, rank });
      return acc;
    }, []);
  }, [users, selectedWeekTotals]);

  const selectedWeekLabel = useMemo(
    () => formatWeekLabel(activeSelectedWeekKey),
    [activeSelectedWeekKey]
  );

  const currentIndex = sortedWeekKeys.indexOf(activeSelectedWeekKey);
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

  const usersWithSessionsThisWeek = useMemo(() => {
    const set = new Set<string>();
    const currentWeek = weekKey;
    sessions.forEach((session) => {
      if (getWeekStartKey(new Date(session.start)) === currentWeek) {
        set.add(session.userId);
      }
    });
    return set;
  }, [sessions, weekKey]);

  const hasUserSessionThisWeek = (userId: string) =>
    usersWithSessionsThisWeek.has(userId);

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
    const today = formatDateKey(new Date(startedAt));

    setStrikes((prev) => {
      const existing = prev[userId] || {
        lastActiveDate: null,
        streakCount: 0,
        lastCongratulatedDate: null,
      };

      if (existing.lastActiveDate === today) return prev;

      const yesterdayDate = new Date(startedAt);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = formatDateKey(yesterdayDate);
      const sameWeek =
        getWeekStartKey(new Date(existing.lastActiveDate || "1970-01-01")) ===
        getWeekStartKey(new Date(startedAt));
      const nextStreak =
        existing.lastActiveDate === yesterday && sameWeek
          ? existing.streakCount + 1
          : 1;

      const updated: StrikeRecord = {
        lastActiveDate: today,
        streakCount: nextStreak,
        lastCongratulatedDate: existing.lastCongratulatedDate,
      };

      if (nextStreak >= 2 && existing.lastCongratulatedDate !== today) {
        const note: Notification = {
          id: `note-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          text: `${nextStreak}ストライクです！`,
          userId,
          date: today,
        };
        setPendingNotifications((p) => [...p, note]);
        updated.lastCongratulatedDate = today;
      }

      return { ...prev, [userId]: updated };
    });

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

  const updateSession = (
    sessionId: string,
    payload: {
      userId: string;
      seatId: string;
      start: number;
      end: number | null;
    }
  ) => {
    const { userId, seatId, start, end } = payload;
    if (!sessionId || !userId || !seatId || !start) return false;
    if (end !== null && end <= start) return false;
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, userId, seatId, start, end }
          : session
      )
    );
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

      const resetWindowKey = getResetWindowKey(now);
      if (resetWindowKey && lastResetDate !== resetWindowKey) {
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
        setLastResetDate(resetWindowKey);
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
    hasUserSessionThisWeek,
    startSession,
    endSession,
    addSessionManual,
    updateSession,
    removeSession,
    sessions,
    handlePrevWeek,
    handleNextWeek,
    handleThisWeek,
    nowMs,
    setSelectedWeekKey,
    lastResetDate,
    importTrackingData: (payload: {
      sessions?: StaySession[];
      lastResetDate?: string | null;
      strikes?: Record<string, StrikeRecord>;
    }) => {
      const nextSessions = Array.isArray(payload.sessions)
        ? payload.sessions
        : [];
      setSessions(nextSessions);
      const nextWeek = computeSelectedWeekFromSessions(
        nextSessions,
        Date.now()
      );
      setSelectedWeekKey(nextWeek);
      setWeekKey(getWeekStartKey(new Date()));
      if (payload.lastResetDate !== undefined) {
        setLastResetDate(payload.lastResetDate);
      }
      if (payload.strikes) {
        setStrikes(payload.strikes);
      }
    },
    pendingNotifications,
    consumeNotifications: () => setPendingNotifications([]),
  };
}
