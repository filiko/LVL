const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // Test environment variables
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123'
      },
      adminUser: {
        email: 'admin@levelgg.com',
        password: 'adminpass123'
      },
      teamLeadUser: {
        email: 'alpha@example.com',
        password: 'teamlead123'
      }
    }
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'tests/component/**/*.cy.{js,jsx,ts,tsx}',
  },
})
