import { test, expect, Page } from '@playwright/test';

/**
 * 3가지 유형(공인/파트너/협력) × 2건 = 총 6개 스튜디오를 이미지 포함하여 라이브 서버에 등록
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@evolutionflow.kr';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin1234!';
const ARTIFACTS = '/Users/beejayjung/.gemini/antigravity/brain/43a14f58-df4c-4a2a-9fef-aba1bf3c204a';

interface StudioData {
  name: string;
  tab: string;
  tabLabel: string;
  country: string;
  cityIndex: number;
  regionIndex: number;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  social: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  capacity: string;
  operatingHours: string;
  description: string;
  amenities: string[];
  imagePath: string;
}

const STUDIOS: StudioData[] = [
  // ===== 공인 스튜디오 2건 =====
  {
    name: '강남 에볼루션플로우 요가센터',
    tab: 'official',
    tabLabel: '공인 스튜디오',
    country: 'KR',
    cityIndex: 1,
    regionIndex: 1,
    address: '서울특별시 강남구 테헤란로 152 강남파이낸스센터',
    lat: 37.5012,
    lng: 127.0396,
    phone: '02-555-1234',
    social: 'Instagram/ef_gangnam',
    managerName: '김요가',
    managerPhone: '010-1001-1001',
    managerEmail: 'gangnam@evolutionflow.kr',
    capacity: '40',
    operatingHours: '06:00 - 22:00',
    description: '강남 최대 규모의 에볼루션플로우 공인 요가 스튜디오. 넓은 원목 바닥과 자연채광이 돋보이는 프리미엄 공간입니다. 전문 강사진의 체계적인 프로그램을 경험하세요.',
    amenities: ['주차', 'WiFi', '라커', '샤워실', '에어컨'],
    imagePath: `${ARTIFACTS}/studio_yoga_modern_1772674898171.png`,
  },
  {
    name: '서초 에볼루션플로우 명상원',
    tab: 'official',
    tabLabel: '공인 스튜디오',
    country: 'KR',
    cityIndex: 1,
    regionIndex: 2,
    address: '서울특별시 서초구 서초대로 398 플래티넘타워',
    lat: 37.4919,
    lng: 127.0076,
    phone: '02-588-5678',
    social: 'Instagram/ef_seocho',
    managerName: '이명상',
    managerPhone: '010-2002-2002',
    managerEmail: 'seocho@evolutionflow.kr',
    capacity: '25',
    operatingHours: '07:00 - 21:00',
    description: '서초의 명상과 웰니스 전문 공인 스튜디오. 대나무 바닥과 젠 가든 요소가 어우러진 평화로운 힐링 공간입니다.',
    amenities: ['WiFi', '에어컨', '난방'],
    imagePath: `${ARTIFACTS}/studio_meditation_zen_1772674985234.png`,
  },

  // ===== 파트너 스튜디오 2건 =====
  {
    name: '홍대 무브먼트 댄스스튜디오',
    tab: 'partner',
    tabLabel: '파트너 스튜디오',
    country: 'KR',
    cityIndex: 1,
    regionIndex: 3,
    address: '서울특별시 마포구 와우산로 94 홍익대학교',
    lat: 37.5507,
    lng: 126.9247,
    phone: '02-333-7890',
    social: 'Instagram/move_hongdae',
    managerName: '박댄스',
    managerPhone: '010-3003-3003',
    managerEmail: 'hongdae@partner.kr',
    capacity: '30',
    operatingHours: '10:00 - 23:00',
    description: '홍대 예술의 거리에 위치한 무브먼트 전문 파트너 스튜디오. 발레바와 대형 거울, 원목 플로어로 구성된 창의적 공간입니다.',
    amenities: ['WiFi', '카페', '샤워실', '에어컨'],
    imagePath: `${ARTIFACTS}/studio_dance_space_1772674939614.png`,
  },
  {
    name: '성수 필라테스 팩토리',
    tab: 'partner',
    tabLabel: '파트너 스튜디오',
    country: 'KR',
    cityIndex: 1,
    regionIndex: 4,
    address: '서울특별시 성동구 성수이로 51 한양빌딩',
    lat: 37.5445,
    lng: 127.0568,
    phone: '02-460-1234',
    social: 'Instagram/pilates_seongsu',
    managerName: '최필라',
    managerPhone: '010-4004-4004',
    managerEmail: 'seongsu@partner.kr',
    capacity: '15',
    operatingHours: '07:00 - 22:00',
    description: '성수동의 프리미엄 필라테스 파트너 스튜디오. 최신 리포머 장비와 파스텔톤 인테리어가 돋보이는 세련된 공간입니다.',
    amenities: ['주차', 'WiFi', '라커', '에어컨'],
    imagePath: `${ARTIFACTS}/studio_pilates_premium_1772674922527.png`,
  },

  // ===== 협력 스튜디오 2건 =====
  {
    name: '해운대 피트니스 아레나',
    tab: 'associated',
    tabLabel: '협력 스튜디오',
    country: 'KR',
    cityIndex: 2,
    regionIndex: 1,
    address: '부산광역시 해운대구 해운대해변로 264',
    lat: 35.1587,
    lng: 129.1604,
    phone: '051-777-5678',
    social: 'Instagram/fit_haeundae',
    managerName: '정피트',
    managerPhone: '010-5005-5005',
    managerEmail: 'haeundae@associated.kr',
    capacity: '50',
    operatingHours: '06:00 - 24:00',
    description: '해운대 바다가 보이는 프리미엄 피트니스 협력 스튜디오. 최신 장비와 넓은 그룹 운동 공간을 갖추고 있습니다.',
    amenities: ['주차', 'WiFi', '라커', '샤워실', '에어컨', '카페'],
    imagePath: `${ARTIFACTS}/studio_fitness_gym_1772674971199.png`,
  },
  {
    name: '제주 크로스핏 박스',
    tab: 'associated',
    tabLabel: '협력 스튜디오',
    country: 'KR',
    cityIndex: 3,
    regionIndex: 1,
    address: '제주특별자치도 제주시 연동 261-20',
    lat: 33.4890,
    lng: 126.4983,
    phone: '064-123-4567',
    social: 'Instagram/crossfit_jeju',
    managerName: '강크핏',
    managerPhone: '010-6006-6006',
    managerEmail: 'jeju@associated.kr',
    capacity: '20',
    operatingHours: '06:00 - 22:00',
    description: '제주도의 에너지 넘치는 크로스핏 협력 스튜디오. 벽돌 인테리어와 산업적 디자인이 특징인 역동적 트레이닝 공간입니다.',
    amenities: ['주차', 'WiFi', '샤워실'],
    imagePath: `${ARTIFACTS}/studio_crossfit_box_1772675014348.png`,
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
  await page.goto('/admin/studios/new');
  await expect(page.getByRole('heading', { name: /신규 스튜디오 등록/i })).toBeVisible({ timeout: 15000 });

  // 스튜디오명
  await page.getByPlaceholder('예: 강남 A스튜디오').fill(studio.name);

  // 드롭다운 선택
  const selects = page.locator('select');
  await selects.nth(0).selectOption(studio.tab);   // 유형
  await selects.nth(1).selectOption(studio.country); // 국가

  // 도시 선택
  await page.waitForTimeout(1500);
  const citySelect = selects.nth(2);
  const cityOptions = await citySelect.locator('option').all();
  if (cityOptions.length > studio.cityIndex) {
    const cityValue = await cityOptions[studio.cityIndex].getAttribute('value');
    await citySelect.selectOption(cityValue!);
  }

  // 지역 선택
  await page.waitForTimeout(1500);
  const regionSelect = selects.nth(3);
  const regionOptions = await regionSelect.locator('option').all();
  if (regionOptions.length > studio.regionIndex) {
    const regionValue = await regionOptions[studio.regionIndex].getAttribute('value');
    await regionSelect.selectOption(regionValue!);
  }

  // 주소 (Google Places 시뮬레이션)
  const addressInput = page.locator('input[placeholder="주소를 입력하면 자동완성 목록에서 선택하세요"]');
  if (await addressInput.count() > 0) {
    await addressInput.fill(studio.address);
    await page.evaluate((data) => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new CustomEvent('__test_place_selected', {
          detail: { address: data.address, lat: data.lat, lng: data.lng }
        }));
      }
    }, { address: studio.address, lat: studio.lat, lng: studio.lng });
    await page.waitForTimeout(1000);
  }

  // 연락처
  await page.getByPlaceholder('예: 02-1234-5678').fill(studio.phone);
  await page.getByPlaceholder('예: Instagram/username').fill(studio.social);
  await page.getByPlaceholder('예: 최관리').fill(studio.managerName);
  await page.getByPlaceholder('예: 010-1234-5678').fill(studio.managerPhone);
  await page.getByPlaceholder('예: manager@studio.com').fill(studio.managerEmail);

  // 시설 정보
  await page.getByPlaceholder('예: 30').fill(studio.capacity);
  await page.getByPlaceholder('예: 09:00 - 22:00').fill(studio.operatingHours);
  await page.getByPlaceholder('시설에 대한 설명을 입력하세요').fill(studio.description);

  // 편의시설
  for (const amenity of studio.amenities) {
    const checkbox = page.getByLabel(amenity);
    if (await checkbox.count() > 0) {
      await checkbox.check();
    }
  }

  // 🖼️ 이미지 업로드
  const fileInput = page.locator('input[type="file"][accept="image/*"]');
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(studio.imagePath);
    await page.waitForTimeout(1000);
    console.log(`  📸 이미지 업로드 완료: ${studio.imagePath.split('/').pop()}`);
  }

  // 다이얼로그 핸들러
  page.once('dialog', dialog => {
    console.log(`  💬 Dialog: ${dialog.message()}`);
    dialog.accept().catch(() => {});
  });

  // 저장
  await page.getByRole('button', { name: '저장' }).click();
  await page.waitForTimeout(3000);

  await page.waitForURL(/\/admin\/studios(.*)/, { timeout: 15000 })
    .catch(() => console.log(`  ⚠️ 리다이렉트 미감지`));

  console.log(`✅ [${studio.tabLabel}] "${studio.name}" 등록 완료!\n`);
}

test.describe('Register 6 Studios (2 per type) with Images', () => {
  test('should register all 6 studios', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

    await loginAsAdmin(page);

    for (let i = 0; i < STUDIOS.length; i++) {
      const studio = STUDIOS[i];
      console.log(`\n🏢 [${i + 1}/6] ${studio.tabLabel} "${studio.name}" 등록 시작...`);
      await registerStudio(page, studio);
    }

    console.log('\n🎉🎉🎉 총 6개 스튜디오 등록 모두 완료! 🎉🎉🎉');
  });
});
