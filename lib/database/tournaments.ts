import { createClient, createServerSupabaseClient } from '../supabase'
import type { Database } from '../database.types'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']

export const tournamentDb = {
  // Get tournaments with filters
  async getTournaments(filters: {
    mode?: string
    region?: string
    platform?: string
    active?: boolean
    limit?: number
    offset?: number
  } = {}) {
    const supabase = createClient()
    const { mode, region, platform, active, limit = 20, offset = 0 } = filters

    let query = supabase
      .from('tournaments')
      .select(`
        *,
        games (
          id,
          name,
          code
        ),
        profiles (
          id,
          username,
          tier
        )
      `)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (mode) query = query.eq('mode', mode)
    if (region) query = query.eq('region', region)
    if (platform) query = query.eq('platform', platform)
    if (active !== undefined) query = query.eq('is_active', active)

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch tournaments: ${error.message}`)
    return data
  },

  // Get single tournament with full details
  async getTournament(id: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        games (
          id,
          name,
          code,
          description
        ),
        profiles (
          id,
          username,
          tier
        ),
        registrations (
          id,
          status,
          registered_at,
          teams (
            id,
            name,
            tag,
            tier,
            captain_id,
            member_count,
            profiles (
              id,
              username,
              tier
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Tournament not found')
      }
      throw new Error(`Failed to fetch tournament: ${error.message}`)
    }

    return data
  },

  // Create tournament
  async createTournament(userId: string, tournamentData: TournamentInsert) {
    const supabase = createClient()

    // Validate mode and max_players alignment
    const modeMaxPlayers = {
      '16v16': 512,  // 16 teams * 32 players
      '32v32': 1024, // 32 teams * 32 players
      '64v64': 2048  // 64 teams * 32 players
    }

    if (tournamentData.max_players && tournamentData.mode) {
      const maxAllowed = modeMaxPlayers[tournamentData.mode as keyof typeof modeMaxPlayers]
      if (tournamentData.max_players > maxAllowed) {
        throw new Error(`Max players for ${tournamentData.mode} mode cannot exceed ${maxAllowed}`)
      }
    }

    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        ...tournamentData,
        created_by: userId
      }])
      .select(`
        *,
        games (
          id,
          name,
          code
        ),
        profiles (
          id,
          username,
          tier
        )
      `)
      .single()

    if (error) throw new Error(`Failed to create tournament: ${error.message}`)
    return data
  },

  // Update tournament
  async updateTournament(id: string, updates: TournamentUpdate) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        games (
          id,
          name,
          code
        ),
        profiles (
          id,
          username,
          tier
        )
      `)
      .single()

    if (error) throw new Error(`Failed to update tournament: ${error.message}`)
    return data
  },

  // Get team registrations for tournament
  async getTeamRegistrations(teamId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        tournament:tournaments (
          id,
          title,
          start_date,
          mode,
          registered_players,
          max_players
        )
      `)
      .eq('team_id', teamId)
      .order('registered_at', { ascending: false })

    if (error) throw new Error(`Failed to get team registrations: ${error.message}`)
    return { data, error: null }
  },

  // Delete tournament
  async deleteTournament(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete tournament: ${error.message}`)
  },

  // Get tournament teams
  async getTournamentTeams(tournamentId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        registered_at,
        teams (
          id,
          name,
          tag,
          tier,
          region,
          captain_id,
          member_count,
          max_members,
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
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('status', 'CONFIRMED')
      .order('registered_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch tournament teams: ${error.message}`)

    return data?.map(registration => ({
      ...registration.teams,
      registration_status: registration.status,
      registered_at: registration.registered_at
    })) || []
  },

  // Register team for tournament
  async registerTeam(tournamentId: string, teamId: string, userId: string, notes?: string) {
    const supabase = createClient()

    // Check if registration already exists
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('team_id', teamId)
      .single()

    if (existing) {
      throw new Error('Team is already registered for this tournament')
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        tournament_id: tournamentId,
        team_id: teamId,
        registered_by: userId,
        notes
      }])
      .select(`
        id,
        status,
        registered_at,
        tournaments (
          id,
          title,
          mode,
          start_date
        ),
        teams (
          id,
          name,
          tag,
          tier
        )
      `)
      .single()

    if (error) throw new Error(`Failed to register team: ${error.message}`)
    return data
  },

  // Update registration status (admin only)
  async updateRegistrationStatus(registrationId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', registrationId)
      .select(`
        id,
        status,
        registered_at,
        tournaments (
          id,
          title,
          mode
        ),
        teams (
          id,
          name,
          tag
        )
      `)
      .single()

    if (error) throw new Error(`Failed to update registration status: ${error.message}`)
    return data
  },

  // Get tournament statistics
  async getTournamentStats(tournamentId: string) {
    const supabase = createClient()

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        title,
        max_players,
        registered_players,
        registrations (
          id,
          status,
          teams (
            id,
            member_count
          )
        )
      `)
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw new Error(`Failed to fetch tournament stats: ${tournamentError.message}`)

    const confirmedTeams = tournament.registrations?.filter(reg => reg.status === 'CONFIRMED') || []
    const pendingTeams = tournament.registrations?.filter(reg => reg.status === 'PENDING') || []
    
    const confirmedPlayers = confirmedTeams.reduce((sum, reg) => sum + (reg.teams?.member_count || 0), 0)
    const pendingPlayers = pendingTeams.reduce((sum, reg) => sum + (reg.teams?.member_count || 0), 0)

    return {
      tournament_id: tournament.id,
      title: tournament.title,
      max_players: tournament.max_players,
      registered_players: tournament.registered_players,
      confirmed_teams: confirmedTeams.length,
      pending_teams: pendingTeams.length,
      confirmed_players: confirmedPlayers,
      pending_players: pendingPlayers,
      total_teams: tournament.registrations?.length || 0,
      slots_remaining: tournament.max_players - confirmedPlayers
    }
  }
}

// Server-side functions (for API routes)
export const tournamentServerDb = {
  // Same functions but using server client
  async getTournaments(filters: Parameters<typeof tournamentDb.getTournaments>[0] = {}) {
    const supabase = createServerSupabaseClient()
    // Implementation similar to client version but with server client
    // ... (implement as needed)
  },

  async getTournament(id: string) {
    const supabase = createServerSupabaseClient()
    // Implementation similar to client version but with server client
    // ... (implement as needed)
  }

  // Add other server functions as needed
}