describe('Tournament Creator Flow', () => {
  let tournamentId;
  let teamId;

  beforeEach(() => {
    // Clear any existing data
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Tournament Creation Flow', () => {
    it('should allow any logged-in user to create a tournament', () => {
      // Login as a regular user (not admin or team lead)
      cy.login('regular-user@test.com', 'password123');
      
      // Navigate to tournaments page
      cy.visit('/battlefield/tournaments');
      
      // Click create tournament button
      cy.get('[data-cy="create-tournament-btn"]').click();
      
      // Fill out tournament form
      cy.get('[data-cy="tournament-title"]').type('Test 32v32 Tournament');
      cy.get('[data-cy="tournament-mode"]').select('32v32');
      cy.get('[data-cy="tournament-region"]').select('EAST_COAST');
      cy.get('[data-cy="tournament-platform"]').select('PC');
      cy.get('[data-cy="tournament-start-date"]').type('2024-02-01T18:00');
      cy.get('[data-cy="tournament-bracket-type"]').select('SINGLE_ELIMINATION');
      
      // Verify max players is automatically set to 64 for 32v32
      cy.get('[data-cy="tournament-max-players"]').should('have.value', '64');
      
      // Submit form
      cy.get('[data-cy="submit-tournament"]').click();
      
      // Should redirect to tournament detail page
      cy.url().should('include', '/battlefield/tournaments/');
      cy.get('[data-cy="tournament-title"]').should('contain', 'Test 32v32 Tournament');
      
      // Should show "Manage Tournament" button for creator
      cy.get('[data-cy="manage-tournament-btn"]').should('be.visible');
      
      // Store tournament ID for later tests
      cy.url().then((url) => {
        tournamentId = url.split('/').pop();
      });
    });

    it('should validate 32v32 mode has correct player limits', () => {
      cy.login('regular-user@test.com', 'password123');
      cy.visit('/battlefield/tournaments/create');
      
      // Select 32v32 mode
      cy.get('[data-cy="tournament-mode"]').select('32v32');
      
      // Try to set max players to invalid value
      cy.get('[data-cy="tournament-max-players"]').clear().type('1024');
      
      // Submit form
      cy.get('[data-cy="submit-tournament"]').click();
      
      // Should show validation error
      cy.get('[data-cy="error-message"]').should('contain', 'Max players for 32v32 mode cannot exceed 64');
    });

    it('should use US-specific regions', () => {
      cy.login('regular-user@test.com', 'password123');
      cy.visit('/battlefield/tournaments/create');
      
      // Check region options
      cy.get('[data-cy="tournament-region"] option').should('have.length', 4);
      cy.get('[data-cy="tournament-region"] option').should('contain', 'East Coast');
      cy.get('[data-cy="tournament-region"] option').should('contain', 'West Coast');
      cy.get('[data-cy="tournament-region"] option').should('contain', 'Midwest');
      cy.get('[data-cy="tournament-region"] option').should('contain', 'South');
      
      // Should not contain global regions
      cy.get('[data-cy="tournament-region"] option').should('not.contain', 'Europe');
      cy.get('[data-cy="tournament-region"] option').should('not.contain', 'Asia');
    });
  });

  describe('Tournament Management Interface', () => {
    beforeEach(() => {
      // Create a tournament first
      cy.login('tournament-creator@test.com', 'password123');
      cy.createTournament({
        title: 'Management Test Tournament',
        mode: '32v32',
        region: 'EAST_COAST',
        platform: 'PC',
        start_date: '2024-02-01T18:00:00Z'
      }).then((id) => {
        tournamentId = id;
      });
    });

    it('should show tournament management interface to creator', () => {
      cy.visit(`/battlefield/tournaments/${tournamentId}`);
      
      // Click manage tournament button
      cy.get('[data-cy="manage-tournament-btn"]').click();
      
      // Should navigate to management page
      cy.url().should('include', '/manage');
      
      // Should show management tabs
      cy.get('[data-cy="tab-overview"]').should('be.visible');
      cy.get('[data-cy="tab-registrations"]').should('be.visible');
      cy.get('[data-cy="tab-settings"]').should('be.visible');
      
      // Should show tournament status badges
      cy.get('[data-cy="status-active"]').should('be.visible');
      cy.get('[data-cy="status-upcoming"]').should('be.visible');
      cy.get('[data-cy="player-count"]').should('contain', '0/64');
    });

    it('should allow tournament creator to activate/deactivate tournament', () => {
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`);
      
      // Should show activate button (tournament starts inactive)
      cy.get('[data-cy="activate-tournament-btn"]').should('be.visible');
      
      // Click activate
      cy.get('[data-cy="activate-tournament-btn"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-message"]').should('contain', 'Tournament activated');
      
      // Should now show deactivate button
      cy.get('[data-cy="deactivate-tournament-btn"]').should('be.visible');
    });

    it('should show registration statistics in overview tab', () => {
      // Create some test registrations first
      cy.createTeamRegistration(tournamentId, 'Test Team 1', 32);
      cy.createTeamRegistration(tournamentId, 'Test Team 2', 30);
      
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`);
      
      // Should show registration stats
      cy.get('[data-cy="total-registrations"]').should('contain', '2');
      cy.get('[data-cy="confirmed-registrations"]').should('contain', '0');
      cy.get('[data-cy="pending-registrations"]').should('contain', '2');
      cy.get('[data-cy="capacity-remaining"]').should('contain', '64');
    });
  });

  describe('Registration Management', () => {
    beforeEach(() => {
      // Create tournament and registrations
      cy.login('tournament-creator@test.com', 'password123');
      cy.createTournament({
        title: 'Registration Test Tournament',
        mode: '32v32',
        region: 'EAST_COAST',
        platform: 'PC',
        start_date: '2024-02-01T18:00:00Z'
      }).then((id) => {
        tournamentId = id;
      });
      
      // Create test team registrations
      cy.createTeamRegistration(tournamentId, 'Alpha Squad', 32);
      cy.createTeamRegistration(tournamentId, 'Bravo Squad', 30);
    });

    it('should allow tournament creator to approve registrations', () => {
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`);
      
      // Switch to registrations tab
      cy.get('[data-cy="tab-registrations"]').click();
      
      // Should show pending registrations
      cy.get('[data-cy="registration-row"]').should('have.length', 2);
      cy.get('[data-cy="registration-status"]').should('contain', 'PENDING');
      
      // Approve first registration
      cy.get('[data-cy="approve-registration"]').first().click();
      
      // Should show success message
      cy.get('[data-cy="success-message"]').should('contain', 'Registration confirmed');
      
      // Status should update to CONFIRMED
      cy.get('[data-cy="registration-status"]').first().should('contain', 'CONFIRMED');
    });

    it('should allow tournament creator to reject registrations', () => {
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`);
      cy.get('[data-cy="tab-registrations"]').click();
      
      // Reject first registration
      cy.get('[data-cy="reject-registration"]').first().click();
      
      // Should show success message
      cy.get('[data-cy="success-message"]').should('contain', 'Registration cancelled');
      
      // Status should update to CANCELLED
      cy.get('[data-cy="registration-status"]').first().should('contain', 'CANCELLED');
    });

    it('should update player count when registrations are approved', () => {
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`);
      
      // Initial player count should be 0
      cy.get('[data-cy="player-count"]').should('contain', '0/64');
      
      // Switch to registrations tab and approve first registration
      cy.get('[data-cy="tab-registrations"]').click();
      cy.get('[data-cy="approve-registration"]').first().click();
      
      // Switch back to overview
      cy.get('[data-cy="tab-overview"]').click();
      
      // Player count should update to 32
      cy.get('[data-cy="player-count"]').should('contain', '32/64');
    });
  });

  describe('Permission System', () => {
    it('should not allow non-creators to access management interface', () => {
      // Create tournament as one user
      cy.login('tournament-creator@test.com', 'password123');
      cy.createTournament({
        title: 'Permission Test Tournament',
        mode: '32v32',
        region: 'EAST_COAST',
        platform: 'PC',
        start_date: '2024-02-01T18:00:00Z'
      }).then((id) => {
        tournamentId = id;
      });
      
      // Login as different user
      cy.login('other-user@test.com', 'password123');
      
      // Try to access management interface
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`, { failOnStatusCode: false });
      
      // Should redirect or show error
      cy.url().should('not.include', '/manage');
      cy.get('[data-cy="error-message"]').should('contain', 'You can only manage tournaments you created');
    });

    it('should allow admins to access any tournament management interface', () => {
      // Create tournament as regular user
      cy.login('regular-user@test.com', 'password123');
      cy.createTournament({
        title: 'Admin Test Tournament',
        mode: '32v32',
        region: 'EAST_COAST',
        platform: 'PC',
        start_date: '2024-02-01T18:00:00Z'
      }).then((id) => {
        tournamentId = id;
      });
      
      // Login as admin
      cy.login('admin@test.com', 'password123');
      
      // Should be able to access management interface
      cy.visit(`/battlefield/tournaments/${tournamentId}/manage`);
      cy.url().should('include', '/manage');
      cy.get('[data-cy="tab-overview"]').should('be.visible');
    });

    it('should not show manage button to non-creators on tournament page', () => {
      // Create tournament as one user
      cy.login('tournament-creator@test.com', 'password123');
      cy.createTournament({
        title: 'Button Test Tournament',
        mode: '32v32',
        region: 'EAST_COAST',
        platform: 'PC',
        start_date: '2024-02-01T18:00:00Z'
      }).then((id) => {
        tournamentId = id;
      });
      
      // Login as different user
      cy.login('other-user@test.com', 'password123');
      
      // Visit tournament page
      cy.visit(`/battlefield/tournaments/${tournamentId}`);
      
      // Should not show manage button
      cy.get('[data-cy="manage-tournament-btn"]').should('not.exist');
    });
  });

  describe('Team Lead Limits', () => {
    it('should enforce max 2 team leads per 32v32 team', () => {
      cy.login('team-captain@test.com', 'password123');
      
      // Create a team
      cy.createTeam('Test Team', '32v32').then((id) => {
        teamId = id;
      });
      
      // Add first team lead (captain)
      cy.addTeamMember(teamId, 'co-leader-1@test.com', 'CO_LEADER');
      
      // Add second team lead should work
      cy.addTeamMember(teamId, 'co-leader-2@test.com', 'CO_LEADER');
      
      // Try to add third team lead should fail
      cy.addTeamMember(teamId, 'co-leader-3@test.com', 'CO_LEADER', false);
      
      // Should show error message
      cy.get('[data-cy="error-message"]').should('contain', '32v32 teams can have a maximum of 2 team leads');
    });
  });
});
