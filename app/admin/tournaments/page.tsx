'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { tournamentDb } from '@/lib/database/tournaments';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

interface Tournament {
  id: string;
  title: string;
  game_id: string;
  mode: string;
  max_players: number;
  registered_players: number;
  start_date: string;
  is_active: boolean;
  is_started: boolean;
  prize_pool?: number;
  entry_fee?: number;
  created_at: string;
  games?: {
    name: string;
  };
}

export default function AdminTournamentsPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!profile?.is_admin) {
      toast.error('Admin access required');
      router.push('/battlefield');
      return;
    }
    
    fetchTournaments();
  }, [user, profile]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentDb.getTournaments({ limit: 100 });
      setTournaments(data);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (tournamentId: string, isActive: boolean) => {
    try {
      await tournamentDb.updateTournament(tournamentId, { is_active: !isActive });
      toast.success(`Tournament ${!isActive ? 'activated' : 'deactivated'}`);
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tournament');
    }
  };

  const handleDeleteTournament = async (tournamentId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await tournamentDb.deleteTournament(tournamentId);
        toast.success('Tournament deleted successfully');
        fetchTournaments();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete tournament');
      }
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    switch (filter) {
      case 'active':
        return tournament.is_active && !tournament.is_started;
      case 'upcoming':
        return !tournament.is_started && new Date(tournament.start_date) > new Date();
      case 'completed':
        return tournament.is_started;
      default:
        return true;
    }
  });

  const getStatusBadge = (tournament: Tournament) => {
    if (tournament.is_started) {
      return <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold">COMPLETED</span>;
    }
    if (tournament.is_active) {
      return <span className="px-2 py-1 bg-blue-600 rounded text-xs font-semibold">ACTIVE</span>;
    }
    return <span className="px-2 py-1 bg-gray-600 rounded text-xs font-semibold">INACTIVE</span>;
  };

  if (!user || !profile?.is_admin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-bank">TOURNAMENT MANAGEMENT</h2>
            <p className="text-gray-300 mt-1">Monitor and manage all tournaments</p>
          </div>
          <button
            onClick={() => router.push('/battlefield/tournaments/create')}
            className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
          >
            CREATE TOURNAMENT
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
          <span className="text-sm font-semibold text-gray-300">FILTER:</span>
          {(['all', 'active', 'upcoming', 'completed'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                filter === filterOption
                  ? 'bg-[#377cca] text-white'
                  : 'bg-[#12436c] text-gray-300 hover:bg-[#377cca]/30'
              }`}
            >
              {filterOption.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tournaments List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-600 rounded w-48"></div>
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-gray-600 rounded"></div>
                    <div className="h-8 w-16 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold">{tournament.title}</h3>
                      {getStatusBadge(tournament)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Game:</span>
                        <p className="font-semibold">{tournament.games?.name || tournament.game_id}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Mode:</span>
                        <p className="font-semibold text-[#3791dd]">{tournament.mode}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Players:</span>
                        <p className="font-semibold">
                          {tournament.registered_players}/{tournament.max_players}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Start Date:</span>
                        <p className="font-semibold">
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {tournament.prize_pool && (
                        <div>
                          <span className="text-gray-400">Prize Pool:</span>
                          <p className="font-semibold text-green-400">
                            ${tournament.prize_pool.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {tournament.entry_fee && (
                        <div>
                          <span className="text-gray-400">Entry Fee:</span>
                          <p className="font-semibold">${tournament.entry_fee}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <p className="font-semibold">
                          {new Date(tournament.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/battlefield/tournaments/${tournament.id}`)}
                      className="px-4 py-2 bg-[#377cca] rounded hover:brightness-110 transition text-sm font-semibold"
                    >
                      VIEW
                    </button>
                    
                    <button
                      onClick={() => handleToggleActive(tournament.id, tournament.is_active)}
                      className={`px-4 py-2 rounded hover:brightness-110 transition text-sm font-semibold ${
                        tournament.is_active 
                          ? 'bg-orange-600' 
                          : 'bg-green-600'
                      }`}
                    >
                      {tournament.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTournament(tournament.id, tournament.title)}
                      className="px-4 py-2 bg-red-600 rounded hover:brightness-110 transition text-sm font-semibold"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">No Tournaments Found</h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'No tournaments have been created yet.'
                  : `No ${filter} tournaments found.`}
              </p>
              <button
                onClick={() => router.push('/battlefield/tournaments/create')}
                className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
              >
                CREATE FIRST TOURNAMENT
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!loading && tournaments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-[#3791dd]">{tournaments.length}</p>
              <p className="text-sm text-gray-400">Total Tournaments</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">
                {tournaments.filter(t => t.is_active && !t.is_started).length}
              </p>
              <p className="text-sm text-gray-400">Active</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">
                {tournaments.reduce((sum, t) => sum + t.registered_players, 0)}
              </p>
              <p className="text-sm text-gray-400">Total Players</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">
                ${tournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">Total Prize Pool</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}