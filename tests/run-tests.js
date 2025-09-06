#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const config = {
  unit: {
    pattern: 'tests/unit/**/*.test.{js,ts,tsx}',
    command: 'npm run test:unit',
    description: 'Unit Tests'
  },
  integration: {
    pattern: 'tests/integration/**/*.test.{js,ts,tsx}',
    command: 'npm run test:integration',
    description: 'Integration Tests'
  },
  e2e: {
    pattern: 'tests/e2e/**/*.cy.{js,ts,tsx}',
    command: 'npm run test:e2e',
    description: 'End-to-End Tests'
  },
  api: {
    pattern: 'tests/integration/api/**/*.test.{js,ts,tsx}',
    command: 'npm run test:api',
    description: 'API Tests'
  }
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  const line = '='.repeat(title.length + 4);
  log(`\n${line}`, 'bright');
  log(`= ${title} =`, 'bright');
  log(`${line}\n`, 'bright');
}

function logSection(title) {
  log(`\n${title}`, 'cyan');
  log('-'.repeat(title.length));
}

function checkDependencies() {
  logSection('Checking Dependencies');
  
  try {
    // Check if Jest is installed
    require.resolve('jest');
    log('✓ Jest is available', 'green');
  } catch (e) {
    log('✗ Jest is not installed. Run: npm install --save-dev jest', 'red');
    return false;
  }

  try {
    // Check if Cypress is installed
    require.resolve('cypress');
    log('✓ Cypress is available', 'green');
  } catch (e) {
    log('✗ Cypress is not installed. Run: npm install --save-dev cypress', 'red');
    return false;
  }

  return true;
}

function findTestFiles(pattern) {
  const glob = require('glob');
  try {
    return glob.sync(pattern, { cwd: process.cwd() });
  } catch (e) {
    log(`✗ Error finding test files: ${e.message}`, 'red');
    return [];
  }
}

function runCommand(command, description) {
  logSection(`Running ${description}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    log('✓ Command executed successfully', 'green');
    return { success: true, output };
  } catch (error) {
    log(`✗ Command failed: ${error.message}`, 'red');
    if (error.stdout) {
      log('STDOUT:', 'yellow');
      console.log(error.stdout);
    }
    if (error.stderr) {
      log('STDERR:', 'yellow');
      console.log(error.stderr);
    }
    return { success: false, error: error.message };
  }
}

function runJestTests(pattern, description) {
  logSection(`Running ${description}`);
  
  const testFiles = findTestFiles(pattern);
  if (testFiles.length === 0) {
    log(`⚠ No test files found for pattern: ${pattern}`, 'yellow');
    return { success: true, output: 'No tests to run' };
  }

  log(`Found ${testFiles.length} test files:`, 'blue');
  testFiles.forEach(file => log(`  - ${file}`, 'blue'));

  try {
    const command = `npx jest ${pattern} --verbose --no-coverage`;
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    log('✓ Tests completed successfully', 'green');
    return { success: true, output };
  } catch (error) {
    log(`✗ Tests failed: ${error.message}`, 'red');
    if (error.stdout) {
      log('Test Output:', 'yellow');
      console.log(error.stdout);
    }
    return { success: false, error: error.message };
  }
}

function runCypressTests() {
  logSection('Running Cypress E2E Tests');
  
  try {
    // Run Cypress in headless mode
    const command = 'npx cypress run --headless --browser chrome';
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    log('✓ Cypress tests completed successfully', 'green');
    return { success: true, output };
  } catch (error) {
    log(`✗ Cypress tests failed: ${error.message}`, 'red');
    if (error.stdout) {
      log('Cypress Output:', 'yellow');
      console.log(error.stdout);
    }
    return { success: false, error: error.message };
  }
}

function generateTestReport(results) {
  logSection('Test Execution Summary');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  log(`Total Test Suites: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  if (failedTests > 0) {
    log('\nFailed Test Suites:', 'red');
    Object.entries(results).forEach(([suite, result]) => {
      if (!result.success) {
        log(`  - ${suite}: ${result.error || 'Unknown error'}`, 'red');
      }
    });
  }
  
  return { totalTests, passedTests, failedTests };
}

function saveTestResults(results, outputPath = 'test-results.json') {
  const timestamp = new Date().toISOString();
  const testResults = {
    timestamp,
    summary: {
      totalTests: Object.keys(results).length,
      passedTests: Object.values(results).filter(r => r.success).length,
      failedTests: Object.values(results).filter(r => !r.success).length
    },
    results
  };
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2));
    log(`\n✓ Test results saved to: ${outputPath}`, 'green');
  } catch (error) {
    log(`\n✗ Failed to save test results: ${error.message}`, 'red');
  }
}

function showHelp() {
  logHeader('LevelGG Test Runner');
  log('A comprehensive test runner for the LevelGG gaming platform.\n', 'blue');
  
  log('Usage:', 'bright');
  log('  node tests/run-tests.js [options]\n');
  
  log('Options:', 'bright');
  log('  --unit        Run only unit tests');
  log('  --integration Run only integration tests');
  log('  --e2e         Run only E2E tests');
  log('  --api         Run only API tests');
  log('  --all         Run all tests (default)');
  log('  --help        Show this help message');
  log('  --report      Generate detailed test report');
  log('  --watch       Run tests in watch mode (unit tests only)\n');
  
  log('Examples:', 'bright');
  log('  node tests/run-tests.js --unit');
  log('  node tests/run-tests.js --e2e');
  log('  node tests/run-tests.js --all --report');
  log('  node tests/run-tests.js --unit --watch\n');
}

function main() {
  const args = process.argv.slice(2);
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  logHeader('LevelGG Test Runner');
  
  // Check dependencies first
  if (!checkDependencies()) {
    log('\n✗ Please install required dependencies before running tests.', 'red');
    process.exit(1);
  }
  
  // Determine which tests to run
  const runAll = args.length === 0 || args.includes('--all');
  const runUnit = runAll || args.includes('--unit');
  const runIntegration = runAll || args.includes('--integration');
  const runE2E = runAll || args.includes('--e2e');
  const runAPI = runAll || args.includes('--api');
  const generateReport = args.includes('--report');
  const watchMode = args.includes('--watch');
  
  const results = {};
  
  // Run unit tests
  if (runUnit) {
    if (watchMode) {
      logSection('Starting Unit Tests in Watch Mode');
      log('Press Ctrl+C to stop watch mode\n', 'yellow');
      try {
        execSync('npx jest tests/unit --watch', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } catch (error) {
        // User interrupted with Ctrl+C
        log('\n✓ Watch mode stopped', 'green');
      }
    } else {
      results.unit = runJestTests(config.unit.pattern, config.unit.description);
    }
  }
  
  // Run integration tests
  if (runIntegration) {
    results.integration = runJestTests(config.integration.pattern, config.integration.description);
  }
  
  // Run API tests
  if (runAPI) {
    results.api = runJestTests(config.api.pattern, config.api.description);
  }
  
  // Run E2E tests
  if (runE2E) {
    results.e2e = runCypressTests();
  }
  
  // Generate summary if not in watch mode
  if (!watchMode && Object.keys(results).length > 0) {
    const summary = generateTestReport(results);
    
    if (generateReport) {
      saveTestResults(results);
    }
    
    // Exit with appropriate code
    if (summary.failedTests > 0) {
      log('\n✗ Some tests failed. Please review the output above.', 'red');
      process.exit(1);
    } else {
      log('\n✓ All tests passed! 🎉', 'green');
      process.exit(0);
    }
  }
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = {
  runJestTests,
  runCypressTests,
  generateTestReport,
  saveTestResults
};
