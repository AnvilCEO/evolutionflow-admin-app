# UI/UX Improvement Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for improving the admin studio management system UI/UX.

## Current State Analysis

### Existing Components

1. **Pages:**
   - `/src/app/admin/studios/page.tsx` - List page with tabs, filters, pagination
   - `/src/app/admin/studios/new/page.tsx` - Create form page
   - `/src/app/admin/studios/[id]/page.tsx` - Detail/edit page

2. **Components:**
   - `StudioForm.tsx` - Complex form with multiple sections
   - `StatusBadge.tsx` - Status indicator (improved with animated dot)
   - `ActionMenu.tsx` - Dropdown menu for actions
   - `AdminTable.tsx` - Data table component
   - `LoadingSpinner.tsx` - Loading indicator

3. **Styling:**
   - Tailwind CSS with inline classes
   - Basic responsive design (md: breakpoint)
   - Inconsistent spacing and colors

## Phase 1: Design System Foundation (Completed)

### Files Created

1. `/src/styles/design-tokens.css` - Complete design token system
2. `/src/components/ui/Button.tsx` - Enhanced button component (exists)
3. `/src/components/ui/Input.tsx` - New input component with validation
4. `/src/components/ui/Card.tsx` - New card container component
5. `/src/components/ui/Toast.tsx` - Toast notification component
6. `/src/components/ui/ToastContainer.tsx` - Toast container
7. `/src/hooks/useToast.tsx` - Toast management hook
8. `/docs/02-design/design-system.md` - Complete documentation

### Updated Files

1. `/src/app/globals.css` - Import design tokens
2. `/src/app/admin/components/StatusBadge.tsx` - Enhanced with dot indicator

## Phase 2: Page-by-Page Improvements

### 2.1 Studios List Page (`/src/app/admin/studios/page.tsx`)

**Current Issues:**
- Basic button styling
- Inconsistent spacing
- No loading skeleton
- Alert() for errors instead of toast
- Basic pagination UI

**Improvements Needed:**

#### File: `/Users/beejayjung/Dev/EvolutionflowKorea/evolutionflow-dev-admin_Cloude/src/app/admin/studios/page.tsx`

1. **Import New Components:**
```tsx
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";
```

2. **Replace Header Section (Lines 262-273):**
```tsx
// Current:
<div className="flex justify-between items-center">
  <div>
    <h1 className="font-pretendard text-3xl font-bold text-black">스튜디오 관리</h1>
    <p className="font-pretendard mt-2 text-gray-600">...</p>
  </div>
  <Link href="/admin/studios/new" className="rounded-md bg-black px-4 py-2...">
    <span>+</span> 스튜디오 등록
  </Link>
</div>

// Replace with:
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">스튜디오 관리</h1>
    <p className="mt-1 text-sm text-gray-600">
      Evolutionflow의 모든 오프라인 스튜디오와 시설 상태를 관리합니다.
    </p>
  </div>
  <Link href="/admin/studios/new">
    <Button
      variant="primary"
      size="md"
      leftIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      }
    >
      스튜디오 등록
    </Button>
  </Link>
</div>
```

3. **Replace Tabs (Lines 276-298):**
```tsx
// Add better visual styling with hover effects and transitions
<div className="border-b border-gray-200">
  <nav className="-mb-px flex gap-6" aria-label="스튜디오 분류">
    {(["official", "partner", "associated"] as const).map((tab) => (
      <button
        key={tab}
        onClick={() => {
          setActiveTab(tab);
          // ... reset filters
        }}
        className={`
          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
          ${
            activeTab === tab
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }
        `}
        aria-current={activeTab === tab ? "page" : undefined}
      >
        {tabLabels[tab]}
        {/* Optional: Add count badge */}
        {total > 0 && activeTab === tab && (
          <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {total}
          </span>
        )}
      </button>
    ))}
  </nav>
</div>
```

