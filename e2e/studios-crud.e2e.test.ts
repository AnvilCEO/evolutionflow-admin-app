import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Studio CRUD Operations
 *
 * Critical user workflows:
 * 1. Create new studio
 * 2. Edit existing studio
 * 3. Change studio status
 * 4. Delete studio
 * 5. Filter and search studios
 */

test.describe('Studios - List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/studios');
  });

  test('should display studios list page', async ({ page }) => {
    await expect(page).toHaveTitle(/Admin/);
    await expect(page.getByText(/스튜디오 관리/)).toBeVisible();
  });

  test('should show tab navigation', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /공인 스튜디오/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /파트너 스튜디오/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /협력 스튜디오/ })).toBeVisible();
  });

  test('should display studios in table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /스튜디오명/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /위치/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /상태/ })).toBeVisible();
  });

  test('should have create new studio button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /새 스튜디오/ })).toBeVisible();
  });
});

test.describe('Studios - Tab Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/studios');
  });

  test('should filter by official tab', async ({ page }) => {
    await page.getByRole('tab', { name: /공인 스튜디오/ }).click();

    // Wait for URL to update
    await page.waitForURL(/tab=official/);

    // Check that URL contains tab parameter
    expect(page.url()).toContain('tab=official');
  });

  test('should filter by partner tab', async ({ page }) => {
    await page.getByRole('tab', { name: /파트너 스튜디오/ }).click();

    await page.waitForURL(/tab=partner/);
    expect(page.url()).toContain('tab=partner');
  });

  test('should filter by associated tab', async ({ page }) => {
    await page.getByRole('tab', { name: /협력 스튜디오/ }).click();

    await page.waitForURL(/tab=associated/);
    expect(page.url()).toContain('tab=associated');
  });
});

test.describe('Studios - Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/studios');
  });

  test('should search studios by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색/);
    await searchInput.fill('강남');
    await searchInput.press('Enter');

    await page.waitForURL(/search=강남/);
    expect(page.url()).toContain('search=%EA%B0%95%EB%82%A8');
  });

  test('should clear search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색/);
    await searchInput.fill('test');
    await searchInput.press('Enter');

    await page.waitForURL(/search=test/);

    await searchInput.clear();
    await searchInput.press('Enter');

    // URL should not contain search parameter
    expect(page.url()).not.toContain('search=');
  });
});

test.describe('Studios - Create Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/studios');
  });

  test('should navigate to create page', async ({ page }) => {
    await page.getByRole('button', { name: /새 스튜디오/ }).click();

    await expect(page).toHaveURL(/\/admin\/studios\/new/);
    await expect(page.getByText(/스튜디오 등록/)).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.goto('/admin/studios/new');

    await page.getByRole('button', { name: /저장/ }).click();

    await expect(page.getByText(/스튜디오명을 입력해주세요/)).toBeVisible();
  });

  test('should create studio with minimum required fields', async ({ page }) => {
    await page.goto('/admin/studios/new');

    // Fill required fields
    await page.getByLabel(/스튜디오명/).fill('E2E Test Studio');
    await page.getByLabel(/스튜디오 유형/).selectOption('official');
    await page.getByLabel(/국가/).selectOption('KR');

    // Wait for cities to load
    await page.waitForTimeout(500);

    await page.getByLabel(/도시/).selectOption('seoul');

    // Wait for regions to load
    await page.waitForTimeout(500);

    await page.getByLabel(/지역/).selectOption('강남구');
    await page.getByLabel(/주소/).fill('서울시 강남구 테헤란로 123');
    await page.getByLabel(/대표번호/).fill('02-1234-5678');
    await page.getByLabel(/위도/).fill('37.5000');
    await page.getByLabel(/경도/).fill('127.0300');

    // Submit form
    await page.getByRole('button', { name: /저장/ }).click();

    // Should redirect to list or detail page
    await page.waitForURL(/\/admin\/studios/, { timeout: 5000 });

    // Verify studio appears in list
    await expect(page.getByText('E2E Test Studio')).toBeVisible();
  });

  test('should create studio with all fields', async ({ page }) => {
    await page.goto('/admin/studios/new');

    // Fill all fields
    await page.getByLabel(/스튜디오명/).fill('Complete Test Studio');
    await page.getByLabel(/스튜디오 유형/).selectOption('partner');
    await page.getByLabel(/국가/).selectOption('KR');

    await page.waitForTimeout(500);
    await page.getByLabel(/도시/).selectOption('seoul');

    await page.waitForTimeout(500);
    await page.getByLabel(/지역/).selectOption('강남구');

    await page.getByLabel(/주소/).fill('서울시 강남구 테헤란로 456');
    await page.getByLabel(/대표번호/).fill('02-9876-5432');
    await page.getByLabel(/SNS/).fill('Instagram/test');

    await page.getByLabel(/담당자명/).fill('김담당');
    await page.getByLabel(/담당자 전화/).fill('010-1234-5678');
    await page.getByLabel(/담당자 이메일/).fill('manager@test.com');

    await page.getByLabel(/수용 인원/).fill('50');
    await page.getByLabel(/운영 시간/).fill('09:00 - 22:00');
    await page.getByLabel(/시설 설명/).fill('테스트 시설 설명');

    // Select amenities
    await page.getByLabel('주차').check();
    await page.getByLabel('WiFi').check();
    await page.getByLabel('카페').check();

    await page.getByLabel(/위도/).fill('37.5000');
    await page.getByLabel(/경도/).fill('127.0300');

    await page.getByRole('button', { name: /저장/ }).click();

    await page.waitForURL(/\/admin\/studios/, { timeout: 5000 });
    await expect(page.getByText('Complete Test Studio')).toBeVisible();
  });

  test('should cancel create and return to list', async ({ page }) => {
    await page.goto('/admin/studios/new');

    await page.getByLabel(/스튜디오명/).fill('Will Cancel');

    await page.getByRole('button', { name: /취소/ }).click();

    await expect(page).toHaveURL(/\/admin\/studios$/);
    await expect(page.getByText('Will Cancel')).not.toBeVisible();
  });
});

