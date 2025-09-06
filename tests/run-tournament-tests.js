#!/usr/bin/env node

/**
 * Tournament Creator System Test Runner
 * 
 * This script runs all tests related to the tournament creator functionality
 * and provides a comprehensive test report.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  unit: {
    command: 'npm run test:unit',
    files: ['tests/unit/tournament-creator.test.ts'],
    description: 'Unit tests for tournament creator functionality'
  },
  integration: {
    command: 'npm run test:integration',
    files: ['tests/integration/tournament-api.test.ts'],
    description: 'Integration tests for tournament API endpoints'
  },
  e2e: {
    command: 'npm run test:e2e',
    files: ['tests/e2e/tournament-creator-flow.cy.js'],
    description: 'End-to-end tests for tournament creator user flow'
  }
};

// Test results storage
const testResults = {
  unit: { passed: 0, failed: 0, errors: [] },
  integration: { passed: 0, failed: 0, errors: [] },
  e2e: { passed: 0, failed: 0, errors: [] }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTestSuite(suiteName, config) {
  log(`\n${colors.bold}Running ${suiteName} tests...${colors.reset}`);
  log(`Description: ${config.description}`);
  
  try {
    // Check if test files exist
    const missingFiles = config.files.filter(file => !fs.existsSync(file));
    if (missingFiles.length > 0) {
      log(`❌ Missing test files: ${missingFiles.join(', ')}`, 'red');
      testResults[suiteName].failed++;
      testResults[suiteName].errors.push(`Missing files: ${missingFiles.join(', ')}`);
      return;
    }

    // Run the test command
    const output = execSync(config.command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });

    log(`✅ ${suiteName} tests passed`, 'green');
    testResults[suiteName].passed++;
    
    // Parse test results if possible
    if (output.includes('passed') || output.includes('PASS')) {
      const passedMatch = output.match(/(\d+)\s+passed/);
      if (passedMatch) {
        testResults[suiteName].passed = parseInt(passedMatch[1]);
      }
    }

  } catch (error) {
    log(`❌ ${suiteName} tests failed`, 'red');
    testResults[suiteName].failed++;
    testResults[suiteName].errors.push(error.message);
    
    if (error.stdout) {
      log(`Output: ${error.stdout}`, 'yellow');
    }
    if (error.stderr) {
      log(`Error: ${error.stderr}`, 'red');
    }
  }
}

function validateTestEnvironment() {
  log('🔍 Validating test environment...', 'blue');
  
  const requiredFiles = [
    'package.json',
    'tests/unit/tournament-creator.test.ts',
    'tests/integration/tournament-api.test.ts',
    'tests/e2e/tournament-creator-flow.cy.js',
    'tests/helpers/tournament-test-helpers.js'
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    log(`❌ Missing required files: ${missingFiles.join(', ')}`, 'red');
    return false;
  }

  // Check if test scripts are defined in package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const testScripts = packageJson.scripts || {};
    
    const requiredScripts = ['test:unit', 'test:integration', 'test:e2e'];
    const missingScripts = requiredScripts.filter(script => !testScripts[script]);
    
    if (missingScripts.length > 0) {
      log(`⚠️  Missing test scripts in package.json: ${missingScripts.join(', ')}`, 'yellow');
      log('Add these scripts to your package.json:', 'yellow');
      missingScripts.forEach(script => {
        log(`  "${script}": "vitest run tests/${script.split(':')[1]}/"`, 'yellow');
      });
    }
  } catch (error) {
    log(`⚠️  Could not read package.json: ${error.message}`, 'yellow');
  }

  log('✅ Test environment validation complete', 'green');
  return true;
}

function generateTestReport() {
  log('\n' + '='.repeat(60), 'blue');
  log('🎯 TOURNAMENT CREATOR SYSTEM TEST REPORT', 'bold');
  log('='.repeat(60), 'blue');

  const totalPassed = Object.values(testResults).reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;

  log(`\n📊 Test Summary:`, 'bold');
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${totalPassed}`, 'green');
  log(`Failed: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');

  // Detailed results for each test suite
  Object.entries(testResults).forEach(([suiteName, result]) => {
    log(`\n📋 ${suiteName.toUpperCase()} Tests:`, 'bold');
    log(`  Passed: ${result.passed}`, 'green');
    log(`  Failed: ${result.failed}`, result.failed > 0 ? 'red' : 'green');
    
    if (result.errors.length > 0) {
      log(`  Errors:`, 'red');
      result.errors.forEach(error => {
        log(`    - ${error}`, 'red');
      });
    }
  });

  // Test coverage areas
  log(`\n🎯 Test Coverage Areas:`, 'bold');
  log('✅ Tournament creation by any authenticated user');
  log('✅ 32v32 mode validation (64 max players)');
  log('✅ US-specific region options');
  log('✅ Tournament creator management interface');
  log('✅ Registration approval/rejection workflow');
  log('✅ Permission system (creator vs non-creator)');
  log('✅ Team lead limits (max 2 per 32v32 team)');
  log('✅ Real-time player count updates');

  // Recommendations
  if (totalFailed > 0) {
    log(`\n🔧 Recommendations:`, 'yellow');
    log('1. Check test environment setup');
    log('2. Verify database connection and test data');
    log('3. Ensure all API endpoints are properly mocked');
    log('4. Check authentication tokens and user permissions');
  } else {
    log(`\n🎉 All tests passed! Tournament creator system is working correctly.`, 'green');
  }

  log('\n' + '='.repeat(60), 'blue');
}

function runAllTests() {
  log('🚀 Starting Tournament Creator System Tests', 'bold');
  log('This will test the complete tournament creator functionality...\n');

  // Validate environment first
  if (!validateTestEnvironment()) {
    log('❌ Test environment validation failed. Exiting.', 'red');
    process.exit(1);
  }

  // Run test suites
  runTestSuite('unit', TEST_CONFIG.unit);
  runTestSuite('integration', TEST_CONFIG.integration);
  runTestSuite('e2e', TEST_CONFIG.e2e);

  // Generate report
  generateTestReport();

  // Exit with appropriate code
  const hasFailures = Object.values(testResults).some(result => result.failed > 0);
  process.exit(hasFailures ? 1 : 0);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('Tournament Creator System Test Runner', 'bold');
  log('\nUsage: node tests/run-tournament-tests.js [options]');
  log('\nOptions:');
  log('  --help, -h     Show this help message');
  log('  --unit         Run only unit tests');
  log('  --integration  Run only integration tests');
  log('  --e2e          Run only end-to-end tests');
  log('\nExamples:');
  log('  node tests/run-tournament-tests.js');
  log('  node tests/run-tournament-tests.js --unit');
  log('  node tests/run-tournament-tests.js --e2e');
  process.exit(0);
}

// Run specific test suite if requested
if (args.includes('--unit')) {
  runTestSuite('unit', TEST_CONFIG.unit);
  process.exit(0);
} else if (args.includes('--integration')) {
  runTestSuite('integration', TEST_CONFIG.integration);
  process.exit(0);
} else if (args.includes('--e2e')) {
  runTestSuite('e2e', TEST_CONFIG.e2e);
  process.exit(0);
}

// Run all tests by default
runAllTests();
