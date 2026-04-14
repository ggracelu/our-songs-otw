import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate between all main pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();

    // Home page
    await expect(page.locator("h1")).toContainText("Songs of the Week");

    // Navigate to Add Song
    await page.click('nav a[href="/add"]');
    await expect(page).toHaveURL("/add");
    await expect(page.locator("h1")).toContainText("Add a Song");

    // Navigate to Playlist
    await page.click('nav a[href="/playlist"]');
    await expect(page).toHaveURL("/playlist");
    await expect(page.locator("h1")).toContainText("Playlist");

    // Navigate to Gallery
    await page.click('nav a[href="/gallery"]');
    await expect(page).toHaveURL("/gallery");
    await expect(page.locator("h1")).toContainText("Past Playlists");

    // Navigate to Stats
    await page.click('nav a[href="/stats"]');
    await expect(page).toHaveURL("/stats");
    await expect(page.locator("h1")).toContainText("Stats");

    // Navigate back Home
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL("/");
  });

  test("navbar shows Songs OTW brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toContainText("Songs OTW");
  });
});