4. **Replace Filters Section (Lines 301-391):**
```tsx
<Card variant="default" padding="md">
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
    <Input
      label="검색"
      placeholder="지점명, 위치로 검색..."
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        setPage(1);
      }}
      leftIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
    />

    {/* Country Select */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">국가</label>
      <select
        value={countryFilter}
        onChange={(e) => {
          setCountryFilter(e.target.value as "KR" | "CN" | "");
          setPage(1);
        }}
        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
      >
        <option value="">전체</option>
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>

    {/* City Select */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">도시</label>
      <select
        value={cityFilter}
        onChange={(e) => {
          setCityFilter(e.target.value);
          setPage(1);
        }}
        disabled={!countryFilter}
        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
      >
        <option value="">전체</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </div>

    {/* Region Select */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">지역</label>
      <select
        value={regionFilter}
        onChange={(e) => {
          setRegionFilter(e.target.value);
          setPage(1);
        }}
        disabled={!cityFilter}
        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
      >
        <option value="">전체</option>
        {regions.map((region) => (
          <option key={region.id} value={region.name}>
            {region.name}
          </option>
        ))}
      </select>
    </div>

    {/* Status Select */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">상태</label>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value as AdminStudioStatus | "");
          setPage(1);
        }}
        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
      >
        <option value="">전체 상태</option>
        <option value="active">운영 중</option>
        <option value="inactive">운영 중지</option>
        <option value="maintenance">점검 중</option>
      </select>
    </div>
  </div>

  {/* Reset Button */}
  <div className="mt-4 flex justify-end">
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setSearchQuery("");
        setStatusFilter("");
        setCountryFilter("");
        setCityFilter("");
        setRegionFilter("");
        setPage(1);
      }}
    >
      필터 초기화
    </Button>
  </div>
</Card>
```

5. **Replace Error Display (Lines 408-410) with Toast:**
```tsx
// In useEffect or error handlers:
const toast = useToast();

// Replace alert/error div with:
useEffect(() => {
  if (error) {
    toast.error(error);
  }
}, [error]);
```

6. **Improve Pagination (Lines 427-447):**
```tsx
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
  <p className="text-sm text-gray-600">
    <span className="font-medium">{total}개</span> 지점 중{" "}
    <span className="font-medium">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}</span>개 표시
  </p>

  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage(Math.max(1, page - 1))}
      disabled={page === 1}
      leftIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      }
    >
      이전
    </Button>

    <span className="text-sm text-gray-700 px-3">
      페이지 <span className="font-medium">{page}</span> / <span className="font-medium">{Math.ceil(total / pageSize)}</span>
    </span>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage(page + 1)}
      disabled={page * pageSize >= total}
      rightIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      }
    >
      다음
    </Button>
  </div>
</div>
```

### 2.2 Studio Create Page (`/src/app/admin/studios/new/page.tsx`)

**Improvements Needed:**

#### File: `/Users/beejayjung/Dev/EvolutionflowKorea/evolutionflow-dev-admin_Cloude/src/app/admin/studios/new/page.tsx`

1. **Replace alert() with Toast (Lines 25, 28):**
```tsx
import { useToast } from "@/hooks/useToast";

// In component:
const toast = useToast();

// Replace:
alert("스튜디오가 등록되었습니다.");
// With:
toast.success("스튜디오가 등록되었습니다.");

// Replace:
alert("등록에 실패했습니다.");
// With:
toast.error(errorMsg || "등록에 실패했습니다.");
```

2. **Improve Header (Lines 45-48):**
```tsx
<div className="mb-6">
  <h1 className="text-3xl font-bold text-gray-900">신규 스튜디오 등록</h1>
  <p className="mt-1 text-sm text-gray-600">
    새로운 스튜디오 정보를 입력하세요. <span className="text-red-500">*</span> 표시는 필수 항목입니다.
  </p>
</div>
```

3. **Wrap Form in Card (Lines 51-53):**
```tsx
import Card from "@/components/ui/Card";

<Card variant="elevated" padding="lg">
  <StudioForm isLoading={isLoading} onSubmit={handleSubmit} onCancel={handleCancel} />
</Card>
```

### 2.3 Studio Detail/Edit Page (`/src/app/admin/studios/[id]/page.tsx`)

**Improvements Needed:**

#### File: `/Users/beejayjung/Dev/EvolutionflowKorea/evolutionflow-dev-admin_Cloude/src/app/admin/studios/[id]/page.tsx`

1. **Replace alert() with Toast:**
```tsx
import { useToast } from "@/hooks/useToast";

const toast = useToast();

// Replace all alert() calls:
toast.success("스튜디오 정보가 저장되었습니다.");
toast.success("스튜디오가 삭제되었습니다.");
```

2. **Improve Delete Modal (Lines 143-169):**
```tsx
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <Card variant="elevated" padding="lg" className="max-w-md w-full">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">스튜디오 삭제</h3>
        </div>

        <p className="text-gray-600">
          <span className="font-semibold">{studio.name}</span>을(를) 삭제하시겠습니까?
        </p>
        <p className="text-sm text-red-600">
          이 작업은 되돌릴 수 없습니다.
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            삭제
          </Button>
        </div>
      </div>
    </Card>
  </div>
)}
```

