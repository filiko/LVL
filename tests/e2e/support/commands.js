// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for waiting for network requests to complete
Cypress.Commands.add('waitForNetworkIdle', (timeout = 10000) => {
  cy.intercept('**/*').as('networkRequests')
  cy.wait('@networkRequests', { timeout })
})

// Custom command for testing loading states
Cypress.Commands.add('testLoadingState', (loadingSelector, contentSelector) => {
  // Check that loading state is shown
  cy.get(loadingSelector).should('be.visible')
  
  // Wait for content to load
  cy.get(contentSelector).should('be.visible')
  
  // Verify loading state is hidden
  cy.get(loadingSelector).should('not.exist')
})

// Custom command for testing error states
Cypress.Commands.add('testErrorState', (errorSelector, errorMessage) => {
  cy.get(errorSelector).should('be.visible')
  cy.get(errorSelector).should('contain', errorMessage)
})

// Custom command for testing success messages
Cypress.Commands.add('testSuccessMessage', (successSelector, successMessage) => {
  cy.get(successSelector).should('be.visible')
  cy.get(successSelector).should('contain', successMessage)
})

// Custom command for testing modal dialogs
Cypress.Commands.add('testModal', (modalSelector, openTrigger, closeTrigger) => {
  // Open modal
  cy.get(openTrigger).click()
  
  // Check modal is visible
  cy.get(modalSelector).should('be.visible')
  
  // Close modal
  cy.get(closeTrigger).click()
  
  // Check modal is hidden
  cy.get(modalSelector).should('not.exist')
})

// Custom command for testing dropdown menus
Cypress.Commands.add('testDropdown', (dropdownSelector, triggerSelector, options) => {
  // Open dropdown
  cy.get(triggerSelector).click()
  
  // Check dropdown is visible
  cy.get(dropdownSelector).should('be.visible')
  
  // Test each option
  options.forEach(option => {
    cy.get(dropdownSelector).should('contain', option)
  })
  
  // Close dropdown by clicking outside
  cy.get('body').click(0, 0)
  
  // Check dropdown is hidden
  cy.get(dropdownSelector).should('not.exist')
})

// Custom command for testing pagination
Cypress.Commands.add('testPagination', (paginationSelector, expectedPages) => {
  // Check pagination controls exist
  cy.get(paginationSelector).should('be.visible')
  
  // Test each page
  for (let i = 1; i <= Math.min(expectedPages, 3); i++) {
    cy.get(`${paginationSelector} [data-testid="page-${i}"]`).click()
    cy.url().should('include', `page=${i}`)
  }
  
  // Test next/previous buttons
  if (expectedPages > 1) {
    cy.get(`${paginationSelector} [data-testid="next-page"]`).click()
    cy.url().should('include', 'page=2')
    
    cy.get(`${paginationSelector} [data-testid="prev-page"]`).click()
    cy.url().should('include', 'page=1')
  }
})

// Custom command for testing search functionality
Cypress.Commands.add('testSearch', (searchSelector, searchTerm, expectedResults) => {
  // Type search term
  cy.get(searchSelector).type(searchTerm)
  
  // Submit search
  cy.get(searchSelector).type('{enter}')
  
  // Check results
  expectedResults.forEach(result => {
    cy.get('[data-testid="search-results"]').should('contain', result)
  })
})

// Custom command for testing sorting
Cypress.Commands.add('testSorting', (sortSelector, sortOptions) => {
  sortOptions.forEach(option => {
    // Click sort option
    cy.get(`${sortSelector} [data-testid="sort-${option}"]`).click()
    
    // Verify sort is applied
    cy.get(`${sortSelector} [data-testid="sort-${option}"]`).should('have.class', 'active')
    
    // Check URL reflects sort
    cy.url().should('include', `sort=${option}`)
  })
})

// Custom command for testing filtering
Cypress.Commands.add('testFiltering', (filterSelector, filterOptions) => {
  filterOptions.forEach(filter => {
    // Apply filter
    cy.get(`${filterSelector} [data-testid="filter-${filter.key}"]`).click()
    
    // Verify filter is applied
    cy.get(`${filterSelector} [data-testid="filter-${filter.key}"]`).should('have.class', 'active')
    
    // Check URL reflects filter
    cy.url().should('include', `${filter.key}=${filter.value}`)
    
    // Verify filtered results
    if (filter.expectedCount) {
      cy.get('[data-testid="filtered-results"]').should('have.length', filter.expectedCount)
    }
  })
})

// Custom command for testing file uploads
Cypress.Commands.add('testFileUpload', (uploadSelector, filePath, expectedFileName) => {
  // Upload file
  cy.get(uploadSelector).attachFile(filePath)
  
  // Verify file is uploaded
  cy.get('[data-testid="uploaded-file"]').should('contain', expectedFileName)
  
  // Verify upload success message
  cy.testSuccessMessage('[data-testid="upload-success"]', 'File uploaded successfully')
})

// Custom command for testing real-time updates
Cypress.Commands.add('testRealTimeUpdates', (updateSelector, triggerAction, expectedUpdate) => {
  // Perform action that triggers real-time update
  triggerAction()
  
  // Wait for update
  cy.get(updateSelector).should('contain', expectedUpdate)
})

// Custom command for testing keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', (focusableElements) => {
  // Test tab navigation
  focusableElements.forEach((element, index) => {
    if (index === 0) {
      cy.get(element).focus()
    } else {
      cy.focused().tab()
      cy.focused().should('match', element)
    }
  })
  
  // Test enter key on interactive elements
  cy.get('[data-testid="interactive-element"]').focus().type('{enter}')
  
  // Test escape key on modals
  cy.get('[data-testid="modal"]').should('be.visible')
  cy.get('body').type('{esc}')
  cy.get('[data-testid="modal"]').should('not.exist')
})

// Custom command for testing performance
Cypress.Commands.add('testPerformance', (pageLoadTimeout = 5000) => {
  // Measure page load time
  cy.window().then((win) => {
    const performance = win.performance
    const navigation = performance.getEntriesByType('navigation')[0]
    
    // Page load should be under timeout
    expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.lessThan(pageLoadTimeout)
    
    // Time to first byte should be reasonable
    expect(navigation.responseStart - navigation.requestStart).to.be.lessThan(2000)
  })
})

// Custom command for testing security
Cypress.Commands.add('testSecurity', () => {
  // Check for security headers
  cy.request('/').then((response) => {
    expect(response.headers).to.have.property('x-frame-options')
    expect(response.headers).to.have.property('x-content-type-options')
    expect(response.headers).to.have.property('referrer-policy')
  })
  
  // Check for CSRF protection
  cy.get('meta[name="csrf-token"]').should('exist')
  
  // Check for secure cookies
  cy.getCookie('session').then((cookie) => {
    if (cookie) {
      expect(cookie.secure).to.be.true
      expect(cookie.httpOnly).to.be.true
    }
  })
})
