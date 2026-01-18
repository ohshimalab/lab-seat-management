import { describe, it, expect } from "vitest";
import { getSeatTotals } from "../hooks/useAnalytics";
import type { StaySession } from "../types";

describe("getSeatTotals", () => {
  const nowMs = Date.UTC(2026, 0, 18, 12, 0, 0);
  const rangeStart = Date.UTC(2026, 0, 18, 0, 0, 0);
  const rangeEnd = Date.UTC(2026, 0, 18, 23, 59, 59, 999);

  it("sums overlapping sessions for the same seat", () => {
    const sessions: StaySession[] = [
      {
        userId: "u1",
        seatId: "A1",
        start: Date.UTC(2026, 0, 18, 1, 0, 0),
        end: Date.UTC(2026, 0, 18, 3, 0, 0),
      },
      {
        userId: "u2",
        seatId: "A1",
        start: Date.UTC(2026, 0, 18, 2, 0, 0),
        end: Date.UTC(2026, 0, 18, 4, 0, 0),
      },
    ];

    const totals = getSeatTotals(sessions, rangeStart, rangeEnd, nowMs);
    expect(totals).toHaveProperty("A1");
    // session durations: 2h + 2h = 4h => 14400 seconds
    expect(totals["A1"].seconds).toBe(4 * 3600);
    expect(totals["A1"].count).toBe(2);
  });

  it("counts ongoing session using nowMs when end is null", () => {
    const sessions: StaySession[] = [
      {
        userId: "u3",
        seatId: "B1",
        start: Date.UTC(2026, 0, 18, 10, 0, 0),
        end: null,
      },
    ];

    const totals = getSeatTotals(sessions, rangeStart, rangeEnd, nowMs);
    expect(totals).toHaveProperty("B1");
    // from 10:00 to now(12:00) = 2h
    expect(totals["B1"].seconds).toBe(2 * 3600);
    expect(totals["B1"].count).toBe(1);
  });

  it("returns empty object when there are no sessions in range", () => {
    const sessions: StaySession[] = [];
    const totals = getSeatTotals(sessions, rangeStart, rangeEnd, nowMs);
    expect(Object.keys(totals).length).toBe(0);
  });

  it("ignores sessions outside the requested range", () => {
    const sessions: StaySession[] = [
      {
        userId: "u4",
        seatId: "C1",
        start: Date.UTC(2026, 0, 17, 1, 0, 0),
        end: Date.UTC(2026, 0, 17, 2, 0, 0),
      },
    ];
    const totals = getSeatTotals(sessions, rangeStart, rangeEnd, nowMs);
    expect(totals["C1"]).toBeUndefined();
  });
});
