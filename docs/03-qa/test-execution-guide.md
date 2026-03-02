# Test Execution Guide - Admin Studio Management

**Version:** 1.0
**Created:** 2026-03-02
**QA Strategist Agent**

---

## Quick Start

```bash
# Install dependencies
yarn install

# Run all tests
yarn test:all

# Run unit tests only
yarn test:unit

# Run E2E tests only
yarn test:e2e
```

---

## Table of Contents

1. [Setup](#setup)
2. [Running Tests](#running-tests)
3. [Test Coverage](#test-coverage)
4. [Debugging Tests](#debugging-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Install Dependencies

```bash
yarn install
```

This installs:
- Jest + React Testing Library (unit/integration tests)
- Playwright (E2E tests)
- TypeScript support
- Testing utilities

### 2. Install Playwright Browsers

```bash
npx playwright install
```

Downloads browser binaries for:
- Chromium
- Firefox
- WebKit

### 3. Verify Setup

```bash
# Type check
yarn type-check

# Lint check
yarn lint

# Run sample test
yarn test -- --version
```

---

## Running Tests

### Unit Tests

**Run all unit tests:**
```bash
yarn test:unit
```

**Run specific test file:**
```bash
yarn test StudioForm.test.tsx
```

**Run tests in watch mode:**
```bash
yarn test:watch
```

**Run with coverage:**
```bash
yarn test:coverage
```

**Example output:**
```
 PASS  src/__tests__/unit/components/StudioForm.test.tsx
  StudioForm - Rendering
    ✓ should render create mode form with empty fields (123ms)
    ✓ should render edit mode form with studio data (89ms)
  StudioForm - Validation
    ✓ should show error when required fields are missing (145ms)
    ✓ should show error when phone is empty (98ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.456 s
```

---

### Integration Tests

**Run all integration tests:**
```bash
yarn test:integration
```

Integration tests verify:
- Component interactions
- API client functions
- State management flows
- Error handling propagation

---

### API Tests

**Run all API tests:**
```bash
yarn test:api
```

API tests verify:
- All endpoints (GET, POST, PUT, DELETE, PATCH)
- Request validation
- Response formats
- Error responses
- Query parameters
- Pagination logic

**Example output:**
```
 PASS  src/__tests__/api/studios.api.test.ts
  GET /api/admin/studios - List Studios
    ✓ should return all studios with default pagination (45ms)
    ✓ should filter by tab (32ms)
    ✓ should filter by status (28ms)
  POST /api/admin/studios - Create Studio
    ✓ should create a new studio with valid data (67ms)
    ✓ should return 400 when required fields are missing (23ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

---

### E2E Tests

**Run all E2E tests:**
```bash
yarn test:e2e
```

**Run with UI mode (interactive):**
```bash
yarn test:e2e:ui
```

**Run specific test file:**
```bash
npx playwright test studios-crud.e2e.test.ts
```

**Run on specific browser:**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Run headed (see browser):**
```bash
npx playwright test --headed
```

**Example output:**
```
Running 15 tests using 3 workers

  ✓  1 [chromium] › studios-crud.e2e.test.ts:5:1 › Studios - List Page › should display studios list page (1.2s)
  ✓  2 [chromium] › studios-crud.e2e.test.ts:10:1 › Studios - List Page › should show tab navigation (856ms)
  ✓  3 [chromium] › studios-crud.e2e.test.ts:16:1 › Studios - Create Studio › should create studio (2.3s)

  15 passed (12.5s)

To open last HTML report run:

  npx playwright show-report
```

---

## Test Coverage

### Generate Coverage Report

```bash
yarn test:coverage
```

**Coverage output:**
```
------------------------------------|---------|----------|---------|---------|-------------------
File                                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------------------|---------|----------|---------|---------|-------------------
All files                           |   82.45 |    76.32 |   78.90 |   83.12 |
 app/admin/studios                  |   85.67 |    80.21 |   82.45 |   86.23 |
  page.tsx                          |   88.23 |    82.45 |   85.67 |   89.12 | 45-48,67
 app/admin/studios/components       |   90.12 |    85.34 |   88.76 |   91.45 |
  StudioForm.tsx                    |   92.34 |    88.45 |   90.23 |   93.12 | 87-89,123
 app/api/admin/studios              |   95.67 |    90.12 |   93.45 |   96.23 |
  route.ts                          |   96.78 |    91.23 |   94.56 |   97.34 | 67
------------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
```

### Coverage Thresholds

**Configured in `jest.config.js`:**
```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 80,
    statements: 80,
  },
}
```

**If coverage is below threshold:**
```
Jest: "global" coverage threshold for lines (80%) not met: 75.32%
```

### View HTML Coverage Report

```bash
# Generate coverage
yarn test:coverage

# Open report in browser (macOS)
open coverage/lcov-report/index.html

# Open report in browser (Linux)
xdg-open coverage/lcov-report/index.html

# Open report in browser (Windows)
start coverage/lcov-report/index.html
```

---

## Debugging Tests

### Debug Jest Tests

**Using VS Code:**
1. Set breakpoint in test file
2. Click "Debug" above test
3. Or use VS Code Jest extension

**Using Chrome DevTools:**
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open: `chrome://inspect`

**Using console.log:**
```typescript
it('should do something', () => {
  const result = doSomething();
  console.log('Result:', result); // Debug output
  expect(result).toBe(expected);
});
```

---

### Debug Playwright Tests

**Debug specific test:**
```bash
yarn test:e2e:debug
```

**Debug with Playwright Inspector:**
```bash
npx playwright test --debug
```

**Pause on failure:**
```bash
npx playwright test --headed --pause-on-failure
```

**Generate trace:**
```bash
npx playwright test --trace on
```

**View trace:**
```bash
npx playwright show-trace trace.zip
```

**Screenshot on failure:**

Already configured in `playwright.config.ts`:
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

Screenshots saved to: `test-results/`

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull request to `main` or `develop`
- Manual workflow dispatch

**Jobs:**
1. **Lint** - ESLint check
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Jest with coverage
4. **Integration Tests** - Jest
5. **API Tests** - Jest
6. **E2E Tests** - Playwright (headless)
7. **Build** - Next.js production build
8. **Quality Gate** - Coverage thresholds

**View results:**
- GitHub Actions tab in repository
- PR check status
- Coverage report artifacts

**Quality Gates:**
```yaml
# Fail if coverage below:
- Lines: 80%
- Statements: 80%
- Functions: 70%
- Branches: 70%
```

---

## Troubleshooting

### Common Issues

#### 1. Jest: Cannot find module '@/...'

**Solution:**
```bash
# Verify tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Verify jest.config.js moduleNameMapper
{
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
}
```

#### 2. Playwright: Browsers not installed

**Solution:**
```bash
npx playwright install
```

#### 3. Playwright: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
E2E_BASE_URL=http://localhost:3001 yarn test:e2e
```

#### 4. Jest: Out of memory

**Solution:**
```bash
# Increase Node.js memory
NODE_OPTIONS=--max_old_space_size=4096 yarn test

# Or reduce workers
yarn test --maxWorkers=2
```

#### 5. Tests failing randomly

**Potential causes:**
- Race conditions
- Async timing issues
- Test data pollution

**Solutions:**
```typescript
// Use waitFor for async assertions
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  // Clear test data
});

