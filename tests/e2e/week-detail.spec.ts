import { test, expect } from "@playwright/test";

test.describe("Week Detail", () => {
  test("should show entry details on week page", async ({ page }) => {
    // First add a song
    await page.goto("/add");
    await page.fill('input[type="date"]', "2026-01-04");
    await page.fill('input[placeholder="What song defined this week?"]', "Levitating");
    await page.fill('input[placeholder="Who made it?"]', "Dua Lipa");
    await page.fill(
      'textarea[placeholder="Why this song? What was the vibe?"]',
      "Perfect dance vibes"
    );
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    // Navigate to the week detail (Jan 4 2026 = week 2)
    await page.goto("/week/2");

    // Should show song details
    await expect(page.getByText("Levitating")).toBeVisible();
    await expect(page.getByText("Dua Lipa")).toBeVisible();
    await expect(page.getByText("Perfect dance vibes")).toBeVisible();
    await expect(page.getByText("Week 2")).toBeVisible();
  });

  test("should show empty state for week without entry", async ({
    page,
  }) => {
    await page.goto("/week/50");
    await expect(page.getByText(/Week 50/)).toBeVisible();
    await expect(page.getByText("Add a Song")).toBeVisible();
  });
});
