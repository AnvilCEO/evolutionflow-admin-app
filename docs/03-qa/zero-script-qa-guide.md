# Zero Script QA Guide - Admin Studio Management

**Version:** 1.0
**Created:** 2026-03-02
**QA Strategist Agent**

---

## Table of Contents

1. [Overview](#overview)
2. [Zero Script QA Principles](#zero-script-qa-principles)
3. [Logging Infrastructure Setup](#logging-infrastructure-setup)
4. [Docker-Based QA Workflow](#docker-based-qa-workflow)
5. [Manual Test Scenarios](#manual-test-scenarios)
6. [Log Analysis Patterns](#log-analysis-patterns)
7. [Iterative Test Cycle](#iterative-test-cycle)
8. [Issue Documentation](#issue-documentation)

---

## Overview

Zero Script QA is a methodology that verifies features through **structured logs** and **real-time monitoring** without writing test scripts.

**Comparison:**

```
Traditional QA:
Write test code → Execute → Check results → Maintain

Zero Script QA:
Build log infrastructure → Manual UX test → AI log analysis → Auto issue detection
```

**Benefits:**
- No test script maintenance
- Real-time issue detection
- Complete request flow tracking
- Production-ready logging from day 1
- AI-powered log analysis

---

## Zero Script QA Principles

### 1. Log Everything

**What to log:**
- All API calls (including 200 OK)
- All errors and warnings
- Important business events
- Performance metrics (duration_ms)
- Request/response payloads (in dev)

**Example:**
```json
{
  "timestamp": "2026-03-02T10:30:00.000Z",
  "level": "INFO",
  "service": "api",
  "request_id": "req_abc123",
  "message": "Studio created successfully",
  "data": {
    "method": "POST",
    "path": "/api/admin/studios",
    "status": 201,
    "duration_ms": 45,
    "studio_id": "s1234567890"
  }
}
```

### 2. Structured JSON Logs

**Required Fields:**
- `timestamp`: ISO 8601 format
- `level`: DEBUG, INFO, WARNING, ERROR
- `service`: api, web, nginx, etc.
- `request_id`: Unique request identifier
- `message`: Human-readable description
- `data`: Additional context (optional)

### 3. Request ID Propagation

**Flow:**
```
Client → API Gateway → Backend → Database
   ↓         ↓           ↓          ↓
req_abc   req_abc     req_abc    req_abc
```

**Benefits:**
- Track entire request across services
- Correlate logs for debugging
- Identify bottlenecks

### 4. Real-time Monitoring

**Tools:**
- Docker logs: `docker compose logs -f`
- Claude Code: AI-powered log analysis
- Manual testing: Real user interactions

---

## Logging Infrastructure Setup

### Frontend Logging (Next.js)

**Logger Module:** `/src/lib/logger.ts`

```typescript
type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

interface LogData {
  request_id?: string;
  [key: string]: any;
}

function log(level: LogLevel, message: string, data?: LogData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'web',
    request_id: data?.request_id || 'N/A',
    message,
    data: data ? { ...data, request_id: undefined } : undefined,
  };

  console.log(JSON.stringify(logEntry));
}

export const logger = {
  debug: (msg: string, data?: LogData) => log('DEBUG', msg, data),
  info: (msg: string, data?: LogData) => log('INFO', msg, data),
  warning: (msg: string, data?: LogData) => log('WARNING', msg, data),
  error: (msg: string, data?: LogData) => log('ERROR', msg, data),
};
```

**API Client Integration:**

```typescript
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const requestId = `req_${uuidv4().slice(0, 8)}`;
  const startTime = Date.now();

  logger.info('API Request started', {
    request_id: requestId,
    method: options.method || 'GET',
    endpoint,
  });

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    logger.info('API Request completed', {
      request_id: requestId,
      status: response.status,
      duration_ms: duration,
    });

    if (!response.ok) {
      logger.error('API Request failed', {
        request_id: requestId,
        status: response.status,
        error: data.error,
      });
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    logger.error('API Request error', {
      request_id: requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
```

### Backend Logging (Next.js API Routes)

**Logging Middleware:**

```typescript
// middleware/logging.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function loggingMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const requestId = req.headers.get('X-Request-ID') || `req_${uuidv4().slice(0, 8)}`;
    const startTime = Date.now();

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'api',
        request_id: requestId,
        message: 'Request started',
        data: {
          method: req.method,
          path: req.nextUrl.pathname,
          query: Object.fromEntries(req.nextUrl.searchParams),
        },
      })
    );

    const response = await handler(req);

    const duration = Date.now() - startTime;

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'api',
        request_id: requestId,
        message: 'Request completed',
        data: {
          status: response.status,
          duration_ms: duration,
        },
      })
    );

    response.headers.set('X-Request-ID', requestId);
    return response;
  };
}
```

---

## Docker-Based QA Workflow

### 1. Docker Compose Configuration

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=DEBUG
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    volumes:
      - ./logs:/app/logs
```

### 2. Start Environment

```bash
# Start all services
docker compose up -d

# Verify services are running
docker compose ps
```

### 3. Start Log Monitoring

```bash
# Stream all logs
docker compose logs -f

# Stream specific service
docker compose logs -f app

# Filter by log level
docker compose logs -f | grep '"level":"ERROR"'

# Track specific request
docker compose logs -f | grep 'req_abc123'

# Filter to specific time range
docker compose logs -f --since 5m
```

### 4. Manual UX Testing

**QA performs actual feature testing:**
1. Navigate to `/admin/studios`
2. Test create studio workflow
3. Test edit studio workflow
4. Test filters and search
5. Test pagination
6. Test status changes
7. Test delete functionality

### 5. Claude Code Real-time Analysis

**While QA tests, Claude Code:**
- Monitors log stream
- Detects error patterns
- Identifies slow responses
- Tracks request flows
- Auto-documents issues

---

## Manual Test Scenarios

### Scenario 1: Create Studio

**Steps:**
1. Navigate to `/admin/studios`
2. Click "새 스튜디오" button
3. Fill required fields:
   - 스튜디오명: "QA Test Studio"
   - 스튜디오 유형: Official
   - 국가: South Korea
   - 도시: Seoul
   - 지역: Gangnam
   - 주소: "서울시 강남구 테헤란로 123"
   - 대표번호: "02-1234-5678"
   - 위도: 37.5000
   - 경도: 127.0300
4. Click "저장"
5. Verify redirect to list page
6. Verify new studio appears

**Expected Logs:**
```json
{"level":"INFO","message":"API Request started","data":{"method":"POST","endpoint":"/api/admin/studios"}}
{"level":"INFO","message":"Request started","data":{"method":"POST","path":"/api/admin/studios"}}
{"level":"INFO","message":"Studio created","data":{"studio_id":"s1234567890"}}
{"level":"INFO","message":"Request completed","data":{"status":201,"duration_ms":45}}
{"level":"INFO","message":"API Request completed","data":{"status":201,"duration_ms":50}}
```

**Pass Criteria:**
- All logs present
- Status code: 201
- duration_ms < 1000
- Studio ID generated
- No errors

---

### Scenario 2: Edit Studio

**Steps:**
1. Navigate to `/admin/studios`
2. Click on existing studio
3. Modify name: append " - Updated"
4. Click "저장"
5. Verify changes saved

**Expected Logs:**
```json
{"level":"INFO","message":"GET /api/admin/studios/s1234567890"}
{"level":"INFO","message":"Studio retrieved","data":{"studio_id":"s1234567890"}}
{"level":"INFO","message":"PUT /api/admin/studios/s1234567890"}
{"level":"INFO","message":"Studio updated","data":{"studio_id":"s1234567890"}}
```

**Pass Criteria:**
- GET request successful (200)
- PUT request successful (200)
- Updated data returned
- No errors

---

### Scenario 3: Filter Studios

**Steps:**
1. Navigate to `/admin/studios`
2. Click "파트너 스튜디오" tab
3. Enter "강남" in search
4. Select status: "운영 중"
5. Verify filtered results

**Expected Logs:**
```json
{"level":"INFO","message":"GET /api/admin/studios?tab=partner&search=강남&status=active"}
{"level":"INFO","message":"Studios filtered","data":{"count":5,"filters":{"tab":"partner","search":"강남","status":"active"}}}
```

**Pass Criteria:**
- Query parameters correct
- Results match filters
- duration_ms < 500
- No errors

---

### Scenario 4: Address Auto-Extraction

**Steps:**
1. Navigate to `/admin/studios/new`
2. Enter address: "서울시 강남구 테헤란로 123"
3. Click "자동추출"
4. Verify city and region populated

**Expected Logs:**
```json
{"level":"INFO","message":"POST /api/admin/masters/extract-location"}
{"level":"INFO","message":"Address extraction started","data":{"address":"서울시 강남구 테헤란로 123"}}
{"level":"INFO","message":"Address extracted","data":{"confidence":"high","city_id":"seoul","region_id":"gangnam"}}
```

**Pass Criteria:**
- Extraction successful
- Confidence: high or medium
- City and region IDs returned
- duration_ms < 500

---

## Log Analysis Patterns

### Error Detection

**Pattern:**
```json
{"level":"ERROR","message":"..."}
```

**Action:**
Report immediately with:
- Request ID
- Error message
- Stack trace (if available)
- User action that triggered error

---

### Slow Response Detection

**Pattern:**
```json
{"data":{"duration_ms":3000}}
```

**Thresholds:**
- ⚠️ Warning: 1000ms < duration < 3000ms
- ❌ Critical: duration ≥ 3000ms

**Action:**
- Identify bottleneck
- Check if database query is slow
- Check if external API is slow
- Recommend optimization

---

### Consecutive Failure Detection

**Pattern:**
```
3+ consecutive failures on same endpoint
```

**Example:**
```json
{"level":"ERROR","path":"/api/admin/studios","status":500}
{"level":"ERROR","path":"/api/admin/studios","status":500}
{"level":"ERROR","path":"/api/admin/studios","status":500}
```

**Action:**
Report potential system issue

---

### Abnormal Status Codes

**Critical Status Codes:**
- 500: Internal Server Error
- 503: Service Unavailable
- 504: Gateway Timeout

**Action:**
Report immediately with full context

---

## Iterative Test Cycle

### Cycle Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   Iterative Test Cycle                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cycle N:                                                   │
│  1. Run manual test scenario                                │
│  2. Claude monitors logs in real-time                       │
│  3. Record pass/fail results                                │
│  4. Claude identifies root cause of failures                │
│  5. Fix code immediately (hot reload)                       │
│  6. Document: Cycle N → Bug → Fix                           │
│                                                             │
│  Repeat until acceptable pass rate (>85%)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example: 8-Cycle Process

| Cycle | Pass Rate | Bug Found | Fix Applied |
|-------|-----------|-----------|-------------|
| 1st | 30% | Form validation missing | Add client-side validation |
| 2nd | 45% | City dropdown empty | Fix API endpoint |
| 3rd | 55% | Address extraction fails | Improve regex pattern |
| 4th | 65% | Pagination offset wrong | Fix calculation |
| 5th | 70% | Status update race condition | Add optimistic locking |
| 6th | 75% | Error messages not user-friendly | Improve UX |
| 7th | 82% | Minor UI alignment issues | Polish CSS |
| 8th | **90%** | Stable | Final QA pass |

### Cycle Documentation Template

```markdown
# Test Cycle N - Admin Studios

**Date:** YYYY-MM-DD HH:MM
**Tester:** QA Strategist
**Pass Rate:** N%
**Tests:** X passed / Y total

## Test Results

| Scenario | Status | Duration | Notes |
|----------|--------|----------|-------|
| TC-001: Create Studio | ✅ | 150ms | |
| TC-002: Edit Studio | ❌ | - | Validation error |
| TC-003: Delete Studio | ⏭️ | - | Blocked by TC-002 |

## Bugs Found

### BUG-001: Form validation bypass
- **Severity:** High
- **Request ID:** req_abc123
- **Logs:**
  ```json
  {"level":"ERROR","message":"Validation failed","data":{"field":"phone"}}
  ```
- **Root Cause:** Client-side validation missing for phone format
- **Fix:** Add regex validation `/^\d{2,3}-\d{3,4}-\d{4}$/`
- **Files:** `src/app/admin/studios/components/StudioForm.tsx:310`

## Next Cycle Plan
- Re-test TC-002 after fix
- Test TC-003 if TC-002 passes
- Add edge case tests for phone validation
```

---

## Issue Documentation

### Issue Template

```markdown
# ISSUE-001: {Title}

**Request ID:** req_abc123
**Severity:** Critical | High | Medium | Low
**Detected:** 2026-03-02 10:30:00
**Status:** Open | In Progress | Fixed | Closed

## Reproduction Steps
1. Navigate to /admin/studios/new
2. Fill form without phone number
3. Click "저장"
4. Expected: Validation error
5. Actual: Form submitted with empty phone

## Logs
```json
{"timestamp":"2026-03-02T10:30:00.000Z","level":"ERROR","request_id":"req_abc123","message":"Validation failed","data":{"field":"phone","error":"Required field missing"}}
```

## Root Cause
Client-side validation is not checking phone field before submission.

## Recommended Fix
Add validation in StudioForm:

```typescript
if (!formData.phone.trim()) {
  setError("연락처를 입력해주세요.");
  return;
}

// Add format validation
if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(formData.phone)) {
  setError("올바른 전화번호 형식이 아닙니다.");
  return;
}
```

## Files to Modify
- `src/app/admin/studios/components/StudioForm.tsx:137-140`

## Test After Fix
- TC-004: Validation - Missing phone
- TC-005: Validation - Invalid phone format
```

---

## Tools and Commands

### Docker Commands

```bash
# Start services
docker compose up -d

# View logs (real-time)
docker compose logs -f

# View logs (last 100 lines)
docker compose logs --tail=100

# View logs since timestamp
docker compose logs --since 2026-03-02T10:00:00

# View logs for specific service
docker compose logs -f app

# Filter logs by level
docker compose logs -f | grep '"level":"ERROR"'

# Search logs by request ID
docker compose logs -f | grep 'req_abc123'

# Stop services
docker compose down

# Restart specific service
docker compose restart app
```

### Log Analysis Commands

```bash
# Count errors
docker compose logs | grep '"level":"ERROR"' | wc -l

# Group errors by message
docker compose logs | grep '"level":"ERROR"' | jq -r '.message' | sort | uniq -c

# Find slow requests (>1000ms)
docker compose logs | jq 'select(.data.duration_ms > 1000)'

# Track request flow
docker compose logs | grep 'req_abc123' | jq '{timestamp, service, message, data}'

# Find most common errors
docker compose logs | grep '"level":"ERROR"' | jq -r '.message' | sort | uniq -c | sort -rn | head -10
```

---

## Success Criteria

### Zero Script QA Completion

- [ ] Logging infrastructure implemented (frontend + backend)
- [ ] Request ID propagation working
- [ ] Docker environment configured
- [ ] Manual test scenarios defined (10+)
- [ ] Completed 5+ iterative test cycles
- [ ] Pass rate ≥ 85%
- [ ] All critical issues fixed
- [ ] Issue documentation complete
- [ ] Log analysis patterns documented

### Quality Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Pass Rate | ≥ 85% | ___ % |
| Test Cycles | 5-8 | ___ |
| Critical Issues | 0 | ___ |
| Avg Response Time | < 500ms | ___ ms |
| Error Rate | < 1% | ___ % |

---

## References

- [Zero Script QA Skill](/skills/zero-script-qa/)
- [PDCA Methodology](/skills/pdca/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [JSON Logging Best Practices](https://www.loggly.com/ultimate-guide/json-logging-best-practices/)

---

**Document Owner:** QA Strategist Agent
**Next Review:** After each test cycle
**Contact:** bkit-qa-strategist