test.describe('Studios - Address Auto-Extraction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/studios/new');
  });

  test('should auto-extract city and region from address', async ({ page }) => {
    await page.getByLabel(/주소/).fill('서울시 강남구 테헤란로 123');

    await page.getByRole('button', { name: /자동추출/ }).click();

    // Wait for extraction to complete
    await page.waitForTimeout(1000);

    // Check if city and region were populated
    const citySelect = page.getByLabel(/도시/);

    // Values should be populated (exact values depend on API response)
    await expect(citySelect).not.toHaveValue('');
  });
});

test.describe('Studios - Edit Studio', () => {
  test('should load studio details in edit mode', async ({ page }) => {
    await page.goto('/admin/studios');

    // Click first studio in list (assumes at least one exists)
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await page.waitForURL(/\/admin\/studios\/s\d+/);

    // Form should be populated with data
    const nameInput = page.getByLabel(/스튜디오명/);
    await expect(nameInput).not.toHaveValue('');
  });

  test('should update studio name', async ({ page }) => {
    await page.goto('/admin/studios');

    const firstRow = page.locator('tbody tr').first();
    const originalName = await firstRow.locator('td').nth(1).textContent();
    await firstRow.click();

    await page.waitForURL(/\/admin\/studios\/s\d+/);

    const nameInput = page.getByLabel(/스튜디오명/);
    await nameInput.clear();
    await nameInput.fill(`${originalName} - Updated`);

    await page.getByRole('button', { name: /저장/ }).click();

    await page.waitForURL(/\/admin\/studios/, { timeout: 5000 });

    await expect(page.getByText(`${originalName} - Updated`)).toBeVisible();
  });

  test('should show additional metadata fields in edit mode', async ({ page }) => {
    await page.goto('/admin/studios');

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await page.waitForURL(/\/admin\/studios\/s\d+/);

    // These fields should only appear in edit mode
    await expect(page.getByText(/등록일/)).toBeVisible();
    await expect(page.getByText(/등록자/)).toBeVisible();
    await expect(page.getByText(/수정일/)).toBeVisible();
  });
});

test.describe('Studios - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/studios');
  });

  test('should navigate to next page', async ({ page }) => {
    // Check if next page button exists (only if there are multiple pages)
    const nextButton = page.getByRole('button', { name: /다음/ });

    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForURL(/page=2/);
      expect(page.url()).toContain('page=2');
    }
  });

  test('should navigate to previous page', async ({ page }) => {
    // Go to page 2 first
    await page.goto('/admin/studios?page=2');

    const prevButton = page.getByRole('button', { name: /이전/ });

    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForURL(/page=1/);
      expect(page.url()).toContain('page=1');
    }
  });

  test('should change page size', async ({ page }) => {
    const pageSizeSelect = page.getByLabel(/페이지 크기/);

    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.selectOption('20');
      await page.waitForURL(/pageSize=20/);
      expect(page.url()).toContain('pageSize=20');
    }
  });
});

test.describe('Studios - Responsive Design', () => {
  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/admin/studios');

    await expect(page.getByText(/스튜디오 관리/)).toBeVisible();
  });

  test('should display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/admin/studios');

    await expect(page.getByText(/스튜디오 관리/)).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto('/admin/studios');

    await expect(page.getByText(/스튜디오 관리/)).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});

test.describe('Studios - Error Handling', () => {
  test('should show error message on network failure', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    await page.goto('/admin/studios/new');

    await page.getByLabel(/스튜디오명/).fill('Test');
    await page.getByLabel(/대표번호/).fill('02-1234-5678');
    await page.getByLabel(/주소/).fill('Test Address');
    await page.getByLabel(/위도/).fill('37.5');
    await page.getByLabel(/경도/).fill('127.0');

    await page.getByRole('button', { name: /저장/ }).click();

    // Should show error message
    await expect(page.getByText(/실패|오류|error/i)).toBeVisible();

    // Restore online mode
    await context.setOffline(false);
  });

  test('should handle invalid studio ID gracefully', async ({ page }) => {
    await page.goto('/admin/studios/invalid-id-999');

    // Should show error or redirect
    await expect(
      page.getByText(/찾을 수 없습니다|Not Found/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
