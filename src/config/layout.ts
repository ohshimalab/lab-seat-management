import type { SeatLayout, SeatState, SeatStatus, User } from "../types";

export const INITIAL_LAYOUT: SeatLayout[] = [
  { rowId: "R1", seats: ["R11", "R12", "R13"] },
  { rowId: "R2", seats: ["R21", "R22", "R23", "R24"] },
  { rowId: "R3", seats: ["R31", "R32", "R33", "R34"] },
  { rowId: "R4", seats: ["R41", "R42", "R43", "R44"] },
];

export const DEFAULT_USERS: User[] = [
  { id: "u1", name: "Yamada", category: "Staff" },
  { id: "u2", name: "Tanaka", category: "M" },
];

export const createEmptySeatStates = (): Record<string, SeatState> => {
  const base: Record<string, SeatState> = {};
  INITIAL_LAYOUT.forEach((row) => {
    row.seats.forEach((seatId) => {
      base[seatId] = { userId: null, status: "present", startedAt: null };
    });
  });
  return base;
};

export const normalizeSeatStates = (
  raw: unknown
): Record<string, SeatState> => {
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
