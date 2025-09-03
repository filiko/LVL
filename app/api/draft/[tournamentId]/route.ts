import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function GET(
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
      .select('created_by')
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
        { error: 'Only tournament creators and admins can access draft data' },
        { status: 403 }
      )
    }

    // Get tournament details with registered teams and players
    const { data: tournamentData, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        title,
        mode,
        max_players,
        registered_players,
        is_started,
        registrations (
          id,
          status,
          teams (
            id,
            name,
            tag,
            tier,
            captain_id,
            member_count,
            team_members (
              id,
              role,
              position,
              squad_assignment,
              profiles (
                id,
                username,
                tier,
                avatar_url,
                country_code
              )
            )
          )
        )
      `)
      .eq('id', params.tournamentId)
      .single()

    if (tournamentError) {
      return NextResponse.json(
        { error: `Failed to fetch tournament data: ${tournamentError.message}` },
        { status: 500 }
      )
    }

    // Filter confirmed registrations and extract players
    const confirmedRegistrations = tournamentData.registrations?.filter(
      reg => reg.status === 'CONFIRMED'
    ) || []

    const teams = confirmedRegistrations.map(reg => reg.teams).filter(Boolean)
    const allPlayers = teams.flatMap(team => 
      team?.team_members?.map(member => ({
        id: member.profiles?.id,
        username: member.profiles?.username,
        tier: member.profiles?.tier,
        avatar_url: member.profiles?.avatar_url,
        country_code: member.profiles?.country_code,
        team_id: team.id,
        team_name: team.name,
        team_tag: team.tag,
        role: member.role,
        position: member.position,
        squad_assignment: member.squad_assignment
      })) || []
    )

    // Calculate draft statistics
    const totalPlayers = allPlayers.length
    const playersByTier = allPlayers.reduce((acc, player) => {
      const tier = player.tier || 'BRONZE'
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const playersByPosition = allPlayers.reduce((acc, player) => {
      const position = player.position || 'INFANTRY'
      acc[position] = (acc[position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      tournament: {
        id: tournamentData.id,
        title: tournamentData.title,
        mode: tournamentData.mode,
        max_players: tournamentData.max_players,
        registered_players: tournamentData.registered_players,
        is_started: tournamentData.is_started
      },
      teams: teams.map(team => ({
        id: team?.id,
        name: team?.name,
        tag: team?.tag,
        tier: team?.tier,
        captain_id: team?.captain_id,
        member_count: team?.member_count,
        members: team?.team_members?.map(member => ({
          id: member.profiles?.id,
          username: member.profiles?.username,
          tier: member.profiles?.tier,
          avatar_url: member.profiles?.avatar_url,
          role: member.role,
          position: member.position,
          squad_assignment: member.squad_assignment
        })) || []
      })),
      players: allPlayers,
      statistics: {
        total_teams: teams.length,
        total_players: totalPlayers,
        players_by_tier: playersByTier,
        players_by_position: playersByPosition,
        avg_team_size: teams.length > 0 ? Math.round(totalPlayers / teams.length) : 0
      }
    })
  } catch (error) {
    console.error('Draft data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}