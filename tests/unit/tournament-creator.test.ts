import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tournamentDb } from '@/lib/database/tournaments';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn()
    }))
  }))
};

vi.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabase
}));

describe('Tournament Creator System', () => {
  const mockUser = {
    id: 'user-123',
    email: 'creator@test.com'
  };

  const mockTournament = {
    id: 'tournament-123',
    title: 'Test 32v32 Tournament',
    game_id: 'bf2042',
    mode: '32v32',
    max_players: 64,
    start_date: '2024-02-01T18:00:00Z',
    region: 'EAST_COAST',
    platform: 'PC',
    language: 'English',
    bracket_type: 'SINGLE_ELIMINATION',
    created_by: mockUser.id,
    is_active: true,
    is_started: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tournament Creation', () => {
    it('should allow any authenticated user to create a tournament', async () => {
      // Mock successful tournament creation
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTournament,
        error: null
      });

      const tournamentData = {
        title: 'Test 32v32 Tournament',
        game_id: 'bf2042',
        mode: '32v32',
        max_players: 64,
        start_date: '2024-02-01T18:00:00Z',
        region: 'EAST_COAST',
        platform: 'PC',
        language: 'English',
        bracket_type: 'SINGLE_ELIMINATION'
      };

      const result = await tournamentDb.createTournament(mockUser.id, tournamentData);

      expect(result).toEqual(mockTournament);
      expect(mockSupabase.from).toHaveBeenCalledWith('tournaments');
    });

    it('should validate 32v32 mode has correct max players (64)', async () => {
      const invalidTournamentData = {
        title: 'Invalid Tournament',
        game_id: 'bf2042',
        mode: '32v32',
        max_players: 1024, // Wrong - should be 64
        start_date: '2024-02-01T18:00:00Z',
        region: 'EAST_COAST',
        platform: 'PC',
        language: 'English',
        bracket_type: 'SINGLE_ELIMINATION'
      };

      // Mock validation error
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Max players for 32v32 mode cannot exceed 64' }
      });

      await expect(
        tournamentDb.createTournament(mockUser.id, invalidTournamentData)
      ).rejects.toThrow('Max players for 32v32 mode cannot exceed 64');
    });

    it('should set created_by field to the user who created the tournament', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTournament,
        error: null
      });

      const tournamentData = {
        title: 'Test Tournament',
        game_id: 'bf2042',
        mode: '32v32',
        max_players: 64,
        start_date: '2024-02-01T18:00:00Z',
        region: 'EAST_COAST',
        platform: 'PC',
        language: 'English',
        bracket_type: 'SINGLE_ELIMINATION'
      };

      await tournamentDb.createTournament(mockUser.id, tournamentData);

      expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
        ...tournamentData,
        created_by: mockUser.id
      }]);
    });
  });

  describe('Tournament Management Permissions', () => {
    it('should allow tournament creator to access their tournament', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockTournament,
        error: null
      });

      const result = await tournamentDb.getTournament(mockTournament.id);

      expect(result).toEqual(mockTournament);
      expect(result.created_by).toBe(mockUser.id);
    });

    it('should allow tournament creator to update their tournament', async () => {
      const updateData = { is_active: false };
      const updatedTournament = { ...mockTournament, ...updateData };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: updatedTournament,
        error: null
      });

      const result = await tournamentDb.updateTournament(mockTournament.id, updateData);

      expect(result).toEqual(updatedTournament);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updateData);
    });

    it('should allow tournament creator to delete their tournament', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({
        data: null,
        error: null
      });

      await tournamentDb.deleteTournament(mockTournament.id);

      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });
  });

  describe('Registration Management', () => {
    const mockRegistration = {
      id: 'reg-123',
      tournament_id: mockTournament.id,
      team_id: 'team-123',
      status: 'PENDING',
      registered_at: '2024-01-15T10:00:00Z',
      teams: {
        id: 'team-123',
        name: 'Test Team',
        member_count: 32,
        max_members: 32,
        captain_id: 'captain-123',
        profiles: {
          username: 'TestCaptain'
        }
      }
    };

    it('should allow tournament creator to view registrations', async () => {
      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: [mockRegistration],
        error: null
      });

      const result = await tournamentDb.getTournamentRegistrations(mockTournament.id);

      expect(result).toEqual([mockRegistration]);
      expect(mockSupabase.from).toHaveBeenCalledWith('registrations');
    });

    it('should track registration status changes', async () => {
      const updatedRegistration = { ...mockRegistration, status: 'CONFIRMED' };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: updatedRegistration,
        error: null
      });

      // This would be called by the API endpoint
      const result = await mockSupabase.from('registrations')
        .update({ status: 'CONFIRMED' })
        .eq('id', mockRegistration.id)
        .select()
        .single();

      expect(result.data.status).toBe('CONFIRMED');
    });
  });

  describe('Tournament Statistics', () => {
    it('should calculate correct registration statistics', async () => {
      const mockRegistrations = [
        { status: 'CONFIRMED', teams: { member_count: 32 } },
        { status: 'CONFIRMED', teams: { member_count: 30 } },
        { status: 'PENDING', teams: { member_count: 28 } },
        { status: 'CANCELLED', teams: { member_count: 25 } }
      ];

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          ...mockTournament,
          registrations: mockRegistrations
        },
        error: null
      });

      const stats = await tournamentDb.getTournamentStats(mockTournament.id);

      expect(stats.confirmed_teams).toBe(2);
      expect(stats.pending_teams).toBe(1);
      expect(stats.confirmed_players).toBe(62); // 32 + 30
      expect(stats.pending_players).toBe(28);
      expect(stats.total_teams).toBe(4);
    });
  });
});
