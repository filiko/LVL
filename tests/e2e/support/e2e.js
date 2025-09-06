// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // for uncaught exceptions in the application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  return true
})

// Custom viewport sizes for responsive testing
Cypress.Commands.add('setViewport', (size) => {
  const sizes = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1280, 720],
    wide: [1920, 1080]
  }
  
  if (sizes[size]) {
    cy.viewport(...sizes[size])
  } else {
    cy.viewport(size)
  }
})

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.window().its('document.readyState').should('eq', 'complete')
})

// Custom assertion for checking if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height()
  const rect = subject[0].getBoundingClientRect()
  
  expect(rect.top).to.be.lessThan(bottom)
  expect(rect.bottom).to.be.greaterThan(0)
  
  return subject
})

// Custom command for testing authentication flows
Cypress.Commands.add('loginAs', (userType) => {
  const users = {
    admin: {
      email: 'admin@levelgg.com',
      password: 'adminpass123'
    },
    teamLead: {
      email: 'alpha@example.com', 
      password: 'teamlead123'
    },
    player: {
      email: 'diamond1@example.com',
      password: 'playerpass123'
    }
  }
  
  const user = users[userType]
  if (!user) {
    throw new Error(`Unknown user type: ${userType}`)
  }
  
  // Navigate to login page
  cy.visit('/login')
  
  // Fill in credentials
  cy.get('[data-testid="email-input"]').type(user.email)
  cy.get('[data-testid="password-input"]').type(user.password)
  
  // Submit form
  cy.get('[data-testid="login-button"]').click()
  
  // Wait for redirect
  cy.url().should('not.include', '/login')
})

// Custom command for creating test data
Cypress.Commands.add('createTestTournament', (tournamentData = {}) => {
  const defaultData = {
    name: 'Test Tournament',
    game: 'battlefield',
    mode: '32v32',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    maxTeams: 16,
    prizePool: 1000,
    entryFee: 50
  }
  
  const data = { ...defaultData, ...tournamentData }
  
  // This would typically make an API call to create the tournament
  // For now, we'll just return the data
  return data
})

// Custom command for testing API responses
Cypress.Commands.add('testApiEndpoint', (method, endpoint, data = null, expectedStatus = 200) => {
  const options = {
    method: method.toUpperCase(),
    url: `${Cypress.env('apiUrl') || 'http://localhost:3000/api'}${endpoint}`,
    failOnStatusCode: false
  }
  
  if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.body = data
  }
  
  cy.request(options).then((response) => {
    expect(response.status).to.eq(expectedStatus)
    return response
  })
})

// Custom command for testing form validation
Cypress.Commands.add('testFormValidation', (formSelector, invalidData, expectedErrors) => {
  // Test with invalid data
  Object.entries(invalidData).forEach(([field, value]) => {
    cy.get(`${formSelector} [data-testid="${field}-input"]`).clear().type(value)
  })
  
  // Submit form
  cy.get(`${formSelector} [data-testid="submit-button"]`).click()
  
  // Check for expected error messages
  Object.entries(expectedErrors).forEach(([field, errorMessage]) => {
    cy.get(`${formSelector} [data-testid="${field}-error"]`).should('contain', errorMessage)
  })
})

// Custom command for testing responsive design
Cypress.Commands.add('testResponsive', (breakpoints = ['mobile', 'tablet', 'desktop']) => {
  breakpoints.forEach(breakpoint => {
    cy.setViewport(breakpoint)
    cy.wait(500) // Wait for layout to adjust
    
    // Take screenshot for visual regression testing
    cy.screenshot(`responsive-${breakpoint}`)
    
    // Test that key elements are visible
    cy.get('[data-testid="main-navigation"]').should('be.visible')
    cy.get('[data-testid="main-content"]').should('be.visible')
  })
})

// Custom command for testing accessibility
Cypress.Commands.add('testAccessibility', () => {
  // Check for proper heading hierarchy
  cy.get('h1, h2, h3, h4, h5, h6').each(($heading, index) => {
    if (index > 0) {
      const prevLevel = parseInt($heading.prevAll('h1, h2, h3, h4, h5, h6').first().prop('tagName').charAt(1))
      const currentLevel = parseInt($heading.prop('tagName').charAt(1))
      expect(currentLevel - prevLevel).to.be.lessThan(2)
    }
  })
  
  // Check for alt text on images
  cy.get('img').each(($img) => {
    expect($img.attr('alt')).to.not.be.undefined
  })
  
  // Check for proper form labels
  cy.get('input, select, textarea').each(($input) => {
    const id = $input.attr('id')
    if (id) {
      cy.get(`label[for="${id}"]`).should('exist')
    }
  })
})
