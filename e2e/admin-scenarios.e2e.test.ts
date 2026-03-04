import { test, expect, Page } from '@playwright/test';

/**
 * Evolutionflow Admin E2E Tests
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@evolutionflow.kr';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin1234!';

// Helper function to login and handle the state
async function loginAsAdmin(page: Page) {
  console.log(`Attempting login with: ${ADMIN_EMAIL}`);
  // 1. Go to login page
  await page.goto('/login');

  // 2. Fill login form
  const emailInput = page.getByPlaceholder(/admin|email/i);
  await emailInput.fill(ADMIN_EMAIL);

  const passwordInput = page.getByPlaceholder(/비밀번호|password/i);
  await passwordInput.fill(ADMIN_PASSWORD);

  // 3. Click login button
  await page.getByRole('button', { name: '로그인' }).click();

  // 4. Wait for /admin URL to be active
  await page.waitForURL(/\/admin/, { timeout: 30000 });

  // 5. Verify we are on the dashboard
  await expect(page.getByText('대시보드', { exact: false }).first()).toBeVisible({ timeout: 15000 });
}

test.describe('Admin Portal - Authentication', () => {
  test('should redirect to login when accessing admin pages without auth', async ({ page }) => {
    await page.goto('/admin/requests');
    await expect(page.getByText('Manager Login')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Portal - Request Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/requests');
    await expect(page.locator('h1:has-text("신청 관리")')).toBeVisible({ timeout: 15000 });
  });

  test('should filter requests by status', async ({ page }) => {
    const pendingButton = page.getByRole('button', { name: '심사중' });
    await pendingButton.click();
    await expect(pendingButton).toHaveClass(/bg-black/);
  });

  test('should search requests by name or email', async ({ page }) => {
    const searchInput = page.getByPlaceholder('이름, 이메일, 제목 등으로 검색...');
    await searchInput.fill('Tester');
    // Check for search result summary text
    await expect(page.getByText('검색 결과:')).toBeVisible({ timeout: 5000 });
  });

  test('should switch between request tabs (Teacher, Workshop, Trip&Event)', async ({ page }) => {
    const workshopTab = page.getByRole('button', { name: '워크샵 신청' });
    await workshopTab.click();
    await expect(workshopTab).toHaveClass(/border-black/);

    const tripTab = page.getByRole('button', { name: '트립&이벤트 신청' });
    await tripTab.click();
    await expect(tripTab).toHaveClass(/border-black/);
  });
});

test.describe('Admin Portal - Member Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/members');
    await expect(page.locator('h1:has-text("회원관리")')).toBeVisible({ timeout: 15000 });
  });

  test('should display member list and search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('이름, 이메일로 검색...');
    // Search for the admin itself to ensure a result exists
    await searchInput.fill(ADMIN_EMAIL);
    await page.waitForTimeout(2000); // Wait for debounce and fetch

    // Check if the admin email is visible in the table
    // Using a more general locator to avoid strict matches in complex table structures
    await expect(page.locator('table').getByText(ADMIN_EMAIL)).toBeVisible({ timeout: 10000 });
  });
});
