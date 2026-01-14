import { render, screen, fireEvent, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const setNow = (iso: string) => vi.setSystemTime(new Date(iso));

describe("home reminder", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens when within 5-minute buffer after configured time", async () => {
    setNow("2024-01-08T16:00:00");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "⚙ 設定" }));
    fireEvent.change(screen.getByDisplayValue("20:00"), {
      target: { value: "15:58" },
    });

    expect(screen.getByText("そろそろ帰宅時間です")).toBeInTheDocument();
    const stored = localStorage.getItem("lab-home-reminder-date");
    expect(stored).toBe("2024-01-08");
  });

  it("does not open when configured time is more than 5 minutes past", () => {
    setNow("2024-01-08T16:00:00");
    localStorage.setItem("lab-home-reminder-time", "15:00");

    render(<App />);

    expect(screen.queryByText("そろそろ帰宅時間です")).toBeNull();
  });

  it("opens after resetting today's reminder and moving time into recent past", async () => {
    setNow("2024-01-08T16:00:00");
    localStorage.setItem("lab-home-reminder-date", "2024-01-08");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "⚙ 設定" }));
    fireEvent.click(
      screen.getByRole("button", { name: "今日のリマインダーをリセット" })
    );
    fireEvent.change(screen.getByDisplayValue("20:00"), {
      target: { value: "15:59" },
    });

    expect(screen.getByText("そろそろ帰宅時間です")).toBeInTheDocument();
  });

  it("auto-closes after configured duration", async () => {
    setNow("2024-01-08T16:00:00");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "⚙ 設定" }));
    fireEvent.change(screen.getByDisplayValue("20:00"), {
      target: { value: "16:00" },
    });
    fireEvent.change(screen.getByDisplayValue("15"), {
      target: { value: "5" },
    });

    expect(screen.getByText("そろそろ帰宅時間です")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("そろそろ帰宅時間です")).toBeNull();
  });
});
