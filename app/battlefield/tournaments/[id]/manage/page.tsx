'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthState } from '@/lib/auth';
import { tournamentDb } from '@/lib/database/tournaments';
import { toast } from 'react-toastify';

interface Tournament {
  id: string;
  title: string;
  game_id: string;
  mode: string;
  max_players: number;
  registered_players: number;
  start_date: string;
  end_date: string;
  region: string;
  platform: string;
  language: string;
  tournament_type: string;
  bracket_type: string;
  prize_pool?: number;
  entry_fee?: number;
  description?: string;
  rules?: string;
  discord_channel?: string;
  is_active: boolean;
  is_started: boolean;
  created_by: string;
  created_at: string;
  games?: {
    name: string;
  };
}

interface Registration {
  id: string;
  tournament_id: string;
  team_id: string;
  status: string;
  registered_at: string;
  teams?: {
    id: string;
    name: string;
    member_count: number;
    max_members: number;
    captain_id: string;
    profiles?: {
      username: string;
    };
  };
}

export default function TournamentManagePage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuthState();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'settings'>('overview');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchTournamentData();
  }, [user, params.id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const tournamentData = await tournamentDb.getTournament(params.id as string);
      
      // Check if user is tournament creator or admin
      if (tournamentData.created_by !== user.id && !profile?.is_admin) {
        toast.error('You can only manage tournaments you created');
        router.push(`/battlefield/tournaments/${params.id}`);
        return;
      }
      
      setTournament(tournamentData);
      
      // Fetch registrations
      const registrationsData = await tournamentDb.getTournamentRegistrations(params.id as string);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Failed to fetch tournament data:', error);
      toast.error('Failed to load tournament data');
      router.push('/battlefield/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!tournament) return;
    
    try {
      await tournamentDb.updateTournament(tournament.id, { is_active: !tournament.is_active });
      setTournament({ ...tournament, is_active: !tournament.is_active });
      toast.success(`Tournament ${!tournament.is_active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tournament');
    }
  };

  const handleStartTournament = async () => {
    if (!tournament) return;
    
    try {
      await tournamentDb.updateTournament(tournament.id, { is_started: true });
      setTournament({ ...tournament, is_started: true });
      toast.success('Tournament started!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start tournament');
    }
  };

  const handleUpdateRegistration = async (registrationId: string, status: string) => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update registration');
      }

      toast.success(`Registration ${status.toLowerCase()}`);
      fetchTournamentData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update registration');
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournament) return;
    
    if (window.confirm(`Are you sure you want to delete "${tournament.title}"? This action cannot be undone.`)) {
      try {
        await tournamentDb.deleteTournament(tournament.id);
        toast.success('Tournament deleted successfully');
        router.push('/battlefield/tournaments');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete tournament');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a2e] to-[#0d2645] flex items-center justify-center">
        <div className="text-white text-xl">Loading tournament data...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a2e] to-[#0d2645] flex items-center justify-center">
        <div className="text-white text-xl">Tournament not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a2e] to-[#0d2645]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-bank text-white mb-2">
              {tournament.title} - Management
            </h1>
            <p className="text-gray-300">
              {tournament.games?.name} • {tournament.mode} • {tournament.region}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleToggleActive}
              className={`px-6 py-2 rounded font-semibold transition ${
                tournament.is_active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {tournament.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
            {!tournament.is_started && tournament.is_active && (
              <button
                onClick={handleStartTournament}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
              >
                START TOURNAMENT
              </button>
            )}
            <button
              onClick={handleDeleteTournament}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
            >
              DELETE
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex space-x-4 mb-8">
          <span className={`px-4 py-2 rounded text-sm font-semibold ${
            tournament.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
          }`}>
            {tournament.is_active ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <span className={`px-4 py-2 rounded text-sm font-semibold ${
            tournament.is_started ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'
          }`}>
            {tournament.is_started ? 'STARTED' : 'UPCOMING'}
          </span>
          <span className="px-4 py-2 rounded text-sm font-semibold bg-[#377cca] text-white">
            {tournament.registered_players}/{tournament.max_players} PLAYERS
          </span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {(['overview', 'registrations', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded font-semibold transition ${
                activeTab === tab
                  ? 'bg-[#377cca] text-white'
                  : 'bg-[#12436c] text-gray-300 hover:bg-[#377cca]/30'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0e3250] p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Tournament Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Mode:</span>
                  <span className="text-white">{tournament.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Platform:</span>
                  <span className="text-white">{tournament.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Region:</span>
                  <span className="text-white">{tournament.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Bracket Type:</span>
                  <span className="text-white">{tournament.bracket_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Start Date:</span>
                  <span className="text-white">{new Date(tournament.start_date).toLocaleDateString()}</span>
                </div>
                {tournament.prize_pool && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Prize Pool:</span>
                    <span className="text-white">${tournament.prize_pool}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0e3250] p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Registration Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Registrations:</span>
                  <span className="text-white">{registrations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Confirmed:</span>
                  <span className="text-white">{registrations.filter(r => r.status === 'CONFIRMED').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pending:</span>
                  <span className="text-white">{registrations.filter(r => r.status === 'PENDING').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Capacity:</span>
                  <span className="text-white">{tournament.registered_players}/{tournament.max_players}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0e3250] p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="w-full px-4 py-2 bg-[#377cca] hover:bg-[#377cca]/80 text-white rounded transition"
                >
                  Manage Registrations
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full px-4 py-2 bg-[#377cca] hover:bg-[#377cca]/80 text-white rounded transition"
                >
                  Tournament Settings
                </button>
                <button
                  onClick={() => router.push(`/battlefield/tournaments/${tournament.id}`)}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                >
                  View Public Page
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="bg-[#0e3250] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#377cca]">
              <h3 className="text-xl font-semibold text-white">Team Registrations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#12436c]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Captain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#377cca]">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-[#12436c]/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {registration.teams?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {registration.teams?.profiles?.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {registration.teams?.member_count}/{registration.teams?.max_members}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          registration.status === 'CONFIRMED'
                            ? 'bg-green-600 text-white'
                            : registration.status === 'PENDING'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(registration.registered_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {registration.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateRegistration(registration.id, 'CONFIRMED')}
                              className="text-green-400 hover:text-green-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateRegistration(registration.id, 'CANCELLED')}
                              className="text-red-400 hover:text-red-300"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {registration.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateRegistration(registration.id, 'CANCELLED')}
                            className="text-red-400 hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-[#0e3250] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Tournament Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tournament Description
                </label>
                <textarea
                  value={tournament.description || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tournament Rules
                </label>
                <textarea
                  value={tournament.rules || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
                  rows={6}
                />
              </div>
              {tournament.discord_channel && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord Channel
                  </label>
                  <input
                    type="text"
                    value={tournament.discord_channel}
                    readOnly
                    className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
