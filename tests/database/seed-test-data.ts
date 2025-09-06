import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Test database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ydsmddzawvigqsgpwqtv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc21kZHphd3ZpZ3FzZ3B3cXR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk3MTUwMiwiZXhwIjoyMDcyNTQ3NTAyfQ.WCq5_4d8uW301L-SJFqHvmNgVAM-KbynkZr7_YJacI0';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export class TestDataSeeder {
  /**
   * Clear all test data from database
   */
  static async clearTestData(): Promise<void> {
    console.log('🧹 Clearing existing test data...');
    
    try {
      // Delete in correct order to respect foreign key constraints
      await supabase.from('registrations').delete().like('id', 'test-%');
      await supabase.from('team_members').delete().like('id', 'test-%');
      await supabase.from('teams').delete().like('id', 'test-%');
      await supabase.from('tournaments').delete().like('id', 'test-%');
      await supabase.from('profiles').delete().like('id', 'test-%');
      
      console.log('✅ Test data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      throw error;
    }
  }

  /**
   * Create test users for tournament creator system
   */
  static async createTestUsers(): Promise<string[]> {
    console.log('👤 Creating test users...');
    
    const testUsers = [
      // Tournament creators
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        username: 'TournamentCreator',
        email: 'tournament-creator@test.com',
        tier: 'GOLD',
        is_admin: false,
        is_team_lead: false
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        username: 'EventOrganizer',
        email: 'event-organizer@test.com',
        tier: 'PLATINUM',
        is_admin: false,
        is_team_lead: false
      },
      
      // Regular users
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        username: 'RegularUser',
        email: 'regular-user@test.com',
        tier: 'BRONZE',
        is_admin: false,
        is_team_lead: false
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        username: 'AnotherUser',
        email: 'another-user@test.com',
        tier: 'SILVER',
        is_admin: false,
        is_team_lead: false
      },
      
      // Admin user
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        username: 'TestAdmin',
        email: 'admin@test.com',
        tier: 'DIAMOND',
        is_admin: true,
        is_team_lead: true
      },
      
      // Team captains
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        username: 'TeamCaptain',
        email: 'team-captain@test.com',
        tier: 'GOLD',
        is_admin: false,
        is_team_lead: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        username: 'SquadLeader',
        email: 'squad-leader@test.com',
        tier: 'PLATINUM',
        is_admin: false,
        is_team_lead: true
      }
    ];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(testUsers)
        .select('id');

      if (error) throw error;
      
      console.log(`✅ Created ${testUsers.length} test users`);
      return data.map(user => user.id);
    } catch (error) {
      console.error('❌ Error creating test users:', error);
      throw error;
    }
  }

  /**
   * Create test teams with proper 32v32 structure
   */
  static async createTestTeams(): Promise<string[]> {
    console.log('👥 Creating test teams...');
    
    const testTeams = [
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Alpha Strike Force',
        tag: 'ALPHA',
        description: 'Elite 32v32 tactical unit',
        captain_id: '550e8400-e29b-41d4-a716-446655440006',
        max_members: 32,
        member_count: 0,
        is_recruiting: true,
        join_code: 'ALPHA1'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        name: 'Bravo Battalion',
        tag: 'BRAVO',
        description: 'Defensive specialists for 32v32',
        captain_id: '550e8400-e29b-41d4-a716-446655440007',
        max_members: 32,
        member_count: 0,
        is_recruiting: true,
        join_code: 'BRAVO2'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert(testTeams)
        .select('id');

      if (error) throw error;
      
      console.log(`✅ Created ${testTeams.length} test teams`);
      return data.map(team => team.id);
    } catch (error) {
      console.error('❌ Error creating test teams:', error);
      throw error;
    }
  }

  /**
   * Add team members with proper role distribution
   */
  static async addTeamMembers(teamIds: string[]): Promise<void> {
    console.log('👥 Adding team members...');
    
    const teamMembers = [];
    
    teamIds.forEach((teamId, teamIndex) => {
      const teamName = teamId === 'test-team-001' ? 'Alpha' : 'Bravo';
      
      // Add captain (team lead #1)
      teamMembers.push({
        id: `550e8400-e29b-41d4-a716-44665544${teamIndex === 0 ? '0010' : '0011'}`,
        team_id: teamId,
        player_id: teamId === '550e8400-e29b-41d4-a716-446655440008' ? '550e8400-e29b-41d4-a716-446655440006' : '550e8400-e29b-41d4-a716-446655440007',
        role: 'CAPTAIN',
        position: 'INFANTRY',
        squad: 'ALPHA',
        is_active: true
      });

      // Add co-leader (team lead #2) - this tests the 2 team lead limit
      teamMembers.push({
        id: `550e8400-e29b-41d4-a716-44665544${teamIndex === 0 ? '0012' : '0013'}`,
        team_id: teamId,
        player_id: teamIndex === 0 ? '550e8400-e29b-41d4-a716-446655440003' : '550e8400-e29b-41d4-a716-446655440004',
        role: 'CO_LEADER',
        position: 'ARMOR',
        squad: 'BRAVO',
        is_active: true
      });

      // Add regular members
      for (let i = 3; i <= 32; i++) {
        const positions = ['INFANTRY', 'ARMOR', 'HELI', 'JET', 'SUPPORT'];
        const squads = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'];
        
        teamMembers.push({
          id: `550e8400-e29b-41d4-a716-44665544${(1000 + i).toString()}`,
          team_id: teamId,
          player_id: `550e8400-e29b-41d4-a716-44665544${(100 + i).toString().padStart(3, '0')}`,
          role: 'MEMBER',
          position: positions[(i - 3) % positions.length],
          squad: squads[(i - 3) % squads.length],
          is_active: true
        });
      }
    });

    try {
      const { error } = await supabase
        .from('team_members')
        .insert(teamMembers);

      if (error) throw error;
      
      // Update team member counts
      for (const teamId of teamIds) {
        await supabase
          .from('teams')
          .update({ member_count: 32 })
          .eq('id', teamId);
      }
      
      console.log(`✅ Added ${teamMembers.length} team members`);
    } catch (error) {
      console.error('❌ Error adding team members:', error);
      throw error;
    }
  }

  /**
   * Create test games first
   */
  static async createTestGames(): Promise<string> {
    console.log('🎮 Creating test games...');
    
    const { data, error } = await supabase
      .from('games')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Battlefield 2042',
        code: 'BF2042',
        description: 'Large-scale multiplayer warfare',
        is_active: true
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Create test tournaments with proper 32v32 configuration
   */
  static async createTestTournaments(): Promise<string[]> {
    console.log('🎮 Creating test tournaments...');
    
    const testTournaments = [
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        title: 'Test 32v32 Championship',
        game_id: '550e8400-e29b-41d4-a716-446655440020', // Will be created for BF2042
        mode: '32v32',
        max_players: 64, // Correct: 32 per team
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
        region: 'EAST_COAST',
        platform: 'PC',
        language: 'English',
        bracket_type: 'SINGLE_ELIMINATION',
        tournament_type: 'RANKED',
        prize_pool: 1000,
        entry_fee: 10,
        description: 'Test tournament for 32v32 mode validation',
        rules: 'Standard 32v32 rules. Max 2 team leads per team.',
        discord_channel: 'https://discord.gg/test-tournament',
        is_active: true,
        is_started: false,
        is_completed: false,
        created_by: '550e8400-e29b-41d4-a716-446655440001',
        registered_players: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        title: 'Another 32v32 Tournament',
        game_id: '550e8400-e29b-41d4-a716-446655440020', // Will be created for BF2042
        mode: '32v32',
        max_players: 64, // Correct: 32 per team
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        region: 'WEST_COAST',
        platform: 'PC',
        language: 'English',
        bracket_type: 'DOUBLE_ELIMINATION',
        tournament_type: 'RANKED',
        prize_pool: 2000,
        entry_fee: 20,
        description: 'Another test tournament for validation',
        rules: 'Double elimination format. 32v32 mode.',
        discord_channel: 'https://discord.gg/test-tournament-2',
        is_active: true,
        is_started: false,
        is_completed: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        registered_players: 0
      }
    ];

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert(testTournaments)
        .select('id');

      if (error) throw error;
      
      console.log(`✅ Created ${testTournaments.length} test tournaments`);
      return data.map(tournament => tournament.id);
    } catch (error) {
      console.error('❌ Error creating test tournaments:', error);
      throw error;
    }
  }

  /**
   * Create test registrations
   */
  static async createTestRegistrations(tournamentIds: string[], teamIds: string[]): Promise<void> {
    console.log('📝 Creating test registrations...');
    
    const testRegistrations = [
      // Tournament 1 registrations
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        tournament_id: '550e8400-e29b-41d4-a716-446655440014',
        team_id: '550e8400-e29b-41d4-a716-446655440008',
        status: 'CONFIRMED',
        registered_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440017',
        tournament_id: '550e8400-e29b-41d4-a716-446655440014',
        team_id: '550e8400-e29b-41d4-a716-446655440009',
        status: 'PENDING',
        registered_at: new Date().toISOString()
      },
      
      // Tournament 2 registrations
      {
        id: '550e8400-e29b-41d4-a716-446655440018',
        tournament_id: '550e8400-e29b-41d4-a716-446655440015',
        team_id: '550e8400-e29b-41d4-a716-446655440008',
        status: 'CONFIRMED',
        registered_at: new Date().toISOString()
      }
    ];

    try {
      const { error } = await supabase
        .from('registrations')
        .insert(testRegistrations);

      if (error) throw error;
      
      // Update tournament registered_players counts
      await supabase
        .from('tournaments')
        .update({ registered_players: 32 }) // 1 confirmed team with 32 members
        .eq('id', 'test-tournament-001');
      
      await supabase
        .from('tournaments')
        .update({ registered_players: 32 }) // 1 confirmed team with 32 members
        .eq('id', 'test-tournament-002');
      
      console.log(`✅ Created ${testRegistrations.length} test registrations`);
    } catch (error) {
      console.error('❌ Error creating test registrations:', error);
      throw error;
    }
  }

  /**
   * Seed all test data
   */
  static async seedAllTestData(): Promise<void> {
    console.log('🌱 Seeding tournament creator test data...');
    console.log('='.repeat(50));

    try {
      // Clear existing test data
      await this.clearTestData();

      // Create test data in order
      const userIds = await this.createTestUsers();
      const gameId = await this.createTestGames();
      const teamIds = await this.createTestTeams();
      await this.addTeamMembers(teamIds);
      const tournamentIds = await this.createTestTournaments();
      await this.createTestRegistrations(tournamentIds, teamIds);

      console.log('\n🎉 Test data seeding completed successfully!');
      console.log('\n📊 Created:');
      console.log(`  - ${userIds.length} test users`);
      console.log(`  - ${teamIds.length} test teams`);
      console.log(`  - ${tournamentIds.length} test tournaments`);
      console.log(`  - Multiple team registrations`);
      
      console.log('\n🔍 You can now:');
      console.log('  - Run tests: npm run test:tournament');
      console.log('  - View data: npm run test:data:summary');
      console.log('  - Export data: npm run test:data:export');

    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      throw error;
    }
  }

  /**
   * Create a specific test scenario
   */
  static async createTournamentCreatorScenario(): Promise<void> {
    console.log('🎯 Creating tournament creator test scenario...');

    try {
      // Create a tournament creator
      const { data: creator } = await supabase
        .from('profiles')
        .insert({
          id: 'test-scenario-creator',
          username: 'ScenarioCreator',
          email: 'scenario-creator@test.com',
          tier: 'GOLD',
          is_admin: false,
          is_team_lead: false
        })
        .select()
        .single();

      // Create a tournament
      const { data: tournament } = await supabase
        .from('tournaments')
        .insert({
          id: 'test-scenario-tournament',
          title: 'Tournament Creator Test Scenario',
          game_id: 'bf2042',
          mode: '32v32',
          max_players: 64,
          start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          region: 'EAST_COAST',
          platform: 'PC',
          language: 'English',
          bracket_type: 'SINGLE_ELIMINATION',
          tournament_type: 'RANKED',
          is_active: true,
          is_started: false,
          created_by: creator.id,
          registered_players: 0
        })
        .select()
        .single();

      // Create a team
      const { data: team } = await supabase
        .from('teams')
        .insert({
          id: 'test-scenario-team',
          name: 'Scenario Test Team',
          tag: 'SCEN',
          description: 'Team for testing tournament creator scenario',
          captain_id: 'test-captain-001',
          max_members: 32,
          member_count: 0,
          is_recruiting: true,
          join_code: 'SCEN1'
        })
        .select()
        .single();

      // Register team for tournament
      await supabase
        .from('registrations')
        .insert({
          id: 'test-scenario-registration',
          tournament_id: tournament.id,
          team_id: team.id,
          status: 'PENDING',
          registered_at: new Date().toISOString()
        });

      console.log('✅ Tournament creator scenario created:');
      console.log(`  Creator: ${creator.username} (${creator.email})`);
      console.log(`  Tournament: ${tournament.title}`);
      console.log(`  Team: ${team.name}`);
      console.log(`  Registration: PENDING`);

    } catch (error) {
      console.error('❌ Error creating scenario:', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      TestDataSeeder.seedAllTestData();
      break;
    case 'clear':
      TestDataSeeder.clearTestData();
      break;
    case 'scenario':
      TestDataSeeder.createTournamentCreatorScenario();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run test:data:seed     - Seed all test data');
      console.log('  npm run test:data:clear    - Clear all test data');
      console.log('  npm run test:data:scenario - Create specific test scenario');
  }
}
