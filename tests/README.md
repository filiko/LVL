# Tournament Creator System Tests

This directory contains comprehensive tests for the tournament creator functionality, including unit tests, integration tests, and end-to-end tests.

## 🎯 Test Coverage

### **Tournament Creation**
- ✅ Any authenticated user can create tournaments
- ✅ 32v32 mode validation (64 max players, not 1024)
- ✅ US-specific regions (East Coast, West Coast, Midwest, South)
- ✅ Tournament creator gets admin privileges for their tournament

### **Tournament Management**
- ✅ Tournament creator can access management interface
- ✅ Registration approval/rejection workflow
- ✅ Tournament activation/deactivation
- ✅ Real-time player count updates
- ✅ Tournament deletion by creator

### **Permission System**
- ✅ Tournament creators can only manage their own tournaments
- ✅ Global admins can manage any tournament
- ✅ Non-creators cannot access management interface
- ✅ Proper error messages for unauthorized access

### **Team Management**
- ✅ Max 2 team leads per 32v32 team (Captain + Co-Leader)
- ✅ Team registration for tournaments
- ✅ Member count validation

## 📁 Test Structure

```
tests/
├── unit/
│   └── tournament-creator.test.ts     # Unit tests for core functionality
├── integration/
│   └── tournament-api.test.ts         # API endpoint tests
├── e2e/
│   └── tournament-creator-flow.cy.js  # End-to-end user flow tests
├── helpers/
│   └── tournament-test-helpers.js     # Cypress custom commands
├── run-tournament-tests.js            # Test runner script
└── README.md                          # This file
```

## 🚀 Running Tests

### **Run All Tests**
```bash
node tests/run-tournament-tests.js
```

### **Run Specific Test Suites**
```bash
# Unit tests only
node tests/run-tournament-tests.js --unit

# Integration tests only
node tests/run-tournament-tests.js --integration

# End-to-end tests only
node tests/run-tournament-tests.js --e2e
```

### **Run with npm scripts**
```bash
# Add these to your package.json scripts section:
{
  "scripts": {
    "test:unit": "vitest run tests/unit/",
    "test:integration": "vitest run tests/integration/",
    "test:e2e": "cypress run --spec tests/e2e/",
    "test:tournament": "node tests/run-tournament-tests.js"
  }
}

# Then run:
npm run test:tournament
```

## 🧪 Test Types

### **Unit Tests** (`tests/unit/tournament-creator.test.ts`)
- Tests individual functions and components
- Mocks external dependencies
- Fast execution
- Tests business logic validation

**Key Test Cases:**
- Tournament creation with valid data
- 32v32 mode player limit validation
- Tournament creator permissions
- Registration status management
- Statistics calculations

### **Integration Tests** (`tests/integration/tournament-api.test.ts`)
- Tests API endpoints
- Tests data flow between components
- Mocks database but tests real API logic

**Key Test Cases:**
- POST /api/tournaments endpoint
- PUT /api/registrations/[id] endpoint
- Authentication and authorization
- Error handling and validation

### **End-to-End Tests** (`tests/e2e/tournament-creator-flow.cy.js`)
- Tests complete user workflows
- Uses real browser automation
- Tests UI interactions and navigation

**Key Test Cases:**
- Complete tournament creation flow
- Tournament management interface
- Registration approval workflow
- Permission system validation
- Team lead limit enforcement

## 🛠️ Test Helpers

### **Cypress Custom Commands** (`tests/helpers/tournament-test-helpers.js`)

```javascript
// Create a tournament
cy.createTournament({
  title: 'Test Tournament',
  mode: '32v32',
  region: 'EAST_COAST'
});

// Create a team
cy.createTeam('Test Team', '32v32');

// Create team registration
cy.createTeamRegistration(tournamentId, 'Team Name', 32);

// Update registration status
cy.updateRegistrationStatus(registrationId, 'CONFIRMED');

// Login as user
cy.login('user@example.com', 'password');

// Assertions
cy.shouldShowTournamentManagement();
cy.shouldShowRegistrationManagement();
cy.shouldShowTournamentStats({
  totalRegistrations: 2,
  confirmedRegistrations: 1,
  playerCount: '32/64'
});
```

