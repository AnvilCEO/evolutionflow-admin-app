# Admin Studio Management - Quick Reference Guide

## Feature Overview

The Admin Studio Management system provides complete CRUD operations for managing studio information across the Evolutionflow platform. Supports 3 studio types (official/partner/associated), hierarchical location filtering, and address auto-extraction.

**Status**: ✅ Production Ready (v1.0.0)
**Design Match**: 92% (exceeds 90% target)
**Test Coverage**: Manual ✅ | Automated ⏳

---

## Quick Links

| Resource | Link | Purpose |
|----------|------|---------|
| Design Doc | [ADMIN_STUDIO_MANAGEMENT.md](../02-design/ADMIN_STUDIO_MANAGEMENT.md) | Complete technical specification |
| Gap Analysis | [admin-studio-management.analysis.md](../03-qa/admin-studio-management.analysis.md) | Design vs Implementation comparison |
| Completion Report | [features/admin-studio-management-v1.0.md](./features/admin-studio-management-v1.0.md) | Full PDCA report |
| Status Report | [2026-03-02-status.md](./2026-03-02-status.md) | Current project health |
| Changelog | [changelog.md](./changelog.md) | Version history and features |

---

## API Quick Reference

### Studio CRUD Endpoints

```http
GET    /api/admin/studios          # List with filters
GET    /api/admin/studios/:id      # Get single
POST   /api/admin/studios          # Create
PUT    /api/admin/studios/:id      # Update
DELETE /api/admin/studios/:id      # Delete
PATCH  /api/admin/studios/:id/status # Update status
```

### Master Data Endpoints

```http
GET /api/admin/masters/countries    # List countries
GET /api/admin/masters/cities       # List cities (by country)
GET /api/admin/masters/regions      # List regions (by city)
POST /api/admin/masters/extract-location # Auto-extract location
GET /api/admin/masters              # Unified API (bonus)
```

### List Query Parameters

```
tab=official|partner|associated     (required)
page=1                              (default: 1)
pageSize=10                         (default: 10)
search=keyword                      (optional, multi-field)
status=active|inactive|maintenance  (optional)
country=KR|CN                       (optional)
city=KR-Seoul                       (optional)
region=강남구                        (optional)
sortKey=createdAt|name|...          (default: updatedAt)
sortDirection=asc|desc              (default: desc)
```

### Sample Requests

**List official studios in Seoul**:
```http
GET /api/admin/studios?tab=official&country=KR&city=KR-Seoul&pageSize=20
```

**Create new studio**:
```http
POST /api/admin/studios
Content-Type: application/json

{
  "name": "강남A스튜디오",
  "tab": "official",
  "country": "KR",
  "city": "KR-Seoul",
  "region": "강남구",
  "address": "서울시 강남구 테헤란로 123",
  "phone": "02-1234-5678",
  "lat": 37.4979,
  "lng": 127.0276,
  "capacity": 30,
  "managerName": "최관리",
  "amenities": ["parking", "wifi"]
}
```

**Extract location from address**:
```http
POST /api/admin/masters/extract-location
Content-Type: application/json

{
  "countryCode": "KR",
  "address": "서울시 강남구 테헤란로 123"
}

Response:
{
  "success": true,
  "data": {
    "cityId": "KR-Seoul",
    "cityName": "서울",
    "regionId": "KR-Seoul-Gangnam",
    "regionName": "강남구",
    "confidence": "high"
  }
}
```

---

## UI Pages

### Studio List (`/admin/studios`)

**Features:**
- 3 tabs: Official | Partner | Associated
- Filters: Search, Status, Country, City, Region, Sort
- Table columns: Name, Location, Manager, Phone, Capacity, Status, Actions
- Pagination: Previous/Next buttons
- Actions: View/Edit, Status change (active/inactive/maintenance), Delete

