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
    const { data: tournament, error } = await supabase
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
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch tournament: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Tournament fetch error:', error)
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

    // Get tournament to check ownership
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if user can update tournament (owner or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (tournament.created_by !== session.user.id && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only tournament creators and admins can update tournaments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      max_players,
      start_date,
      end_date,
      region,
      platform,
      language,
      tournament_type,
      bracket_type,
      is_active,
      is_started,
      is_completed,
      prize_pool,
      entry_fee,
      description,
      rules,
      discord_channel
    } = body

    // Update tournament
    const { data: updatedTournament, error } = await supabase
      .from('tournaments')
      .update({
        title,
        max_players,
        start_date,
        end_date,
        region,
        platform,
        language,
        tournament_type,
        bracket_type,
        is_active,
        is_started,
        is_completed,
        prize_pool,
        entry_fee,
        description,
        rules,
        discord_channel
      })
      .eq('id', params.id)
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
        { error: `Failed to update tournament: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedTournament)
  } catch (error) {
    console.error('Tournament update error:', error)
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

    // Get tournament to check ownership
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('created_by, is_started')
      .eq('id', params.id)
      .single()

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if user can delete tournament (owner or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (tournament.created_by !== session.user.id && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only tournament creators and admins can delete tournaments' },
        { status: 403 }
      )
    }

    // Prevent deletion of started tournaments
    if (tournament.is_started) {
      return NextResponse.json(
        { error: 'Cannot delete a tournament that has already started' },
        { status: 400 }
      )
    }

    // Delete tournament (cascading will handle related records)
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete tournament: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Tournament deleted successfully' })
  } catch (error) {
    console.error('Tournament deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}