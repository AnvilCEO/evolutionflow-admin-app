# Admin Studio Management System Design

## 1. 개요

관리자가 스튜디오 정보를 체계적으로 관리할 수 있는 기능입니다. Teacher Studio에서 조회되는 스튜디오 정보를 기반으로, Admin Studio에서는 생성, 수정, 삭제, 상태 관리 등의 CRUD 기능을 제공합니다.

**목표:**
- Teacher Studio 조회 페이지에 표시될 스튜디오 정보를 관리
- 스튜디오 추가/수정/삭제
- 스튜디오 상태 관리 (운영/중지/점검)
- 스튜디오 유형 분류 및 **종류별 게시 위치 관리** (공인/파트너/협력)

---

## 2. 데이터 모델

### 2.1 스튜디오 유형 및 게시 위치

스튜디오는 3가지 종류로 분류되며, **각 종류별로 Teacher 페이지의 서로 다른 탭에 게시됩니다.**

| 유형 | 코드 | Teacher 페이지 표시 위치 | 설명 |
|------|------|------------------------|------|
| 공인 스튜디오 | `official` | "공인 스튜디오 Official Studio" 탭 | Evolutionflow 공식 계약 스튜디오 |
| 파트너 스튜디오 | `partner` | "파트너 스튜디오 Partner Studio" 탭 | 공식 파트너 스튜디오 |
| 협력 스튜디오 | `associated` | "협력 스튜디오 Associated Studio" 탭 | 협력 중인 외부 스튜디오 |

### 2.2 Teacher Studio 데이터 (조회용)

```typescript
type StudioTab = "official" | "partner" | "associated";
type StudioCountry = "KR" | "CN";

type StudioItem = {
  id: string;                    // 스튜디오 고유 ID
  tab: StudioTab;               // 스튜디오 유형 (게시 위치 결정)
  name: string;                 // 스튜디오 명
  country: StudioCountry;       // 국가
  city: string;                 // 도시
  region: string;               // 지역 (시/도 아래)
  address: string;              // 상세 주소
  phone: string;                // 연락처
  social: string;               // SNS 정보
  lat: number;                  // 지도 위도
  lng: number;                  // 지도 경도
};
```

### 2.3 마스터 데이터 모델

```typescript
// 국가 마스터
interface CountryMaster {
  code: "KR" | "CN";           // 국가 코드
  name: string;                // 국가명 (한글)
  displayOrder: number;        // 표시 순서
}

// 도시 마스터 (국가별)
interface CityMaster {
  id: string;                  // 고유 ID (예: "KR-Seoul")
  countryCode: "KR" | "CN";    // 국가 코드 (FK)
  name: string;                // 도시명 (한글)
  displayOrder: number;        // 표시 순서
}

// 지역 마스터 (도시별)
interface RegionMaster {
  id: string;                  // 고유 ID (예: "KR-Seoul-Gangnam")
  cityId: string;              // 도시 ID (FK)
  countryCode: "KR" | "CN";    // 국가 코드 (FK, 조회 편의)
  name: string;                // 지역명 (한글, 예: 강남구)
  displayOrder: number;        // 표시 순서
}
```

### 2.4 Admin Studio 데이터 (관리용) - 확장 모델

```typescript
type AdminStudioStatus = "active" | "inactive" | "maintenance";

interface AdminStudioItem extends StudioItem {
  // 기본 필드 (위와 동일)

  // 추가 관리 필드
  managerName: string;          // 담당자명
  managerPhone: string;         // 담당자 연락처
  managerEmail: string;         // 담당자 이메일

  capacity: number;             // 수용 인원
  status: AdminStudioStatus;    // 운영 상태 (active/inactive/maintenance)
  description?: string;         // 시설 설명
  operatingHours?: string;      // 운영 시간
  amenities?: string[];         // 편의 시설 (주차, WiFi 등)

  // 메타 정보
  createdAt: string;            // 등록일
  updatedAt: string;            // 수정일
  createdBy: string;            // 등록자
  updatedBy: string;            // 수정자
}
```

---

## 3. 주요 기능 (CRUD)

### 3.1 조회 (Read)
- **목록 조회**: 탭 기반 스튜디오 유형 분류 + 페이지네이션, 검색, 필터링, 정렬
- **상세 조회**: 개별 스튜디오 정보 조회
- **탭 옵션** (필수):
  - 공인 (official)
  - 파트너 (partner)
  - 협력 (associated)
- **필터 옵션** (선택):
  - 검색어 (이름, 위치)
  - 운영 상태 (active/inactive/maintenance)
  - 국가 → 도시 → 지역 (계층적 필터, 마스터 데이터 연동)

