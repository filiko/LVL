import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

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

    const body = await request.json()
    const { new_captain_id } = body

    if (!new_captain_id) {
      return NextResponse.json(
        { error: 'new_captain_id is required' },
        { status: 400 }
      )
    }

    // Get team info
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

    // Check if user is current captain or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (team.captain_id !== session.user.id && !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only current team captain or admin can transfer captaincy' },
        { status: 403 }
      )
    }

    // Check if new captain is a team member
    const { data: newCaptainMembership } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('team_id', params.id)
      .eq('player_id', new_captain_id)
      .eq('is_active', true)
      .single()

    if (!newCaptainMembership) {
      return NextResponse.json(
        { error: 'New captain must be an active team member' },
        { status: 400 }
      )
    }

    // Start transaction: Update team captain and member roles
    const { error: teamError } = await supabase
      .from('teams')
      .update({ captain_id: new_captain_id })
      .eq('id', params.id)

    if (teamError) {
      return NextResponse.json(
        { error: `Failed to update team captain: ${teamError.message}` },
        { status: 500 }
      )
    }

    // Update old captain's role to member (if they're still in the team)
    if (team.captain_id) {
      await supabase
        .from('team_members')
        .update({ role: 'MEMBER' })
        .eq('team_id', params.id)
        .eq('player_id', team.captain_id)
    }

    // Update new captain's role
    const { error: memberError } = await supabase
      .from('team_members')
      .update({ role: 'CAPTAIN' })
      .eq('id', newCaptainMembership.id)

    if (memberError) {
      // Rollback team captain change
      await supabase
        .from('teams')
        .update({ captain_id: team.captain_id })
        .eq('id', params.id)

      return NextResponse.json(
        { error: `Failed to update member role: ${memberError.message}` },
        { status: 500 }
      )
    }

    // Fetch updated team info
    const { data: updatedTeam, error: fetchError } = await supabase
      .from('teams')
      .select(`
        *,
        profiles (
          id,
          username,
          tier,
          avatar_url
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to fetch updated team: ${fetchError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Team captaincy transferred successfully',
      team: updatedTeam
    })
  } catch (error) {
    console.error('Captain transfer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}