import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, CONFIRMED, or CANCELLED' },
        { status: 400 }
      );
    }

    // Get the registration to check tournament ownership
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        tournament_id,
        tournaments (
          id,
          created_by
        )
      `)
      .eq('id', params.id)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if user is tournament creator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isTournamentCreator = registration.tournaments?.created_by === session.user.id;
    const isAdmin = profile?.is_admin;

    if (!isTournamentCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only tournament creators and admins can update registrations' },
        { status: 403 }
      );
    }

    // Update registration status
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', params.id)
      .select(`
        id,
        status,
        registered_at,
        teams (
          id,
          name,
          member_count
        )
      `)
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      );
    }

    // Update tournament registered_players count
    if (status === 'CONFIRMED') {
      // Add team members to registered count
      const teamMemberCount = updatedRegistration.teams?.member_count || 0;
      await supabase.rpc('increment_tournament_players', {
        tournament_id: registration.tournament_id,
        increment_by: teamMemberCount
      });
    } else if (status === 'CANCELLED') {
      // Subtract team members from registered count
      const teamMemberCount = updatedRegistration.teams?.member_count || 0;
      await supabase.rpc('decrement_tournament_players', {
        tournament_id: registration.tournament_id,
        decrement_by: teamMemberCount
      });
    }

    return NextResponse.json({
      success: true,
      registration: updatedRegistration
    });

  } catch (error) {
    console.error('Registration update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the registration to check tournament ownership
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        tournament_id,
        teams (
          member_count
        ),
        tournaments (
          id,
          created_by
        )
      `)
      .eq('id', params.id)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if user is tournament creator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isTournamentCreator = registration.tournaments?.created_by === session.user.id;
    const isAdmin = profile?.is_admin;

    if (!isTournamentCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only tournament creators and admins can delete registrations' },
        { status: 403 }
      );
    }

    // Delete registration
    const { error: deleteError } = await supabase
      .from('registrations')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete registration' },
        { status: 500 }
      );
    }

    // Update tournament registered_players count if registration was confirmed
    if (registration.status === 'CONFIRMED') {
      const teamMemberCount = registration.teams?.member_count || 0;
      await supabase.rpc('decrement_tournament_players', {
        tournament_id: registration.tournament_id,
        decrement_by: teamMemberCount
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    });

  } catch (error) {
    console.error('Registration deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