### 2.4 Studio Form Component (`/src/app/admin/studios/components/StudioForm.tsx`)

**Major Improvements Needed:**

#### File: `/Users/beejayjung/Dev/EvolutionflowKorea/evolutionflow-dev-admin_Cloude/src/app/admin/studios/components/StudioForm.tsx`

1. **Replace All Input Fields with Input Component:**
```tsx
import Input from "@/components/ui/Input";

// Example for Studio Name (Lines 184-195):
<Input
  label="스튜디오명"
  isRequired
  placeholder="예: 강남 A스튜디오"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  error={error && !formData.name.trim() ? "스튜디오명을 입력해주세요" : undefined}
  fullWidth
/>
```

2. **Wrap Sections in Card Components:**
```tsx
// Basic Info Section (Lines 179-294):
<Card variant="default" padding="md" header={<h3 className="text-lg font-bold">기본 정보</h3>}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Inputs */}
  </div>
</Card>

// Repeat for Contact Info, Facility Info, Location Info sections
```

3. **Improve Buttons (Lines 524-540):**
```tsx
import Button from "@/components/ui/Button";

<div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-gray-200">
  <Button
    variant="outline"
    onClick={onCancel}
    disabled={submitting || isLoading}
  >
    취소
  </Button>

  <Button
    type="submit"
    variant="primary"
    isLoading={submitting || isLoading}
    disabled={submitting || isLoading}
  >
    저장
  </Button>
</div>
```

4. **Add Form-Level Validation:**
```tsx
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

// Validate on submit:
const validateForm = () => {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = "스튜디오명을 입력해주세요";
  }

  if (!formData.phone.trim()) {
    errors.phone = "연락처를 입력해주세요";
  }

  if (!formData.address.trim()) {
    errors.address = "주소를 입력해주세요";
  }

  if (formData.lat === 0 || formData.lng === 0) {
    errors.location = "위도/경도를 입력해주세요";
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

## Phase 3: Add ToastContainer to Layout

### File: `/Users/beejayjung/Dev/EvolutionflowKorea/evolutionflow-dev-admin_Cloude/src/app/admin/layout.tsx`

Add ToastContainer to the admin layout:

```tsx
import ToastContainer from "@/components/ui/ToastContainer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Existing layout */}
      {children}

      {/* Add ToastContainer */}
      <ToastContainer />
    </div>
  );
}
```

## Phase 4: Responsive Optimizations

### Mobile View (<768px)

1. **Stack filters vertically**
2. **Full-width buttons**
3. **Collapsible sections in forms**
4. **Simplified table view (card-based)**

### Tablet View (768px - 1024px)

1. **2-column grid for filters**
2. **2-column form layout**
3. **Full table with horizontal scroll**

### Desktop View (>1024px)

1. **Multi-column layouts**
2. **Side-by-side actions**
3. **Expanded table view**

## Phase 5: Loading States & Animations

### Skeleton Screens

Create skeleton loading for table rows:

```tsx
// src/components/ui/Skeleton.tsx
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="h-12 bg-gray-200 rounded flex-1" />
        </div>
      ))}
    </div>
  );
}
```

### Transition Classes

Add to components:
```tsx
className="transition-all duration-200 hover:shadow-md"
```

## Implementation Priority

### High Priority (Week 1)
1. Add ToastContainer to layout
2. Replace all alert() with toast notifications
3. Update StatusBadge with animated dots
4. Improve button styling with Button component

### Medium Priority (Week 2)
5. Refactor StudioForm with Input/Card components
6. Improve pagination UI
7. Enhance filter section
8. Add loading states

### Low Priority (Week 3)
9. Add skeleton loading screens
10. Improve responsive layouts
11. Add animations and transitions
12. Accessibility improvements

## Testing Checklist

- [ ] Test all forms on mobile devices
- [ ] Verify keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify color contrast ratios
- [ ] Test loading states
- [ ] Test error handling with toasts
- [ ] Verify responsive breakpoints
- [ ] Test touch targets (minimum 44px)

## Success Metrics

1. **Visual Consistency:** All components use design system
2. **Accessibility:** WCAG 2.1 AA compliance
3. **Responsive:** Works on all screen sizes
4. **Performance:** Smooth animations (<300ms)
5. **User Feedback:** Toast notifications for all operations
6. **Error Handling:** Clear, field-level validation
