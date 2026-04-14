import { test, expect } from "@playwright/test";

test.describe("Playlist", () => {
  test("should show entries and toggle honorable mentions", async ({
    page,
  }) => {
    // Add a song with an HM
    await page.goto("/add");
    await page.fill('input[type="date"]', "2026-01-04");
    await page.fill('input[placeholder="What song defined this week?"]', "As It Was");
    await page.fill('input[placeholder="Who made it?"]', "Harry Styles");

    // Add an honorable mention
    await page.click("text=+ Add HM");
    await page.fill('input[placeholder="Song title"]', "Anti-Hero");
    await page.fill('input[placeholder="Artist"]', "Taylor Swift");

    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    // Go to playlist
    await page.goto("/playlist");
    await expect(page.getByText("As It Was")).toBeVisible();

    // HM should be visible by default
    await expect(page.getByText("Anti-Hero")).toBeVisible();

    // Toggle HM off
    await page.getByText("Show honorable mentions").click();
    await expect(page.getByText("Anti-Hero")).not.toBeVisible();

    // Toggle HM back on
    await page.getByText("Show honorable mentions").click();
    await expect(page.getByText("Anti-Hero")).toBeVisible();
  });
});
