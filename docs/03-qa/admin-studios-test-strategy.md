# Admin Studio Management System - Test Strategy

**Version:** 1.0
**Created:** 2026-03-02
**Last Updated:** 2026-03-02
**Status:** PDCA Check Phase - QA Strategist

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Test Scope](#test-scope)
4. [Test Levels](#test-levels)
5. [Test Scenarios Matrix](#test-scenarios-matrix)
6. [Test Data Strategy](#test-data-strategy)
7. [Test Coverage Targets](#test-coverage-targets)
8. [Zero Script QA Integration](#zero-script-qa-integration)
9. [Quality Metrics](#quality-metrics)
10. [Risk Assessment](#risk-assessment)
11. [Test Execution Plan](#test-execution-plan)

---

## Executive Summary

This document outlines the comprehensive QA strategy for the Admin Studio Management System. The strategy employs a multi-layered testing approach combining:

- **Unit Tests** (Jest + React Testing Library) - Component isolation and validation logic
- **Integration Tests** - Component interactions and API client functions
- **E2E Tests** (Playwright) - Complete user workflows
- **API Tests** - RESTful endpoint validation
- **Zero Script QA** - Docker log-based runtime verification

**Target Match Rate:** 90%+
**Critical Quality Threshold:** 0 Critical Issues
**Code Quality Score:** 70/100 minimum

---

## System Overview

### Feature: Admin Studio Management CRUD

**Technology Stack:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

**Architecture:**
- Pages: 3 (List, Create, Detail/Edit)
- API Routes: 6 endpoints
- Master Data: 4 endpoints
- Components: StudioForm, Filters, Table, Modals

**API Endpoints:**
1. `GET /api/admin/studios` - List with filters, sorting, pagination
2. `GET /api/admin/studios/:id` - Get specific studio
3. `POST /api/admin/studios` - Create new studio
4. `PUT /api/admin/studios/:id` - Update studio
5. `DELETE /api/admin/studios/:id` - Delete studio
6. `PATCH /api/admin/studios/:id/status` - Update status
7. `GET /api/admin/masters/countries` - Get countries
8. `GET /api/admin/masters/cities` - Get cities
9. `GET /api/admin/masters/regions` - Get regions
10. `POST /api/admin/masters/extract-location` - Address auto-extraction

---

## Test Scope

### In Scope

**Functional Testing:**
- CRUD operations (Create, Read, Update, Delete)
- Form validation
- Filter and search functionality
- Sorting and pagination
- Status changes
- Address auto-extraction
- Master data dependent dropdowns

**Non-Functional Testing:**
- Performance (response times < 1000ms)
- Security (input validation, XSS prevention)
- Accessibility (WCAG 2.1 Level AA)
- Responsive design (mobile, tablet, desktop)
- Error handling

### Out of Scope

- Backend database integration (mocked in-memory)
- Authentication/Authorization (assumed handled by middleware)
- File upload functionality
- Real-time synchronization
- Load testing (to be added in Phase 9)

---

## Test Levels

### 1. Unit Tests (Jest + React Testing Library)

**Target Coverage:** 80%+

**Focus Areas:**
- Individual React components
- Form validation logic
- Data transformations
- Utility functions
- Type safety

**Example Components to Test:**
- `StudioForm.tsx`
- `StatusBadge.tsx`
- `FilterBar.tsx`
- `Pagination.tsx`

**Test File Location:** `src/__tests__/unit/`

---

### 2. Integration Tests

**Target Coverage:** Key integration points

**Focus Areas:**
- Component interactions
- Form submission flow
- API client functions
- State management
- Error handling propagation

**Test File Location:** `src/__tests__/integration/`

---

### 3. E2E Tests (Playwright)

**Target Coverage:** Critical user paths

**Focus Areas:**
- Complete CRUD workflows
- Multi-page navigation
- Form interactions
- Filter combinations
- Error scenarios

**Test File Location:** `e2e/`

---

### 4. API Tests

**Target Coverage:** All endpoints

**Focus Areas:**
- Request/response validation
- Status codes
- Error responses
- Query parameter handling
- Pagination logic

**Test File Location:** `src/__tests__/api/`

---

## Test Scenarios Matrix

### Create Studio

| # | Scenario | Type | Priority | Expected Result |
|---|----------|------|----------|-----------------|
| TC-001 | Create with minimum required fields | E2E | Critical | Studio created successfully |
| TC-002 | Create with all fields including amenities | E2E | High | Studio created with all data |
| TC-003 | Address auto-extraction success | Integration | High | City/region auto-populated |
| TC-004 | Validation: Missing required fields | Unit | Critical | Form shows validation errors |
| TC-005 | Validation: Invalid phone format | Unit | Medium | Phone validation error shown |
| TC-006 | Validation: Invalid email format | Unit | Medium | Email validation error shown |
| TC-007 | Validation: Lat/Lng = 0 | Unit | High | Coordinates validation error |
| TC-008 | API: Duplicate studio prevention | API | Medium | 400 error returned |

---

### List & Filter

| # | Scenario | Type | Priority | Expected Result |
|---|----------|------|----------|-----------------|
| TC-101 | List all studios with pagination | E2E | Critical | Studios displayed with pagination |
| TC-102 | Tab filtering (official/partner/associated) | E2E | Critical | Filtered results by tab |
| TC-103 | Search by name | E2E | High | Matching studios displayed |
| TC-104 | Search by address | E2E | High | Matching studios displayed |
| TC-105 | Search by manager name | E2E | Medium | Matching studios displayed |
| TC-106 | Filter by status | E2E | High | Filtered results by status |
| TC-107 | Filter by country | E2E | High | Filtered results by country |
| TC-108 | Filter by city | E2E | High | Filtered results by city |
| TC-109 | Filter by region | E2E | Medium | Filtered results by region |
| TC-110 | Combine multiple filters | E2E | High | AND logic applied correctly |
| TC-111 | Sort by name (asc/desc) | E2E | Medium | Correct sort order |
| TC-112 | Sort by updated date | E2E | High | Recently updated first |
| TC-113 | Pagination: Next page | E2E | Critical | Page 2 displayed |
| TC-114 | Pagination: Previous page | E2E | Critical | Page 1 displayed |
| TC-115 | Pagination: Change page size | E2E | Medium | Correct number of items |

---

### Edit Studio

| # | Scenario | Type | Priority | Expected Result |
|---|----------|------|----------|-----------------|
| TC-201 | Load studio details | E2E | Critical | Form populated with data |
| TC-202 | Update studio name | E2E | High | Name updated successfully |
| TC-203 | Update contact information | E2E | High | Contact info updated |
| TC-204 | Change amenities selection | E2E | Medium | Amenities updated |
| TC-205 | Change country (cascading reset) | Integration | High | City/region cleared |
| TC-206 | Change city (region reset) | Integration | High | Region cleared |
| TC-207 | Validation during edit | Unit | High | Validation errors shown |
| TC-208 | Cancel edit (no changes saved) | E2E | Medium | Original data preserved |

---

### Status Changes

| # | Scenario | Type | Priority | Expected Result |
|---|----------|------|----------|-----------------|
| TC-301 | Change active → inactive | E2E | High | Status updated in DB and UI |
| TC-302 | Change inactive → active | E2E | High | Status updated in DB and UI |
| TC-303 | Change to maintenance | E2E | High | Status updated to maintenance |
| TC-304 | Verify status in list view | E2E | Medium | Badge reflects new status |
| TC-305 | Verify status in detail view | E2E | Medium | Status shown correctly |
| TC-306 | API: Status update validation | API | High | Only valid statuses accepted |

---

### Delete Studio

| # | Scenario | Type | Priority | Expected Result |
|---|----------|------|----------|-----------------|
| TC-401 | Delete confirmation dialog | E2E | Critical | Confirmation shown |
| TC-402 | Delete confirm | E2E | Critical | Studio deleted from DB |
| TC-403 | Delete cancel | E2E | High | Studio not deleted |
| TC-404 | Verify deletion in list | E2E | Critical | Studio not in list |
| TC-405 | Verify cannot retrieve deleted | API | High | 404 error returned |

---

### Error Scenarios

| # | Scenario | Type | Priority | Expected Result |
|---|----------|------|----------|-----------------|
| TC-501 | Invalid studio ID | API | High | 404 error returned |
| TC-502 | Network error handling | Integration | High | User-friendly error shown |
| TC-503 | Server error (500) | E2E | Medium | Error message displayed |
| TC-504 | Validation error response | API | High | 400 with error details |
| TC-505 | Concurrent edit conflict | Integration | Low | Conflict resolution shown |

---

## Test Data Strategy

### Test Data Requirements

**Test Studio Records:** 50+
- 20 Official studios
- 20 Partner studios
- 10 Associated studios

**Status Distribution:**
- 35 Active
- 10 Inactive
- 5 Maintenance

**Location Distribution:**
- 30 Korea (KR)
- 20 China (CN)

### Test Fixtures

**Location:** `src/__tests__/fixtures/`

**Files:**
- `studios.fixture.ts` - Mock studio data
- `masters.fixture.ts` - Countries, cities, regions
- `users.fixture.ts` - Admin users (for auth context)

### Factory Functions

**Pattern:** Factory pattern for consistent test data

```typescript
// Example
createStudio({
  name: "Test Studio",
  tab: "official",
  // ... defaults provided
})
```

**Benefits:**
- Consistency across tests
- Easy to modify
- Type-safe

---

## Test Coverage Targets

### Code Coverage Targets

| Category | Target | Threshold |
|----------|--------|-----------|
| Unit Tests | 80%+ | 70% minimum |
| Integration Tests | 60%+ | 50% minimum |
| API Tests | 100% | 90% minimum |
| Overall Coverage | 75%+ | 65% minimum |

### Functional Coverage Targets

| Feature | Target | Priority |
|---------|--------|----------|
| CRUD Operations | 100% | Critical |
| Filters & Search | 90%+ | Critical |
| Validation | 100% | Critical |
| Error Handling | 80%+ | High |
| UI Components | 70%+ | Medium |

---

## Zero Script QA Integration

### Concept

Zero Script QA verifies features through **structured logs** and **real-time monitoring** without writing test scripts.

### Implementation Strategy

#### 1. Logging Infrastructure

**JSON Log Format:**
```json
{
  "timestamp": "2026-03-02T10:30:00.000Z",
  "level": "INFO",
  "service": "api",
  "request_id": "req_abc123",
  "message": "API Request completed",
  "data": {
    "method": "POST",
    "path": "/api/admin/studios",
    "status": 200,
    "duration_ms": 45
  }
}
```

#### 2. Request ID Propagation

**Flow:**
```
Client → API Gateway → Backend → Database
   ↓         ↓           ↓          ↓
req_abc   req_abc     req_abc    req_abc
```

**Benefits:**
- Track entire request flow
- Correlate logs across services
- Debug production issues

#### 3. Docker-Based Monitoring

**Workflow:**
1. Start environment: `docker compose up -d`
2. Start log monitoring: `docker compose logs -f`
3. Manual UX testing by QA
4. Claude Code real-time log analysis
5. Auto-document issues

**Issue Detection Thresholds:**

| Severity | Condition | Action |
|----------|-----------|--------|
| Critical | `level: ERROR` or `status: 5xx` | Immediate report |
| Critical | `duration_ms > 3000` | Immediate report |
| Critical | 3+ consecutive failures | Immediate report |
| Warning | `status: 401, 403` | Warning report |
| Warning | `duration_ms > 1000` | Warning report |

#### 4. Iterative Test Cycle Pattern

**Example: 8-Cycle Process**

| Cycle | Pass Rate | Bug Found | Fix Applied |
|-------|-----------|-----------|-------------|
| 1st | 30% | API validation missing | Add validations |
| 2nd | 45% | City dropdown bug | Fix cascade logic |
| 3rd | 55% | Address extraction fail | Improve regex |
| 4th | 65% | Pagination offset | Fix calculation |
| 5th | 70% | Status update race | Add optimistic lock |
| 6th | 75% | Error handling | Improve UX |
| 7th | 82% | Minor UI issues | Polish |
| 8th | **90%** | Stable | Final QA |

**Cycle Workflow:**
1. Run manual test scenario
2. Monitor logs in real-time
3. Record pass/fail results
4. Identify root cause from logs
5. Fix code immediately
6. Document: Cycle N → Bug → Fix
7. Repeat until ≥90% pass rate

---

## Quality Metrics

### PDCA Match Rate

**Definition:** Design vs Implementation alignment

**Formula:**
```
Match Rate = (Matching Items / Total Design Items) × 100%
```

**Thresholds:**
- ≥ 90% → Proceed to Report phase
- < 90% → Trigger Act phase (pdca-iterator)
- < 70% → Major redesign needed

### Critical Issues

**Definition:** Bugs that block deployment

**Examples:**
- Security vulnerabilities
- Data corruption
- Complete feature failure
- Performance > 3 seconds

**Threshold:** 0 Critical Issues required for deployment

### Code Quality Score

**Components:**
- Code complexity (Cyclomatic)
- Code duplication
- Test coverage
- ESLint violations
- Type safety

**Threshold:** 70/100 minimum

---

## Risk Assessment

### High Risk Areas

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Form validation bypass | High | Medium | Comprehensive unit tests + E2E |
| API response inconsistency | High | Low | API contract tests |
| Cascading dropdown failure | Medium | Medium | Integration tests |
| Pagination calculation error | Medium | Low | Unit tests + edge cases |
| Status update race condition | High | Low | Concurrency tests |
| XSS via form inputs | High | Low | Security tests + sanitization |

### Testing Gaps

**Current Gaps:**
- No authentication testing (assumed external)
- No database transaction testing (in-memory)
- No concurrent user testing
- No mobile device testing (responsive only)

**Future Enhancements:**
- Add Cypress component tests
- Add visual regression tests (Percy/Chromatic)
- Add accessibility audit (axe-core)
- Add performance monitoring (Lighthouse CI)

---

## Test Execution Plan

### Phase 1: Setup (Week 1)

- [ ] Install testing dependencies (Jest, RTL, Playwright)
- [ ] Configure Jest and Playwright
- [ ] Create test fixtures and factories
- [ ] Set up CI/CD pipeline (GitHub Actions)

### Phase 2: Unit Tests (Week 1-2)

- [ ] StudioForm component tests
- [ ] Validation logic tests
- [ ] Helper function tests
- [ ] StatusBadge tests
- [ ] FilterBar tests

### Phase 3: Integration Tests (Week 2)

- [ ] Form submission flow
- [ ] API client tests
- [ ] Cascading dropdown tests
- [ ] Error handling tests

### Phase 4: API Tests (Week 2-3)

- [ ] All GET endpoint tests
- [ ] POST endpoint tests
- [ ] PUT/PATCH endpoint tests
- [ ] DELETE endpoint tests
- [ ] Error response tests

### Phase 5: E2E Tests (Week 3)

- [ ] Create studio workflow
- [ ] Edit studio workflow
- [ ] Delete studio workflow
- [ ] Filter and search workflows
- [ ] Pagination workflow

### Phase 6: Zero Script QA (Week 3-4)

- [ ] Set up Docker logging
- [ ] Implement Request ID propagation
- [ ] Create manual test scenarios
- [ ] Run iterative test cycles
- [ ] Document issues and fixes

### Phase 7: CI/CD Integration (Week 4)

- [ ] GitHub Actions workflow
- [ ] Test coverage reporting
- [ ] E2E test in CI
- [ ] Deployment gates

---

## CI/CD Integration

### GitHub Actions Workflow

**Triggers:**
- Push to main branch
- Pull request creation
- Manual workflow dispatch

**Jobs:**
1. **Lint** - ESLint check
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Jest with coverage
4. **Integration Tests** - Jest
5. **API Tests** - Jest
6. **E2E Tests** - Playwright (headless)
7. **Build** - Next.js production build
8. **Coverage Report** - Upload to Codecov

**Quality Gates:**
- Lint: 0 errors
- Type Check: Pass
- Unit Tests: ≥ 80% coverage
- E2E Tests: All critical paths pass
- Build: Success

---

## Naming Conventions

### Test Files

**Pattern:** `{ComponentName}.test.tsx` or `{feature}.test.ts`

**Examples:**
- `StudioForm.test.tsx`
- `studioApi.test.ts`
- `studios.e2e.test.ts`

### Test Suites

**Pattern:** `describe("{Component/Feature} - {Scenario}")`

**Examples:**
```typescript
describe("StudioForm - Validation", () => {
  // tests
})

describe("Studio API - Create Endpoint", () => {
  // tests
})
```

### Test Cases

**Pattern:** `it("should {expected behavior} when {condition}")`

**Examples:**
```typescript
it("should show error when required fields are missing")
it("should create studio when valid data is provided")
it("should filter by tab when tab is selected")
```

---

## Tools and Dependencies

### Testing Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.47.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.2.0",
    "msw": "^2.0.0",
    "c8": "^10.0.0"
  }
}
```

### VS Code Extensions

- Jest Runner
- Playwright Test for VS Code
- Coverage Gutters
- Error Lens

---

## Success Criteria

### Definition of Done

- [ ] All critical test scenarios pass (100%)
- [ ] Unit test coverage ≥ 80%
- [ ] Integration test coverage ≥ 60%
- [ ] API tests: 100% endpoint coverage
- [ ] E2E tests: All critical paths covered
- [ ] 0 Critical issues
- [ ] Code quality score ≥ 70/100
- [ ] PDCA Match Rate ≥ 90%
- [ ] CI/CD pipeline passing
- [ ] Zero Script QA completed with ≥ 85% pass rate

### Go/No-Go Decision

**Go Criteria:**
- All critical tests pass
- No critical issues
- Match Rate ≥ 90%
- Performance within SLA (< 1000ms)

**No-Go Criteria:**
- Any critical test fails
- Critical issues present
- Match Rate < 90%
- Security vulnerabilities

---

## References

### Internal Documents

- `/docs/01-plan/features/admin-studios.plan.md`
- `/docs/02-design/features/admin-studios.design.md`
- `/docs/CONVENTIONS.md`

### External Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [PDCA Methodology](/.bkit/skills/pdca/)

---

## Appendix

### Glossary

- **Match Rate**: Percentage of design requirements implemented correctly
- **Zero Script QA**: Log-based testing without writing test scripts
- **Critical Path**: User workflow that must work for product launch
- **Test Fixture**: Predefined test data
- **Factory Function**: Function that creates test data consistently

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-02 | QA Strategist | Initial test strategy document |

---

**Document Owner:** QA Strategist Agent
**Review Cycle:** After each PDCA iteration
**Next Review:** Before Phase 9 (Deployment)
