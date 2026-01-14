import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const countState = (state: string, slices: HTMLElement[]) =>
  slices.filter((el) => el.getAttribute("data-state") === state).length;

describe("seat presence timeline", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();

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
      fireEvent.click(
        await screen.findByRole("button", { name: "離席中にする" })
      );

      const slicesAfterAway = within(
        screen.getByTestId("timeline-R11")
      ).getAllByTestId("timeline-slice");
      expect(countState("away", slicesAfterAway)).toBe(1);
      expect(countState("present", slicesAfterAway)).toBe(4);
    }
  );
});
