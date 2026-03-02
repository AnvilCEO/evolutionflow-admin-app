# 스튜디오 관리 시스템 - 빠른 시작 테스트 가이드

## ⚡ 5분 안에 시작하기

### Step 1: 환경 설정 확인 ✓ (완료)

모든 환경 변수가 로컬 개발용으로 설정되었습니다:

```bash
# Admin Site (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD20-pWK3FJjxbnovQkt3btEfOORLluunY

# Public Site (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD20-pWK3FJjxbnovQkt3btEfOORLluunY
```

### Step 2: 백엔드 데이터베이스 마이그레이션

```bash
cd evolutionflow-dev-api_Cloude

# 데이터베이스 마이그레이션 (스키마 업데이트)
npx prisma migrate dev --name add_studio_enhancements

# Prisma 클라이언트 재생성
npx prisma generate
```

### Step 3: 백엔드 서버 시작 (터미널 1)

```bash
cd evolutionflow-dev-api_Cloude
npm run start:dev
```

✅ 확인: `http://localhost:4000/` 접속 가능
- NestJS 서버 로그 나타남

### Step 4: 어드민 사이트 시작 (터미널 2)

```bash
cd evolutionflow-dev-admin_Cloude
npm run dev
```

✅ 확인: `http://localhost:3002/admin/studios` 접속 가능

### Step 5: 공개 사이트 시작 (터미널 3)

```bash
cd evolutionflow-site-app_Cloude
npm run dev
```

✅ 확인: `http://localhost:3100/teacher/studio` 접속 가능

---

## 🧪 핵심 기능 테스트 (10분)

### 테스트 1: Google Places 주소 자동완성

1. 어드민 사이트: http://localhost:3002/admin/studios
2. "스튜디오 등록" 버튼 클릭
3. **주소 필드**에 "서울시 강남구" 입력
4. ✅ 드롭다운에서 주소 제안 나타남
5. 주소 선택
6. ✅ 위도(Latitude)/경도(Longitude) **자동으로 채워짐**

**예상 결과:**
```
Latitude: 37.XXXX
Longitude: 127.XXXX
```

---

### 테스트 2: 이미지 업로드

1. 같은 등록 폼에서 아래로 스크롤
2. **스튜디오 소개 이미지** 섹션 찾기
3. 이미지 파일 선택 (JPG, PNG 등)
4. ✅ **미리보기 표시됨**
5. ❌ 이미지 제거 버튼 (×) 클릭
6. ✅ **미리보기 사라짐**

**검증:**
- ✓ 이미지만 업로드 가능 (다른 파일 거부)
- ✓ 5MB 초과 파일 거부
- ✓ 미리보기 표시/삭제 가능

---

### 테스트 3: 스튜디오 등록 및 공개 연동

#### 3.1) 스튜디오 등록

어드민에서 다음 정보로 등록:

```
스튜디오명:        "테스트 스튜디오"
스튜디오 유형:     "공인 스튜디오" (official)
국가:             "대한민국"
도시:             "서울"
주소:             "서울시 강남구 테헤란로 123" (Google Places 사용)
연락처:           "02-1234-5678"
상태:             "활성" (active)
```

✅ 저장 성공

#### 3.2) 공개 사이트 확인

공개 사이트: http://localhost:3100/teacher/studio

✅ **등록한 스튜디오가 목록에 표시됨**

- 스튜디오명 표시
- 지도에 정확한 위치에 핀 표시
- 공인/파트너/협력 구분 표시

---

### 테스트 4: 상태 변경 확인

#### 4.1) 상태를 "비활성"으로 변경

어드민에서 등록한 스튜디오 수정:
- 상태: "비활성" (inactive)
- 저장

#### 4.2) 공개 사이트 새로고침

http://localhost:3100/teacher/studio 새로고침

✅ **스튜디오가 사라짐** (활성 상태만 공개)

#### 4.3) 다시 "활성"으로 변경

어드민에서:
- 상태: "활성" (active)
- 저장

공개 사이트 새로고침

✅ **스튜디오가 다시 나타남**

---

## 🚀 Advanced Testing (선택사항)

### API 직접 테스트

```bash
# 공개 스튜디오 조회 (활성만)
curl http://localhost:4000/studios/public

# 필터링
curl "http://localhost:4000/studios/public?country=KR&city=서울"

# 어드민 전체 조회 (인증 필요)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/studios
```

---

## 🐛 문제 해결

### 문제 1: API 연결 실패
```
❌ 스튜디오 목록 조회에 실패했습니다.
```

**해결책:**
1. 백엔드 서버 실행 확인: `npm run start:dev`
2. 포트 4000 사용 가능 확인
3. 환경 변수 다시 확인: `NEXT_PUBLIC_API_URL=http://localhost:4000`

### 문제 2: Google Places 미작동
```
❌ 주소 입력 시 제안 나타나지 않음
```

**해결책:**
1. API 키 확인: `.env.local` 파일 확인
2. 브라우저 개발자 도구 → Console에서 에러 메시지 확인
3. Google Cloud Console에서 API 활성화 확인

### 문제 3: 지도 핀 미표시
```
❌ 공개 사이트에서 지도 핀 표시 안 됨
```

**해결책:**
1. API 응답에 `latitude`, `longitude` 포함 확인
2. 브라우저 Console에서 API 응답 확인: `curl http://localhost:4000/studios/public`

---

## ✅ 완료 체크리스트

- [ ] 백엔드 마이그레이션 완료
- [ ] 세 서버 모두 실행 중
- [ ] Google Places 주소 입력 작동
- [ ] 이미지 미리보기 표시
- [ ] 스튜디오 등록 성공
- [ ] 공개 사이트에서 스튜디오 표시
- [ ] 상태 변경 시 공개 여부 변경

모두 ✅ 완료하면 **시스템 준비 완료!** 🎉

---

## 📊 다음 단계

1. **더 자세한 테스트**: `/INTEGRATION_TEST_GUIDE.md` 참조
2. **필터 기능 테스트**: 공개 사이트에서 필터/검색 확인
3. **프로덕션 배포**: Vercel 배포 준비

---

## 💡 팁

### 빠른 테스트를 위한 팁

```bash
# 터미널 1: 백엔드
cd evolutionflow-dev-api_Cloude && npm run start:dev

# 터미널 2: 어드민 (새 터미널)
cd evolutionflow-dev-admin_Cloude && npm run dev

# 터미널 3: 공개 사이트 (새 터미널)
cd evolutionflow-site-app_Cloude && npm run dev

# 이제 세 서버 모두 실행 중이며 아래 주소에서 접속 가능:
# - Backend: http://localhost:4000
# - Admin: http://localhost:3002
# - Public: http://localhost:3100
```

### 데이터베이스 초기화 (필요시)

```bash
cd evolutionflow-dev-api_Cloude

# 데이터베이스 리셋 (주의: 모든 데이터 삭제)
npx prisma migrate reset --force

# 또는 마이그레이션만 실행
npx prisma migrate dev
```
