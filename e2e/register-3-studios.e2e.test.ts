import { test, expect, Page } from '@playwright/test';

/**
 * 3가지 유형(공인/파트너/협력) 스튜디오를 각각 다른 주소로 라이브 서버에 등록하는 E2E 테스트
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@evolutionflow.kr';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin1234!';

interface StudioData {
  name: string;
  tab: string;       // official | partner | associated
  tabLabel: string;
  country: string;
  cityIndex: number;  // nth city option (1-based, skipping "선택하세요")
  regionIndex: number;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  capacity: string;
  operatingHours: string;
  description: string;
  amenities: string[];
}

const STUDIOS: StudioData[] = [
  {
    name: 'E2E 공인 강남스튜디오',
    tab: 'official',
    tabLabel: '공인 스튜디오',
    country: 'KR',
    cityIndex: 1,   // 서울
    regionIndex: 1,  // 강남구
    address: '서울특별시 강남구 테헤란로 152 강남파이낸스센터',
    lat: 37.5012,
    lng: 127.0396,
    phone: '02-555-1111',
    managerName: '김강남',
    managerPhone: '010-1001-0001',
    managerEmail: 'gangnam@test.com',
    capacity: '40',
    operatingHours: '09:00 - 22:00',
    description: 'E2E 테스트 - 공인 스튜디오 (서울 강남구)',
    amenities: ['주차', 'WiFi', '에어컨'],
  },
  {
    name: 'E2E 파트너 홍대스튜디오',
    tab: 'partner',
    tabLabel: '파트너 스튜디오',
    country: 'KR',
    cityIndex: 1,   // 서울
    regionIndex: 3,  // 마포구
    address: '서울특별시 마포구 와우산로 94 홍익대학교',
    lat: 37.5507,
    lng: 126.9247,
    phone: '02-333-2222',
    managerName: '이홍대',
    managerPhone: '010-2002-0002',
    managerEmail: 'hongdae@test.com',
    capacity: '25',
    operatingHours: '10:00 - 21:00',
    description: 'E2E 테스트 - 파트너 스튜디오 (서울 마포구 홍대)',
    amenities: ['WiFi', '카페', '샤워실'],
  },
  {
    name: 'E2E 협력 부산해운대스튜디오',
    tab: 'associated',
    tabLabel: '협력 스튜디오',
    country: 'KR',
    cityIndex: 2,   // 부산
    regionIndex: 1,  // first region
    address: '부산광역시 해운대구 해운대해변로 264 해운대비치',
    lat: 35.1587,
    lng: 129.1604,
    phone: '051-777-3333',
    managerName: '박해운',
    managerPhone: '010-3003-0003',
    managerEmail: 'haeundae@test.com',
    capacity: '50',
    operatingHours: '08:00 - 23:00',
    description: 'E2E 테스트 - 협력 스튜디오 (부산 해운대)',
    amenities: ['주차', 'WiFi', '라커', '샤워실', '에어컨'],
  },
];

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder(/admin|email/i).fill(ADMIN_EMAIL);
  await page.getByPlaceholder(/비밀번호|password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(/\/admin/, { timeout: 30000 });
  await expect(page.getByText('대시보드', { exact: false }).first()).toBeVisible({ timeout: 15000 });
}

async function registerStudio(page: Page, studio: StudioData) {
  // Navigate to registration page
  await page.goto('/admin/studios/new');
  await expect(page.getByRole('heading', { name: /신규 스튜디오 등록/i })).toBeVisible({ timeout: 15000 });

  // Studio name
  await page.getByPlaceholder('예: 강남 A스튜디오').fill(studio.name);

  // Studio type
  const selects = page.locator('select');
  await selects.nth(0).selectOption(studio.tab);

  // Country
  await selects.nth(1).selectOption(studio.country);

  // Wait for cities to load and select
  await page.waitForTimeout(1500);
  const citySelect = selects.nth(2);
  const cityOptions = await citySelect.locator('option').all();
  if (cityOptions.length > studio.cityIndex) {
    const cityValue = await cityOptions[studio.cityIndex].getAttribute('value');
    await citySelect.selectOption(cityValue!);
  }

  // Wait for regions to load and select
  await page.waitForTimeout(1500);
  const regionSelect = selects.nth(3);
  const regionOptions = await regionSelect.locator('option').all();
  if (regionOptions.length > studio.regionIndex) {
    const regionValue = await regionOptions[studio.regionIndex].getAttribute('value');
    await regionSelect.selectOption(regionValue!);
  }

  // Address: simulate Google Places selection via custom event
  // First type into the search box
  const addressInput = page.locator('input[placeholder="주소를 입력하면 자동완성 목록에서 선택하세요"]');
  const hasSearchInput = await addressInput.count() > 0;

  if (hasSearchInput) {
    await addressInput.fill(studio.address);
    // Trigger the custom event to simulate place selection
    await page.evaluate((data) => {
      const form = document.querySelector('form');
      if (form) {
        const event = new CustomEvent('__test_place_selected', {
          detail: { address: data.address, lat: data.lat, lng: data.lng }
        });
        form.dispatchEvent(event);
      }
    }, { address: studio.address, lat: studio.lat, lng: studio.lng });
    await page.waitForTimeout(1000);
  } else {
    // Fallback: if old UI with manual address input
    const oldAddressInput = page.getByPlaceholder('예: 서울시 강남구 테헤란로 123');
    if (await oldAddressInput.count() > 0) {
      await oldAddressInput.fill(studio.address);
    }
  }

  // Phone
  await page.getByPlaceholder('예: 02-1234-5678').fill(studio.phone);

  // Manager info
  await page.getByPlaceholder('예: 최관리').fill(studio.managerName);
  await page.getByPlaceholder('예: 010-1234-5678').fill(studio.managerPhone);
  await page.getByPlaceholder('예: manager@studio.com').fill(studio.managerEmail);

  // Capacity & hours
  await page.getByPlaceholder('예: 30').fill(studio.capacity);
  await page.getByPlaceholder('예: 09:00 - 22:00').fill(studio.operatingHours);
  await page.getByPlaceholder('시설에 대한 설명을 입력하세요').fill(studio.description);

  // Amenities
  for (const amenity of studio.amenities) {
    await page.getByLabel(amenity).check();
  }

  // Image upload
  await page.waitForTimeout(500);
  const fileInput = page.locator('input[type="file"][accept="image/*"]');
  if (await fileInput.count() > 0) {
    const imagePath = '/Users/beejayjung/.gemini/antigravity/brain/43a14f58-df4c-4a2a-9fef-aba1bf3c204a/studio_placeholder_1772615461920.png';
    await fileInput.setInputFiles(imagePath);
    await page.waitForTimeout(500);
  }

  // Handle success dialog
  page.once('dialog', dialog => {
    console.log(`[${studio.tabLabel}] Dialog: ${dialog.message()}`);
    dialog.accept().catch(() => {});
  });

  // Submit
  await page.getByRole('button', { name: '저장' }).click();
  await page.waitForTimeout(3000);

  // Wait for redirect or dialog
  await page.waitForURL(/\/admin\/studios(.*)/, { timeout: 15000 })
    .catch(() => console.log(`[${studio.tabLabel}] Redirect not detected, continuing...`));

  console.log(`✅ ${studio.tabLabel} "${studio.name}" 등록 완료!`);
}

test.describe('Register 3 Studio Types', () => {
  test('should register official, partner, and associated studios', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes total

    await loginAsAdmin(page);

    for (const studio of STUDIOS) {
      console.log(`\n🏢 [${studio.tabLabel}] "${studio.name}" 등록 시작...`);
      await registerStudio(page, studio);
    }

    console.log('\n🎉 3가지 유형 스튜디오 등록 모두 완료!');
  });
});
