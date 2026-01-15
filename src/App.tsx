import { useState, useMemo, useEffect } from "react";
import mqtt from "mqtt";
import type React from "react";
import { Seat } from "./components/Seat";
import { UserSelectModal } from "./components/UserSelectModal";
import { ActionModal } from "./components/ActionModal";
import { RandomSeatModal } from "./components/RandomSeatModal";
import { AdminModal } from "./components/AdminModal";
import { TrainInfo } from "./components/TrainInfo";
import { NewsVideo } from "./components/NewsVideo";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { HomeReminderModal } from "./components/HomeReminderModal";
import { useStayTracking } from "./hooks/useStayTracking";
import { FIRST_ARRIVAL_KEY, useNotifications } from "./hooks/useNotifications";
import type {
  User,
  SeatLayout,
  UserCategory,
  SeatState,
  SeatStatus,
  StaySession,
  MqttConfig,
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

const DEFAULT_MQTT_CONFIG: MqttConfig = {
  serverUrl: "",
  clientName: "",
  clientPassword: "",
};

const EMPTY_TELEMETRY = {
  temp: null as number | null,
  hum: null as number | null,
  location: "",
  updatedAt: null as number | null,
};

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
      const startedAt: number | null =
        typeof candidate.startedAt === "number" ? candidate.startedAt : null;
      base[seatId] = { userId, status, startedAt };
    }
  });
  return base;
};