### 3.2 생성 (Create)
- **신규 스튜디오 등록**
- **필수 입력 필드**: 이름, 국가, 도시, 지역, 주소, 전화, 위도/경도, 유형
- **선택 입력 필드**: 담당자, 연락처, 이메일, 수용 인원, 설명, 운영 시간, 편의 시설

### 3.3 수정 (Update)
- **스튜디오 정보 수정**
- **상태 변경** (active → inactive → maintenance)
- **담당자 정보 변경**

### 3.4 삭제 (Delete)
- **스튜디오 삭제** (물리 삭제 또는 소프트 삭제)
- **삭제 전 확인 다이얼로그**

---

## 4. API 스펙

### 4.1 목록 조회

```http
GET /api/admin/studios
Query Parameters:
  - tab: "official" | "partner" | "associated" (required)
  - page: number (default: 1)
  - pageSize: number (default: 10)
  - search?: string (이름, 위치로 검색)
  - status?: "active" | "inactive" | "maintenance"
  - country?: "KR" | "CN"
  - sortKey?: string (default: "createdAt")
  - sortDirection?: "asc" | "desc" (default: "desc")

Response:
{
  success: boolean,
  data: AdminStudioItem[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}

**참고:**
- tab 파라미터는 필수 (탭 선택에 따라 결정)
- 탭 변경 시 자동으로 필터 리셋 및 페이지를 1로 초기화
```

### 4.2 상세 조회

```http
GET /api/admin/studios/:id

Response:
{
  success: boolean,
  data: AdminStudioItem
}
```

### 4.3 신규 등록

```http
POST /api/admin/studios
Body:
{
  name: string (required),
  tab: "official" | "partner" | "associated" (required),
  country: "KR" | "CN" (required),
  city: string (required),
  region: string (required),
  address: string (required),
  phone: string (required),
  social?: string,
  lat: number (required),
  lng: number (required),
  managerName?: string,
  managerPhone?: string,
  managerEmail?: string,
  capacity?: number,
  status?: "active" (default),
  description?: string,
  operatingHours?: string,
  amenities?: string[]
}

Response:
{
  success: boolean,
  data: AdminStudioItem,
  message: string
}
```

### 4.4 수정

```http
PUT /api/admin/studios/:id
Body: (4.3과 동일, 모든 필드 선택사항)

Response:
{
  success: boolean,
  data: AdminStudioItem,
  message: string
}
```

### 4.5 상태 변경 (빠른 업데이트)

```http
PATCH /api/admin/studios/:id/status
Body:
{
  status: "active" | "inactive" | "maintenance" (required)
}

Response:
{
  success: boolean,
  data: AdminStudioItem,
  message: string
}
```

### 4.6 삭제

```http
DELETE /api/admin/studios/:id

Response:
{
  success: boolean,
  message: string
}
```

---

## 4.7 마스터 데이터 API

### 4.7.1 국가 목록 조회

```http
GET /api/admin/masters/countries

Response:
{
  success: boolean,
  data: CountryMaster[]
}

Example Response:
{
  success: true,
  data: [
    { code: "KR", name: "대한민국", displayOrder: 1 },
    { code: "CN", name: "중국", displayOrder: 2 }
  ]
}
```

### 4.7.2 도시 목록 조회 (국가별)

```http
GET /api/admin/masters/cities?countryCode=KR

Query Parameters:
  - countryCode: "KR" | "CN" (required)

Response:
{
  success: boolean,
  data: CityMaster[]
}

Example Response:
{
  success: true,
  data: [
    { id: "KR-Seoul", countryCode: "KR", name: "서울", displayOrder: 1 },
    { id: "KR-Busan", countryCode: "KR", name: "부산", displayOrder: 2 }
  ]
}
```

### 4.7.3 지역 목록 조회 (도시별)

```http
GET /api/admin/masters/regions?cityId=KR-Seoul

Query Parameters:
  - cityId: string (required, 예: "KR-Seoul")

Response:
{
  success: boolean,
  data: RegionMaster[]
}

Example Response:
{
  success: true,
  data: [
    { id: "KR-Seoul-Gangnam", cityId: "KR-Seoul", countryCode: "KR", name: "강남구", displayOrder: 1 },
    { id: "KR-Seoul-Seocho", cityId: "KR-Seoul", countryCode: "KR", name: "서초구", displayOrder: 2 }
  ]
}
```

### 4.7.4 주소에서 도시/지역 자동 추출

