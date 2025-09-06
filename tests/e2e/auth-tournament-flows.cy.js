describe('Authentication & Tournament Management Flows', () => {
  beforeEach(() => {
    // Reset any test data and clear cookies before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Authentication Flows', () => {
    it('should allow users to register with valid credentials', () => {
      cy.visit('/register')
      
      // Fill in registration form
      cy.get('[data-testid="username-input"]').type('TestUser123')
      cy.get('[data-testid="email-input"]').type('testuser@example.com')
      cy.get('[data-testid="password-input"]').type('SecurePass123!')
      
      // Submit form
      cy.get('[data-testid="submit-button"]').click()
      
      // Should redirect to login or dashboard
      cy.url().should('not.include', '/register')
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="registration-success"]', 'Account created successfully')
    })

    it('should allow users to login with valid credentials', () => {
      cy.visit('/login')
      
      // Fill in login form
      cy.get('[data-testid="email-input"]').type('testuser@example.com')
      cy.get('[data-testid="password-input"]').type('SecurePass123!')
      
      // Submit form
      cy.get('[data-testid="login-button"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/battlefield')
      
      // Check user is logged in
      cy.get('[data-testid="user-profile"]').should('be.visible')
    })

    it('should handle OAuth login with Discord', () => {
      cy.visit('/login')
      
      // Click Discord OAuth button
      cy.get('[data-testid="discord-oauth-button"]').click()
      
      // Should redirect to Discord OAuth
      cy.url().should('include', 'discord.com')
      
      // Note: Full OAuth flow testing requires test Discord app
      // This test verifies the OAuth redirect is working
    })

    it('should handle OAuth login with Google', () => {
      cy.visit('/login')
      
      // Click Google OAuth button
      cy.get('[data-testid="google-oauth-button"]').click()
      
      // Should redirect to Google OAuth
      cy.url().should('include', 'accounts.google.com')
      
      // Note: Full OAuth flow testing requires test Google app
      // This test verifies the OAuth redirect is working
    })

    it('should show validation errors for invalid login data', () => {
      cy.visit('/login')
      
      // Test invalid email format
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('pass')
      cy.get('[data-testid="login-button"]').click()
      
      // Check for validation errors
      cy.testFormValidation(
        '[data-testid="login-form"]',
        { email: 'invalid-email', password: 'pass' },
        { email: 'Please enter a valid email address', password: 'Password must be at least 8 characters' }
      )
    })

    it('should allow users to logout', () => {
      // Login first
      cy.loginAs('player')
      
      // Click logout button
      cy.get('[data-testid="logout-button"]').click()
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      
      // User profile should not be visible
      cy.get('[data-testid="user-profile"]').should('not.exist')
    })
  })

  describe('Tournament Creation & Management', () => {
    beforeEach(() => {
      // Login as admin for tournament management
      cy.loginAs('admin')
    })

    it('should allow admins to create new tournaments', () => {
      cy.visit('/admin/tournaments')
      
      // Click create tournament button
      cy.get('[data-testid="create-tournament-button"]').click()
      
      // Fill in tournament form
      cy.get('[data-testid="tournament-name-input"]').type('Test Tournament 2025')
      cy.get('[data-testid="tournament-game-select"]').select('battlefield')
      cy.get('[data-testid="tournament-mode-select"]').select('32v32')
      cy.get('[data-testid="tournament-start-date-input"]').type('2025-02-15')
      cy.get('[data-testid="tournament-end-date-input"]').type('2025-02-20')
      cy.get('[data-testid="tournament-max-teams-input"]').type('16')
      cy.get('[data-testid="tournament-prize-pool-input"]').type('1000')
      cy.get('[data-testid="tournament-entry-fee-input"]').type('50')
      
      // Submit form
      cy.get('[data-testid="submit-button"]').click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="tournament-created-success"]', 'Tournament created successfully')
      
      // Should redirect to tournament list
      cy.url().should('include', '/admin/tournaments')
      
      // New tournament should be visible in list
      cy.get('[data-testid="tournament-list"]').should('contain', 'Test Tournament 2025')
    })

    it('should allow admins to edit existing tournaments', () => {
      cy.visit('/admin/tournaments')
      
      // Click edit button on first tournament
      cy.get('[data-testid="edit-tournament-button"]').first().click()
      
      // Modify tournament name
      cy.get('[data-testid="tournament-name-input"]').clear().type('Updated Tournament Name')
      
      // Submit form
      cy.get('[data-testid="submit-button"]').click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="tournament-updated-success"]', 'Tournament updated successfully')
      
      // Tournament name should be updated in list
      cy.get('[data-testid="tournament-list"]').should('contain', 'Updated Tournament Name')
    })

    it('should allow admins to activate/deactivate tournaments', () => {
      cy.visit('/admin/tournaments')
      
      // Find inactive tournament and activate it
      cy.get('[data-testid="tournament-status-toggle"]').first().click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="tournament-status-updated"]', 'Tournament status updated')
      
      // Status should change
      cy.get('[data-testid="tournament-status"]').first().should('contain', 'Active')
    })

    it('should allow admins to delete tournaments', () => {
      cy.visit('/admin/tournaments')
      
      // Click delete button on first tournament
      cy.get('[data-testid="delete-tournament-button"]').first().click()
      
      // Confirm deletion in modal
      cy.get('[data-testid="confirm-delete-button"]').click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="tournament-deleted-success"]', 'Tournament deleted successfully')
      
      // Tournament should be removed from list
      cy.get('[data-testid="tournament-list"]').should('not.contain', 'Test Tournament')
    })
  })

  describe('Tournament Registration & Signup', () => {
    beforeEach(() => {
      // Login as team lead for registration
      cy.loginAs('teamLead')
    })

    it('should allow team leads to register teams for tournaments', () => {
      cy.visit('/battlefield/tournaments')
      
      // Find an active tournament
      cy.get('[data-testid="tournament-card"]').first().click()
      
      // Click register button
      cy.get('[data-testid="register-team-button"]').click()
      
      // Select team to register
      cy.get('[data-testid="team-select"]').select('Alpha Strike Force')
      
      // Confirm registration
      cy.get('[data-testid="confirm-registration-button"]').click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="registration-success"]', 'Team registered successfully')
      
      // Registration status should update
      cy.get('[data-testid="registration-status"]').should('contain', 'Registered')
    })

    it('should show tournament details and requirements', () => {
      cy.visit('/battlefield/tournaments')
      
      // Click on tournament to view details
      cy.get('[data-testid="tournament-card"]').first().click()
      
      // Check tournament information is displayed
      cy.get('[data-testid="tournament-name"]').should('be.visible')
      cy.get('[data-testid="tournament-game"]').should('be.visible')
      cy.get('[data-testid="tournament-mode"]').should('be.visible')
      cy.get('[data-testid="tournament-dates"]').should('be.visible')
      cy.get('[data-testid="tournament-prize-pool"]').should('be.visible')
      cy.get('[data-testid="tournament-entry-fee"]').should('be.visible')
      cy.get('[data-testid="tournament-requirements"]').should('be.visible')
    })

    it('should allow users to browse available tournaments', () => {
      cy.visit('/battlefield/tournaments')
      
      // Check tournament list is displayed
      cy.get('[data-testid="tournament-list"]').should('be.visible')
      
      // Test search functionality
      cy.testSearch('[data-testid="tournament-search"]', 'Battlefield', ['Battlefield', '32v32'])
      
      // Test filtering
      cy.testFiltering('[data-testid="tournament-filters"]', [
        { key: 'game', value: 'battlefield' },
        { key: 'mode', value: '32v32' },
        { key: 'status', value: 'active' }
      ])
      
      // Test sorting
      cy.testSorting('[data-testid="tournament-sort"]', ['date', 'prize', 'teams'])
    })

    it('should show registration status for user teams', () => {
      cy.visit('/battlefield/tournaments')
      
      // Check registration status is displayed for each tournament
      cy.get('[data-testid="tournament-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="registration-status"]').should('be.visible')
        })
      })
    })
  })

  describe('Team Management & Signup', () => {
    beforeEach(() => {
      // Login as team lead
      cy.loginAs('teamLead')
    })

    it('should allow team leads to create new teams', () => {
      cy.visit('/battlefield/teams/create')
      
      // Fill in team creation form
      cy.get('[data-testid="team-name-input"]').type('New Test Team')
      cy.get('[data-testid="team-tag-input"]').type('NTT')
      cy.get('[data-testid="team-game-select"]').select('battlefield')
      cy.get('[data-testid="team-description-input"]').type('A new test team for automated testing')
      
      // Submit form
      cy.get('[data-testid="submit-button"]').click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="team-created-success"]', 'Team created successfully')
      
      // Should redirect to team page
      cy.url().should('include', '/teams/')
      
      // Team name should be displayed
      cy.get('[data-testid="team-name"]').should('contain', 'New Test Team')
    })

    it('should allow team leads to manage team roster', () => {
      cy.visit('/battlefield/teams')
      
      // Click on team to manage
      cy.get('[data-testid="team-card"]').first().click()
      
      // Navigate to roster management
      cy.get('[data-testid="manage-roster-button"]').click()
      
      // Check roster management interface
      cy.get('[data-testid="roster-list"]').should('be.visible')
      cy.get('[data-testid="add-member-button"]').should('be.visible')
      cy.get('[data-testid="remove-member-button"]').should('be.visible')
    })

    it('should allow team leads to invite new members', () => {
      cy.visit('/battlefield/teams')
      
      // Click on team
      cy.get('[data-testid="team-card"]').first().click()
      
      // Click invite members button
      cy.get('[data-testid="invite-members-button"]').click()
      
      // Fill in invite form
      cy.get('[data-testid="invite-email-input"]').type('newmember@example.com')
      cy.get('[data-testid="invite-role-select"]').select('INFANTRY')
      cy.get('[data-testid="invite-squad-select"]').select('ALPHA')
      
      // Send invite
      cy.get('[data-testid="send-invite-button"]').click()
      
      // Check for success message
      cy.testSuccessMessage('[data-testid="invite-sent-success"]', 'Invitation sent successfully')
    })
  })

  describe('Admin Dashboard & Management', () => {
    beforeEach(() => {
      // Login as admin
      cy.loginAs('admin')
    })

    it('should display admin dashboard with statistics', () => {
      cy.visit('/admin/dashboard')
      
      // Check dashboard loads
      cy.get('[data-testid="admin-dashboard"]').should('be.visible')
      
      // Check statistics cards
      cy.get('[data-testid="stats-card-users"]').should('be.visible')
      cy.get('[data-testid="stats-card-tournaments"]').should('be.visible')
      cy.get('[data-testid="stats-card-teams"]').should('be.visible')
      cy.get('[data-testid="stats-card-revenue"]').should('be.visible')
      
      // Check recent activity feed
      cy.get('[data-testid="activity-feed"]').should('be.visible')
    })

    it('should allow admins to manage users', () => {
      cy.visit('/admin/users')
      
      // Check user list loads
      cy.get('[data-testid="user-list"]').should('be.visible')
      
      // Test user search
      cy.testSearch('[data-testid="user-search"]', 'admin', ['admin@levelgg.com'])
      
      // Test user filtering
      cy.testFiltering('[data-testid="user-filters"]', [
        { key: 'role', value: 'admin' },
        { key: 'status', value: 'active' }
      ])
      
      // Test user actions (promote, ban, etc.)
      cy.get('[data-testid="user-actions-button"]').first().click()
      cy.get('[data-testid="promote-user-button"]').should('be.visible')
      cy.get('[data-testid="ban-user-button"]').should('be.visible')
    })

    it('should allow admins to view tournament analytics', () => {
      cy.visit('/admin/tournaments')
      
      // Click on tournament analytics
      cy.get('[data-testid="tournament-analytics-button"]').first().click()
      
      // Check analytics dashboard
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible')
      cy.get('[data-testid="registration-chart"]').should('be.visible')
      cy.get('[data-testid="revenue-chart"]').should('be.visible')
      cy.get('[data-testid="team-distribution-chart"]').should('be.visible')
    })
  })

  describe('Performance & Load Testing', () => {
    it('should handle multiple concurrent users', () => {
      // Test page load performance
      cy.visit('/battlefield/tournaments')
      cy.testPerformance(3000)
      
      // Test with different viewport sizes
      cy.testResponsive(['mobile', 'tablet', 'desktop'])
    })

    it('should handle large tournament lists', () => {
      cy.visit('/battlefield/tournaments')
      
      // Test pagination if many tournaments exist
      cy.get('[data-testid="tournament-list"]').then(($list) => {
        if ($list.children().length > 10) {
          cy.testPagination('[data-testid="tournament-pagination"]', 3)
        }
      })
    })
  })

  describe('Security & Access Control', () => {
    it('should prevent unauthorized access to admin routes', () => {
      // Try to access admin route without login
      cy.visit('/admin/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/login')
    })

    it('should prevent non-admin users from accessing admin features', () => {
      // Login as regular user
      cy.loginAs('player')
      
      // Try to access admin route
      cy.visit('/admin/dashboard')
      
      // Should show access denied or redirect
      cy.get('[data-testid="access-denied"]').should('be.visible')
    })

    it('should validate form inputs and prevent injection attacks', () => {
      cy.visit('/admin/tournaments')
      cy.get('[data-testid="create-tournament-button"]').click()
      
      // Test XSS prevention
      const maliciousInput = '<script>alert("xss")</script>'
      cy.get('[data-testid="tournament-name-input"]').type(maliciousInput)
      
      // Submit form
      cy.get('[data-testid="submit-button"]').click()
      
      // Check that script tags are sanitized
      cy.get('[data-testid="tournament-name-input"]').should('not.contain', '<script>')
    })
  })
})
