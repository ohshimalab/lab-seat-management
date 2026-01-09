import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { TrainTime } from "../data/timetableTypes";

let weekdayTimetable: TrainTime[] = [];
let holidayTimetable: TrainTime[] = [];

const isHolidayMock = vi.fn();

vi.mock("japanese-holidays", () => ({
  default: { isHoliday: isHolidayMock },
}));

vi.mock("../data/weekday.csv?raw", () => ({ default: "weekday-csv" }));
vi.mock("../data/holiday.csv?raw", () => ({ default: "holiday-csv" }));

const parseCSVMock = vi.fn((raw: string) =>
  raw === "weekday-csv" ? weekdayTimetable : holidayTimetable
);

vi.mock("../utils/csvParser", () => ({
  parseCSV: parseCSVMock,
}));

describe("TrainInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2024-05-14T09:50:00+09:00"));
    vi.resetModules();

    weekdayTimetable = [
      { hour: 9, minute: 55, dest: "A" },
      { hour: 10, minute: 0, dest: "B" },
      { hour: 10, minute: 10, dest: "C" },
      { hour: 10, minute: 30, dest: "D" },
    ];

    holidayTimetable = [
      { hour: 10, minute: 5, dest: "H1" },
      { hour: 10, minute: 20, dest: "H2" },
    ];

    isHolidayMock.mockReturnValue(false);
    parseCSVMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("shows the next three weekday trains after applying walk time", async () => {
    const { TrainInfo } = await import("../components/TrainInfo");
    render(<TrainInfo />);

    expect(await screen.findByText("平日ダイヤ")).toBeInTheDocument();

    const destinations = await screen.findAllByText(/行$/);
    expect(destinations.map((node) => node.textContent)).toEqual([
      "B行",
      "C行",
      "D行",
    ]);

    expect(screen.queryByText("A行")).toBeNull();
    expect(screen.getByText("徒歩 10分 考慮済")).toBeInTheDocument();
  });

  it("uses the holiday timetable and shows a closed message when no trains remain", async () => {
    vi.setSystemTime(new Date("2024-05-18T22:55:00+09:00"));
    holidayTimetable = [
      { hour: 22, minute: 0, dest: "終電" },
      { hour: 22, minute: 15, dest: "臨時" },
    ];
    isHolidayMock.mockReturnValue(true);

    const { TrainInfo } = await import("../components/TrainInfo");
    render(<TrainInfo />);

    expect(await screen.findByText("土休日ダイヤ")).toBeInTheDocument();
    expect(
      await screen.findByText("本日の電車は終了しました")
    ).toBeInTheDocument();
    expect(screen.queryByText("終電行")).toBeNull();
  });
});
