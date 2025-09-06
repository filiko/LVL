// Cypress custom commands for tournament testing
Cypress.Commands.add('createTournament', (tournamentData) => {
  return cy.request({
    method: 'POST',
    url: '/api/tournaments',
    body: tournamentData,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.tournament.id;
  });
});

Cypress.Commands.add('createTeam', (teamName, mode = '32v32') => {
  return cy.request({
    method: 'POST',
    url: '/api/teams',
    body: {
      name: teamName,
      tag: teamName.substring(0, 4).toUpperCase(),
      mode: mode,
      max_members: mode === '32v32' ? 32 : 16,
      recruitment_status: 'OPEN'
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.team.id;
  });
});

Cypress.Commands.add('createTeamRegistration', (tournamentId, teamName, memberCount) => {
  return cy.createTeam(teamName).then((teamId) => {
    // Add members to team
    for (let i = 0; i < memberCount; i++) {
      cy.request({
        method: 'POST',
        url: `/api/teams/${teamId}/members`,
        body: {
          player_id: `player-${i}@test.com`,
          role: i === 0 ? 'CAPTAIN' : 'MEMBER',
          position: 'INFANTRY'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        }
      });
    }

    // Register team for tournament
    return cy.request({
      method: 'POST',
      url: '/api/registrations',
      body: {
        tournament_id: tournamentId,
        team_id: teamId
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      return response.body.registration.id;
    });
  });
});

Cypress.Commands.add('addTeamMember', (teamId, playerEmail, role = 'MEMBER', shouldSucceed = true) => {
  return cy.request({
    method: 'POST',
    url: `/api/teams/${teamId}/members`,
    body: {
      player_id: playerEmail,
      role: role,
      position: 'INFANTRY'
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    },
    failOnStatusCode: false
  }).then((response) => {
    if (shouldSucceed) {
      expect(response.status).to.eq(201);
    } else {
      expect(response.status).to.eq(400);
    }
    return response;
  });
});

Cypress.Commands.add('updateRegistrationStatus', (registrationId, status) => {
  return cy.request({
    method: 'PUT',
    url: `/api/registrations/${registrationId}`,
    body: { status },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

Cypress.Commands.add('login', (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    Cypress.env('authToken', response.body.token);
    
    // Set auth token in localStorage for frontend
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', response.body.token);
    });
  });
});

Cypress.Commands.add('logout', () => {
  Cypress.env('authToken', null);
  cy.window().then((win) => {
    win.localStorage.removeItem('authToken');
  });
});

// Test data factories
Cypress.Commands.add('createTestUser', (userData = {}) => {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    username: `testuser${Date.now()}`,
    tier: 'BRONZE',
    is_team_lead: false,
    is_admin: false
  };

  const user = { ...defaultUser, ...userData };
  
  return cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: user
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.user;
  });
});

Cypress.Commands.add('createTestTournament', (overrides = {}) => {
  const defaultTournament = {
    title: `Test Tournament ${Date.now()}`,
    game_id: 'bf2042',
    mode: '32v32',
    max_players: 64,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    region: 'EAST_COAST',
    platform: 'PC',
    language: 'English',
    bracket_type: 'SINGLE_ELIMINATION'
  };

  return cy.createTournament({ ...defaultTournament, ...overrides });
});

// Assertion helpers
Cypress.Commands.add('shouldShowTournamentManagement', () => {
  cy.get('[data-cy="manage-tournament-btn"]').should('be.visible');
  cy.get('[data-cy="tournament-title"]').should('be.visible');
  cy.get('[data-cy="tournament-status"]').should('be.visible');
});

Cypress.Commands.add('shouldShowRegistrationManagement', () => {
  cy.get('[data-cy="tab-registrations"]').should('be.visible');
  cy.get('[data-cy="registration-row"]').should('exist');
  cy.get('[data-cy="approve-registration"]').should('be.visible');
  cy.get('[data-cy="reject-registration"]').should('be.visible');
});

Cypress.Commands.add('shouldShowTournamentStats', (expectedStats) => {
  if (expectedStats.totalRegistrations !== undefined) {
    cy.get('[data-cy="total-registrations"]').should('contain', expectedStats.totalRegistrations);
  }
  if (expectedStats.confirmedRegistrations !== undefined) {
    cy.get('[data-cy="confirmed-registrations"]').should('contain', expectedStats.confirmedRegistrations);
  }
  if (expectedStats.pendingRegistrations !== undefined) {
    cy.get('[data-cy="pending-registrations"]').should('contain', expectedStats.pendingRegistrations);
  }
  if (expectedStats.playerCount !== undefined) {
    cy.get('[data-cy="player-count"]').should('contain', expectedStats.playerCount);
  }
});

// Database cleanup helpers
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test tournaments, teams, and users
  cy.request({
    method: 'DELETE',
    url: '/api/test/cleanup',
    headers: {
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    }
  });
});

// Mock external services
Cypress.Commands.add('mockSupabase', () => {
  cy.intercept('POST', '**/auth/v1/token*', {
    statusCode: 200,
    body: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com'
      }
    }
  });

  cy.intercept('GET', '**/rest/v1/tournaments*', {
    statusCode: 200,
    body: []
  });

  cy.intercept('GET', '**/rest/v1/teams*', {
    statusCode: 200,
    body: []
  });
});

// Performance testing helpers
Cypress.Commands.add('measureTournamentCreation', () => {
  const startTime = Date.now();
  
  return cy.createTestTournament().then(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Tournament creation should complete within 2 seconds
    expect(duration).to.be.lessThan(2000);
    
    return duration;
  });
});

Cypress.Commands.add('measureRegistrationApproval', (registrationId) => {
  const startTime = Date.now();
  
  return cy.updateRegistrationStatus(registrationId, 'CONFIRMED').then(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Registration approval should complete within 1 second
    expect(duration).to.be.lessThan(1000);
    
    return duration;
  });
});
