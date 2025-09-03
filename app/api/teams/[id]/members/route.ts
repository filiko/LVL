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
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
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
          discord_id,
          country_code
        )
      `)
      .eq('team_id', params.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch team members: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(members)
  } catch (error) {
    console.error('Team members fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { join_code, player_id, role, position, squad_assignment } = body

    // If join_code is provided, it's a join request
    if (join_code) {
      // Verify join code
      const { data: team } = await supabase
        .from('teams')
        .select('id, name, member_count, max_members, is_recruiting')
        .eq('join_code', join_code)
        .single()

      if (!team) {
        return NextResponse.json(
          { error: 'Invalid join code' },
          { status: 400 }
        )
      }

      if (!team.is_recruiting) {
        return NextResponse.json(
          { error: 'Team is not currently recruiting' },
          { status: 400 }
        )
      }

      if (team.member_count >= team.max_members) {
        return NextResponse.json(
          { error: 'Team is full' },
          { status: 400 }
        )
      }

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('player_id', session.user.id)
        .eq('is_active', true)
        .single()

      if (existingMembership) {
        return NextResponse.json(
          { error: 'You are already a member of this team' },
          { status: 400 }
        )
      }

      // Add user to team
      const { data: newMember, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          player_id: session.user.id,
          role: 'MEMBER',
          position: position || 'INFANTRY'
        }])
        .select(`
          id,
          role,
          position,
          squad_assignment,
          joined_at,
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
          { error: `Failed to join team: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(newMember, { status: 201 })
    }

    // Otherwise, it's a captain adding a member
    if (!player_id) {
      return NextResponse.json(
        { error: 'player_id is required' },
        { status: 400 }
      )
    }

    // Check if user is team captain
    const { data: team } = await supabase
      .from('teams')
      .select('captain_id, member_count, max_members')
      .eq('id', params.id)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    if (team.captain_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team captains can add members directly' },
        { status: 403 }
      )
    }

    if (team.member_count >= team.max_members) {
      return NextResponse.json(
        { error: 'Team is full' },
        { status: 400 }
      )
    }

    // Check if player is already a member
    const { data: existingMembership } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', params.id)
      .eq('player_id', player_id)
      .eq('is_active', true)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Player is already a team member' },
        { status: 400 }
      )
    }

    // Add player to team
    const { data: newMember, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: params.id,
        player_id,
        role: role || 'MEMBER',
        position: position || 'INFANTRY',
        squad_assignment
      }])
      .select(`
        id,
        role,
        position,
        squad_assignment,
        joined_at,
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
        { error: `Failed to add team member: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Team member addition error:', error)
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

    const body = await request.json()
    const { member_id, role, position, squad_assignment, is_active } = body

    if (!member_id) {
      return NextResponse.json(
        { error: 'member_id is required' },
        { status: 400 }
      )
    }

    // Check if user is team captain or admin
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    const isTeamMember = await supabase
      .from('team_members')
      .select('player_id')
      .eq('id', member_id)
      .eq('player_id', session.user.id)
      .single()

    if (team.captain_id !== session.user.id && !profile?.is_admin && !isTeamMember.data) {
      return NextResponse.json(
        { error: 'Only team captains, admins, or the member themselves can update member details' },
        { status: 403 }
      )
    }

    // Update team member
    const { data: updatedMember, error } = await supabase
      .from('team_members')
      .update({
        role,
        position,
        squad_assignment,
        is_active
      })
      .eq('id', member_id)
      .eq('team_id', params.id)
      .select(`
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
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update team member: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Team member update error:', error)
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
    const memberId = searchParams.get('member_id')

    if (!memberId) {
      return NextResponse.json(
        { error: 'member_id query parameter is required' },
        { status: 400 }
      )
    }

    // Get member and team info
    const { data: member } = await supabase
      .from('team_members')
      .select('player_id, role')
      .eq('id', memberId)
      .eq('team_id', params.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Check if user is team captain, admin, or the member themselves
    const { data: team } = await supabase
      .from('teams')
      .select('captain_id')
      .eq('id', params.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (team?.captain_id !== session.user.id && 
        !profile?.is_admin && 
        member.player_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team captains, admins, or the member themselves can remove members' },
        { status: 403 }
      )
    }

    // Prevent captain from removing themselves (they should transfer captaincy first)
    if (member.role === 'CAPTAIN' && member.player_id === session.user.id) {
      return NextResponse.json(
        { error: 'Team captains must transfer captaincy before leaving the team' },
        { status: 400 }
      )
    }

    // Remove team member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to remove team member: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Team member removed successfully' })
  } catch (error) {
    console.error('Team member removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}