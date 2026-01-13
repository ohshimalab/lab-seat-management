import { useState, useMemo, useEffect } from "react";
import { Seat } from "./components/Seat";
import { UserSelectModal } from "./components/UserSelectModal";
import { ActionModal } from "./components/ActionModal";
import { RandomSeatModal } from "./components/RandomSeatModal";
import { AdminModal } from "./components/AdminModal";
import { TrainInfo } from "./components/TrainInfo";
import { NewsVideo } from "./components/NewsVideo";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { WeeklyHistogramModal } from "./components/WeeklyHistogramModal";
import type {
  User,
  SeatLayout,
  UserCategory,
  SeatState,
  SeatStatus,
} from "./types";

// --- 初期レイアウト ---
const INITIAL_LAYOUT: SeatLayout[] = [
  { rowId: "R1", seats: ["R11", "R12", "R13"] },
  { rowId: "R2", seats: ["R21", "R22", "R23", "R24"] },
  { rowId: "R3", seats: ["R31", "R32", "R33", "R34"] },
  { rowId: "R4", seats: ["R41", "R42", "R43", "R44"] },
];

const DEFAULT_USERS: User[] = [
  { id: "u1", name: "Yamada", category: "Staff" },
  { id: "u2", name: "Tanaka", category: "M" },
];

const createEmptySeatStates = () => {
  const base: Record<string, SeatState> = {};
  INITIAL_LAYOUT.forEach((row) => {
    row.seats.forEach((seatId) => {
      base[seatId] = { userId: null, status: "present", startedAt: null };
    });
  });
  return base;
};

