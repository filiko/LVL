import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Test database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ydsmddzawvigqsgpwqtv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc21kZHphd3ZpZ3FzZ3B3cXR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk3MTUwMiwiZXhwIjoyMDcyNTQ3NTAyfQ.WCq5_4d8uW301L-SJFqHvmNgVAM-KbynkZr7_YJacI0';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface TestDataSummary {
  users: number;
  teams: number;
  tournaments: number;
  registrations: number;
  teamMembers: number;
}

interface TournamentData {
  id: string;
  title: string;
  mode: string;
  max_players: number;
  registered_players: number;
  created_by: string;
  is_active: boolean;
  is_started: boolean;
  creator_username?: string;
  registrations: Array<{
    id: string;
    team_name: string;
    status: string;
    member_count: number;
  }>;
}

interface TeamData {
  id: string;
  name: string;
  tag: string;
  captain_username: string;
  member_count: number;
  max_members: number;
  team_leads: number;
  members: Array<{
    username: string;
    role: string;
    position: string;
    squad: string;
  }>;
}

export class TestDataViewer {
  /**
   * Get summary of all test data in the database
   */
  static async getDataSummary(): Promise<TestDataSummary> {
    try {
      const [usersResult, teamsResult, tournamentsResult, registrationsResult, teamMembersResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('teams').select('id', { count: 'exact' }),
        supabase.from('tournaments').select('id', { count: 'exact' }),
        supabase.from('registrations').select('id', { count: 'exact' }),
        supabase.from('team_members').select('id', { count: 'exact' })
      ]);

      return {
        users: usersResult.count || 0,
        teams: teamsResult.count || 0,
        tournaments: tournamentsResult.count || 0,
        registrations: registrationsResult.count || 0,
        teamMembers: teamMembersResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching data summary:', error);
      throw error;
    }
  }

