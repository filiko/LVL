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
    const { data: teams, error } = await supabase
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
      .eq('tournament_id', params.id)
      .eq('status', 'CONFIRMED')
      .order('registered_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch tournament teams: ${error.message}` },
        { status: 500 }
      )
    }

    // Extract team data from registrations
    const tournamentTeams = teams?.map(registration => ({
      ...registration.teams,
      registration_status: registration.status,
      registered_at: registration.registered_at
    })) || []

    return NextResponse.json(tournamentTeams)
  } catch (error) {
    console.error('Tournament teams fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}