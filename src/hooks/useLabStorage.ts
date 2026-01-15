import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_MQTT_CONFIG } from "./useEnvTelemetry";
import type {
  MqttConfig,
  SeatState,
  StaySession,
  User,
  UserCategory,
} from "../types";

const USERS_KEY = "lab-users-data";
const SEATS_KEY = "lab-seat-data";

type ExportArgs = {
  sessions: StaySession[];
  lastResetDate: string | null;
  mqttConfig: MqttConfig;
};

type ImportDeps = {
  importTrackingData: (payload: {
    sessions: StaySession[];
    lastResetDate: string | null;
  }) => void;
  setMqttConfig: (config: MqttConfig) => void;
};

type Options = {
  defaultUsers: User[];
  createEmptySeatStates: () => Record<string, SeatState>;
  normalizeSeatStates: (raw: unknown) => Record<string, SeatState>;
};

const isUserRecord = (value: unknown): value is User => {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<User>;
  return typeof record.id === "string" && typeof record.name === "string";
};

const isStaySessionRecord = (value: unknown): value is StaySession => {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<StaySession>;
  const hasIds =
    typeof record.userId === "string" && typeof record.seatId === "string";
  const hasStart = typeof record.start === "number";
  const hasEnd =
    typeof record.end === "number" ||
    record.end === null ||
    record.end === undefined;
  return Boolean(hasIds && hasStart && hasEnd);
};

export const useLabStorage = ({
  defaultUsers,
  createEmptySeatStates,
  normalizeSeatStates,
}: Options) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(isUserRecord).map((u) => ({
            id: u.id,
            name: u.name,
            category: u.category || "Other",
          }));
        }
        return defaultUsers;
      } catch {
        return defaultUsers;
      }
    }
    return defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const [seatStates, setSeatStates] = useState<Record<string, SeatState>>(
    () => {
      const saved = localStorage.getItem(SEATS_KEY);
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
    localStorage.setItem(SEATS_KEY, JSON.stringify(seatStates));
  }, [seatStates]);

  const makeExportData = useCallback(
    ({ sessions, lastResetDate, mqttConfig }: ExportArgs) =>
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
    [users, seatStates]
  );

  const makeImportHandler = useCallback(
    ({ importTrackingData, setMqttConfig }: ImportDeps) =>
      (raw: string) => {
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            return { success: false, message: "JSONが無効です" };
          }

          const validCategories: UserCategory[] = [
            "Staff",
            "D",
            "M",
            "B",
            "Other",
          ];

          const importedUsers: User[] = Array.isArray(
            (parsed as { users?: unknown }).users
          )
            ? ((parsed as { users?: unknown }).users as unknown[])
                .filter(isUserRecord)
                .map((u) => ({
                  id: u.id,
                  name: u.name,
                  category: validCategories.includes(u.category || "Other")
                    ? (u.category as UserCategory)
                    : "Other",
                }))
            : users;

          const importedSeats = (parsed as { seatStates?: unknown }).seatStates
            ? normalizeSeatStates(
                (parsed as { seatStates?: unknown }).seatStates
              )
            : createEmptySeatStates();

          const importedSessions: StaySession[] = Array.isArray(
            (parsed as { sessions?: unknown }).sessions
          )
            ? ((parsed as { sessions?: unknown }).sessions as unknown[])
                .filter(isStaySessionRecord)
                .map((s) => ({
                  id: s.id,
                  userId: s.userId,
                  seatId: s.seatId,
                  start: s.start,
                  end: typeof s.end === "number" ? s.end : s.end ?? null,
                }))
            : [];

          const importedLastReset: string | null =
            typeof (parsed as { lastResetDate?: unknown }).lastResetDate ===
            "string"
              ? (parsed as { lastResetDate: string }).lastResetDate
              : null;

          const importedMqttConfigRaw =
            (parsed as { mqttConfig?: unknown }).mqttConfig || {};
          const importedMqttConfig: MqttConfig = {
            ...DEFAULT_MQTT_CONFIG,
            ...(typeof importedMqttConfigRaw === "object" &&
            importedMqttConfigRaw
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
      },
    [createEmptySeatStates, normalizeSeatStates, setUsers, setSeatStates, users]
  );

  const hasAnyUser = useMemo(() => users.length > 0, [users]);

  return {
    users,
    setUsers,
    seatStates,
    setSeatStates,
    makeExportData,
    makeImportHandler,
    hasAnyUser,
  };
};
