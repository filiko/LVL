import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
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
    const userId = searchParams.get('user_id') || session.user.id
    const teamId = searchParams.get('team_id')
    const tournamentId = searchParams.get('tournament_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('registrations')
      .select(`
        id,
        status,
        registered_at,
        notes,
        tournaments (
          id,
          title,
          mode,
          start_date,
          end_date,
          region,
          platform,
          is_active,
          is_started,
          is_completed,
          games (
            id,
            name,
            code
          )
        ),
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
            tier,
            avatar_url
          )
        )
      `)
      .order('registered_at', { ascending: false })

    // Filter by user's teams (as captain or member)
    if (userId) {
      // Get user's teams first
      const { data: userTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('player_id', userId)
        .eq('is_active', true)

      const teamIds = userTeams?.map(membership => membership.team_id) || []

      if (teamIds.length > 0) {
        query = query.in('team_id', teamIds)
      } else {
        // User has no teams, return empty result
        return NextResponse.json([])
      }
    }

    // Apply additional filters
    if (teamId) {
      query = query.eq('team_id', teamId)
    }
    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: registrations, error } = await query

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch registrations: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Registrations fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}