```http
POST /api/admin/masters/extract-location
Body:
{
  countryCode: "KR" | "CN" (required),
  address: string (required, 예: "서울시 강남구 테헤란로 123")
}

Response:
{
  success: boolean,
  data: {
    cityId?: string,        // 추출된 도시 ID (예: "KR-Seoul")
    regionId?: string,      // 추출된 지역 ID (예: "KR-Seoul-Gangnam")
    cityName?: string,      // 추출된 도시명 (예: "서울")
    regionName?: string,    // 추출된 지역명 (예: "강남구")
    confidence: "high" | "medium" | "low"  // 추출 신뢰도
  },
  message?: string
}

Example Response (성공):
{
  success: true,
  data: {
    cityId: "KR-Seoul",
    regionId: "KR-Seoul-Gangnam",
    cityName: "서울",
    regionName: "강남구",
    confidence: "high"
  }
}

Example Response (부분 성공):
{
  success: true,
  data: {
    cityId: "KR-Seoul",
    cityName: "서울",
    regionId: null,
    regionName: null,
    confidence: "medium"
  }
}

Example Response (실패):
{
  success: false,
  message: "주소에서 도시/지역을 자동 추출할 수 없습니다. 수동으로 선택해주세요."
}
```

---

## 5. UI/UX 설계

### 5.1 목록 페이지 (`/admin/studios`)

#### 레이아웃
```
┌──────────────────────────────────────────────────────┐
│ 스튜디오 관리                                         │
│ Evolutionflow의 모든 오프라인 스튜디오와 시설...     │
│                                   [+ 스튜디오 등록] │
├──────────────────────────────────────────────────────┤
│ [공인] [파트너] [협력]                               │
├──────────────────────────────────────────────────────┤
│ [검색] [국가 ▼] [도시 ▼] [지역 ▼] [상태 ▼] [초기화] │
├──────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐  │
│ │ 스튜디오명  │ 위치      │ 담당자 │ 연락처 │ ... │ │
│ │─────────────────────────────────────────────────│ │
│ │ 강남A스튜디오│ 서울 강남구│ 최관리 │ 02-1234│... │
│ │ 홍대B스튜디오│ 서울 마포구│ 박점장 │ 02-9876│... │
│ │ 판교C스튜디오│ 경기 분당구│ 이운영 │ 031-111│... │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 총 N개 지점 중 1-10개 표시                           │
│ [이전] [다음]                                        │
└──────────────────────────────────────────────────────┘
```

**탭 기능:**
- **공인** (official): "공인 스튜디오 Official Studio" 탭에 표시될 스튜디오
- **파트너** (partner): "파트너 스튜디오 Partner Studio" 탭에 표시될 스튜디오
- **협력** (associated): "협력 스튜디오 Associated Studio" 탭에 표시될 스튜디오
- 각 탭 선택 시 해당 종류의 스튜디오만 표시

#### 테이블 컬럼
| 컬럼명 | 설명 | 정렬 | 설명 |
|-------|------|------|------|
| 스튜디오명 | 이름 | ✓ | 클릭하면 상세보기로 이동 |
| 위치 | 도시/지역/주소 | - | 마우스 오버 시 전체 주소 표시 |
| 담당자 | 담당자명 | ✓ | - |
| 연락처 | 담당자 전화 | - | - |
| 수용인원 | 수용 가능 인원 | ✓ | OOO명 형식 |
| 상태 | 운영/중지/점검 | ✓ | 배지 형식 |
| 작업 | 수정/삭제 버튼 | - | ActionMenu 컴포넌트 |

**스튜디오 유형은 탭으로 구분:** 별도의 컬럼 불필요

#### 액션 메뉴
- 상세보기/수정 → `/admin/studios/[id]`
- 상태 변경 (active/inactive/maintenance)
- 삭제 → 확인 다이얼로그

### 5.2 상세보기/수정 페이지 (`/admin/studios/[id]`)

