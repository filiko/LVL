import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: team, error } = await supabase
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
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch team: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Get team to check permissions
    const { data: team } = await supabase
      .from('teams')
      .select('captain_id')
      .eq('id', params.id)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if user can update team (captain or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (team.captain_id !== session.user.id && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only team captains and admins can update teams' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      tag,
      description,
      tier,
      region,
      language,
      max_members,
      is_recruiting,
      discord_server
    } = body

    // Update team
    const { data: updatedTeam, error } = await supabase
      .from('teams')
      .update({
        name,
        tag,
        description,
        tier,
        region,
        language,
        max_members,
        is_recruiting,
        discord_server
      })
      .eq('id', params.id)
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

    if (error) {
      return NextResponse.json(
        { error: `Failed to update team: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error('Team update error:', error)
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

    // Get team to check permissions
    const { data: team } = await supabase
      .from('teams')
      .select('captain_id')
      .eq('id', params.id)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if user can delete team (captain or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (team.captain_id !== session.user.id && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only team captains and admins can delete teams' },
        { status: 403 }
      )
    }

    // Check if team has active tournament registrations
    const { data: activeRegistrations } = await supabase
      .from('registrations')
      .select('tournaments(is_started, is_completed)')
      .eq('team_id', params.id)
      .eq('status', 'CONFIRMED')

    const hasActiveTournaments = activeRegistrations?.some(reg => 
      reg.tournaments?.is_started && !reg.tournaments?.is_completed
    )

    if (hasActiveTournaments) {
      return NextResponse.json(
        { error: 'Cannot delete team with active tournament registrations' },
        { status: 400 }
      )
    }

    // Delete team (cascading will handle related records)
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete team: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Team deleted successfully' })
  } catch (error) {
    console.error('Team deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}