const normalizeSeatStates = (raw: unknown) => {
  const base = createEmptySeatStates();
  if (!raw || typeof raw !== "object") return base;
  const saved = raw as Record<string, unknown>;
  Object.keys(base).forEach((seatId) => {
    const value = saved[seatId];
    if (typeof value === "string" || value === null) {
      base[seatId] = {
        userId: value as string | null,
        status: "present",
        startedAt: null,
      };
      return;
    }
    if (value && typeof value === "object") {
      const candidate = value as Partial<SeatState>;
      const userId =
        typeof candidate.userId === "string" ? candidate.userId : null;
      const status: SeatStatus =
        candidate.status === "away" ? "away" : "present";
      const startedAt =
        typeof (candidate as { startedAt?: unknown }).startedAt === "number"
          ? (candidate as { startedAt?: number }).startedAt
          : null;
      base[seatId] = { userId, status, startedAt };
    }
  });
  return base;
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

function App() {
  const initialStay = loadStayData();
  const initialSelectedWeekKey = (() => {
    const totals: Record<string, number> = {};
    Object.entries(initialStay.data).forEach(([key, vals]) => {
      totals[key] = Object.values(vals || {}).reduce(
        (acc, value) => acc + (value || 0),
        0
      );
    });
    const available = Object.keys(totals)
      .filter((key) => totals[key] > 0)
      .sort();
    return available[available.length - 1] || initialStay.weekKey;
  })();
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("lab-users-data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parsed.map((u: any) => ({
          ...u,
          category: u.category || "Other",
        }));
      } catch {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });
  const [lastResetDate, setLastResetDate] = useState<string | null>(() => {
    return localStorage.getItem("lab-last-reset-date");
  });

  useEffect(() => {
    localStorage.setItem("lab-users-data", JSON.stringify(users));
  }, [users]);

  const [seatStates, setSeatStates] = useState<Record<string, SeatState>>(
    () => {
      const saved = localStorage.getItem("lab-seat-data");
      if (saved) {
        try {
          return normalizeSeatStates(JSON.parse(saved));
        } catch {
          return createEmptySeatStates();
        }
      }
      return createEmptySeatStates();
    }
  );

  useEffect(() => {
    localStorage.setItem("lab-seat-data", JSON.stringify(seatStates));
  }, [seatStates]);

  const addStayDuration = (userId: string, startedAt: number | null) => {
    if (!startedAt) return;
    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - startedAt) / 1000)
    );
    if (elapsedSeconds === 0) return;
    setStayHistory((prev) => {
      const weekTotals = prev[weekKey] || {};
      return {
        ...prev,
        [weekKey]: {
          ...weekTotals,
          [userId]: (weekTotals[userId] || 0) + elapsedSeconds,
        },
      };
    });
  };

  const finalizeSeatOccupant = (seatId: string) => {
    const seat = seatStates[seatId];
    if (seat?.userId) addStayDuration(seat.userId, seat.startedAt);
  };

  const finalizeAllSeats = () => {
    Object.keys(seatStates).forEach((seatId) => finalizeSeatOccupant(seatId));
  };

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHistogramOpen, setIsHistogramOpen] = useState(false);
  const [randomUserId, setRandomUserId] = useState<string | null>(null);
  const [randomSeatId, setRandomSeatId] = useState<string | null>(null);
  const [weekKey, setWeekKey] = useState<string>(initialStay.weekKey);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(
    initialSelectedWeekKey
  );
  const [stayHistory, setStayHistory] = useState<
    Record<string, Record<string, number>>
  >(() => initialStay.data);

  useEffect(() => {
    localStorage.setItem(
      "lab-stay-data",
      JSON.stringify({ weekKey, data: stayHistory })
    );
  }, [stayHistory, weekKey]);

  useEffect(() => {
    setStayHistory((prev) => ({
      ...prev,
      [weekKey]: prev[weekKey] || {},
    }));
  }, [weekKey]);

  useEffect(() => {
    if (lastResetDate) {
      localStorage.setItem("lab-last-reset-date", lastResetDate);
    }
  }, [lastResetDate]);

  useEffect(() => {
    const checkAndReset = () => {
      const now = new Date();
      const todayKey = formatDateKey(now);
      const currentWeekKey = getWeekStartKey(now);

      if (currentWeekKey !== weekKey) {
        setWeekKey(currentWeekKey);
        setStayHistory((prev) => ({
          ...prev,
          [currentWeekKey]: prev[currentWeekKey] || {},
        }));
        setSeatStates((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((seatId) => {
            const seat = next[seatId];
            if (seat?.userId) {
              next[seatId] = {
                ...seat,
                startedAt: now.getTime(),
                status: seat.status || "present",
              } as SeatState;
            }
          });
          return next;
        });
      }

      const isAfterSix = now.getHours() >= 6;
      if (isAfterSix && lastResetDate !== todayKey) {
        Object.keys(seatStates).forEach((seatId) => {
          const seat = seatStates[seatId];
          if (seat?.userId) addStayDuration(seat.userId, seat.startedAt);
        });
        setSeatStates(createEmptySeatStates());
        setLastResetDate(todayKey);
      }
    };

    checkAndReset();
    const intervalId = setInterval(checkAndReset, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [lastResetDate, weekKey, seatStates]);

  const seatedUserIds = useMemo(
    () =>
      Object.values(seatStates)
        .map((s) => s.userId)
        .filter((id): id is string => id !== null),
    [seatStates]
  );
  const availableUsers = useMemo(
    () => users.filter((user) => !seatedUserIds.includes(user.id)),
    [users, seatedUserIds]
  );

  const hasEmptySeat = useMemo(
    () => Object.values(seatStates).some((s) => s.userId === null),
    [seatStates]
  );

  const stayDurationDisplay = useMemo(() => {
    const map: Record<string, string> = {};
    const currentTotals = stayHistory[weekKey] || {};
    users.forEach((user) => {
      const seconds = currentTotals[user.id] || 0;
      map[user.id] = formatStayDuration(seconds);
    });
    return map;
  }, [users, stayHistory, weekKey]);

  const liveCurrentWeekSeconds = (() => {
    const now = Date.now();
    const live: Record<string, number> = {};
    Object.values(seatStates).forEach((seat) => {
      if (!seat?.userId || !seat.startedAt) return;
      const elapsed = Math.max(0, Math.floor((now - seat.startedAt) / 1000));
      if (elapsed === 0) return;
      live[seat.userId] = (live[seat.userId] || 0) + elapsed;
    });
    return live;
  })();

  const selectedWeekTotals = useMemo(() => {
    const base = stayHistory[selectedWeekKey] || {};
    if (selectedWeekKey !== weekKey) return base;
    const merged: Record<string, number> = { ...base };
    Object.entries(liveCurrentWeekSeconds).forEach(([userId, live]) => {
      merged[userId] = (merged[userId] || 0) + live;
    });
    return merged;
  }, [stayHistory, selectedWeekKey, weekKey, liveCurrentWeekSeconds]);

  const weekTotals = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(stayHistory).forEach(([key, totals]) => {
      const sum = Object.values(totals || {}).reduce(
        (acc, value) => acc + (value || 0),
        0
      );
      map[key] = sum;
    });
    const liveSum = Object.values(liveCurrentWeekSeconds).reduce(
      (acc, value) => acc + value,
      0
    );
    map[weekKey] = (map[weekKey] || 0) + liveSum;
    return map;
  }, [stayHistory, liveCurrentWeekSeconds, weekKey]);

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

  const histogramWeeks = useMemo(() => {
    return sortedWeekKeys.map((key) => {
      const total = weekTotals[key] || 0;
      return {
        weekKey: key,
        label: formatWeekLabel(key),
        totalSeconds: total,
        formatted: formatStayDuration(total),
        isSelected: key === selectedWeekKey,
      };
    });
  }, [sortedWeekKeys, weekTotals, selectedWeekKey]);

  const histogramUserBars = useMemo(() => {
    const rows = users.map((user) => {
      const seconds = selectedWeekTotals[user.id] || 0;
      return {
        key: user.id,
        label: user.name,
        totalSeconds: seconds,
        formatted: formatStayDuration(seconds),
        isSelected: false,
      };
    });
    rows.sort((a, b) => {
      if (a.totalSeconds === b.totalSeconds)
        return a.label.localeCompare(b.label);
      return b.totalSeconds - a.totalSeconds;
    });
    return rows;
  }, [users, selectedWeekTotals]);

  const selectedWeekTotalFormatted = formatStayDuration(
    Object.values(selectedWeekTotals).reduce((acc, v) => acc + v, 0)
  );

  const handleSeatClick = (seatId: string) => {
    const currentUserId = seatStates[seatId]?.userId || null;
    setSelectedSeatId(seatId);
    if (currentUserId) setIsActionModalOpen(true);
    else setIsUserModalOpen(true);
  };

  const handleLeaveSeat = () => {
    if (!selectedSeatId) return;
    finalizeSeatOccupant(selectedSeatId);
    setSeatStates((prev) => ({
      ...prev,
      [selectedSeatId]: { userId: null, status: "present", startedAt: null },
    }));
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedSeatId) return;
    setSeatStates((prev) => ({
      ...prev,
      [selectedSeatId]: {
        userId: user.id,
        status: "present",
        startedAt: Date.now(),
      },
    }));
    setIsUserModalOpen(false);
    setSelectedSeatId(null);
  };

  const assignRandomSeatForUser = (user: User) => {
    const now = Date.now();
    const currentSeatId = Object.entries(seatStates).find(
      ([, value]) => value.userId === user.id
    )?.[0];
    if (currentSeatId) finalizeSeatOccupant(currentSeatId);

    let chosenSeat: string | null = null;
    setSeatStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key]?.userId === user.id) {
          next[key] = { userId: null, status: "present", startedAt: null };
        }
      });
      const emptySeats = Object.entries(next)
        .filter(([, value]) => value.userId === null)
        .map(([seatId]) => seatId);
      if (emptySeats.length === 0) return prev;
      chosenSeat =
        emptySeats[Math.floor(Math.random() * emptySeats.length)] || null;
      if (!chosenSeat) return prev;
      next[chosenSeat] = {
        userId: user.id,
        status: "present",
        startedAt: now,
      };
      return next;
    });
    setRandomUserId(user.id);
    setRandomSeatId(chosenSeat);
  };

  const handleOpenRandom = () => {
    setRandomUserId(null);
    setRandomSeatId(null);
    setIsRandomModalOpen(true);
  };

  const handleRandomSelect = (user: User) => {
    assignRandomSeatForUser(user);
  };

  const handleToggleAway = () => {
    if (!selectedSeatId) return;
    setSeatStates((prev) => {
      const current = prev[selectedSeatId] || {
        userId: null,
        status: "present",
      };
      if (!current.userId) return prev;
      const nextStatus: SeatStatus =
        current.status === "away" ? "present" : "away";
      return {
        ...prev,
        [selectedSeatId]: { ...current, status: nextStatus },
      };
    });
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleAddUser = (name: string, category: UserCategory) => {
    setUsers((prev) => [
      ...prev,
      { id: Date.now().toString(), name, category },
    ]);
  };

  const handleRemoveUser = (userId: string) => {
    Object.keys(seatStates).forEach((seatId) => {
      const seat = seatStates[seatId];
      if (seat?.userId === userId) addStayDuration(userId, seat.startedAt);
    });
    setSeatStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key]?.userId === userId) {
          next[key] = { userId: null, status: "present", startedAt: null };
        }
      });
      return next;
    });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleReset = () => {
    if (confirm("全ての席状況をリセットしますか？")) {
      finalizeAllSeats();
      setSeatStates(createEmptySeatStates());
    }
  };

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

  const getSelectedUserName = () => {
    if (!selectedSeatId) return "";
    const userId = seatStates[selectedSeatId]?.userId || null;
    return users.find((u) => u.id === userId)?.name || "";
  };

  return (
    <div className="h-screen bg-gray-50 p-2 md:p-3 select-none flex flex-col overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2 px-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          大島研究室
        </h1>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setIsHistogramOpen(true)}
            className="bg-emerald-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-emerald-500 shadow-md"
          >
            📊 週別滞在ヒストグラム
          </button>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-amber-400 shadow-md"
          >
            🏆 滞在ランキング
          </button>
          <button
            onClick={handleOpenRandom}
            className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-indigo-500 shadow-md"
          >
            🎲 ランダム着席
          </button>
          <button
            onClick={handleReset}
            className="text-xs md:text-sm text-gray-400 hover:text-red-500 underline"
          >
            全席リセット
          </button>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-gray-800 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-gray-700 shadow-md"
          >
            ⚙ メンバー管理
          </button>
        </div>
      </div>
      <div className="flex flex-1 gap-3 md:gap-4 max-w-7xl mx-auto w-full h-full overflow-hidden">
        <div className="flex-1 min-w-0 bg-white p-4 md:p-5 rounded-xl shadow-lg h-full overflow-y-auto">
          {INITIAL_LAYOUT.map((row) => (
            <div
              key={row.rowId}
              className="mb-0.5 border-b border-gray-100 pb-4 last:border-0 last:mb-0"
            >
              <h2 className="text-xl font-semibold text-gray-500 mb-2 pl-2">
                {row.rowId} 列
              </h2>
              <div className="flex flex-wrap gap-2">
                {row.seats.map((seatId) => {
                  const seatState = seatStates[seatId] || {
                    userId: null,
                    status: "present" as SeatStatus,
                    startedAt: null,
                  };
                  const currentUser = seatState.userId
                    ? users.find((u) => u.id === seatState.userId) || null
                    : null;
                  return (
                    <Seat
                      key={seatId}
                      seatId={seatId}
                      currentUser={currentUser}
                      status={seatState.status}
                      onClick={handleSeatClick}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col gap-2">
          <div className="flex-1 min-h-0">
            <TrainInfo />
          </div>
          <div className="flex-1 min-h-0">
            <NewsVideo />
          </div>
        </div>
      </div>
      <UserSelectModal
        isOpen={isUserModalOpen}
        users={availableUsers}
        stayDurations={stayDurationDisplay}
        onSelect={handleUserSelect}
        onClose={() => setIsUserModalOpen(false)}
      />
      <ActionModal
        isOpen={isActionModalOpen}
        seatId={selectedSeatId || ""}
        userName={getSelectedUserName()}
        isAway={
          selectedSeatId ? seatStates[selectedSeatId]?.status === "away" : false
        }
        onToggleAway={handleToggleAway}
        onLeave={handleLeaveSeat}
        onClose={() => setIsActionModalOpen(false)}
      />
      <AdminModal
        isOpen={isAdminModalOpen}
        users={users}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        onClose={() => setIsAdminModalOpen(false)}
      />
      <RandomSeatModal
        isOpen={isRandomModalOpen}
        users={availableUsers}
        selectedUserId={randomUserId}
        assignedSeatId={randomSeatId}
        hasAnySeat={hasEmptySeat || Boolean(randomUserId)}
        stayDurations={stayDurationDisplay}
        onSelectUser={handleRandomSelect}
        onClose={() => setIsRandomModalOpen(false)}
      />
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        weekLabel={selectedWeekLabel}
        rows={leaderboardRows}
        users={users}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onThisWeek={handleThisWeek}
        disableThisWeek={disableThisWeek}
        disablePrevWeek={disablePrevWeek}
        disableNextWeek={disableNextWeek}
        onClose={() => setIsLeaderboardOpen(false)}
      />
      <WeeklyHistogramModal
        isOpen={isHistogramOpen}
        weeks={histogramWeeks}
        userBars={histogramUserBars}
        selectedWeekLabel={selectedWeekLabel}
        selectedWeekTotal={selectedWeekTotalFormatted}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onThisWeek={handleThisWeek}
        disablePrevWeek={disablePrevWeek}
        disableNextWeek={disableNextWeek}
        disableThisWeek={disableThisWeek}
        onClose={() => setIsHistogramOpen(false)}
      />
    </div>
  );
}

export default App;
