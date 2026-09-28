import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { TodayInfo } from "../components/TodayInfo";
import {
  getAnniversariesForDate,
  formatDateKey,
  saveCustomAnniversary,
  getCustomAnniversaries,
  deleteCustomAnniversary,
} from "../data/todayEvents";

describe("TodayInfo & todayEvents", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns known anniversaries for specific dates", () => {
    const pcDay = new Date(2026, 8, 28); // Sep 28
    const events = getAnniversariesForDate(pcDay);
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((e) => e.title.includes("パソコン記念日"))).toBe(true);
  });

  it("returns empty array when no fixed anniversary is configured", () => {
    const obscureDay = new Date(2026, 5, 23); // June 23
    const events = getAnniversariesForDate(obscureDay);
    expect(events.length).toBe(0);
  });

  it("saves and deletes custom lab anniversaries", () => {
    const key = "09-28";
    saveCustomAnniversary(key, {
      title: "大島研新歓BBQ記念日",
      category: "lab",
      description: "美味しいお肉を食べた記念の日",
      emoji: "🍖",
    });

    const list = getCustomAnniversaries();
    expect(list[key]).toBeDefined();
    expect(list[key][0].title).toBe("大島研新歓BBQ記念日");

    deleteCustomAnniversary(key, list[key][0].id);
    const afterDelete = getCustomAnniversaries();
    expect(afterDelete[key].length).toBe(0);
  });

  it("renders TodayInfo UI and navigates dates", () => {
    render(<TodayInfo />);

    // Header title check
    expect(screen.getByText("今日は何の日？")).toBeInTheDocument();

    // Navigation buttons exist
    const prevBtn = screen.getByRole("button", { name: "◀" });
    const nextBtn = screen.getByRole("button", { name: "▶" });
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    // Clicking next day changes date display
    fireEvent.click(nextBtn);
    expect(screen.getByRole("button", { name: "今日" })).toBeInTheDocument();

    // Click reset to today
    fireEvent.click(screen.getByRole("button", { name: "今日" }));
  });

  it("opens modal and allows adding a custom anniversary", () => {
    render(<TodayInfo />);

    const openModalBtn = screen.getByRole("button", { name: /\+ 記念日/i });
    fireEvent.click(openModalBtn);

    expect(screen.getByText(/の記念日を追加/)).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/先輩の誕生日/);
    fireEvent.change(titleInput, { target: { value: "マイルストーン達成記念" } });

    const submitBtn = screen.getByRole("button", { name: "保存する" });
    fireEvent.click(submitBtn);

    expect(screen.getByText("マイルストーン達成記念")).toBeInTheDocument();
  });
});
