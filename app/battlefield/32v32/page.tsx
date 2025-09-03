"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase';
import type { Tournament, Team } from '@/lib/database.types';

// Remove duplicate interfaces since we're importing from database.types

const Tournament32v32Page = () => {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams'>('tournaments');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch 32v32 tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
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
        .eq('mode', '32v32')
        .eq('is_active', true)
        .order('start_date', { ascending: true });

      if (tournamentsError) {
        throw tournamentsError;
      }

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
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
            profiles (
              id,
              username,
              tier
            )
          )
        `)
        .eq('is_recruiting', true)
        .order('created_at', { ascending: false });

      if (teamsError) {
        throw teamsError;
      }

      setTournaments(tournamentsData || []);
      setTeams(teamsData || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (tournament: Tournament) => {
    if (tournament.is_started) return 'bg-yellow-600';
    if (!tournament.is_active) return 'bg-red-600';
    return 'bg-green-600';
  };

  const getStatusText = (tournament: Tournament) => {
    if (tournament.is_started) return 'IN PROGRESS';
    if (!tournament.is_active) return 'CLOSED';
    return 'OPEN';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'BRONZE': 'bg-orange-700',
      'SILVER': 'bg-gray-400',
      'GOLD': 'bg-yellow-500',
      'PLATINUM': 'bg-blue-400',
      'DIAMOND': 'bg-purple-500'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-bank mb-2">32v32 LARGE SCALE WARFARE</h1>
              <p className="text-gray-300">Join massive battlefield engagements with up to 64 players</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">ACTIVE PLAYERS</div>
              <div className="text-3xl font-bold text-green-400">1,247</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'tournaments'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            TOURNAMENTS
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'teams'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            TEAMS
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {/* Tournaments Tab */}
            {activeTab === 'tournaments' && (
              <div className="space-y-6">
                {tournaments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-semibold mb-2">No 32v32 Tournaments Available</h3>
                    <p className="text-gray-400">Check back soon for new large-scale tournaments</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="bg-[#0e1c33] rounded-lg border border-[#114369] overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => router.push(`/battlefield/32v32/${tournament.id}`)}
                      >
                        {/* Tournament Header */}
                        <div className="relative bg-gradient-to-r from-[#1a2f4a] to-[#0e1c33] p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(tournament)}`}>
                                  {getStatusText(tournament)}
                                </span>
                                <span className="text-gray-400">{tournament.bracket_type}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-400">32v32</div>
                              <div className="text-sm text-gray-400">LARGE SCALE</div>
                            </div>
                          </div>

                          {/* Tournament Stats */}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="text-sm text-gray-400">PARTICIPANTS</div>
                              <div className="text-lg font-semibold">
                                {tournament.registered_players}/{tournament.max_players}
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(tournament.registered_players / tournament.max_players) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">START DATE</div>
                              <div className="text-lg font-semibold">{formatDate(tournament.start_date)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Tournament Details */}
                        <div className="p-6 pt-0">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Region:</span>
                              <span className="ml-2 font-semibold">{tournament.region}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Platform:</span>
                              <span className="ml-2 font-semibold">{tournament.platform}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Language:</span>
                              <span className="ml-2 font-semibold">{tournament.language}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <span className="ml-2 font-semibold">{tournament.tournament_type}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Click to view details and register
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-xs text-green-400">Live Registration</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Active Teams</h2>
                  <button
                    onClick={() => router.push('/teams/create')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                  >
                    Create Team
                  </button>
                </div>

                {teams.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-semibold mb-2">No Teams Found</h3>
                    <p className="text-gray-400 mb-4">Create or join a team to participate in 32v32 tournaments</p>
                    <button
                      onClick={() => router.push('/teams/create')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition"
                    >
                      Create Your Team
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6 hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => router.push(`/teams/${team.id}`)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold mb-1">{team.name}</h3>
                            <p className="text-sm text-gray-400">
                              Lead: {(team as any).profiles?.username || 'Unknown'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTierColor(team.tier)}`}>
                            {team.tier}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Members:</span>
                            <span className="font-semibold">{team.member_count}/32</span>
                          </div>
                          
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(team.member_count / 32) * 100}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Ready for 32v32</span>
                            <span className={`${team.member_count >= 32 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {team.member_count >= 32 ? 'FULL ROSTER' : 'RECRUITING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Tournament32v32Page;