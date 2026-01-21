import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import CleaningDuty from "../components/CleaningDuty";

describe("CleaningDuty", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("fetches A1/A2 and displays names when configured", async () => {
    localStorage.setItem("cleaningDuty.spreadsheetId", "sheet-123");
    localStorage.setItem("cleaningDuty.clientId", "cid-abc");
    localStorage.setItem("cleaningDuty.accessToken", "token-xyz");

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ values: [["田中"], ["鈴木"]] }),
      }),
    );
    global.fetch = mockFetch as unknown as typeof global.fetch;

    render(<CleaningDuty />);

    await waitFor(() => {
      expect(screen.getByText("田中さん")).toBeInTheDocument();
      expect(screen.getByText("鈴木さん")).toBeInTheDocument();
    });

    // ensure fetch called with spreadsheet id and auth header
    expect(mockFetch.mock.calls.length).toBeGreaterThan(0);
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toContain("sheet-123");
    // header check
    const opts = call[1];
    expect(opts.headers.Authorization).toContain("token-xyz");
  });
});
