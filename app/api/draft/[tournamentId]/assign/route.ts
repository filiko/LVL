import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

interface TeamAssignment {
  team_id: string
  player_assignments: {
    player_id: string
    position: string
    squad_assignment?: string
  }[]
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin or tournament creator
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('created_by, is_started')
      .eq('id', params.tournamentId)
      .single()

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (tournament.created_by !== session.user.id && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only tournament creators and admins can assign players' },
        { status: 403 }
      )
    }

    if (tournament.is_started) {
      return NextResponse.json(
        { error: 'Cannot modify assignments after tournament has started' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { assignment_type, team_assignments } = body

    if (assignment_type === 'auto') {
      // Auto-assignment logic
      return await handleAutoAssignment(supabase, params.tournamentId)
    } else if (assignment_type === 'manual' && team_assignments) {
      // Manual assignment logic
      return await handleManualAssignment(supabase, params.tournamentId, team_assignments)
    } else {
      return NextResponse.json(
        { error: 'Invalid assignment type or missing data' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Player assignment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleAutoAssignment(supabase: any, tournamentId: string) {
  try {
    // Get all registered teams and their members
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        teams (
          id,
          name,
          team_members (
            id,
            player_id,
            position,
            profiles (
              id,
              username,
              tier
            )
          )
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('status', 'CONFIRMED')

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch registrations: ${error.message}` },
        { status: 500 }
      )
    }

    const teams = registrations?.map(reg => reg.teams).filter(Boolean) || []
    const squads = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL']
    const positions = ['INFANTRY', 'ARMOR', 'HELI', 'JET', 'SUPPORT']

    const assignments: TeamAssignment[] = []

    // Auto-assign players to squads and positions based on their preferences and tier
    for (const team of teams) {
      if (!team?.team_members) continue

      const teamAssignment: TeamAssignment = {
        team_id: team.id,
        player_assignments: []
      }

      // Sort members by tier (higher tiers get priority for specialized roles)
      const sortedMembers = [...team.team_members].sort((a, b) => {
        const tierOrder = { 'DIAMOND': 5, 'PLATINUM': 4, 'GOLD': 3, 'SILVER': 2, 'BRONZE': 1 }
        const aTier = tierOrder[a.profiles?.tier as keyof typeof tierOrder] || 1
        const bTier = tierOrder[b.profiles?.tier as keyof typeof tierOrder] || 1
        return bTier - aTier
      })

      // Assign squads and positions
      let squadIndex = 0
      let positionCounts = { INFANTRY: 0, ARMOR: 0, HELI: 0, JET: 0, SUPPORT: 0 }

      for (const member of sortedMembers) {
        if (!member.profiles?.id) continue

        // Determine best position based on current position preference and availability
        let assignedPosition = member.position || 'INFANTRY'
        
        // Balance positions - limit specialized roles
        const maxSpecializedRoles = Math.max(1, Math.floor(sortedMembers.length / 8))
        
        if (['ARMOR', 'HELI', 'JET'].includes(assignedPosition)) {
          if (positionCounts[assignedPosition as keyof typeof positionCounts] >= maxSpecializedRoles) {
            assignedPosition = 'INFANTRY'
          }
        }

        // Assign squad
        const assignedSquad = squads[squadIndex % squads.length]
        squadIndex++

        teamAssignment.player_assignments.push({
          player_id: member.profiles.id,
          position: assignedPosition,
          squad_assignment: assignedSquad
        })

        positionCounts[assignedPosition as keyof typeof positionCounts]++
      }

      assignments.push(teamAssignment)
    }

    // Apply assignments to database
    const updatePromises = assignments.flatMap(teamAssignment =>
      teamAssignment.player_assignments.map(playerAssignment =>
        supabase
          .from('team_members')
          .update({
            position: playerAssignment.position,
            squad_assignment: playerAssignment.squad_assignment
          })
          .eq('team_id', teamAssignment.team_id)
          .eq('player_id', playerAssignment.player_id)
      )
    )

    const results = await Promise.allSettled(updatePromises)
    const failed = results.filter(result => result.status === 'rejected')

    if (failed.length > 0) {
      console.error('Some assignments failed:', failed)
    }

    return NextResponse.json({
      message: 'Auto-assignment completed',
      teams_processed: assignments.length,
      players_assigned: assignments.reduce((sum, team) => sum + team.player_assignments.length, 0),
      failed_assignments: failed.length
    })
  } catch (error) {
    console.error('Auto-assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to complete auto-assignment' },
      { status: 500 }
    )
  }
}

async function handleManualAssignment(supabase: any, tournamentId: string, teamAssignments: TeamAssignment[]) {
  try {
    // Validate team assignments belong to tournament
    const { data: validTeams, error: validationError } = await supabase
      .from('registrations')
      .select('team_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'CONFIRMED')

    if (validationError) {
      return NextResponse.json(
        { error: `Validation failed: ${validationError.message}` },
        { status: 500 }
      )
    }

    const validTeamIds = new Set(validTeams?.map(reg => reg.team_id) || [])

    // Filter out invalid team assignments
    const filteredAssignments = teamAssignments.filter(assignment =>
      validTeamIds.has(assignment.team_id)
    )

    // Apply manual assignments
    const updatePromises = filteredAssignments.flatMap(teamAssignment =>
      teamAssignment.player_assignments.map(playerAssignment =>
        supabase
          .from('team_members')
          .update({
            position: playerAssignment.position,
            squad_assignment: playerAssignment.squad_assignment
          })
          .eq('team_id', teamAssignment.team_id)
          .eq('player_id', playerAssignment.player_id)
      )
    )

    const results = await Promise.allSettled(updatePromises)
    const failed = results.filter(result => result.status === 'rejected')

    if (failed.length > 0) {
      console.error('Some manual assignments failed:', failed)
    }

    return NextResponse.json({
      message: 'Manual assignment completed',
      teams_processed: filteredAssignments.length,
      players_assigned: filteredAssignments.reduce((sum, team) => sum + team.player_assignments.length, 0),
      failed_assignments: failed.length
    })
  } catch (error) {
    console.error('Manual assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to complete manual assignment' },
      { status: 500 }
    )
  }
}