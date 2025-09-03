import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

// Generate random join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const tier = searchParams.get('tier')
    const recruiting = searchParams.get('recruiting')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Apply filters
    if (region) {
      query = query.eq('region', region)
    }
    if (tier) {
      query = query.eq('tier', tier)
    }
    if (recruiting !== null) {
      query = query.eq('is_recruiting', recruiting === 'true')
    }

    const { data: teams, error } = await query

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch teams: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Teams fetch error:', error)
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

    // Check if user is team lead
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_team_lead, is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_team_lead && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only team leads can create teams' },
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
      discord_server
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    // Generate unique join code
    let joinCode = generateJoinCode()
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
        joinCode = generateJoinCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique join code' },
        { status: 500 }
      )
    }

    // Create team
    const { data: team, error } = await supabase
      .from('teams')
      .insert([{
        name,
        tag,
        description,
        tier: tier || 'BRONZE',
        region,
        language,
        captain_id: session.user.id,
        max_members: max_members || 32,
        join_code: joinCode,
        discord_server
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

    if (error) {
      return NextResponse.json(
        { error: `Failed to create team: ${error.message}` },
        { status: 500 }
      )
    }

    // Add creator as team member (captain)
    await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        player_id: session.user.id,
        role: 'CAPTAIN',
        position: 'INFANTRY' // Default position
      }])

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Team creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}