  /**
   * Get detailed tournament data with registrations
   */
  static async getTournamentData(tournamentId?: string): Promise<TournamentData[]> {
    try {
      let query = supabase
        .from('tournaments')
        .select(`
          id,
          title,
          mode,
          max_players,
          registered_players,
          created_by,
          is_active,
          is_started,
          profiles!tournaments_created_by_fkey(username),
          registrations(
            id,
            status,
            teams(
              name,
              member_count
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (tournamentId) {
        query = query.eq('id', tournamentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(tournament => ({
        id: tournament.id,
        title: tournament.title,
        mode: tournament.mode,
        max_players: tournament.max_players,
        registered_players: tournament.registered_players,
        created_by: tournament.created_by,
        is_active: tournament.is_active,
        is_started: tournament.is_started,
        creator_username: (tournament.profiles as any)?.username,
        registrations: (tournament.registrations || []).map(reg => ({
          id: reg.id,
          team_name: (reg.teams as any)?.name || 'Unknown Team',
          status: reg.status,
          member_count: (reg.teams as any)?.member_count || 0
        }))
      }));
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      throw error;
    }
  }

  /**
   * Get detailed team data with members
   */
  static async getTeamData(teamId?: string): Promise<TeamData[]> {
    try {
      let query = supabase
        .from('teams')
        .select(`
          id,
          name,
          tag,
          member_count,
          max_members,
          captain_id,
          profiles!teams_captain_id_fkey(username),
          team_members(
            profiles(username),
            role,
            position,
            squad
          )
        `)
        .order('created_at', { ascending: false });

      if (teamId) {
        query = query.eq('id', teamId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(team => {
        const members = (team.team_members || []) as any[];
        const teamLeads = members.filter(m => m.role === 'CAPTAIN' || m.role === 'CO_LEADER').length;

        return {
          id: team.id,
          name: team.name,
          tag: team.tag,
          captain_username: (team.profiles as any)?.username || 'Unknown',
          member_count: team.member_count,
          max_members: team.max_members,
          team_leads: teamLeads,
          members: members.map(member => ({
            username: (member.profiles as any)?.username || 'Unknown',
            role: member.role,
            position: member.position,
            squad: member.squad
          }))
        };
      });
    } catch (error) {
      console.error('Error fetching team data:', error);
      throw error;
    }
  }

  /**
   * Get test users with their roles and permissions
   */
  static async getTestUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          tier,
          is_admin,
          is_team_lead,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching test users:', error);
      throw error;
    }
  }

  /**
   * Get 32v32 tournaments specifically
   */
  static async get32v32Tournaments(): Promise<TournamentData[]> {
    try {
      const tournaments = await this.getTournamentData();
      return tournaments.filter(t => t.mode === '32v32');
    } catch (error) {
      console.error('Error fetching 32v32 tournaments:', error);
      throw error;
    }
  }

  /**
   * Get teams with exactly 2 team leads (for 32v32 validation)
   */
  static async getTeamsWithTwoLeads(): Promise<TeamData[]> {
    try {
      const teams = await this.getTeamData();
      return teams.filter(t => t.team_leads === 2);
    } catch (error) {
      console.error('Error fetching teams with two leads:', error);
      throw error;
    }
  }

  /**
   * Get teams with more than 2 team leads (should be none for 32v32)
   */
  static async getTeamsWithTooManyLeads(): Promise<TeamData[]> {
    try {
      const teams = await this.getTeamData();
      return teams.filter(t => t.team_leads > 2);
    } catch (error) {
      console.error('Error fetching teams with too many leads:', error);
      throw error;
    }
  }

  /**
   * Validate tournament creator system
   */
  static async validateTournamentCreatorSystem(): Promise<{
    valid: boolean;
    issues: string[];
    summary: any;
  }> {
    const issues: string[] = [];
    
    try {
      // Check 32v32 tournaments have correct max players
      const tournaments32v32 = await this.get32v32Tournaments();
      const invalidPlayerCount = tournaments32v32.filter(t => t.max_players !== 64);
      if (invalidPlayerCount.length > 0) {
        issues.push(`Found ${invalidPlayerCount.length} 32v32 tournaments with incorrect max players (should be 64)`);
      }

      // Check teams don't have more than 2 team leads
      const teamsWithTooManyLeads = await this.getTeamsWithTooManyLeads();
      if (teamsWithTooManyLeads.length > 0) {
        issues.push(`Found ${teamsWithTooManyLeads.length} teams with more than 2 team leads`);
      }

      // Check tournament creators exist
      const tournaments = await this.getTournamentData();
      const tournamentsWithoutCreators = tournaments.filter(t => !t.creator_username);
      if (tournamentsWithoutCreators.length > 0) {
        issues.push(`Found ${tournamentsWithoutCreators.length} tournaments without valid creators`);
      }

      const summary = await this.getDataSummary();
      
      return {
        valid: issues.length === 0,
        issues,
        summary
      };
    } catch (error) {
      return {
        valid: false,
        issues: [`Error validating system: ${error}`],
        summary: null
      };
    }
  }

  /**
   * Print formatted data summary to console
   */
  static async printDataSummary(): Promise<void> {
    console.log('\n🎯 TOURNAMENT CREATOR SYSTEM - DATABASE INSPECTION');
    console.log('='.repeat(60));

    try {
      const summary = await this.getDataSummary();
      console.log('\n📊 Database Summary:');
      console.log(`  Users: ${summary.users}`);
      console.log(`  Teams: ${summary.teams}`);
      console.log(`  Tournaments: ${summary.tournaments}`);
      console.log(`  Registrations: ${summary.registrations}`);
      console.log(`  Team Members: ${summary.teamMembers}`);

      // Show 32v32 tournaments
      const tournaments32v32 = await this.get32v32Tournaments();
      console.log(`\n🎮 32v32 Tournaments (${tournaments32v32.length}):`);
      tournaments32v32.forEach(t => {
        console.log(`  - ${t.title} (${t.max_players} max players) - Created by: ${t.creator_username}`);
        console.log(`    Status: ${t.is_active ? 'Active' : 'Inactive'} | ${t.registrations.length} registrations`);
      });

      // Show teams with proper team lead counts
      const teamsWithTwoLeads = await this.getTeamsWithTwoLeads();
      const teamsWithTooManyLeads = await this.getTeamsWithTooManyLeads();
      console.log(`\n👥 Team Lead Validation:`);
      console.log(`  Teams with exactly 2 leads: ${teamsWithTwoLeads.length}`);
      console.log(`  Teams with too many leads: ${teamsWithTooManyLeads.length}`);

      if (teamsWithTooManyLeads.length > 0) {
        console.log('  ⚠️  Teams with too many leads:');
        teamsWithTooManyLeads.forEach(t => {
          console.log(`    - ${t.name}: ${t.team_leads} leads`);
        });
      }

      // Show test users
      const testUsers = await this.getTestUsers();
      const admins = testUsers.filter(u => u.is_admin);
      const teamLeads = testUsers.filter(u => u.is_team_lead && !u.is_admin);
      const regularUsers = testUsers.filter(u => !u.is_admin && !u.is_team_lead);

      console.log(`\n👤 Test Users:`);
      console.log(`  Admins: ${admins.length}`);
      console.log(`  Team Leads: ${teamLeads.length}`);
      console.log(`  Regular Users: ${regularUsers.length}`);

      // Validation results
      const validation = await this.validateTournamentCreatorSystem();
      console.log(`\n✅ System Validation:`);
      if (validation.valid) {
        console.log('  All checks passed! ✅');
      } else {
        console.log('  Issues found: ❌');
        validation.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }

    } catch (error) {
      console.error('Error printing data summary:', error);
    }
  }

  /**
   * Export all test data to JSON file
   */
  static async exportTestData(filename: string = 'test-data-export.json'): Promise<void> {
    try {
      const [summary, tournaments, teams, users] = await Promise.all([
        this.getDataSummary(),
        this.getTournamentData(),
        this.getTeamData(),
        this.getTestUsers()
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        summary,
        tournaments,
        teams,
        users,
        validation: await this.validateTournamentCreatorSystem()
      };

      const fs = require('fs');
      fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
      console.log(`\n📁 Test data exported to: ${filename}`);
    } catch (error) {
      console.error('Error exporting test data:', error);
    }
  }
}

// CLI interface for running the viewer
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'summary':
      TestDataViewer.printDataSummary();
      break;
    case 'export':
      const filename = process.argv[3] || 'test-data-export.json';
      TestDataViewer.exportTestData(filename);
      break;
    case 'validate':
      TestDataViewer.validateTournamentCreatorSystem().then(result => {
        console.log('\n🔍 Validation Results:');
        console.log(`Valid: ${result.valid ? '✅' : '❌'}`);
        if (result.issues.length > 0) {
          console.log('Issues:');
          result.issues.forEach(issue => console.log(`  - ${issue}`));
        }
      });
      break;
    default:
      console.log('Usage:');
      console.log('  npm run test:data:summary  - Show database summary');
      console.log('  npm run test:data:export   - Export all test data');
      console.log('  npm run test:data:validate - Validate system');
  }
}
