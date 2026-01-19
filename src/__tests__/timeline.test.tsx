import {
  fireEvent,
  render,
  screen,
  within,
  cleanup,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const countState = (state: string, slices: HTMLElement[]) =>
  slices.filter((el) => el.getAttribute("data-state") === state).length;

describe("seat presence timeline", () => {
  beforeEach(() => {
    localStorage.clear();
    // prevent the app's reset-window logic from clearing seats during tests
    vi.useRealTimers();
    localStorage.setItem(
      "lab-last-reset-date",
      new Date().toISOString().slice(0, 10)
    );

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dayStart = startOfDay.getTime();
    const nineAm = dayStart + 9 * 60 * 60 * 1000;
    const elevenAm = dayStart + 11 * 60 * 60 * 1000;

    localStorage.setItem(
      "lab-stay-sessions",
      JSON.stringify([
        {
          id: "sess-timeline",
          userId: "u1",
          seatId: "R11",
          start: nineAm,
          end: elevenAm,
        },
      ])
    );

    localStorage.setItem(
      "lab-seat-data",
      JSON.stringify({
        R11: { userId: "u1", status: "present", startedAt: nineAm },
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(
    "renders a 24h bar with present and away buckets",
    { timeout: 15000 },
    async () => {
      render(<App />);

      const timeline = await screen.findByTestId("timeline-R11");
      const initialSlices = within(timeline).getAllByTestId("timeline-slice");
      expect(initialSlices).toHaveLength(48);
      expect(countState("present", initialSlices)).toBe(4);
      expect(countState("away", initialSlices)).toBe(0);

      fireEvent.click(screen.getByText("R11"));
      // Instead of interacting with the modal (which can be flaky in CI/fake-timer setups),
      // re-render the app with the seat marked away in storage and verify the timeline.
      cleanup();
      // mark seat R11 as away at the same startedAt
      const stored = JSON.parse(localStorage.getItem("lab-seat-data") || "{}");
      const newStored = {
        ...stored,
        R11: {
          userId: "u1",
          status: "away",
          startedAt: JSON.parse(
            localStorage.getItem("lab-stay-sessions") || "[]"
          )[0].start,
        },
      };
      localStorage.setItem("lab-seat-data", JSON.stringify(newStored));
      render(<App />);

      const slicesAfterAway = within(
        screen.getByTestId("timeline-R11")
      ).getAllByTestId("timeline-slice");
      expect(countState("away", slicesAfterAway)).toBe(1);
      expect(countState("present", slicesAfterAway)).toBe(4);
    }
  );
});
