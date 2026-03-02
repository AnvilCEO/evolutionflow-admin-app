/**
 * Master Data - 국가, 도시, 지역 초기 데이터
 */

import type { CountryMaster, CityMaster, RegionMaster } from "@/types/master";

export const COUNTRIES: CountryMaster[] = [
  { code: "KR", name: "대한민국", displayOrder: 1 },
  { code: "CN", name: "중국", displayOrder: 2 },
];

/**
 * 한국(KR) 도시 및 지역
 */
export const CITIES_KR: CityMaster[] = [
  { id: "KR-Seoul", countryCode: "KR", name: "서울", displayOrder: 1 },
  { id: "KR-Busan", countryCode: "KR", name: "부산", displayOrder: 2 },
  { id: "KR-Daegu", countryCode: "KR", name: "대구", displayOrder: 3 },
  { id: "KR-Incheon", countryCode: "KR", name: "인천", displayOrder: 4 },
  { id: "KR-Gwangju", countryCode: "KR", name: "광주", displayOrder: 5 },
  { id: "KR-Daejeon", countryCode: "KR", name: "대전", displayOrder: 6 },
  { id: "KR-Ulsan", countryCode: "KR", name: "울산", displayOrder: 7 },
  { id: "KR-Sejong", countryCode: "KR", name: "세종", displayOrder: 8 },
  { id: "KR-Gyeonggi", countryCode: "KR", name: "경기", displayOrder: 9 },
  { id: "KR-Gangwon", countryCode: "KR", name: "강원", displayOrder: 10 },
  { id: "KR-Chungbuk", countryCode: "KR", name: "충북", displayOrder: 11 },
  { id: "KR-Chungnam", countryCode: "KR", name: "충남", displayOrder: 12 },
  { id: "KR-Jeonbuk", countryCode: "KR", name: "전북", displayOrder: 13 },
  { id: "KR-Jeonnam", countryCode: "KR", name: "전남", displayOrder: 14 },
  { id: "KR-Gyeongbuk", countryCode: "KR", name: "경북", displayOrder: 15 },
  { id: "KR-Gyeongnam", countryCode: "KR", name: "경남", displayOrder: 16 },
  { id: "KR-Jeju", countryCode: "KR", name: "제주", displayOrder: 17 },
];

export const REGIONS_KR: RegionMaster[] = [
  // 서울
  { id: "KR-Seoul-Gangnam", cityId: "KR-Seoul", countryCode: "KR", name: "강남구", displayOrder: 1 },
  { id: "KR-Seoul-Seocho", cityId: "KR-Seoul", countryCode: "KR", name: "서초구", displayOrder: 2 },
  { id: "KR-Seoul-Mapo", cityId: "KR-Seoul", countryCode: "KR", name: "마포구", displayOrder: 3 },
  { id: "KR-Seoul-Jung", cityId: "KR-Seoul", countryCode: "KR", name: "중구", displayOrder: 4 },
  { id: "KR-Seoul-Jongno", cityId: "KR-Seoul", countryCode: "KR", name: "종로구", displayOrder: 5 },
  { id: "KR-Seoul-Dong", cityId: "KR-Seoul", countryCode: "KR", name: "동대문구", displayOrder: 6 },
  { id: "KR-Seoul-Seongdong", cityId: "KR-Seoul", countryCode: "KR", name: "성동구", displayOrder: 7 },
  { id: "KR-Seoul-Gwangjin", cityId: "KR-Seoul", countryCode: "KR", name: "광진구", displayOrder: 8 },
  { id: "KR-Seoul-Songpa", cityId: "KR-Seoul", countryCode: "KR", name: "송파구", displayOrder: 9 },
  { id: "KR-Seoul-Gangdong", cityId: "KR-Seoul", countryCode: "KR", name: "강동구", displayOrder: 10 },
  { id: "KR-Seoul-Yeongdeungpo", cityId: "KR-Seoul", countryCode: "KR", name: "영등포구", displayOrder: 11 },
  { id: "KR-Seoul-Guro", cityId: "KR-Seoul", countryCode: "KR", name: "구로구", displayOrder: 12 },
  { id: "KR-Seoul-Gangseo", cityId: "KR-Seoul", countryCode: "KR", name: "강서구", displayOrder: 13 },
  { id: "KR-Seoul-Yangcheon", cityId: "KR-Seoul", countryCode: "KR", name: "양천구", displayOrder: 14 },
  { id: "KR-Seoul-Eunpyeong", cityId: "KR-Seoul", countryCode: "KR", name: "은평구", displayOrder: 15 },
  { id: "KR-Seoul-Seodaemun", cityId: "KR-Seoul", countryCode: "KR", name: "서대문구", displayOrder: 16 },
  { id: "KR-Seoul-Nowon", cityId: "KR-Seoul", countryCode: "KR", name: "노원구", displayOrder: 17 },
  { id: "KR-Seoul-Dobong", cityId: "KR-Seoul", countryCode: "KR", name: "도봉구", displayOrder: 18 },
  { id: "KR-Seoul-Gangbuk", cityId: "KR-Seoul", countryCode: "KR", name: "강북구", displayOrder: 19 },
  { id: "KR-Seoul-Seongbuk", cityId: "KR-Seoul", countryCode: "KR", name: "성북구", displayOrder: 20 },
  { id: "KR-Seoul-Jungnang", cityId: "KR-Seoul", countryCode: "KR", name: "중랑구", displayOrder: 21 },

  // 부산 (주요 구만)
  { id: "KR-Busan-Haeundae", cityId: "KR-Busan", countryCode: "KR", name: "해운대구", displayOrder: 1 },
  { id: "KR-Busan-Busanjin", cityId: "KR-Busan", countryCode: "KR", name: "부산진구", displayOrder: 2 },
  { id: "KR-Busan-Seogu", cityId: "KR-Busan", countryCode: "KR", name: "서구", displayOrder: 3 },
  { id: "KR-Busan-Jung", cityId: "KR-Busan", countryCode: "KR", name: "중구", displayOrder: 4 },
  { id: "KR-Busan-Dong", cityId: "KR-Busan", countryCode: "KR", name: "동구", displayOrder: 5 },

  // 경기도 (주요 지역만)
  { id: "KR-Gyeonggi-Suwon", cityId: "KR-Gyeonggi", countryCode: "KR", name: "수원", displayOrder: 1 },
  { id: "KR-Gyeonggi-Seongnam", cityId: "KR-Gyeonggi", countryCode: "KR", name: "성남", displayOrder: 2 },
  { id: "KR-Gyeonggi-Bundang", cityId: "KR-Gyeonggi", countryCode: "KR", name: "분당구", displayOrder: 3 },
  { id: "KR-Gyeonggi-Gangnam", cityId: "KR-Gyeonggi", countryCode: "KR", name: "강남구", displayOrder: 4 },
  { id: "KR-Gyeonggi-Gwangmyeong", cityId: "KR-Gyeonggi", countryCode: "KR", name: "광명", displayOrder: 5 },
];

