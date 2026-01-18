import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SeatHeatmap from "../components/Analytics/SeatHeatmap";
import type { SeatLayout, StaySession } from "../types";

describe("SeatHeatmap component - smoke", () => {
  it("renders without crashing given minimal layout and sessions", () => {
    const layout: SeatLayout[] = [{ rowId: "R1", seats: ["A1", "A2"] }];
    const sessions: StaySession[] = [];
    const nowMs = Date.UTC(2026, 0, 18, 12, 0, 0);
    const rangeStart = Date.UTC(2026, 0, 18, 0, 0, 0);
    const rangeEnd = Date.UTC(2026, 0, 18, 23, 59, 59, 999);

    render(
      <SeatHeatmap
        layout={layout}
        sessions={sessions}
        rangeStartMs={rangeStart}
        rangeEndMs={rangeEnd}
        nowMs={nowMs}
      />
    );

    expect(screen.getByText("座席ヒートマップ")).toBeInTheDocument();
  });

  it("defaults to 今日 preset on mount", () => {
    const layout: SeatLayout[] = [{ rowId: "R1", seats: ["A1", "A2"] }];
    const sessions: StaySession[] = [];
    const nowMs = Date.UTC(2026, 0, 18, 12, 0, 0);
    const rangeStart = Date.UTC(2026, 0, 18, 0, 0, 0);
    const rangeEnd = Date.UTC(2026, 0, 18, 23, 59, 59, 999);

    render(
      <SeatHeatmap
        layout={layout}
        sessions={sessions}
        rangeStartMs={rangeStart}
        rangeEndMs={rangeEnd}
        nowMs={nowMs}
      />
    );

    // active preset button should be 今日 and have aria-current
    const todayButton = screen.getByRole("button", { name: /今日/ });
    expect(todayButton).toHaveAttribute("aria-current", "true");

    // human-readable range should show today's date twice
    expect(screen.getByText("2026-01-18 — 2026-01-18")).toBeInTheDocument();
  });

  it("clicking 昨日 preset updates the date inputs to yesterday", async () => {
    const layout: SeatLayout[] = [{ rowId: "R1", seats: ["A1", "A2"] }];
    const sessions: StaySession[] = [];
    const nowMs = Date.UTC(2026, 0, 18, 12, 0, 0);
    const rangeStart = Date.UTC(2026, 0, 18, 0, 0, 0);
    const rangeEnd = Date.UTC(2026, 0, 18, 23, 59, 59, 999);

    render(
      <SeatHeatmap
        layout={layout}
        sessions={sessions}
        rangeStartMs={rangeStart}
        rangeEndMs={rangeEnd}
        nowMs={nowMs}
      />
    );

    const yesterdayBtn = screen.getByRole("button", { name: /昨日/ });
    expect(yesterdayBtn).toBeInTheDocument();
    fireEvent.click(yesterdayBtn);

    const startInput = screen.getByLabelText("開始日時") as HTMLInputElement;
    const endInput = screen.getByLabelText("終了日時") as HTMLInputElement;

    await waitFor(() => {
      expect(startInput.value).toBe("2026-01-17T00:00");
    });
    // endInput value may include minutes only
    await waitFor(() => {
      expect(endInput.value.startsWith("2026-01-17T23:59")).toBe(true);
    });
  });

  it("display toggle switches between hours and session count", async () => {
    const layout: SeatLayout[] = [{ rowId: "R1", seats: ["A1"] }];
    const sessions: StaySession[] = [];
    const nowMs = Date.UTC(2026, 0, 18, 12, 0, 0);
    const rangeStart = Date.UTC(2026, 0, 18, 0, 0, 0);
    const rangeEnd = Date.UTC(2026, 0, 18, 23, 59, 59, 999);

    render(
      <SeatHeatmap
        layout={layout}
        sessions={sessions}
        rangeStartMs={rangeStart}
        rangeEndMs={rangeEnd}
        nowMs={nowMs}
      />
    );

    // initially should show hours (default)
    const tile = screen.getByText(/0\.0時間/);
    expect(tile).toBeInTheDocument();

    // click セッション数 tab (role=tab)
    const sessionsTab = screen.getByRole("tab", { name: /セッション数/ });
    fireEvent.click(sessionsTab);

    await waitFor(() => {
      expect(screen.getByText(/^0$/)).toBeInTheDocument();
    });
  });
});
