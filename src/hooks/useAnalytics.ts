import { useMemo } from "react";
import type { StaySession } from "../types";

export interface SeatAggregate {
  seconds: number;
  count: number;
}

export function getSeatTotals(
  sessions: StaySession[],
  rangeStartMs: number,
  rangeEndMs: number,
  nowMs?: number
): Record<string, SeatAggregate> {
  const now = nowMs ?? Date.now();
  const totals: Record<string, SeatAggregate> = {};

  for (const s of sessions) {
    const start = Math.max(s.start, rangeStartMs);
    const end = Math.min(s.end ?? now, rangeEndMs);
    if (end > start) {
      const seconds = Math.floor((end - start) / 1000);
      const cur = totals[s.seatId] ?? { seconds: 0, count: 0 };
      cur.seconds += seconds;
      cur.count += 1;
      totals[s.seatId] = cur;
    }
  }

  return totals;
}

export function useSeatTotals(
  sessions: StaySession[],
  rangeStartMs: number,
  rangeEndMs: number,
  nowMs?: number
) {
  return useMemo(
    () => getSeatTotals(sessions, rangeStartMs, rangeEndMs, nowMs),
    [sessions, rangeStartMs, rangeEndMs, nowMs]
  );
}
