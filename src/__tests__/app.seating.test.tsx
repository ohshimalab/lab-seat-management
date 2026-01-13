import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("seat management - seating and clearing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("assigns a user to a seat and clears it via leave", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Seat someone in R11
    await user.click(screen.getByText("R11"));
    const memberButton = screen.getByRole("button", { name: /Yamada/ });
    await user.click(memberButton);

    // Seat shows the assigned user
    const seat = screen.getByText("R11").closest("div");
    expect(seat).toHaveTextContent("Yamada");
    expect(seat).not.toHaveTextContent("空席");

    // Open action modal and leave
    await user.click(screen.getByText("R11"));
    const leaveButton = await screen.findByRole("button", {
      name: "退席する (磁石を外す)",
    });
    await user.click(leaveButton);

    // Seat becomes empty again
    const clearedSeat = screen.getByText("R11").closest("div");
    expect(clearedSeat).toHaveTextContent("空席");
    expect(clearedSeat).not.toHaveTextContent("Yamada");

    // Persisted state reflects cleared seat
    const saved = JSON.parse(localStorage.getItem("lab-seat-data") || "{}");
    expect(saved.R11?.userId ?? null).toBeNull();
    expect(saved.R11?.status ?? "present").toBe("present");
  });

  it("assigns random seat", async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "🎲 ランダム着席" }));
    const memberButton = await screen.findByRole("button", { name: /Yamada/ });
    await user.click(memberButton);

    const firstSeat = screen.getAllByText("R11")[0].closest("div");
    expect(firstSeat).toHaveTextContent("Yamada");
  });

  it(
    "auto resets seats when opened at or after 22:30",
    { timeout: 10000 },
    async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-02T22:30:00"));
      localStorage.setItem(
        "lab-seat-data",
        JSON.stringify({ R11: { userId: "u1", status: "present" } })
      );
      localStorage.setItem(
        "lab-users-data",
        JSON.stringify([{ id: "u1", name: "Yamada", category: "Staff" }])
      );
      localStorage.setItem("lab-last-reset-date", "2024-01-01");

      render(<App />);

      await Promise.resolve();

      const clearedSeat = screen.getByText("R11").closest("div");
      expect(clearedSeat).toHaveTextContent("空席");

      const saved = JSON.parse(localStorage.getItem("lab-seat-data") || "{}");
      expect(saved.R11?.userId ?? null).toBeNull();
      expect(saved.R11?.status ?? "present").toBe("present");
      expect(localStorage.getItem("lab-last-reset-date")).toBe("2024-01-02");

      vi.useRealTimers();
    }
  );

  it(
    "catches up reset when opened before 6am",
    { timeout: 10000 },
    async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-03T05:30:00"));
      localStorage.setItem(
        "lab-seat-data",
        JSON.stringify({ R11: { userId: "u1", status: "present" } })
      );
      localStorage.setItem(
        "lab-users-data",
        JSON.stringify([{ id: "u1", name: "Yamada", category: "Staff" }])
      );
      localStorage.setItem("lab-last-reset-date", "2024-01-01");

      render(<App />);

      await Promise.resolve();

      const clearedSeat = screen.getByText("R11").closest("div");
      expect(clearedSeat).toHaveTextContent("空席");

      const saved = JSON.parse(localStorage.getItem("lab-seat-data") || "{}");
      expect(saved.R11?.userId ?? null).toBeNull();
      expect(saved.R11?.status ?? "present").toBe("present");
      // Reset window key should track the previous day when before 6am
      expect(localStorage.getItem("lab-last-reset-date")).toBe("2024-01-02");

      vi.useRealTimers();
    }
  );

  it("tracks weekly stay duration and shows it in selection", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T09:00:00"));
    render(<App />);

    fireEvent.click(screen.getByText("R11"));
    const memberButton = screen.getByRole("button", { name: /Yamada/ });
    fireEvent.click(memberButton);

    vi.setSystemTime(new Date("2024-01-08T11:00:00"));

    fireEvent.click(screen.getByText("R11"));
    const leaveButton = screen.getByRole("button", {
      name: "退席する (磁石を外す)",
    });
    fireEvent.click(leaveButton);

    fireEvent.click(screen.getByText("R11"));
    screen.getByRole("button", { name: /Yamada \(2h0m\)/ });

    vi.useRealTimers();
  });

  it(
    "rolls week, closes open session, and reopens with refreshed startedAt",
    { timeout: 10000 },
    async () => {
      vi.useFakeTimers();
      const sunday = new Date("2024-01-07T23:50:00");
      const monday = new Date("2024-01-08T00:05:00");
      vi.setSystemTime(sunday);

      try {
        render(<App />);

        fireEvent.click(screen.getByText("R11"));
        fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));

        // Cross into the next week (Monday) and trigger the interval check.
        vi.setSystemTime(monday);
        act(() => {
          vi.runOnlyPendingTimers();
          vi.advanceTimersByTime(60 * 1000);
          vi.runOnlyPendingTimers();
        });
        await act(async () => {});

        const sessions = JSON.parse(
          localStorage.getItem("lab-stay-sessions") || "[]"
        );
        const rolloverMs = monday.getTime();
        const closed = sessions.find((s: any) => s.end !== null);
        const reopened = sessions.find((s: any) => s.end === null);
        expect(closed?.end).toBeGreaterThan(sunday.getTime());
        expect(reopened?.start).toBeGreaterThanOrEqual(closed?.end || 0);
        expect(reopened?.userId).toBe("u1");

        const savedSeat = JSON.parse(
          localStorage.getItem("lab-seat-data") || "{}"
        );
        expect(savedSeat.R11.userId).toBe("u1");
        expect(savedSeat.R11.startedAt).toBe(reopened?.start);

        expect(screen.getByText("R11").closest("div")).toHaveTextContent(
          "Yamada"
        );
      } finally {
        vi.useRealTimers();
      }
    }
  );

  it("resets all seats manually and closes open sessions", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("R11"));
    await user.click(screen.getByRole("button", { name: /Yamada/ }));

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const beforeReset = Date.now();

    await user.click(screen.getByRole("button", { name: "全席リセット" }));
    confirmSpy.mockRestore();

    await waitFor(() => {
      expect(screen.getByText("R11").closest("div")).toHaveTextContent(
        "空席"
      );
    });

    const savedSeats = JSON.parse(localStorage.getItem("lab-seat-data") || "{}");
    expect(savedSeats.R11.userId).toBeNull();
    expect(savedSeats.R11.status).toBe("present");
    expect(savedSeats.R11.startedAt).toBeNull();

    const sessions = JSON.parse(localStorage.getItem("lab-stay-sessions") || "[]");
    expect(sessions.length).toBeGreaterThan(0);
    const last = sessions[sessions.length - 1];
    expect(last.end).not.toBeNull();
    expect(last.end).toBeGreaterThanOrEqual(beforeReset);
    expect(last.start).toBeLessThan(last.end);
  });

  it("supports drag-and-drop to move a user into an empty seat", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("R11"));
    await user.click(screen.getByRole("button", { name: /Yamada/ }));

    const sourceSeat = screen.getByText("R11").closest("div") as HTMLElement;
    const targetSeat = screen.getByText("R23").closest("div") as HTMLElement;
    const dataTransfer = {
      dropEffect: "none",
      getData: vi.fn(),
      setData: vi.fn(),
      clearData: vi.fn(),
      items: [],
      types: [],
      files: [],
    } as unknown as DataTransfer;

    fireEvent.dragStart(sourceSeat, { dataTransfer });
    fireEvent.dragOver(targetSeat, { dataTransfer });
    fireEvent.drop(targetSeat, { dataTransfer });
    fireEvent.dragEnd(sourceSeat, { dataTransfer });

    await waitFor(() => {
      expect(sourceSeat).toHaveTextContent("空席");
      expect(targetSeat).toHaveTextContent("Yamada");
    });
  });

  it("swaps occupants when dropping onto an occupied seat", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("R11"));
    await user.click(screen.getByRole("button", { name: /Yamada/ }));

    await user.click(screen.getByText("R22"));
    await user.click(screen.getByRole("button", { name: /Tanaka/ }));

    const sourceSeat = screen.getByText("R11").closest("div") as HTMLElement;
    const targetSeat = screen.getByText("R22").closest("div") as HTMLElement;
    const dataTransfer = {
      dropEffect: "none",
      getData: vi.fn(),
      setData: vi.fn(),
      clearData: vi.fn(),
      items: [],
      types: [],
      files: [],
    } as unknown as DataTransfer;

    fireEvent.dragStart(sourceSeat, { dataTransfer });
    fireEvent.dragOver(targetSeat, { dataTransfer });
    fireEvent.drop(targetSeat, { dataTransfer });
    fireEvent.dragEnd(sourceSeat, { dataTransfer });

    await waitFor(() => {
      expect(sourceSeat).toHaveTextContent("Tanaka");
      expect(targetSeat).toHaveTextContent("Yamada");
    });
  });

  it("exports current data and imports it back with changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("R11"));
    await user.click(screen.getByRole("button", { name: /Yamada/ }));

    await user.click(screen.getByRole("button", { name: "⚙ メンバー管理" }));

    const exportArea = (await screen.findByLabelText(
      "export-data"
    )) as HTMLTextAreaElement;
    const exported = JSON.parse(exportArea.value);
    expect(exported.seatStates.R11.userId).toBe("u1");

    const modified = {
      ...exported,
      seatStates: {
        ...exported.seatStates,
        R11: { userId: null, status: "present", startedAt: null },
        R23: { userId: "u1", status: "present", startedAt: null },
      },
    };

    const importArea = (await screen.findByLabelText(
      "import-data"
    )) as HTMLTextAreaElement;
    fireEvent.change(importArea, {
      target: { value: JSON.stringify(modified) },
    });

    await user.click(screen.getByRole("button", { name: "インポート" }));
    await user.click(screen.getByRole("button", { name: "閉じる" }));

    await waitFor(() => {
      expect(screen.getByText("R23").closest("div")).toHaveTextContent(
        "Yamada"
      );
      expect(screen.getByText("R11").closest("div")).toHaveTextContent("空席");
    });
  });
});
