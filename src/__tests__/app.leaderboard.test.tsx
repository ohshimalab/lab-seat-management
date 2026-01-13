import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "../App";

describe("leaderboard modal", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows ranking by week and supports navigation", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-22T09:00:00"));

    localStorage.setItem(
      "lab-users-data",
      JSON.stringify([
        { id: "u1", name: "Yamada", category: "Staff" },
        { id: "u2", name: "Tanaka", category: "M" },
      ])
    );

    localStorage.setItem(
      "lab-stay-data",
      JSON.stringify({
        weekKey: "2024-01-08",
        data: {
          "2024-01-08": { u1: 7200, u2: 1800 },
          "2024-01-15": { u1: 60, u2: 3600 },
        },
      })
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "🏆 滞在ランキング" }));

    // Go to week starting 2024-01-15 (next available week)
    fireEvent.click(screen.getByRole("button", { name: "次の週 ＞" }));

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Tanaka");
    expect(items[0]).toHaveTextContent("1h0m");
    expect(items[1]).toHaveTextContent("Yamada");
    expect(items[1]).toHaveTextContent("1m");

    // Move to current week; next should disable (no further data)
    fireEvent.click(screen.getByRole("button", { name: "次の週 ＞" }));
    const nextButton = screen.getByRole("button", { name: "次の週 ＞" });
    expect(nextButton).toBeDisabled();

    // At earliest week, prev should disable
    fireEvent.click(screen.getByRole("button", { name: "＜ 前の週" }));
    fireEvent.click(screen.getByRole("button", { name: "＜ 前の週" }));
    const prevButton = screen.getByRole("button", { name: "＜ 前の週" });
    expect(prevButton).toBeDisabled();

    vi.useRealTimers();
  });
});
