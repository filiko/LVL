import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json()
    const { team_id } = body

    if (!team_id) {
      return NextResponse.json(
        { error: 'team_id is required' },
        { status: 400 }
      )
    }

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', params.id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if tournament is active and accepting registrations
    if (!tournament.is_active) {
      return NextResponse.json(
        { error: 'Tournament registration is closed' },
        { status: 400 }
      )
    }

    if (tournament.is_started) {
      return NextResponse.json(
        { error: 'Tournament has already started' },
        { status: 400 }
      )
    }

    // Get team details and check ownership
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, captain_id, member_count')
      .eq('id', team_id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if user is the team captain
    if (team.captain_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team captains can register their teams' },
        { status: 403 }
      )
    }

    // Check team size requirements based on tournament mode
    const minMemberRequirements = {
      '16v16': 16,
      '32v32': 32,
      '64v64': 64
    }

    const requiredMembers = minMemberRequirements[tournament.mode as keyof typeof minMemberRequirements]
    if (team.member_count < requiredMembers) {
      return NextResponse.json(
        { error: `Team needs at least ${requiredMembers} members for ${tournament.mode} tournaments` },
        { status: 400 }
      )
    }

    // Check if team is already registered
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('team_id', team_id)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Team is already registered for this tournament' },
        { status: 400 }
      )
    }

    // Check if tournament has reached max capacity
    const { data: currentRegistrations } = await supabase
      .from('registrations')
      .select('teams(member_count)')
      .eq('tournament_id', params.id)
      .eq('status', 'CONFIRMED')

    const currentPlayerCount = currentRegistrations?.reduce(
      (total, reg: any) => total + (reg.teams?.member_count || 0), 
      0
    ) || 0

    if (currentPlayerCount + team.member_count > tournament.max_players) {
      return NextResponse.json(
        { error: 'Tournament has reached maximum capacity' },
        { status: 400 }
      )
    }

    // Create registration
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .insert([{
        tournament_id: params.id,
        team_id: team_id,
        registered_by: session.user.id,
        status: 'CONFIRMED' // Auto-confirm for now, could be 'PENDING' for manual approval
      }])
      .select(`
        *,
        teams (
          id,
          name,
          tag,
          tier,
          member_count,
          profiles (
            id,
            username,
            tier
          )
        )
      `)
      .single()

    if (registrationError) {
      return NextResponse.json(
        { error: `Failed to register team: ${registrationError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { searchParams } = new URL(request.url)
    const team_id = searchParams.get('team_id')

    if (!team_id) {
      return NextResponse.json(
        { error: 'team_id is required' },
        { status: 400 }
      )
    }

    // Get tournament details
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('is_started')
      .eq('id', params.id)
      .single()

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    if (tournament.is_started) {
      return NextResponse.json(
        { error: 'Cannot withdraw from a tournament that has already started' },
        { status: 400 }
      )
    }

    // Get registration and check ownership
    const { data: registration } = await supabase
      .from('registrations')
      .select(`
        id,
        teams (
          captain_id
        )
      `)
      .eq('tournament_id', params.id)
      .eq('team_id', team_id)
      .single()

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Check if user is team captain or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    const isTeamCaptain = (registration as any).teams?.captain_id === session.user.id
    const isAdmin = profile?.is_admin

    if (!isTeamCaptain && !isAdmin) {
      return NextResponse.json(
        { error: 'Only team captains and admins can withdraw registrations' },
        { status: 403 }
      )
    }

    // Delete registration
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('tournament_id', params.id)
      .eq('team_id', team_id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to withdraw registration: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Registration withdrawn successfully' })
  } catch (error) {
    console.error('Registration withdrawal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}