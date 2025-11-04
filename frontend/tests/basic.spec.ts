import { test, expect } from "@playwright/test";

test("dashboard renders headline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

