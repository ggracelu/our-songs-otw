import { test, expect } from "@playwright/test";

test.describe("Stats", () => {
  test("should show correct stats after adding songs", async ({
    page,
  }) => {
    // Add first song
    await page.goto("/add");
    await page.fill('input[type="date"]', "2026-01-04");
    await page.fill('input[placeholder="What song defined this week?"]', "Song A");
    await page.fill('input[placeholder="Who made it?"]', "Artist X");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    // Add second song
    await page.goto("/add");
    await page.fill('input[type="date"]', "2026-01-11");
    await page.fill('input[placeholder="What song defined this week?"]', "Song B");
    await page.fill('input[placeholder="Who made it?"]', "Artist X");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    // Add third song
    await page.goto("/add");
    await page.fill('input[type="date"]', "2026-01-18");
    await page.fill('input[placeholder="What song defined this week?"]', "Song C");
    await page.fill('input[placeholder="Who made it?"]', "Artist Y");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    // Go to stats
    await page.goto("/stats");

    // Check stats are shown
    await expect(page.getByText("Songs Picked")).toBeVisible();
    await expect(page.getByText("Complete")).toBeVisible();

    // Check top artist
    await expect(page.getByText("Most Featured Artist")).toBeVisible();
    await expect(page.getByText("Artist X").first()).toBeVisible();
  });
});