**Quick Tasks:**
- Search by studio name: Type in search box
- Filter by location: Select Country → City → Region
- Change status: Click Actions menu → Select status
- Create new: Click "+스튜디오 등록" button
- Edit details: Click Actions menu → "상세보기/수정"

### Studio Detail (`/admin/studios/[id]`)

**Sections:**
1. **기본 정보** (Basic Info)
   - Name, Type (tab), Country, City, Region, Address

2. **연락처 정보** (Contact Info)
   - Phone, SNS, Manager Name, Manager Phone, Manager Email

3. **시설 정보** (Facility Info)
   - Capacity, Operating Hours, Amenities

4. **위치 정보** (Location)
   - Latitude, Longitude, Map view

5. **추가 정보** (Meta - Edit mode only)
   - Status, Created/Updated dates and user

**Features:**
- Auto-extract address: Enter address → Click "자동추출" → Fill city/region
- Hierarchical selection: Country → City appears → Region appears
- Validation: Required fields marked with *
- Buttons: Save, Delete, Cancel

### Create New (`/admin/studios/new`)

- Same form as detail page
- All metadata fields hidden
- Status pre-set to "active"
- Submit creates new studio and redirects to list

---

## Common Tasks

### Find a Studio

```
1. Go to /admin/studios
2. Select tab: Official/Partner/Associated
3. Use search box: Type studio name or location
4. Optional: Use filters for precise location
5. Click table row to view details
```

### Create a New Studio

```
1. Click "+스튜디오 등록" button
2. Fill required fields (marked with *)
3. For address: Enter full address → Click "자동추출"
4. Verify auto-extracted city/region, adjust if needed
5. Fill optional fields (amenities, manager info, etc.)
6. Click "저장" to create
7. Confirm success message and redirect to list
```

### Edit Existing Studio

```
1. Find studio in list
2. Click Actions menu → "상세보기/수정"
3. Modify desired fields
4. Click "저장" to update
5. Confirm success message
```

### Delete a Studio

```
1. Find studio in list
2. Click Actions menu → Scroll to find delete option
3. OR: Click "상세보기/수정" → Click "삭제" button
4. Confirm in dialog: "이 작업은 되돌릴 수 없습니다"
5. Studio is permanently deleted
```

### Change Studio Status

**Quick method (from list):**
```
1. Find studio
2. Click Actions menu
3. Select status: "운영 재개" / "운영 중지" / "점검 모드 전환"
4. UI updates immediately
```

**Alternative (from detail page):**
```
1. Navigate to detail page
2. Status field shows current status (read-only in v1.0)
3. Use list page for quick status change
```

### Filter by Location

```
1. Click "국가" dropdown → Select country (KR or CN)
2. Click "도시" dropdown (now enabled) → Select city
3. Click "지역" dropdown (now enabled) → Select region
4. List auto-updates with filtered results
5. Click "초기화" to reset all filters
```

---

## Data Models

### Studio Record

```typescript
{
  id: string,                          // Auto-generated UUID
  tab: "official" | "partner" | "associated",
  name: string,                        // Studio name
  country: "KR" | "CN",
  city: string,                        // City ID from master data
  region: string,                      // Region name
  address: string,                     // Full address
  phone: string,                       // Main phone
  social?: string,                     // SNS info
  lat: number,                         // Latitude
  lng: number,                         // Longitude

  // Admin fields
  managerName?: string,
  managerPhone?: string,
  managerEmail?: string,
  capacity?: number,                   // Capacity in people
  status: "active" | "inactive" | "maintenance",
  description?: string,
  operatingHours?: string,
  amenities?: string[],                // e.g., ["parking", "wifi", "locker"]

  // Metadata
  createdAt: string,                   // ISO 8601
  updatedAt: string,
  createdBy: string,                   // User ID
  updatedBy: string,
}
```

### Master Data

**Countries**: KR (South Korea), CN (China)

