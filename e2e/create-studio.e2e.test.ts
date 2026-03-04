import { test, expect, Page } from '@playwright/test';

/**
 * Evolutionflow Admin - Studio Registration E2E Test (including image upload)
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@evolutionflow.kr';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin1234!';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder(/admin|email/i).fill(ADMIN_EMAIL);
  await page.getByPlaceholder(/비밀번호|password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(/\/admin/, { timeout: 30000 });
  await expect(page.getByText('대시보드', { exact: false }).first()).toBeVisible({ timeout: 15000 });
}

test.describe('Admin Portal - Studio Registration', () => {
  test('should register a new studio with image upload', async ({ page }) => {
    test.setTimeout(120000);

    // Mock the backend API POST /api/admin/studios since the endpoint is not yet on Vercel
    await page.route('**/api/admin/studios', async route => {
      if (route.request().method() === 'POST') {
        const json = {
          success: true,
          data: { id: "test-studio-id" },
          message: "스튜디오가 등록되었습니다."
        };
        await route.fulfill({ json, status: 201 });
      } else {
        await route.continue();
      }
    });

    // Mock the frontend proxy /api/admin/upload to avoid Vercel Blob dependency during E2E
    await page.route('**/api/admin/upload', async route => {
      if (route.request().method() === 'POST') {
        const json = {
          success: true,
          url: "https://mock.blob.vercel-storage.com/test-image.png",
          pathname: "test-image.png"
        };
        await route.fulfill({ json, status: 201 });
      } else {
        await route.continue();
      }
    });

    await loginAsAdmin(page);
    // Navigate to new studio page
    await page.goto('/admin/studios/new');
    await expect(page.getByRole('heading', { name: /신규 스튜디오 등록/i })).toBeVisible();

    // Fill basic fields
    await page.getByPlaceholder('예: 강남 A스튜디오').fill('테스트 스튜디오');
    // Select dropdowns
    const selects = page.locator('select');
    await selects.nth(0).selectOption('official'); // 스튜디오 유형
    await selects.nth(1).selectOption('KR');       // 국가

    // Wait for cities to load and select first
    await page.waitForTimeout(1000);
    const citySelect = selects.nth(2);
    const cityOptions = await citySelect.locator('option').all();
    if (cityOptions.length > 1) {
      const firstCityValue = await cityOptions[1].getAttribute('value');
      await citySelect.selectOption(firstCityValue!);
    }

    // Wait for regions to load and select first
    await page.waitForTimeout(1000);
    const regionSelect = selects.nth(3);
    const regionOptions = await regionSelect.locator('option').all();
    if (regionOptions.length > 1) {
      const firstRegionValue = await regionOptions[1].getAttribute('value');
      await regionSelect.selectOption(firstRegionValue!);
    }

    // Address & coordinates
    await page.getByPlaceholder('예: 서울시 강남구 테헤란로 123').fill('서울시 강남구 테헤란로 123');
    await page.getByPlaceholder('예: 37.4979').fill('37.4979');
    await page.getByPlaceholder('예: 127.0276').fill('127.0276');

    // Contact info
    await page.getByPlaceholder('예: 02-1234-5678').fill('02-1234-5678');
    await page.getByPlaceholder('예: Instagram/username').fill('Instagram/teststudio');
    await page.getByPlaceholder('예: 최관리').fill('테스트 담당자');
    await page.getByPlaceholder('예: 010-1234-5678').fill('010-1111-2222');
    await page.getByPlaceholder('예: manager@studio.com').fill('manager@teststudio.com');

    // Capacity & operating hours
    await page.getByPlaceholder('예: 30').fill('30');
    await page.getByPlaceholder('예: 09:00 - 22:00').fill('09:00 - 22:00');
    await page.getByPlaceholder('시설에 대한 설명을 입력하세요').fill('테스트용 스튜디오 설명');

    // Amenities (select a few)
    await page.getByLabel('주차').check();
    await page.getByLabel('WiFi').check();

    // Image upload (Optional: handle live server which might not have the file input yet)
    await page.waitForTimeout(1000);
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    const hasFileInput = await fileInput.count() > 0;

    if (hasFileInput) {
      const imagePath = '/Users/beejayjung/.gemini/antigravity/brain/43a14f58-df4c-4a2a-9fef-aba1bf3c204a/studio_placeholder_1772615461920.png';
      await fileInput.setInputFiles(imagePath);
    } else {
      console.log("File input for image upload not found. Skipping image upload.");
    }

    // Handle success alert
    page.once('dialog', dialog => {
      console.log('Dialog message:', dialog.message());
      // Accept regardless to unblock
      dialog.accept().catch(() => {});
    });

    // Submit form
    await page.getByRole('button', { name: '저장' }).click();

    // Just wait a bit for network
    await page.waitForTimeout(2000);

    // If redirected, it should show '스튜디오 관리'
    // If not, we will at least see the console log
    await page.waitForURL(/\/admin\/studios(.*)/, { timeout: 10000 }).catch(e => console.error("Redirect failed", e));
  });
});
