import { render, screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const seatYamada = async () => {
  fireEvent.click(screen.getByText("R11"));
  fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));
};

const seatTanaka = async (seatLabel = "R12") => {
  fireEvent.click(screen.getByText(seatLabel));
  fireEvent.click(screen.getByRole("button", { name: /Tanaka/ }));
};

describe("weekly greeting popup", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T09:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(
    "shows on first seat of the week and auto-hides",
    { timeout: 10000 },
    async () => {
      render(<App />);

      await seatYamada();

      expect(screen.getByText("今週も頑張りましょう！")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(screen.queryByText("今週も頑張りましょう！")).toBeNull();
    }
  );

  it(
    "does not repeat within the same week for the same user",
    { timeout: 10000 },
    async () => {
      render(<App />);

      await seatYamada();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      fireEvent.click(screen.getByText("R11"));
      fireEvent.click(
        screen.getByRole("button", { name: "退席する (磁石を外す)" })
      );

      expect(screen.getByText("R11").closest("div")).toHaveTextContent("空席");

      await seatYamada();

      expect(screen.queryByText("今週も頑張りましょう！")).toBeNull();
    }
  );
});

describe("first arrival popup", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-10T09:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("congratulates the first arrival of the day and auto-hides", () => {
    render(<App />);

    seatYamada();

    expect(screen.getByText(/一番乗り/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText(/一番乗り/)).toBeNull();
  });

  it("does not repeat for the second seated person on the same day", () => {
    render(<App />);

    seatYamada();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    seatTanaka();

    expect(screen.queryByText(/一番乗り/)).toBeNull();
  });
});

describe("weekend farewell popup", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows when leaving on Friday and auto-hides", () => {
    vi.setSystemTime(new Date("2024-01-12T18:00:00")); // Friday
    render(<App />);

    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));

    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(
      screen.getByRole("button", { name: "退席する (磁石を外す)" })
    );

    expect(screen.getByText("今週もお疲れ様でした")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("今週もお疲れ様でした")).toBeNull();
  });

  it("does not show when leaving on a weekday (Monday)", () => {
    vi.setSystemTime(new Date("2024-01-08T18:00:00")); // Monday
    render(<App />);

    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));

    fireEvent.click(screen.getByText("R11"));
    fireEvent.click(
      screen.getByRole("button", { name: "退席する (磁石を外す)" })
    );

    expect(screen.queryByText("今週もお疲れ様でした")).toBeNull();
  });
});