/**
 * 중국(CN) 도시 및 지역
 */
export const CITIES_CN: CityMaster[] = [
  { id: "CN-Beijing", countryCode: "CN", name: "베이징", displayOrder: 1 },
  { id: "CN-Shanghai", countryCode: "CN", name: "상하이", displayOrder: 2 },
  { id: "CN-Guangzhou", countryCode: "CN", name: "광저우", displayOrder: 3 },
  { id: "CN-Shenzhen", countryCode: "CN", name: "선전", displayOrder: 4 },
  { id: "CN-Chengdu", countryCode: "CN", name: "청두", displayOrder: 5 },
  { id: "CN-Wuhan", countryCode: "CN", name: "우한", displayOrder: 6 },
];

export const REGIONS_CN: RegionMaster[] = [
  // 베이징
  { id: "CN-Beijing-Chaoyang", cityId: "CN-Beijing", countryCode: "CN", name: "조양구", displayOrder: 1 },
  { id: "CN-Beijing-Xicheng", cityId: "CN-Beijing", countryCode: "CN", name: "서성구", displayOrder: 2 },
  { id: "CN-Beijing-Chongwen", cityId: "CN-Beijing", countryCode: "CN", name: "동성구", displayOrder: 3 },

  // 상하이
  { id: "CN-Shanghai-Pudong", cityId: "CN-Shanghai", countryCode: "CN", name: "푸동신구", displayOrder: 1 },
  { id: "CN-Shanghai-Huangpu", cityId: "CN-Shanghai", countryCode: "CN", name: "황푸구", displayOrder: 2 },
  { id: "CN-Shanghai-Jing", cityId: "CN-Shanghai", countryCode: "CN", name: "정안구", displayOrder: 3 },

  // 광저우
  { id: "CN-Guangzhou-Tianhe", cityId: "CN-Guangzhou", countryCode: "CN", name: "천하구", displayOrder: 1 },
  { id: "CN-Guangzhou-Liwan", cityId: "CN-Guangzhou", countryCode: "CN", name: "리완구", displayOrder: 2 },

  // 선전
  { id: "CN-Shenzhen-Luohu", cityId: "CN-Shenzhen", countryCode: "CN", name: "라오후구", displayOrder: 1 },
  { id: "CN-Shenzhen-Futian", cityId: "CN-Shenzhen", countryCode: "CN", name: "푸톈구", displayOrder: 2 },
];

/**
 * 모든 도시 (국가 코드별로 분류)
 */
export const ALL_CITIES: Record<string, CityMaster[]> = {
  KR: CITIES_KR,
  CN: CITIES_CN,
};

/**
 * 모든 지역 (도시 ID별로 분류)
 */
export const ALL_REGIONS = [...REGIONS_KR, ...REGIONS_CN];

export const REGIONS_BY_CITY: Record<string, RegionMaster[]> = {};

// 도시별 지역 매핑 생성
ALL_REGIONS.forEach((region) => {
  if (!REGIONS_BY_CITY[region.cityId]) {
    REGIONS_BY_CITY[region.cityId] = [];
  }
  REGIONS_BY_CITY[region.cityId].push(region);
});
