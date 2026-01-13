import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, expect } from "vitest";
import App from "../App";

describe("weekly histogram", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows only weeks with data and navigates within available range", () => {
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

    fireEvent.click(
      screen.getByRole("button", { name: "📊 週別滞在ヒストグラム" })
    );

    const prev = screen.getByRole("button", { name: "＜ 前の週" });
    const next = screen.getByRole("button", { name: "次の週 ＞" });
    const thisWeek = screen.getByRole("button", { name: "今週" });

    expect(thisWeek).toBeDisabled();
    expect(next).toBeDisabled();
    expect(screen.getByText(/合計 1h1m/)).toBeInTheDocument();

    fireEvent.click(prev);

    expect(screen.getByText(/合計 2h30m/)).toBeInTheDocument();
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();
  });
});
