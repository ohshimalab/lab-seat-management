import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useCleaningDuty,
  getMondayOfWeek,
  loadCleaningDutyConfig,
  saveCleaningDutyConfig,
} from "../hooks/useCleaningDuty";
import App from "../App";

describe("useCleaningDuty hook & Cleaning Duty System", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("calculates Monday of any given week correctly", () => {
    // 2026-09-28 is a Monday
    const monday = new Date(2026, 8, 28);
    expect(getMondayOfWeek(monday)).toBe("2026-09-28");

    // 2026-09-30 is a Wednesday -> Monday is 2026-09-28
    const wednesday = new Date(2026, 8, 30);
    expect(getMondayOfWeek(wednesday)).toBe("2026-09-28");

    // 2026-10-04 is a Sunday -> Monday is 2026-09-28
    const sunday = new Date(2026, 9, 4);
    expect(getMondayOfWeek(sunday)).toBe("2026-09-28");
  });

  it("rotates duty automatically on a new Monday", () => {
    // Simulate last Monday as 2026-09-21
    const pastMonday = "2026-09-21";
    saveCleaningDutyConfig({
      members: ["大島", "近藤", "佐藤"],
      currentIndex: 0,
      lastRotatedMonday: pastMonday,
      completedWeeks: {},
    });

    const config = loadCleaningDutyConfig();
    expect(config.currentIndex).toBe(0);

    // Call hook which checks current Monday (which is after 2026-09-21)
    let result: ReturnType<typeof useCleaningDuty> | null = null;
    const TestComponent = () => {
      result = useCleaningDuty();
      return null;
    };

    render(<TestComponent />);
    expect(result).not.toBeNull();
    // Advanced from 0 to 1 ("近藤")
    expect(result!.currentIndex).toBe(1);
    expect(result!.thisWeek).toBe("近藤");
  });

  it("completes duty for the week and stops pending prompt", () => {
    let result: ReturnType<typeof useCleaningDuty> | null = null;
    const TestComponent = () => {
      result = useCleaningDuty();
      return null;
    };

    render(<TestComponent />);
    expect(result).not.toBeNull();

    const currentDutyUser = result!.thisWeek!;
    expect(result!.isUserDutyPending(currentDutyUser)).toBe(true);

    // Complete duty
    act(() => {
      result!.completeThisWeek();
    });

    expect(result!.isCompletedThisWeek).toBe(true);
    // After completion, duty is no longer pending
    expect(result!.isUserDutyPending(currentDutyUser)).toBe(false);

    // Reset completion
    act(() => {
      result!.resetThisWeekCompletion();
    });
    expect(result!.isCompletedThisWeek).toBe(false);
    expect(result!.isUserDutyPending(currentDutyUser)).toBe(true);
  });

  it("allows manual reassignment of duty user and member reordering", () => {
    let result: ReturnType<typeof useCleaningDuty> | null = null;
    const TestComponent = () => {
      result = useCleaningDuty();
      return null;
    };

    render(<TestComponent />);
    expect(result).not.toBeNull();

    // Change to index 2
    act(() => {
      result!.setCurrentIndex(2);
    });
    expect(result!.currentIndex).toBe(2);

    // Next duty
    act(() => {
      result!.nextDuty();
    });
    expect(result!.currentIndex).toBe(3);

    // Prev duty
    act(() => {
      result!.prevDuty();
    });
    expect(result!.currentIndex).toBe(2);

    // Add member
    act(() => {
      result!.addMember("新メンバー");
    });
    expect(result!.members.includes("新メンバー")).toBe(true);
  });

  it("displays duty between train and today info, hides completion status on surface, prompts only when pending", async () => {
    const user = userEvent.setup();

    // Pre-configure duty user as "Yamada"
    saveCleaningDutyConfig({
      members: ["Yamada", "Tanaka"],
      currentIndex: 0,
      lastRotatedMonday: getMondayOfWeek(),
      completedWeeks: {},
    });

    render(<App />);

    // Check bar is visible with duty user Yamada
    expect(screen.getByText("今週の掃除当番:")).toBeInTheDocument();
    expect(screen.getByText("Yamada")).toBeInTheDocument();

    // "未完了" is NOT displayed on the surface!
    expect(screen.queryByText("未完了")).not.toBeInTheDocument();
    expect(screen.queryByText("✓ 今週の掃除完了")).not.toBeInTheDocument();

    // Click R11 seat to open user selection
    await user.click(screen.getByText("R11"));

    // Select "Yamada" to sit down
    const yamadaButton = screen.getByRole("button", { name: /Yamada/ });
    await user.click(yamadaButton);

    // Notification prompt appears: "今週の掃除当番です。掃除は完了しましたか？"
    expect(
      screen.getByText(/今週の掃除当番です。掃除は完了しましたか？/)
    ).toBeInTheDocument();

    // Click "まだ" -> closes prompt without completing
    const madaButton = screen.getByRole("button", { name: "まだ" });
    await user.click(madaButton);
    expect(
      screen.queryByText(/今週の掃除当番です。掃除は完了しましたか？/)
    ).not.toBeInTheDocument();

    // Click R11 again and leave seat
    await user.click(screen.getByText("R11"));
    const leaveButton = await screen.findByRole("button", {
      name: "退席する (磁石を外す)",
    });
    await user.click(leaveButton);

    // Prompt appears again on leave!
    expect(
      screen.getByText(/今週の掃除当番です。掃除は完了しましたか？/)
    ).toBeInTheDocument();

    // Click "完了した"
    const completeButton = screen.getByRole("button", { name: /完了した/ });
    await user.click(completeButton);

    // Toast appears confirming completion
    expect(
      screen.getByText(/今週の掃除当番を完了として記録しました/)
    ).toBeInTheDocument();

    // Now sit Yamada again in R11 -> no prompt since already completed
    await user.click(screen.getByText("R11"));
    const yamadaButtonAgain = screen.getByRole("button", { name: /Yamada/ });
    await user.click(yamadaButtonAgain);
    expect(
      screen.queryByText(/今週の掃除当番です。掃除は完了しましたか？/)
    ).not.toBeInTheDocument();
  });
});
