import { test, expect } from "@playwright/test";

test.describe("Add Song", () => {
  test("should add a song via the form and see it on home", async ({
    page,
  }) => {
    await page.goto("/add");

    // Fill the form — 2026-01-04 is a Sunday
    await page.fill('input[type="date"]', "2026-01-04");
    await page.fill('input[placeholder="What song defined this week?"]', "Blinding Lights");
    await page.fill('input[placeholder="Who made it?"]', "The Weeknd");
    await page.fill(
      'textarea[placeholder="Why this song? What was the vibe?"]',
      "Great start to the year"
    );

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to home
    await page.waitForURL("/", { timeout: 10000 });

    // The entry should appear
    await expect(page.getByText("Blinding Lights")).toBeVisible();
    await expect(page.getByText("The Weeknd")).toBeVisible();
  });

  test("should show error for non-Sunday date", async ({ page }) => {
    await page.goto("/add");

    await page.fill('input[type="date"]', "2026-01-05"); // Monday
    await page.fill('input[placeholder="What song defined this week?"]', "Test Song");
    await page.fill('input[placeholder="Who made it?"]', "Test Artist");

    await page.click('button[type="submit"]');

    // Should show Sunday error and stay on page
    await expect(page.getByText("that's the ritual")).toBeVisible();
    await expect(page).toHaveURL(/\/add/);
  });
});
