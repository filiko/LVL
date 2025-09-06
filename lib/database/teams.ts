import { createClient, createServerSupabaseClient } from '../supabase'
import type { Database } from '../database.types'

type Team = Database['public']['Tables']['teams']['Row']
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']
type TeamMember = Database['public']['Tables']['team_members']['Row']
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']

export const teamDb = {
  // Generate unique join code
  generateJoinCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // Get teams with filters
  async getTeams(filters: {
    region?: string
    tier?: string
    recruiting?: boolean
    limit?: number
    offset?: number
  } = {}) {
    const supabase = createClient()
    const { region, tier, recruiting, limit = 20, offset = 0 } = filters

    let query = supabase
      .from('teams')
      .select(`
        *,
        profiles (
          id,
          username,
          tier,
          avatar_url
        ),
        team_members (
          id,
          role,
          position,
          squad_assignment,
          profiles (
            id,
            username,
            tier,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (region) query = query.eq('region', region)
    if (tier) query = query.eq('tier', tier)
    if (recruiting !== undefined) query = query.eq('is_recruiting', recruiting)

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch teams: ${error.message}`)
    return data
  },

  // Get single team with full details
  async getTeam(id: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        profiles (
          id,
          username,
          tier,
          avatar_url
        ),
        team_members (
          id,
          role,
          position,
          squad_assignment,
          joined_at,
          is_active,
          profiles (
            id,
            username,
            tier,
            avatar_url,
            discord_id
          )
        ),
        registrations (
          id,
          tournament_id,
          status,
          registered_at,
          tournaments (
            id,
            title,
            mode,
            start_date
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Team not found')
      }
      throw new Error(`Failed to fetch team: ${error.message}`)
    }

    return data
  },

  // Create team
  async createTeam(userId: string, teamData: Omit<TeamInsert, 'captain_id' | 'join_code'>) {
    const supabase = createClient()

    // Generate unique join code
    let joinCode = this.generateJoinCode()
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('join_code', joinCode)
        .single()
      
      if (!existingTeam) {
        isUnique = true
      } else {
        joinCode = this.generateJoinCode()
        attempts++
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique join code')
    }

    // Create team
    const { data: team, error } = await supabase
      .from('teams')
      .insert([{
        ...teamData,
        captain_id: userId,
        join_code: joinCode
      }])
      .select(`
        *,
        profiles (
          id,
          username,
          tier,
          avatar_url
        )
      `)
      .single()

    if (error) throw new Error(`Failed to create team: ${error.message}`)

    // Add creator as team member (captain)
    await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        player_id: userId,
        role: 'CAPTAIN',
        position: 'INFANTRY'
      }])

    return team
  },

  // Update team
  async updateTeam(id: string, updates: TeamUpdate) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles (
          id,
          username,
          tier,
          avatar_url
        )
      `)
      .single()

    if (error) throw new Error(`Failed to update team: ${error.message}`)
    return data
  },

  // Delete team
  async deleteTeam(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete team: ${error.message}`)
  },

  // Get team members
  async getTeamMembers(teamId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        position,
        squad_assignment,
        joined_at,
        is_active,
        profiles (
          id,
          username,
          tier,
          avatar_url,
          discord_id,
          country_code
        )
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch team members: ${error.message}`)
    return data
  },

  // Join team with join code
  async joinTeam(joinCode: string, userId: string, position?: string) {
    const supabase = createClient()

    // Verify join code and get team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, member_count, max_members, is_recruiting')
      .eq('join_code', joinCode)
      .single()

    if (teamError || !team) {
      throw new Error('Invalid join code')
    }

    if (!team.is_recruiting) {
      throw new Error('Team is not currently recruiting')
    }

    if (team.member_count >= team.max_members) {
      throw new Error('Team is full')
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('player_id', userId)
      .eq('is_active', true)
      .single()

    if (existingMembership) {
      throw new Error('You are already a member of this team')
    }

    // Add user to team
    const { data: newMember, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        player_id: userId,
        role: 'MEMBER',
        position: position || 'INFANTRY'
      }])
      .select(`
        id,
        role,
        position,
        squad_assignment,
        joined_at,
        profiles (
          id,
          username,
          tier,
          avatar_url
        )
      `)
      .single()

    if (error) throw new Error(`Failed to join team: ${error.message}`)
    return { member: newMember, team_name: team.name }
  },

  // Add member to team (captain only)
  async addTeamMember(teamId: string, playerId: string, memberData: {
    role?: 'CAPTAIN' | 'CO_LEADER' | 'MEMBER'
    position?: string
    squad_assignment?: string
  } = {}) {
    const supabase = createClient()

    // Check team capacity
    const { data: team } = await supabase
      .from('teams')
      .select('member_count, max_members')
      .eq('id', teamId)
      .single()

    if (team && team.member_count >= team.max_members) {
      throw new Error('Team is full')
    }

    // Check if player is already a member
    const { data: existingMembership } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .eq('is_active', true)
      .single()

    if (existingMembership) {
      throw new Error('Player is already a team member')
    }

    // Check team lead limits for 32v32 teams (max 2 team leads)
    if (memberData.role === 'CAPTAIN' || memberData.role === 'CO_LEADER') {
      const { data: existingLeads } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .in('role', ['CAPTAIN', 'CO_LEADER'])
        .eq('is_active', true)

      if (existingLeads && existingLeads.length >= 2) {
        throw new Error('32v32 teams can have a maximum of 2 team leads (Captain + Co-Leader)')
      }
    }

    const { data: newMember, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        player_id: playerId,
        role: memberData.role || 'MEMBER',
        position: memberData.position || 'INFANTRY',
        squad_assignment: memberData.squad_assignment
      }])
      .select(`
        id,
        role,
        position,
        squad_assignment,
        joined_at,
        profiles (
          id,
          username,
          tier,
          avatar_url
        )
      `)
      .single()

    if (error) throw new Error(`Failed to add team member: ${error.message}`)
    return newMember
  },

  // Update team member
  async updateTeamMember(memberId: string, updates: TeamMemberUpdate) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', memberId)
      .select(`
        id,
        role,
        position,
        squad_assignment,
        joined_at,
        is_active,
        profiles (
          id,
          username,
          tier,
          avatar_url
        )
      `)
      .single()

    if (error) throw new Error(`Failed to update team member: ${error.message}`)
    return data
  },

  // Remove team member
  async removeTeamMember(memberId: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) throw new Error(`Failed to remove team member: ${error.message}`)
  },

  // Transfer team captaincy
  async transferCaptaincy(teamId: string, newCaptainId: string) {
    const supabase = createClient()

    // Get current captain
    const { data: team } = await supabase
      .from('teams')
      .select('captain_id')
      .eq('id', teamId)
      .single()

    if (!team) throw new Error('Team not found')

    // Check if new captain is a team member
    const { data: newCaptainMembership } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('team_id', teamId)
      .eq('player_id', newCaptainId)
      .eq('is_active', true)
      .single()

    if (!newCaptainMembership) {
      throw new Error('New captain must be an active team member')
    }

    // Update team captain
    const { error: teamError } = await supabase
      .from('teams')
      .update({ captain_id: newCaptainId })
      .eq('id', teamId)

    if (teamError) throw new Error(`Failed to update team captain: ${teamError.message}`)

    // Update old captain's role to member (if they're still in the team)
    if (team.captain_id) {
      await supabase
        .from('team_members')
        .update({ role: 'MEMBER' })
        .eq('team_id', teamId)
        .eq('player_id', team.captain_id)
    }

    // Update new captain's role
    const { error: memberError } = await supabase
      .from('team_members')
      .update({ role: 'CAPTAIN' })
      .eq('id', newCaptainMembership.id)

    if (memberError) {
      // Rollback team captain change
      await supabase
        .from('teams')
        .update({ captain_id: team.captain_id })
        .eq('id', teamId)

      throw new Error(`Failed to update member role: ${memberError.message}`)
    }

    return { success: true, message: 'Captaincy transferred successfully' }
  },

  // Get user's teams
  async getUserTeams(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        position,
        squad_assignment,
        joined_at,
        teams (
          id,
          name,
          tag,
          tier,
          region,
          member_count,
          max_members,
          is_recruiting,
          profiles (
            id,
            username,
            tier,
            avatar_url
          )
        )
      `)
      .eq('player_id', userId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch user teams: ${error.message}`)
    return data
  }
}