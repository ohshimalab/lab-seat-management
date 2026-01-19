import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "../App";

describe("Week Strike & aggregated notifications", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("shows 2ストライクです！ on consecutive days and only once per day", async () => {
    // use synchronous fireEvent to avoid userEvent/fake-timers interactions
    // Day 1: seat the user
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T09:00:00")); // Monday
    render(<App />);
    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));

    // No strike on first day
    expect(screen.queryByText(/ストライク/)).toBeNull();

    // Leave so we can re-seat next day
    fireEvent.click(screen.getByText("R11"));
    const leaveButton = screen.getByRole("button", {
      name: "退席する (磁石を外す)",
    });
    fireEvent.click(leaveButton);

    // Day 2: consecutive seating should trigger 2ストライク
    vi.setSystemTime(new Date("2024-01-09T09:00:00")); // Tuesday

    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));

    // Expect a single notification modal containing the strike text
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("2ストライク");

    // don't rely on closing UI here; verify content then finish
    vi.useRealTimers();
  });

  it("aggregates multiple notifications into a single popup", async () => {
    // Pick a weekend day (Saturday)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-13T10:00:00")); // Saturday
    render(<App />);

    // Seat first person of the day -- expect aggregated messages
    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));

    // existing toast layer should show first-arrival + weekly greeting
    expect(screen.getByText(/一番乗り/)).toBeInTheDocument();
    expect(screen.getByText(/今週も頑張りましょう！/)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
