# 스튜디오 관리 시스템 통합 테스트 가이드

## 📋 시스템 구성

```
Port 4000: NestJS Backend API
Port 3002: 어드민 사이트 (Admin)
Port 3100: 공개 사이트 (Public)
```

## 🚀 시작 전 준비사항

### 1. 환경 변수 설정

#### 백엔드 (evolutionflow-dev-api_Cloude)
```bash
# .env 파일 확인
DATABASE_URL=postgresql://user:password@localhost:5432/evolutionflow
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### 어드민 (evolutionflow-dev-admin_Cloude)
```bash
# .env.local 파일
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD20-pWK3FJjxbnovQkt3btEfOORLluunY
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### 공개 사이트 (evolutionflow-site-app_Cloude)
```bash
# .env.local 파일
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD20-pWK3FJjxbnovQkt3btEfOORLluunY
```

---

## 🧪 통합 테스트 시나리오

### **Test 1: 어드민에서 새 스튜디오 등록**

**목적**: 전체 데이터 흐름 검증 (어드민 → API → 데이터베이스)

**단계:**
1. 어드민 사이트 접속: `http://localhost:3002/admin/studios`
2. "스튜디오 등록" 버튼 클릭
3. 다음 정보 입력:
   - **스튜디오명**: "테스트 스튜디오"
   - **스튜디오 유형**: "공인 스튜디오"
   - **국가**: "KR"
   - **도시**: "서울"
   - **지역**: "강남구"
   - **주소**: "서울시 강남구 테헤란로 123" (Google Places 검색 후 자동 선택)
   - **대표번호**: "02-1234-5678"
   - **담당자명**: "테스트담당"
   - **상태**: "활성"

**Google Places 자동완성 검증:**
- 주소 입력 시 드롭다운 나타나는가?
- 주소 선택 후 위도/경도가 자동 입력되는가?
- 위도/경도 값이 올바른 범위(한국)인가?

**이미지 업로드 검증:**
- 이미지 파일 선택 시 미리보기 표시되는가?
- 5MB 초과 파일은 거부되는가?
- 이미지 제거 버튼이 작동하는가?

**저장 검증:**
- 저장 버튼 클릭 후 목록으로 돌아가는가?
- 새 스튜디오가 목록에 표시되는가?
- 스튜디오 상세 조회 시 모든 데이터가 올바른가?

---

### **Test 2: 공개 사이트에서 등록된 스튜디오 조회**

**목적**: 백엔드 `/studios/public` 엔드포인트 검증

**단계:**
1. 공개 사이트 접속: `http://localhost:3100/teacher/studio`
2. 페이지 로드 확인

**동적 데이터 로드 검증:**
- 페이지 로드 시 로딩 상태가 표시되는가?
- API 응답 후 스튜디오 목록이 표시되는가?
- Test 1에서 등록한 스튜디오가 목록에 나타나는가?
- 지도에 스튜디오 핀이 정확히 표시되는가?
- 스튜디오 필터가 정상 작동하는가?

**필터 검증:**
```
필터 조건                검증사항
─────────────────────────────────────
스튜디오 유형 필터       공인/파트너/협력 필터링 가능
국가 필터              KR/CN 필터링 가능
도시 필터              해당 국가의 도시만 표시
지역 필터              해당 도시의 지역만 표시
이름 검색              스튜디오명으로 검색 가능
```

---

### **Test 3: 상태 변경 및 공개 여부 확인**

**목적**: 상태 필터링 검증 (활성만 공개)

**단계:**
1. 어드민에서 Test 1의 스튜디오 상세 조회
2. 상태를 "비활성"으로 변경 후 저장
3. 공개 사이트 새로고침

**상태 필터링 검증:**
- 비활성 스튜디오가 공개 사이트에 사라지는가?
- 어드민에서는 여전히 보이는가?
- 다시 "활성"으로 변경하면 공개 사이트에 나타나는가?

---

### **Test 4: 스튜디오 수정 및 동기화**

**목적**: 업데이트 데이터 흐름 검증

**단계:**
1. 어드민에서 Test 1의 스튜디오 수정
2. 스튜디오명을 "업데이트된 스튜디오"로 변경
3. 주소를 다른 위치로 변경 (Google Places 사용)
4. 저장

**동기화 검증:**
- 수정 후 어드민 목록에 변경 반영되는가?
- 공개 사이트 새로고침 시 변경 내용 반영되는가?
- 지도의 스튜디오 위치가 올바르게 업데이트되는가?

---

### **Test 5: 스튜디오 삭제**

**목적**: 삭제 데이터 흐름 검증

**단계:**
1. 어드민에서 스튜디오 목록 조회
2. 테스트 스튜디오의 삭제 버튼 클릭
3. 확인 (삭제 확인 모달이 있다면)

