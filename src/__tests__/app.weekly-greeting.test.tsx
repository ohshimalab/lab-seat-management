import { render, screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const seatYamada = async () => {
  fireEvent.click(screen.getByText("R11"));
  fireEvent.click(screen.getByRole("button", { name: /Yamada/ }));
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