// Use unique IDs for test data
const testId = `test_${Date.now()}_${Math.random()}`;
```

#### 6. Playwright: Test timeout

**Solution:**
```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds

  // ... test code
});

// Or in playwright.config.ts
{
  timeout: 30000, // 30 seconds
}
```

---

## Test Data Management

### Fixtures Location

```
src/__tests__/fixtures/
├── studios.fixture.ts       # Studio test data
├── masters.fixture.ts       # Master data (countries, cities, regions)
└── users.fixture.ts         # User/admin data
```

### Using Fixtures

```typescript
import { createMockStudio, generateMockStudios } from '@/__tests__/fixtures/studios.fixture';

// Create single studio
const studio = createMockStudio({
  name: 'Test Studio',
  tab: 'official',
});

// Generate multiple studios
const studios = generateMockStudios(20, {
  tab: 'partner',
  status: 'active',
});
```

---

## Performance Tips

### Speed up Jest

```bash
# Run tests in parallel (default)
yarn test

# Limit workers for CI
yarn test --maxWorkers=2

# Run only changed files
yarn test --onlyChanged

# Bail after first failure
yarn test --bail
```

### Speed up Playwright

```bash
# Run in parallel
npx playwright test --workers=4

# Run specific browser only
npx playwright test --project=chromium

# Skip slow tests in dev
npx playwright test --grep-invert @slow
```

---

## Best Practices

### 1. Write Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should create studio when valid data is provided', () => { ... });
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should filter studios by tab', async () => {
  // Arrange
  const studios = generateMockStudios(10);

  // Act
  const filtered = filterByTab(studios, 'official');

  // Assert
  expect(filtered).toHaveLength(5);
  filtered.forEach(s => expect(s.tab).toBe('official'));
});
```

### 3. Test One Thing at a Time

```typescript
// ❌ Bad - Tests multiple things
it('should create and update studio', () => {
  const created = createStudio(data);
  expect(created).toBeDefined();

  const updated = updateStudio(created.id, newData);
  expect(updated.name).toBe(newData.name);
});

// ✅ Good - Separate tests
it('should create studio', () => { ... });
it('should update studio', () => { ... });
```

### 4. Use data-testid for E2E

```tsx
// Component
<button data-testid="create-studio-btn">Create</button>

// Test
await page.getByTestId('create-studio-btn').click();
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup(); // React Testing Library
  // Clear database/state
});
```

---

## Continuous Improvement

### Monitor Test Health

```bash
# Check test duration
yarn test --verbose

# Identify slow tests
yarn test --listTests --verbose | grep "slow"

# Check flaky tests
# Re-run failed tests
yarn test --onlyFailures
```

### Update Test Strategy

After each PDCA iteration:
1. Review failed tests
2. Identify gaps in coverage
3. Add new test scenarios
4. Refactor brittle tests
5. Update fixtures

---

## References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Test Strategy Document](/docs/03-qa/admin-studios-test-strategy.md)
- [Zero Script QA Guide](/docs/03-qa/zero-script-qa-guide.md)

---

**Document Owner:** QA Strategist Agent
**Last Updated:** 2026-03-02
**Next Review:** After each PDCA cycle