## 📊 Test Data

### **Test Users**
- `regular-user@test.com` - Standard user for testing
- `tournament-creator@test.com` - User who creates tournaments
- `admin@test.com` - Global admin user
- `team-captain@test.com` - Team captain for team management tests

### **Test Tournaments**
- 32v32 Battlefield tournaments
- Various regions (East Coast, West Coast, etc.)
- Different bracket types
- Test prize pools and entry fees

### **Test Teams**
- Teams with 32 members (for 32v32 mode)
- Teams with different roles (Captain, Co-Leader, Members)
- Teams with various skill levels

## 🔧 Setup Requirements

### **Dependencies**
```bash
npm install --save-dev vitest cypress @testing-library/cypress
```

### **Environment Variables**
```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
CYPRESS_BASE_URL=http://localhost:3000
```

### **Database Setup**
- Test database with same schema as production
- Test data seeding scripts
- Database cleanup between test runs

## 📈 Test Metrics

### **Performance Benchmarks**
- Tournament creation: < 2 seconds
- Registration approval: < 1 second
- Page load times: < 3 seconds
- API response times: < 500ms

### **Coverage Goals**
- Unit test coverage: > 90%
- Integration test coverage: > 80%
- E2E test coverage: > 70%

## 🐛 Debugging Tests

### **Common Issues**

1. **Authentication Failures**
   - Check test user credentials
   - Verify auth token generation
   - Ensure proper session handling

2. **Database Connection Issues**
   - Verify test database is running
   - Check connection strings
   - Ensure proper cleanup between tests

3. **API Endpoint Failures**
   - Check route handlers are properly exported
   - Verify request/response formats
   - Check middleware and authentication

4. **Cypress Test Failures**
   - Check element selectors (data-cy attributes)
   - Verify page load times
   - Check for race conditions

### **Debug Commands**
```bash
# Run tests with verbose output
npm run test:unit -- --reporter=verbose

# Run Cypress in headed mode
npx cypress open

# Run specific test file
npx vitest run tests/unit/tournament-creator.test.ts
```

## 📝 Writing New Tests

### **Unit Test Template**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### **E2E Test Template**
```javascript
describe('User Flow', () => {
  it('should complete the full workflow', () => {
    // Login
    cy.login('user@example.com', 'password');
    
    // Navigate
    cy.visit('/tournaments');
    
    // Interact
    cy.get('[data-cy="create-button"]').click();
    
    // Assert
    cy.url().should('include', '/create');
  });
});
```

## 🎯 Test Scenarios

### **Happy Path Scenarios**
1. User creates tournament → Gets management access → Approves registrations → Starts tournament
2. Team registers for tournament → Gets approved → Tournament starts
3. Admin manages any tournament → Updates settings → Monitors progress

### **Edge Cases**
1. Tournament creator tries to approve their own team registration
2. User tries to access management interface for tournament they didn't create
3. Team tries to register with too many team leads
4. Tournament reaches max capacity during registration

### **Error Scenarios**
1. Invalid tournament data submission
2. Unauthorized access attempts
3. Database connection failures
4. Network timeout scenarios

## 📋 Test Checklist

Before running tests, ensure:

- [ ] Test database is set up and accessible
- [ ] Test users are created with proper permissions
- [ ] API endpoints are properly configured
- [ ] Frontend components have proper data-cy attributes
- [ ] Environment variables are set correctly
- [ ] Dependencies are installed
- [ ] Test data cleanup scripts are working

## 🚀 Continuous Integration

### **GitHub Actions Example**
```yaml
name: Tournament Creator Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:tournament
```

This comprehensive test suite ensures the tournament creator system works correctly and provides confidence in the implementation.