function App() {
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

  const [mqttConfig, setMqttConfig] = useState<MqttConfig>(() => {
    const saved = localStorage.getItem("lab-mqtt-config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<MqttConfig>;
        return {
          ...DEFAULT_MQTT_CONFIG,
          ...parsed,
        };
      } catch {
        return DEFAULT_MQTT_CONFIG;
      }
    }
    return DEFAULT_MQTT_CONFIG;
  });

  const [envTelemetry, setEnvTelemetry] = useState<{
    temp: number | null;
    hum: number | null;
    location: string;
    updatedAt: number | null;
  }>({ ...EMPTY_TELEMETRY });

  useEffect(() => {
    localStorage.setItem("lab-mqtt-config", JSON.stringify(mqttConfig));
  }, [mqttConfig]);

  const finalizeSeatOccupant = (seatId: string, now: number) => {
    const seat = seatStates[seatId];
    if (seat?.userId) endSession(seat.userId, seatId, now);
  };

  const finalizeAllSeats = (now: number) => {
    Object.keys(seatStates).forEach((seatId) =>
      finalizeSeatOccupant(seatId, now)
    );
  };

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHomeReminderOpen, setIsHomeReminderOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => {
    const saved = localStorage.getItem("lab-home-reminder-time");
    return typeof saved === "string" && /^\d{2}:\d{2}$/.test(saved)
      ? saved
      : "20:00";
  });
  const [reminderDuration, setReminderDuration] = useState(() => {
    const saved = localStorage.getItem("lab-home-reminder-duration");
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return Number.isNaN(parsed) || parsed <= 0 ? 15 : parsed;
  });
  const [randomUserId, setRandomUserId] = useState<string | null>(null);
  const [randomSeatId, setRandomSeatId] = useState<string | null>(null);
  const [draggingSeatId, setDraggingSeatId] = useState<string | null>(null);

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

  const hasSeatedUser = seatedUserIds.length > 0;

  const tempDisplay =
    envTelemetry.temp === null ? "--" : envTelemetry.temp.toFixed(1);
  const humDisplay =
    envTelemetry.hum === null ? "--" : envTelemetry.hum.toFixed(1);
  const updatedLabel = envTelemetry.updatedAt
    ? new Date(envTelemetry.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  useEffect(() => {
    const STORAGE_KEY = "lab-home-reminder-date";
    const BUFFER_MINUTES = 5;
    const parseMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
      if (Number.isNaN(h) || Number.isNaN(m)) return 20 * 60;
      return h * 60 + m;
    };

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
    const id = setInterval(checkReminder, 60 * 1000);
    return () => clearInterval(id);
  }, [reminderTime, hasSeatedUser]);

  useEffect(() => {
    localStorage.setItem("lab-home-reminder-time", reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem(
      "lab-home-reminder-duration",
      String(reminderDuration)
    );
  }, [reminderDuration]);

  const isMqttConfigValid = (config: MqttConfig) =>
    Boolean(config.serverUrl && config.clientName);

  const handleMqttConfigChange = (config: MqttConfig) => {
    setMqttConfig(config);
    if (!isMqttConfigValid(config)) {
      setEnvTelemetry({ ...EMPTY_TELEMETRY });
    }
  };

  useEffect(() => {
    if (!isMqttConfigValid(mqttConfig)) return;

    let isMounted = true;
    const { serverUrl, clientName } = mqttConfig;
    const normalized = serverUrl.replace(/\s+/g, "");
    const hasProtocol =
      normalized.startsWith("ws://") || normalized.startsWith("wss://");
    const wsUrl = hasProtocol ? normalized : `wss://${normalized}`;
    const clientId = `${clientName}-${Math.random().toString(16).slice(2, 8)}`;

    const client = mqtt.connect(wsUrl, {
      clientId,
      username: clientName,
      password: mqttConfig.clientPassword || undefined,
      reconnectPeriod: 5000,
      clean: true,
    });

    const topic = "ohshimalab/+/+/telemetry";

    const handleMessage = (_topic: string, payload: unknown) => {
      try {
        const text =
          typeof payload === "string"
            ? payload
            : payload instanceof Uint8Array
            ? new TextDecoder().decode(payload)
            : payload instanceof ArrayBuffer
            ? new TextDecoder().decode(new Uint8Array(payload))
            : String(payload);
        const parsed = JSON.parse(text) as {
          meta?: { loc?: string; ts?: number };
          values?: { temp?: number; hum?: number };
        };
        const temp = parsed.values?.temp;
        const hum = parsed.values?.hum;
        if (typeof temp === "number" && typeof hum === "number" && isMounted) {
          setEnvTelemetry({
            temp,
            hum,
            location:
              parsed.meta && typeof parsed.meta.loc === "string"
                ? parsed.meta.loc
                : "",
            updatedAt:
              parsed.meta && typeof parsed.meta.ts === "number"
                ? parsed.meta.ts * 1000
                : Date.now(),
          });
        }
      } catch {
        // ignore malformed payloads
      }
    };

    const handleDisconnect = () => {
      if (isMounted) setEnvTelemetry({ ...EMPTY_TELEMETRY });
    };

    client.on("connect", () => {
      client.subscribe(topic);
    });

    client.on("message", handleMessage);
    client.on("close", handleDisconnect);
    client.on("error", handleDisconnect);

    return () => {
      isMounted = false;
      client.removeListener("message", handleMessage);
      client.removeListener("close", handleDisconnect);
      client.removeListener("error", handleDisconnect);
      client.end(true);
    };
  }, [mqttConfig]);

  const resetReminderDate = () => {
    localStorage.removeItem("lab-home-reminder-date");
  };

  const {
    selectedWeekLabel,
    leaderboardRows,
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
    lastResetDate,
    importTrackingData,
    todaySeatTimeline,
  } = useStayTracking({
    users,
    seatStates,
    setSeatStates,
    createEmptySeatStates,
  });

  const {
    weeklyGreetingOpen,
    weekendFarewellOpen,
    firstArrivalOpen,
    firstArrivalName,
    showWeeklyGreeting,
    hideWeeklyGreeting,
    showWeekendFarewell,
    hideWeekendFarewell,
    showFirstArrival,
    hideFirstArrival,
  } = useNotifications();

  const maybeShowWeeklyGreeting = (userId: string) => {
    if (!hasUserSessionThisWeek(userId)) {
      showWeeklyGreeting();
    }
  };

  const isWeekendDay = (date: Date) => {
    const day = date.getDay();
    return day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
  };

  const maybeShowFirstArrivalGreeting = (userId: string, nowDate: Date) => {
    const todayKey = nowDate.toISOString().slice(0, 10);
    const recorded = localStorage.getItem(FIRST_ARRIVAL_KEY);
    if (recorded === todayKey) return;
    const name = users.find((u) => u.id === userId)?.name || "";
    showFirstArrival(name);
    localStorage.setItem(FIRST_ARRIVAL_KEY, todayKey);
  };

  const handleSeatClick = (seatId: string) => {
    const currentUserId = seatStates[seatId]?.userId || null;
    setSelectedSeatId(seatId);
    if (currentUserId) setIsActionModalOpen(true);
    else setIsUserModalOpen(true);
  };

  const handleLeaveSeat = () => {
    if (!selectedSeatId) return;
    const nowDate = new Date();
    const now = nowDate.getTime();
    finalizeSeatOccupant(selectedSeatId, now);
    setSeatStates((prev) => ({
      ...prev,
      [selectedSeatId]: { userId: null, status: "present", startedAt: null },
    }));
    if (isWeekendDay(nowDate)) showWeekendFarewell();
    setIsActionModalOpen(false);
    setSelectedSeatId(null);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedSeatId) return;
    const nowDate = new Date();
    const now = nowDate.getTime();
    setSeatStates((prev) => ({
      ...prev,
      [selectedSeatId]: {
        userId: user.id,
        status: "present",
        startedAt: now,
      },
    }));
    maybeShowFirstArrivalGreeting(user.id, nowDate);
    maybeShowWeeklyGreeting(user.id);
    startSession(user.id, selectedSeatId, now);
    setIsUserModalOpen(false);
    setSelectedSeatId(null);
  };

  const assignRandomSeatForUser = (user: User) => {
    const nowDate = new Date();
    const now = nowDate.getTime();
    const currentSeatId = Object.entries(seatStates).find(
      ([, value]) => value.userId === user.id
    )?.[0];
    if (currentSeatId) endSession(user.id, currentSeatId, now);

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
    if (chosenSeat) {
      maybeShowFirstArrivalGreeting(user.id, nowDate);
      maybeShowWeeklyGreeting(user.id);
      startSession(user.id, chosenSeat, now);
    }
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
      if (seat?.userId === userId) endSession(userId, seatId, Date.now());
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

  const handleSeatDragStart = (seatId: string) => {
    if (seatStates[seatId]?.userId) setDraggingSeatId(seatId);
  };

  const handleSeatDragEnd = () => {
    setDraggingSeatId(null);
  };

  const handleSeatDragOver = (
    seatId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!draggingSeatId || seatId === draggingSeatId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleSeatDrop = (targetSeatId: string) => {
    if (!draggingSeatId || draggingSeatId === targetSeatId) {
      setDraggingSeatId(null);
      return;
    }

    const sourceSeat = seatStates[draggingSeatId];
    const targetSeat = seatStates[targetSeatId];
    if (!sourceSeat?.userId) {
      setDraggingSeatId(null);
      return;
    }

    const now = Date.now();
    const userId = sourceSeat.userId;

    setSeatStates((prev) => {
      const from = prev[draggingSeatId];
      const to = prev[targetSeatId];
      if (!from?.userId) return prev;
      const next: Record<string, SeatState> = { ...prev };

      // Swap if target occupied, otherwise move into empty
      if (to?.userId) {
        next[draggingSeatId] = {
          userId: to.userId,
          status: to.status || "present",
          startedAt: now,
        };
        next[targetSeatId] = {
          userId: from.userId,
          status: from.status || "present",
          startedAt: now,
        };
      } else {
        next[draggingSeatId] = {
          userId: null,
          status: "present",
          startedAt: null,
        };
        next[targetSeatId] = {
          userId: from.userId,
          status: from.status || "present",
          startedAt: now,
        };
      }
      return next;
    });

    if (targetSeat?.userId) {
      endSession(userId, draggingSeatId, now);
      endSession(targetSeat.userId, targetSeatId, now);
      startSession(userId, targetSeatId, now);
      startSession(targetSeat.userId, draggingSeatId, now);
    } else {
      endSession(userId, draggingSeatId, now);
      startSession(userId, targetSeatId, now);
    }
    setDraggingSeatId(null);
  };

  const handleReset = () => {
    if (confirm("全ての席状況をリセットしますか？")) {
      const now = Date.now();
      finalizeAllSeats(now);
      setSeatStates(createEmptySeatStates());
    }
  };

  const getSelectedUserName = () => {
    if (!selectedSeatId) return "";
    const userId = seatStates[selectedSeatId]?.userId || null;
    return users.find((u) => u.id === userId)?.name || "";
  };

  const exportData = useMemo(
    () =>
      JSON.stringify(
        {
          version: 2,
          users,
          seatStates,
          sessions,
          lastResetDate: lastResetDate || null,
          mqttConfig,
        },
        null,
        2
      ),
    [users, seatStates, sessions, lastResetDate, mqttConfig]
  );

  const handleImportData = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { success: false, message: "JSONが無効です" };
      }

      const validCategories: UserCategory[] = ["Staff", "D", "M", "B", "Other"];

      const importedUsers: User[] = Array.isArray(
        (parsed as { users?: unknown }).users
      )
        ? ((parsed as { users?: unknown }).users as User[])
            .filter(
              (u) => u && typeof u.id === "string" && typeof u.name === "string"
            )
            .map((u) => ({
              id: u.id,
              name: u.name,
              category: validCategories.includes(u.category || "Other")
                ? (u.category as UserCategory)
                : "Other",
            }))
        : users;

      const importedSeats = (parsed as { seatStates?: unknown }).seatStates
        ? normalizeSeatStates((parsed as { seatStates?: unknown }).seatStates)
        : createEmptySeatStates();

      const importedSessions: StaySession[] = Array.isArray(
        (parsed as { sessions?: unknown }).sessions
      )
        ? ((parsed as { sessions?: unknown }).sessions as StaySession[]).filter(
            (s) =>
              s &&
              typeof s.userId === "string" &&
              typeof s.seatId === "string" &&
              typeof s.start === "number" &&
              (typeof s.end === "number" || s.end === null)
          )
        : [];

      const importedLastReset =
        typeof (parsed as { lastResetDate?: unknown }).lastResetDate ===
        "string"
          ? (parsed as { lastResetDate?: string }).lastResetDate
          : null;

      const importedMqttConfigRaw =
        (parsed as { mqttConfig?: unknown }).mqttConfig || {};
      const importedMqttConfig: MqttConfig = {
        ...DEFAULT_MQTT_CONFIG,
        ...(typeof importedMqttConfigRaw === "object" && importedMqttConfigRaw
          ? (importedMqttConfigRaw as Partial<MqttConfig>)
          : {}),
      };

      setUsers(importedUsers);
      setSeatStates(importedSeats);
      importTrackingData({
        sessions: importedSessions,
        lastResetDate: importedLastReset,
      });
      setMqttConfig(importedMqttConfig);

      return { success: true, message: "インポートが完了しました" };
    } catch {
      return { success: false, message: "JSONの解析に失敗しました" };
    }
  };

  return (
    <div className="h-screen bg-gray-50 p-2 md:p-3 select-none flex flex-col overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2 px-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            大島研究室
          </h1>
          <div className="flex items-start gap-3 text-xs md:text-sm text-gray-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col gap-0.5 leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">🌡️</span>
                <span className="font-mono text-gray-900">{tempDisplay}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">💧</span>
                <span className="font-mono text-gray-900">{humDisplay}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 leading-tight text-[11px] text-gray-500">
              {envTelemetry.location && <span>({envTelemetry.location})</span>}
              {updatedLabel && (
                <span className="text-gray-400">更新 {updatedLabel}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-amber-400 shadow-md"
          >
            🏆 リーダーボード
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
            ⚙ 設定
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
                      isDroppable={Boolean(
                        draggingSeatId && draggingSeatId !== seatId
                      )}
                      onDragStart={handleSeatDragStart}
                      onDragOver={handleSeatDragOver}
                      onDrop={handleSeatDrop}
                      onDragEnd={handleSeatDragEnd}
                      timelineSlices={todaySeatTimeline[seatId]}
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
              onClick={hideWeeklyGreeting}
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
              onClick={hideFirstArrival}
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
              onClick={hideWeekendFarewell}
              className="text-sm font-bold text-white/80 hover:text-white"
              aria-label="通知を閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
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
        reminderTime={reminderTime}
        onChangeReminderTime={setReminderTime}
        onResetReminderDate={resetReminderDate}
        reminderDuration={reminderDuration}
        onChangeReminderDuration={setReminderDuration}
        mqttConfig={mqttConfig}
        onChangeMqttConfig={handleMqttConfigChange}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        sessions={sessions}
        onAddSession={(session) =>
          addSessionManual(
            session.userId,
            session.seatId,
            session.start,
            session.end
          )
        }
        onUpdateSession={updateSession}
        onRemoveSession={removeSession}
        exportData={exportData}
        onImportData={handleImportData}
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
      <HomeReminderModal
        isOpen={isHomeReminderOpen}
        autoCloseMs={reminderDuration * 1000}
        onClose={() => setIsHomeReminderOpen(false)}
      />
    </div>
  );
}

export default App;