#### 레이아웃
```
┌──────────────────────────────────────────────────────┐
│ < 스튜디오 관리 > 스튜디오명: 강남A스튜디오          │
│                                     [저장] [삭제] [목록]
├──────────────────────────────────────────────────────┤
│                                                      │
│ ▼ 기본 정보                                           │
│ ├─ 스튜디오명: [_______________]                    │
│ ├─ 스튜디오 유형: [official ▼]                      │
│ ├─ 국가: [KR ▼]                                      │
│ ├─ 도시: [서울 ▼] (국가 선택 시 활성화)            │
│ ├─ 지역: [강남구 ▼] (도시 선택 시 활성화)          │
│ ├─ 주소: [_______________] [자동추출 ↻]           │
│ │  (주소 입력 후 "자동추출" 클릭 시 도시/지역 자동 │
│ │   입력. 실패 시 수동 입력)                        │
│                                                      │
│ ▼ 연락처 정보                                         │
│ ├─ 대표번호: [_______________]                      │
│ ├─ SNS: [_______________]                           │
│ ├─ 담당자명: [_______________]                      │
│ ├─ 담당자 전화: [_______________]                    │
│ └─ 담당자 이메일: [_______________]                  │
│                                                      │
│ ▼ 시설 정보                                           │
│ ├─ 수용 인원: [____] 명                             │
│ ├─ 운영 시간: [_______________]                     │
│ └─ 편의 시설: [□주차 □WiFi □라커 □카페]            │
│                                                      │
│ ▼ 위치 정보                                           │
│ ├─ 위도: [_______________]                          │
│ ├─ 경도: [_______________]                          │
│ └─ [지도 보기]                                       │
│                                                      │
│ ▼ 추가 정보                                           │
│ ├─ 시설 설명: [_____________]                       │
│ ├─ 상태: [active ▼]                                 │
│ ├─ 등록일: 2025-01-15                               │
│ ├─ 등록자: admin1                                   │
│ ├─ 수정일: 2025-02-20                               │
│ └─ 수정자: admin2                                   │
│                                                      │
│ [저장] [삭제] [목록]                                 │
└──────────────────────────────────────────────────────┘
```

#### 주요 기능/컴포넌트
- 폼 섹션 (접기/펼치기)
- 저장/취소/삭제 버튼
- 입력 유효성 검증
- 에러 메시지
- **국가 → 도시 → 지역 계층적 필터**
  - 국가 선택 시 도시 목록 로드 및 업데이트
  - 도시 선택 시 지역 목록 로드 및 업데이트
  - 지역은 도시 선택 후에만 활성화
- **주소 자동 추출**
  - "자동추출" 버튼 클릭 시 `/api/admin/masters/extract-location` 호출
  - 성공 시: 도시/지역 자동 입력
  - 부분 성공 시: 도시만 자동 입력, 지역은 수동 입력 유도
  - 실패 시: 오류 메시지 표시, 수동 입력 유도

### 5.3 신규 등록 페이지 (`/admin/studios/new`)

상세보기 페이지와 동일한 레이아웃이나:
- 제목: "신규 스튜디오 등록"
- 상태: 기본값 "active"
- 등록일, 수정일 필드 없음

### 5.4 삭제 확인 다이얼로그

```
┌──────────────────────────────────────────┐
│ ⚠️  스튜디오 삭제                         │
│                                          │
│ "강남A스튜디오"를 삭제하시겠습니까?     │
│                                          │
│ 이 작업은 되돌릴 수 없습니다.           │
│                                          │
│         [삭제] [취소]                   │
└──────────────────────────────────────────┘
```

---

## 6. 구현 계획

### 6.1 파일 구조

```
/src/app/admin/studios/
├── page.tsx                    # 목록 페이지
├── layout.tsx                  # 레이아웃 (필요시)
├── [id]/
│   ├── page.tsx               # 상세보기/수정 페이지
│   └── layout.tsx             # 레이아웃 (필요시)
├── new/
│   └── page.tsx               # 신규 등록 페이지
└── components/
    ├── StudioForm.tsx         # 폼 컴포넌트
    ├── StudioTable.tsx        # 테이블 컴포넌트
    ├── StudioModal.tsx        # 삭제 확인 모달
    └── StudioFilters.tsx      # 필터 컴포넌트

/src/lib/api/admin/
├── studios.ts                 # 스튜디오 API 함수
└── masters.ts                 # 마스터 데이터 API 함수

/src/lib/utils/
└── locationExtractor.ts       # 주소 자동 추출 유틸리티 (클라이언트 사이드 도움말)

/types/
├── studio.ts                  # 스튜디오 타입 정의
└── master.ts                  # 마스터 데이터 타입 정의 (Country, City, Region)
```

### 6.2 구현 단계

1. **Phase 1: 마스터 데이터 & 타입 정의**
   - CountryMaster, CityMaster, RegionMaster 타입 정의
   - AdminStudioItem 타입 정의
   - 마스터 데이터 초기 데이터 생성 (KR/CN 국가, 도시, 지역)

