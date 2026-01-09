import { test, expect } from "@playwright/test";

test.describe("seat management E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("seat, mark away, return, and leave persists", async ({ page }) => {
    // Seat Yamada at R11
    await page.getByText("R11").click();
    await page.getByRole("button", { name: "Yamada" }).click();

    const seat = page.locator("div").filter({ hasText: "R11" }).first();
    await expect(seat).toContainText("Yamada");

    // Mark away
    await page.getByText("R11").click();
    await page.getByRole("button", { name: "離席中にする" }).click();
    await expect(
      page.getByRole("button", { name: "離席中にする" })
    ).toHaveCount(0);
    await expect(seat).toContainText("離席中");

    // Return to present
    await page.getByText("R11").click();
    await page.getByRole("button", { name: "着席に戻す" }).click();
    await expect(page.getByRole("button", { name: "着席に戻す" })).toHaveCount(
      0
    );
    await expect(seat).not.toContainText("離席中");

    // Leave seat
    await page.getByText("R11").click();
    await page.getByRole("button", { name: "退席する (磁石を外す)" }).click();
    await expect(seat).toContainText("空席");

    // Reload to verify persistence
    await page.reload();
    await expect(seat).toContainText("空席");
  });
});