**삭제 검증:**
- 어드민 목록에서 삭제되는가?
- 공개 사이트에서도 사라지는가?
- 데이터베이스에서 완전히 제거되는가?

---

## 🔍 API 엔드포인트 직접 테스트

### curl을 이용한 API 테스트

```bash
# 1. 공개 스튜디오 조회 (상태: active만)
curl http://localhost:4000/studios/public

# 2. 필터링된 스튜디오 조회
curl "http://localhost:4000/studios/public?country=KR&city=서울&status=active"

# 3. 어드민: 모든 스튜디오 조회 (필터 무관)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/studios

# 4. 어드민: 스튜디오 상세 조회
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/studios/{id}

# 5. 어드민: 새 스튜디오 등록
curl -X POST http://localhost:4000/studios \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트",
    "tab": "official",
    "country": "KR",
    "city": "서울",
    "region": "강남구",
    "address": "서울시 강남구",
    "phone": "02-1234-5678",
    "latitude": 37.4979,
    "longitude": 127.0276
  }'
```

---

## 📊 성능 및 에러 처리 테스트

### Network 느린 상황 테스트
1. 브라우저 DevTools → Network 탭
2. "Slow 3G" 또는 "Fast 3G" 선택
3. 공개 사이트 새로고침
4. 로딩 상태가 표시되고 데이터 로드되는가?

### API 오류 상황 테스트
1. 백엔드 서버 중지
2. 공개 사이트 새로고침
3. 에러 메시지가 표시되는가?
4. 어드민에서 스튜디오 등록 시도 → 에러 처리되는가?

### CORS 테스트
1. 공개 사이트에서 API 호출 성공하는가?
2. 어드민에서 API 호출 성공하는가?
3. 브라우저 콘솔에 CORS 에러 없는가?

---

## ✅ 체크리스트

### 백엔드 검증
- [ ] 데이터베이스 연결 확인
- [ ] Prisma migration 완료
- [ ] `/studios/public` 엔드포인트 정상 작동
- [ ] 필터링 기능 정상 작동
- [ ] 인증/인가 로직 정상 작동

### 어드민 검증
- [ ] Google Places 자동완성 작동
- [ ] 이미지 업로드 및 미리보기
- [ ] 모든 필수 필드 유효성 검사
- [ ] API 연동 정상 작동
- [ ] 에러 메시지 표시

### 공개 사이트 검증
- [ ] API에서 데이터 동적 로드
- [ ] 로딩 상태 표시
- [ ] 필터/검색 기능 작동
- [ ] 지도 표시 정상
- [ ] 반응형 디자인 작동

### 데이터 동기화 검증
- [ ] 어드민 등록 → 공개 사이트 표시
- [ ] 어드민 수정 → 공개 사이트 반영
- [ ] 어드민 삭제 → 공개 사이트 제거
- [ ] 상태 변경 → 공개 여부 변경

---

## 🐛 일반적인 문제 해결

### 문제: API 연결 실패
```bash
# 해결책
1. 백엔드 서버 실행 확인: npm run start:dev
2. 포트 4000 사용 가능 확인
3. NEXT_PUBLIC_API_URL 환경변수 확인
```

### 문제: Google Places 자동완성 미작동
```bash
# 해결책
1. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 확인
2. API 키 활성화 여부 확인 (Google Cloud Console)
3. 도메인 제한 설정 확인
```

### 문제: 이미지 업로드 실패
```bash
# 해결책
1. 파일 크기 확인 (5MB 이상 불가)
2. 파일 형식 확인 (이미지만 가능)
3. 서버 저장소 권한 확인
```

### 문제: 공개 사이트에서 데이터 미표시
```bash
# 해결책
1. 브라우저 콘솔의 에러 메시지 확인
2. Network 탭에서 API 응답 확인
3. 스튜디오 상태가 "활성"인지 확인
```

---

## 📝 로깅 및 모니터링

### 백엔드 로그 확인
```bash
# NestJS 서버 실행 시 로그 출력
npm run start:dev

# 주요 로그 항목:
# - Studio CRUD 작업
# - API 요청/응답
# - 데이터베이스 쿼리
```

### 어드민/공개 사이트 로그
```bash
# 브라우저 DevTools Console 확인
# 주요 로그:
# - API 요청
# - Google Maps 초기화
# - 에러 메시지
```

---

## 🎯 테스트 완료 기준

모든 테스트를 통과하면:
- ✅ 데이터 흐름 (Create → Read → Update → Delete)
- ✅ 실시간 동기화 (어드민 ↔ 공개)
- ✅ 자동화 기능 (Google Places)
- ✅ 에러 처리
- ✅ 사용자 경험

**시스템이 프로덕션 배포 준비 완료!**

