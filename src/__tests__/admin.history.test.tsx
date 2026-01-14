import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

describe("admin history management", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("adds a manual session and updates leaderboard", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T09:00:00"));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "⚙ 設定" }));

    fireEvent.change(screen.getByDisplayValue("ユーザーを選択"), {
      target: { value: "u1" },
    });
    fireEvent.change(screen.getByPlaceholderText("席ID (例: R11)"), {
      target: { value: "R99" },
    });
    fireEvent.change(screen.getByLabelText("session-start"), {
      target: { value: "2024-01-08T09:00" },
    });
    fireEvent.change(screen.getByLabelText("session-end"), {
      target: { value: "2024-01-08T11:00" },
    });

    const addButtons = screen.getAllByRole("button", { name: "追加" });
    fireEvent.click(addButtons[addButtons.length - 1]);

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    fireEvent.click(screen.getByRole("button", { name: "🏆 リーダーボード" }));
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Yamada");
    expect(rows[0]).toHaveTextContent("2h0m");

    vi.useRealTimers();
  });

  it("removes a session via admin and clears leaderboard total", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T09:00:00"));

    localStorage.setItem(
      "lab-stay-sessions",
      JSON.stringify([
        {
          id: "sess-test",
          userId: "u1",
          seatId: "R11",
          start: new Date("2024-01-08T09:00:00").getTime(),
          end: new Date("2024-01-08T11:00:00").getTime(),
        },
      ])
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "🏆 リーダーボード" }));
    const initialRows = screen.getAllByRole("listitem");
    expect(initialRows[0]).toHaveTextContent("2h0m");
    fireEvent.click(screen.getByRole("button", { name: "✕ 閉じる" }));

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "⚙ 設定" }));

    const deleteButtons = screen.getAllByText("削除");
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    confirmSpy.mockRestore();

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    fireEvent.click(screen.getByRole("button", { name: "🏆 リーダーボード" }));
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("0m");

    vi.useRealTimers();
  });

  it("edits a session and recalculates leaderboard", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T09:00:00"));

    localStorage.setItem(
      "lab-stay-sessions",
      JSON.stringify([
        {
          id: "sess-edit",
          userId: "u1",
          seatId: "R11",
          start: new Date("2024-01-08T09:00:00").getTime(),
          end: new Date("2024-01-08T11:00:00").getTime(),
        },
      ])
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "⚙ 設定" }));

    const editButton = screen.getByRole("button", { name: "編集" });
    fireEvent.click(editButton);

    const editEndInput = screen.getByLabelText("edit-end");
    fireEvent.change(editEndInput, {
      target: { value: "2024-01-08T12:00" },
    });

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    fireEvent.click(screen.getByRole("button", { name: "🏆 リーダーボード" }));
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("3h0m");

    vi.useRealTimers();
  });
});
