# Testing Documentation

This document provides a comprehensive guide to the testing strategy, patterns, and conventions used in the ALPACA_ESCLUSIVI project.

## Table of Contents

- [Overview](#overview)
- [Testing Philosophy](#testing-philosophy)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)

## Overview

The ALPACA_ESCLUSIVI project follows a comprehensive testing strategy that includes:

- **Unit Tests**: Test individual components, functions, and classes in isolation
- **Integration Tests**: Test how different modules work together
- **End-to-End (E2E) Tests**: Test complete user workflows from API request to response

**Total Test Count**: 144 tests (123 backend + 21 frontend)

## Testing Philosophy

Our testing approach follows these principles:

1. **Test Behavior, Not Implementation**: Tests should validate what the code does, not how it does it
2. **Comprehensive Coverage**: All business logic should be covered by tests
3. **Fast Feedback**: Tests should run quickly to enable rapid development
4. **Clear and Maintainable**: Tests should be easy to understand and maintain
5. **Realistic Scenarios**: Tests should reflect real-world usage patterns

## Backend Testing

### Technology Stack

- **Framework**: Jest
- **Mocking**: Jest mocks
- **HTTP Testing**: Supertest
- **Language**: TypeScript

### Test Structure

```
backend/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   └── __tests__/
│   │   │       └── Alpaca.test.ts
│   │   └── services/
│   │       └── __tests__/
│   │           ├── PaymentService.test.ts
│   │           └── SecurityService.test.ts
│   ├── usecases/
│   │   └── BidOnAlpaca.ts
│   ├── presentation/
│   │   └── __tests__/
│   │       └── AlpacaController.test.ts
│   ├── __tests__/
│   │   └── e2e/
│   │       └── api.e2e.test.ts
│   └── tests/
│       └── BidOnAlpaca.test.ts
```

### Backend Test Categories

#### 1. Domain Tests (`Alpaca.test.ts`)

Tests the core business logic of the Alpaca domain entity:

- **Constructor validation**: Ensures objects are created correctly
- **Business logic**: Validates bid validation and ownership transfer
- **State management**: Tests history tracking and factory resets
- **Edge cases**: Handles special characters, large numbers, and multiple transfers

**Coverage**: 100%

#### 2. Service Tests

**PaymentService.test.ts**:
- Payment intent creation
- Payment verification
- Amount conversion to cents
- Error handling for Stripe API

**SecurityService.test.ts**:
- Password hashing
- Password verification
- Unicode and special character handling
- Security properties (salting, non-reversibility)

**Coverage**: 100%

#### 3. Use Case Tests (`BidOnAlpaca.test.ts`)

Tests the complete bidding workflow:

- **Successful bids**: Valid transfers with cooldown bypass
- **Bid validation**: Too low, equal, or missing values
- **Cooldown logic**: Time-based restrictions
- **Password security**: Hash generation and storage
- **Edge cases**: Repository errors, special characters

**Coverage**: 100%

#### 4. Controller Tests (`AlpacaController.test.ts`)

Tests the HTTP request/response handling:

- **Input validation**: Zod schema validation
- **HTTP status codes**: Correct responses for different scenarios
- **Error mapping**: Business errors to HTTP errors
- **Authentication**: Password verification for updates

**Coverage**: 100%

#### 5. E2E Tests (`api.e2e.test.ts`)

Tests complete API workflows:

- **Happy paths**: Successful bid and customization flows
- **Validation errors**: Missing fields, invalid inputs
- **Business logic errors**: Insufficient bids, cooldowns, not found
- **Authorization**: Password-protected operations
- **Complete lifecycle**: Bid → Customize → Bid again

**Test Count**: 25 tests

### Running Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/core/domain/__tests__/Alpaca.test.ts

# Run E2E tests only
npm test -- src/__tests__/e2e
```

### Backend Test Coverage

```
File                        | % Stmts | % Branch | % Funcs | % Lines
----------------------------|---------|----------|---------|--------
All files                   |   65.71 |    44.59 |   64.51 |   65.15
 Core Domain                |     100 |      100 |     100 |     100
 Core Services              |     100 |       80 |     100 |     100
 Use Cases                  |     100 |      100 |     100 |     100
 Presentation               |     100 |    88.88 |     100 |     100
 App                        |     100 |       50 |     100 |     100
```

*Note: Infrastructure layer (Prisma, PaymentGateway) is excluded as it requires database and external service mocking.*

## Frontend Testing

### Technology Stack

- **Framework**: Vitest
- **UI Testing**: React Testing Library
- **Mocking**: Vitest mocks
- **Language**: TypeScript

### Test Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── __tests__/
│   │       └── alpacaService.test.ts
│   └── tests/
│       └── setup.ts
└── vitest.config.ts
```

### Frontend Test Categories

#### 1. Service Tests (`alpacaService.test.ts`)

Tests the API client layer:

- **GET requests**: Fetching all alpacas
- **POST requests**: Placing bids with validation
- **PATCH requests**: Customizing alpacas with authentication
- **Error handling**: Network errors, HTTP errors, validation errors
- **Edge cases**: Empty responses, malformed JSON, special characters

**Coverage**: 100%
**Test Count**: 21 tests

### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Frontend Test Coverage

All service layer code is 100% covered with comprehensive tests for:
- Happy paths
- Error scenarios
- Edge cases
- Network failures

## Test Coverage

### Coverage Reports

Both backend and frontend generate coverage reports in multiple formats:

**Backend**:
- Text summary in terminal
- HTML report at `backend/coverage/lcov-report/index.html`
- JSON data at `backend/coverage/coverage-final.json`

**Frontend**:
- Text summary in terminal
- HTML report at `frontend/coverage/index.html`

### Viewing Coverage Reports

```bash
# Backend
cd backend
npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend
npm run test:coverage
open coverage/index.html
```

## Continuous Integration

### GitHub Actions Workflow

Tests are automatically run on every pull request and push to `main` or `staging` branches.

#### Backend Testing Step

```yaml
- name: Run tests
  working-directory: backend
  run: npm test -- --coverage
```

#### Frontend Testing Step

```yaml
- name: Run frontend tests
  working-directory: frontend
  run: npm test
```

### CI/CD Pipeline

1. **Test Job**: Runs all tests before deployment
2. **Build Job**: Only runs if tests pass
3. **Deploy Job**: Only runs on successful build

## Best Practices

### Writing Tests

1. **Use Descriptive Names**
   ```typescript
   it('should successfully transfer ownership when bid is higher', async () => {
     // Test implementation
   });
   ```

2. **Follow AAA Pattern**
   ```typescript
   it('should validate bid amount', () => {
     // Arrange
     const alpaca = new Alpaca(1, 'Test', 'White', AccessoryType.NONE, 100, 'Owner');
     
     // Act
     const result = alpaca.isBidValid(150);
     
     // Assert
     expect(result).toBe(true);
   });
   ```

3. **Test One Thing Per Test**
   - Each test should verify a single behavior
   - Split complex scenarios into multiple tests

4. **Use Meaningful Test Data**
   - Use realistic values that reflect production scenarios
   - Avoid magic numbers

5. **Mock External Dependencies**
   - Mock database calls
   - Mock external API calls
   - Mock payment services

6. **Test Error Paths**
   - Don't just test happy paths
   - Verify error messages and status codes

### Test Organization

1. **Group Related Tests**
   ```typescript
   describe('BidOnAlpaca', () => {
     describe('Successful Bids', () => {
       // Happy path tests
     });
     
     describe('Validation Failures', () => {
       // Error path tests
     });
   });
   ```

2. **Use beforeEach for Setup**
   ```typescript
   beforeEach(() => {
     mockRepo.reset();
     jest.clearAllMocks();
   });
   ```

3. **Keep Tests Independent**
   - Tests should not depend on execution order
   - Each test should clean up after itself

### Common Patterns

#### Mocking Fetch (Frontend)

```typescript
global.fetch = vi.fn();

(global.fetch as any).mockResolvedValueOnce({
  ok: true,
  json: async () => mockData,
});
```

#### Mocking Services (Backend)

```typescript
const mockService = {
  method: jest.fn(),
} as jest.Mocked<ServiceType>;

mockService.method.mockResolvedValue(result);
```

#### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

#### Testing Errors

```typescript
it('should throw error for invalid input', async () => {
  await expect(
    functionThatThrows()
  ).rejects.toThrow('Expected error message');
});
```

## Troubleshooting

### Common Issues

1. **Tests Timeout**
   - Increase timeout in jest/vitest config
   - Check for unresolved promises

2. **Flaky Tests**
   - Ensure tests are independent
   - Check for race conditions
   - Mock time-dependent code

3. **Coverage Not Updating**
   - Clear coverage cache: `rm -rf coverage`
   - Restart watch mode

4. **Import Errors**
   - Check tsconfig.json paths
   - Verify module resolution

## Future Improvements

- [ ] Add Playwright/Cypress for frontend E2E tests
- [ ] Implement visual regression testing
- [ ] Add performance testing
- [ ] Increase coverage thresholds
- [ ] Add mutation testing
- [ ] Implement contract testing for API

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Last Updated**: 2026-02-11
**Maintainer**: Development Team
