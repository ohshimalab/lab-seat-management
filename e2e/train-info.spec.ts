import { test, expect, Page } from "@playwright/test";

const freezeDate = async (page: Page, isoString: string) => {
  await page.addInitScript(
    ({ now }) => {
      const fixed = new Date(now).getTime();
      const RealDate = Date;
      class MockDate extends RealDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(fixed);
            return;
          }
          // @ts-ignore
          super(...args);
        }
        static now() {
          return fixed;
        }
      }
      Object.setPrototypeOf(MockDate, RealDate);
      // @ts-ignore
      globalThis.Date = MockDate;
    },
    { now: isoString }
  );
};

test.describe("train info", () => {
  test("shows weekday departures after walk buffer", async ({ page }) => {
    await freezeDate(page, "2024-05-14T09:50:00+09:00");
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByText("平日ダイヤ")).toBeVisible();
    await expect(page.getByText("徒歩 10分 考慮済")).toBeVisible();

    const times = await page
      .locator("div.bg-gray-800", { hasText: "学園都市発" })
      .first()
      .locator(
        "div.flex.items-center.justify-between div.text-2xl.font-mono.font-bold"
      )
      .allTextContents();

    expect(times).toEqual(["10:05", "10:14", "10:21"]);
  });

  test("shows holiday departures after walk buffer", async ({ page }) => {
    await freezeDate(page, "2024-05-18T21:50:00+09:00");
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByText("土休日ダイヤ")).toBeVisible();

    const times = await page
      .locator("div.bg-gray-800", { hasText: "学園都市発" })
      .first()
      .locator(
        "div.flex.items-center.justify-between div.text-2xl.font-mono.font-bold"
      )
      .allTextContents();

    expect(times).toEqual(["22:01", "22:09", "22:16"]);
  });
});
