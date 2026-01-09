import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
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
    const memberButton = await screen.findByRole("button", { name: "Yamada" });
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
});
