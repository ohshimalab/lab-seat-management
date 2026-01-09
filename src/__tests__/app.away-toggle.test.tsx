import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("seat management - away toggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles a seated user between present and away, closing the modal each time", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Seat someone in R11
    await user.click(screen.getByText("R11"));
    const memberButton = await screen.findByRole("button", { name: "Yamada" });
    await user.click(memberButton);

    // Open modal, set away
    await user.click(screen.getByText("R11"));
    const awayButton = await screen.findByRole("button", {
      name: "離席中にする",
    });
    await user.click(awayButton);

    // Modal should close
    expect(screen.queryByRole("button", { name: "離席中にする" })).toBeNull();
    // Seat shows away badge
    const seat = screen.getByText("R11").closest("div");
    expect(seat).toHaveTextContent("離席中");

    // State persisted as away
    const savedAfterAway = JSON.parse(
      localStorage.getItem("lab-seat-data") || "{}"
    );
    expect(savedAfterAway.R11?.status).toBe("away");

    // Open modal again, return to present
    await user.click(screen.getByText("R11"));
    const backButton = await screen.findByRole("button", {
      name: "着席に戻す",
    });
    await user.click(backButton);

    expect(screen.queryByRole("button", { name: "着席に戻す" })).toBeNull();
    const seatAfterReturn = screen.getByText("R11").closest("div");
    expect(seatAfterReturn).not.toHaveTextContent("離席中");

    const savedAfterReturn = JSON.parse(
      localStorage.getItem("lab-seat-data") || "{}"
    );
    expect(savedAfterReturn.R11?.status).toBe("present");
  });
});
