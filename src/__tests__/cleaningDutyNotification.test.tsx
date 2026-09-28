import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useCleaningDuty,
  LS_CLEANING_CONFIG,
  LS_MANUAL_DUTY,
  getWeekKey,
} from "../hooks/useCleaningDuty";
import App from "../App";

describe("useCleaningDuty hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with empty list when localStorage is empty", () => {
    const { result } = renderHook(() => useCleaningDuty());
    expect(result.current.members).toEqual([]);
    expect(result.current.thisWeek).toBeNull();
    expect(result.current.nextWeek).toBeNull();
    expect(result.current.currentIndex).toBe(0);
  });

  it("adds, moves, and removes members correctly", () => {
    const { result } = renderHook(() => useCleaningDuty());

    act(() => {
      result.current.addMember("Tanaka");
      result.current.addMember("Suzuki");
      result.current.addMember("Sato");
    });

    expect(result.current.members).toEqual(["Tanaka", "Suzuki", "Sato"]);
    expect(result.current.thisWeek).toBe("Tanaka");
    expect(result.current.nextWeek).toBe("Suzuki");

    // Move Suzuki before Tanaka
    act(() => {
      result.current.moveMember(1, 0);
    });
    expect(result.current.members).toEqual(["Suzuki", "Tanaka", "Sato"]);

    // Move to next duty
    act(() => {
      result.current.nextDuty();
    });
    expect(result.current.thisWeek).toBe("Sato");

    // Remove member
    act(() => {
      result.current.removeMember(0);
    });
    expect(result.current.members).toEqual(["Tanaka", "Sato"]);
  });

  it("identifies cleaning duty users properly", () => {
    localStorage.setItem(
      LS_CLEANING_CONFIG,
      JSON.stringify({
        members: ["Yamada", "Tanaka"],
        currentIndex: 0,
        lastRotatedWeek: getWeekKey(),
      })
    );

    const { result } = renderHook(() => useCleaningDuty());
    expect(result.current.isCleaningDutyUser("Yamada")).toBe(true);
    expect(result.current.isCleaningDutyUser("yamada")).toBe(true);
    expect(result.current.isCleaningDutyUser("Tanaka")).toBe(false);
  });

  it("handles manual override of this week's duty", () => {
    localStorage.setItem(
      LS_CLEANING_CONFIG,
      JSON.stringify({
        members: ["Yamada", "Tanaka"],
        currentIndex: 0,
        lastRotatedWeek: getWeekKey(),
      })
    );

    const { result } = renderHook(() => useCleaningDuty());
    expect(result.current.thisWeek).toBe("Yamada");

    act(() => {
      result.current.setManualThisWeek("Tanaka");
    });

    expect(result.current.thisWeek).toBe("Tanaka");
    expect(result.current.isCleaningDutyUser("Tanaka")).toBe(true);
  });
});