2. **Phase 2: 마스터 데이터 API**
   - `/api/admin/masters/countries` 엔드포인트
   - `/api/admin/masters/cities` 엔드포인트 (국가별)
   - `/api/admin/masters/regions` 엔드포인트 (도시별)
   - `/api/admin/masters/extract-location` 엔드포인트 (주소 자동 추출)

3. **Phase 3: 스튜디오 CRUD API**
   - 6개의 스튜디오 API 엔드포인트 구현

4. **Phase 4: 목록 페이지**
   - 테이블 컴포넌트
   - 탭 필터 기능 (공인/파트너/협력)
   - 국가 → 도시 → 지역 계층적 필터
   - 검색/상태 필터
   - 페이지네이션

5. **Phase 5: 상세보기/수정 페이지**
   - 폼 컴포넌트
   - 국가 → 도시 → 지역 계층적 선택
   - 주소 입력 + 자동 추출 버튼
   - 유효성 검증
   - 저장/삭제 기능

6. **Phase 6: 신규 등록 페이지**
   - 신규 등록 폼 (상세보기와 동일)
   - 지도 선택 기능 (옵션)

7. **Phase 7: 통합 테스트**
   - 마스터 데이터 필터링 테스트
   - 자동 추출 기능 테스트
   - E2E 테스트
   - 에러 처리 테스트

---

## 7. 주요 고려사항

### 7.1 스튜디오 유형 및 게시 위치 관리
- **Admin 관리 페이지**: 스튜디오 유형별(official/partner/associated) 탭으로 구분
- **Teacher 조회 페이지**: Admin에서 설정한 `tab` 속성에 따라 해당 탭에만 표시
  - Admin에서 `tab: "official"` → Teacher의 "공인 스튜디오" 탭에만 표시
  - Admin에서 `tab: "partner"` → Teacher의 "파트너 스튜디오" 탭에만 표시
  - Admin에서 `tab: "associated"` → Teacher의 "협력 스튜디오" 탭에만 표시
- **참고**: 스튜디오를 수정할 때 `tab` 값 변경 시 Teacher 페이지의 표시 위치도 자동으로 변경됨

### 7.2 마스터 데이터 관리 (국가/도시/지역)
- **마스터 데이터 구조**: 국가 → 도시 → 지역 (3단계 계층 구조)
- **필터 연동**:
  - 국가 선택 → 해당 국가의 도시 목록만 표시
  - 도시 선택 → 해당 도시의 지역 목록만 표시
- **초기 데이터**: DB에 KR(대한민국)과 CN(중국)의 주요 도시/지역 미리 저장
- **향후 확장**: Admin UI에서 마스터 데이터 추가/수정/삭제 기능 추가 가능

### 7.3 주소 자동 추출 기능
- **작동 방식**: 사용자가 국가와 주소를 입력한 후 "자동추출" 버튼 클릭
- **추출 로직**:
  - 백엔드: 정규표현식 또는 NLP를 사용해 주소에서 도시/지역명 추출
  - 추출된 도시/지역명을 마스터 데이터와 매칭
  - 신뢰도 반환 (high/medium/low)
- **신뢰도별 처리**:
  - high: 도시/지역 모두 자동 입력
  - medium: 도시만 자동 입력, 지역은 수동 입력 유도
  - low: 자동 추출 실패, 사용자에게 수동 입력 유도
- **예시**:
  - 입력: "서울시 강남구 테헤란로 123"
  - 결과: 도시="서울", 지역="강남구" (신뢰도 high)
- **한계**: 정확하지 않은 주소는 수동 입력 필요

### 7.4 데이터 동기화
- Teacher Studio와 Admin Studio 데이터를 어떻게 동기화할 것인가?
  - **옵션A**: Admin에서 관리 → Teacher에서 조회 (권장)
  - **옵션B**: 별도 테이블로 관리

### 7.5 삭제 정책
- 물리 삭제 vs 소프트 삭제
- 삭제된 스튜디오의 관련 데이터 처리

### 7.6 지도 통합
- 위도/경도 입력: 텍스트 입력 vs 지도 클릭
- 지도 라이브러리 (Google Maps 유지)

### 7.7 권한 관리
- 스튜디오 등록/수정/삭제 권한 검증
- 감사 로그 (createdBy, updatedBy)

### 7.8 성능 최적화
- 목록 조회 시 대량 데이터 처리
- 마스터 데이터 캐싱 (국가/도시/지역)
- 이미지 최적화 (스튜디오 사진 추가 시)

---

## 8. 다음 단계

1. 이 설계 검토 및 승인
2. API 엔드포인트 구현
3. 데이터 모델/타입 정의
4. UI 컴포넌트 구현
5. 통합 및 테스트
