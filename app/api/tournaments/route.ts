import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')
    const region = searchParams.get('region')
    const platform = searchParams.get('platform')
    const isActive = searchParams.get('active')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Apply filters
    if (mode) {
      query = query.eq('mode', mode)
    }
    if (region) {
      query = query.eq('region', region)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: tournaments, error } = await query

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch tournaments: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Tournament fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user can create tournaments (team lead or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_team_lead, is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_team_lead && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only team leads and admins can create tournaments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      game_id,
      mode,
      max_players,
      start_date,
      end_date,
      region,
      platform,
      language,
      tournament_type,
      bracket_type,
      prize_pool,
      entry_fee,
      description,
      rules,
      discord_channel
    } = body

    // Validate required fields
    if (!title || !game_id || !mode || !max_players || !start_date || !region || !platform || !language || !bracket_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate mode and max_players alignment
    const modeMaxPlayers = {
      '16v16': 512,  // 16 teams * 32 players
      '32v32': 1024, // 32 teams * 32 players
      '64v64': 2048  // 64 teams * 32 players
    }

    if (max_players > modeMaxPlayers[mode as keyof typeof modeMaxPlayers]) {
      return NextResponse.json(
        { error: `Max players for ${mode} mode cannot exceed ${modeMaxPlayers[mode as keyof typeof modeMaxPlayers]}` },
        { status: 400 }
      )
    }

    // Create tournament
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert([{
        title,
        game_id,
        mode,
        max_players,
        start_date,
        end_date,
        region,
        platform,
        language,
        tournament_type: tournament_type || 'RANKED',
        bracket_type,
        prize_pool,
        entry_fee,
        description,
        rules,
        discord_channel,
        created_by: session.user.id
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

    if (error) {
      return NextResponse.json(
        { error: `Failed to create tournament: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    console.error('Tournament creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}