**Cities (Sample)**:
- KR: Seoul, Busan, Daegu, Daejeon, Gwangju, Ulsan, Incheon, Sejong, Gyeonggi, ...
- CN: Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, Hangzhou

**Regions (Sample)**:
- Seoul: Gangnam, Gangbuk, Seocho, Mapo, Jongno, Jung, Dongdaemun, ...
- Beijing: Chaoyang, Haidian, Fengtai, Xicheng, Dongcheng, ...

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| List shows no studios | Tab filtering active | Switch tabs or check filters |
| Can't select city | Country not selected | Select country first |
| Address extraction fails | Address format incorrect | Check address follows "City Province District Address" pattern |
| Changes not saved | Form validation error | Check required fields (marked *) |
| Status change reverted | API error occurred | Check network, try again |
| API returns 401 | Not authenticated | Login to get valid token |

### Debug Checklist

- [ ] Are you logged in? (Check AuthContext)
- [ ] Is the tab selected? (Official/Partner/Associated)
- [ ] Are filters reset? (Click "초기화")
- [ ] Is the country selected? (Required for city/region)
- [ ] Is network connected? (Check browser console)
- [ ] Are form fields valid? (Check for red error messages)

---

## Known Limitations (v1.0.0)

| Limitation | Workaround | Planned Fix |
|------------|-----------|------------|
| Amenities as text input | Copy/paste array format: ["parking", "wifi"] | v1.1: Add checkbox UI |
| No status dropdown in edit form | Use Actions menu on list page | v1.1: Add to form |
| Filter persists on tab change | Click "초기화" after switching tabs | v1.0.1: Auto-reset |
| No bulk operations | Edit studios individually | v1.2+: Add bulk feature |
| No CSV export | No workaround yet | v1.2+: Add export |
| 10 studios per page max | Increase pageSize in API call | v1.1: Make configurable |

---

## Performance Notes

- **List page load**: ~150-200ms (with 10 studios)
- **Search response**: <100ms (500ms debounce applied)
- **Address extraction**: <500ms (server), <100ms (client fallback)
- **Status update**: Instant visual + ~200ms backend
- **No N+1 queries**: Master data cached in component state

---

## Security Notes

- All endpoints require valid auth token
- Input validation on form submission
- Address extraction is read-only operation
- Delete requires confirmation dialog
- No sensitive data in API responses
- CORS configured for admin routes only

---

## Environment Variables

```env
# Currently hardcoded, will be extracted:
NEXT_PUBLIC_API_BASE=http://localhost:3000

# Auth provided by:
AUTH_TOKEN=from AuthContext (JWT)
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Type Definitions | `src/types/studio.ts`, `src/types/master.ts` |
| API Functions | `src/lib/api/admin/studios.ts`, `src/lib/api/admin/masters.ts` |
| API Routes | `src/app/api/admin/studios/*`, `src/app/api/admin/masters/*` |
| Pages | `src/app/admin/studios/` (page.tsx, [id]/page.tsx, new/page.tsx) |
| Components | `src/app/admin/studios/components/StudioForm.tsx` |
| Master Data | `src/lib/data/masterData.ts` |
| Docs | `docs/02-design/`, `docs/03-qa/`, `docs/04-report/` |

---

## Support & Issues

**For bugs or questions:**
1. Check this guide first
2. Review gap analysis: [admin-studio-management.analysis.md](../03-qa/admin-studio-management.analysis.md)
3. Check design document: [ADMIN_STUDIO_MANAGEMENT.md](../02-design/ADMIN_STUDIO_MANAGEMENT.md)
4. Review completion report: [features/admin-studio-management-v1.0.md](./features/admin-studio-management-v1.0.md)

**Planned improvements:**
- See [Known Limitations](#known-limitations-v100) section
- See [v1.0.1 - v1.2+ roadmap](#ui-pages) in completion report

---

**Last Updated**: 2026-03-02
**Version**: 1.0.0
**Status**: Production Ready ✅
