import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Parlexa Smoke Tests', () => {
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Parlexa/);
    await expect(page.locator('h1')).toContainText('Discover AI');
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Chat');
    await searchInput.press('Enter');
    // Result grid should be visible or show loading
    await expect(page.locator('.search-system')).toBeVisible();
  });

  test('Public AI Finder wizard loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai-finder`);
    await expect(page.locator('h2')).toContainText('Which industry');
  });

  test('Login page accessibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Sign In' })).toBeVisible();
  });

});
