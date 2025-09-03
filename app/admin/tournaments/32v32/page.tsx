"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Tournament {
  id: number;
  title: string;
  start_date: string;
  mode: string;
  region: string;
  platform: string;
  language: string;
  registered_players: number;
  max_players: number;
  is_active: boolean;
  is_started: boolean;
  tournament_type: string;
  bracket_type: string;
  created_at: string;
}

interface Team {
  id: number;
  name: string;
  lead_player: {
    username: string;
    email: string;
    tier: string;
  };
  tier: string;
  member_count: number;
  squads: Squad[];
}

interface Squad {
  id: number;
  squad_type: string;
  members: SquadMember[];
}

interface SquadMember {
  id: number;
  player: {
    username: string;
    tier: string;
  };
  role: string;
  action_role: string;
}

interface TournamentParticipant {
  id: number;
  team: Team;
  registered_at: string;
}

const Admin32v32Management = () => {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'draft' | 'squads' | 'matches'>('overview');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const data = await res.json();
        setBackendUrl(data.BACKEND_URL);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };

    setAccessToken(localStorage.getItem('access_token'));
    fetchConfig();
  }, []);

  useEffect(() => {
    if (backendUrl && accessToken) {
      fetchTournaments();
    }
  }, [backendUrl, accessToken]);

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentDetails();
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/tournaments/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { mode: '32v32' }
      });
      
      const filtered32v32 = response.data.filter((t: Tournament) => t.mode === '32v32');
      setTournaments(filtered32v32);
      
      if (filtered32v32.length > 0 && !selectedTournament) {
        setSelectedTournament(filtered32v32[0]);
      }
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentDetails = async () => {
    if (!selectedTournament) return;
    
    try {
      const response = await axios.get(`${backendUrl}/api/tournaments/${selectedTournament.id}/participants/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setParticipants(response.data);
    } catch (error) {
      console.error('Failed to fetch tournament details:', error);
    }
  };

  const generateBracket = async () => {
    if (!selectedTournament) return;
    
    try {
      await axios.post(
        `${backendUrl}/api/tournaments/${selectedTournament.id}/generate-bracket/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Tournament bracket generated successfully!');
      fetchTournamentDetails();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to generate bracket';
      toast.error(errorMessage);
    }
  };

  const startTournament = async () => {
    if (!selectedTournament) return;
    
    if (!confirm('Are you sure you want to start this tournament? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.patch(
        `${backendUrl}/api/tournaments/${selectedTournament.id}/`,
        { is_started: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Tournament started successfully!');
      fetchTournaments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to start tournament';
      toast.error(errorMessage);
    }
  };

  const autoAssignTeams = async () => {
    if (!selectedTournament) return;
    
    try {
      // This would be a custom endpoint for auto-assigning players to teams
      await axios.post(
        `${backendUrl}/api/tournaments/${selectedTournament.id}/auto-assign/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Teams auto-assigned successfully!');
      fetchTournamentDetails();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to auto-assign teams';
      toast.error(errorMessage);
    }
  };

  const getSquadCompleteness = (team: Team) => {
    const requiredSquads = 6; // Minimum for 32v32
    const currentSquads = team.squads?.length || 0;
    return Math.min((currentSquads / requiredSquads) * 100, 100);
  };

  const getTeamReadiness = (team: Team) => {
    const memberComplete = team.member_count >= 32;
    const squadComplete = (team.squads?.length || 0) >= 6;
    
    if (memberComplete && squadComplete) return { status: 'Ready', color: 'text-green-400' };
    if (memberComplete || squadComplete) return { status: 'Partial', color: 'text-yellow-400' };
    return { status: 'Not Ready', color: 'text-red-400' };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
              >
                ← Back to Admin
              </button>
              <div className="text-sm text-gray-400">32v32 Tournament Management</div>
            </div>
            <h1 className="text-4xl font-bold font-bank">32v32 TOURNAMENT ADMIN</h1>
          </div>
          
          <div className="text-right">
            <button
              onClick={() => router.push('/admin/create-league')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded transition"
            >
              Create New 32v32 League
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Tournament List Sidebar */}
          <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
            <h2 className="text-xl font-semibold mb-4">Active 32v32 Tournaments</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  onClick={() => setSelectedTournament(tournament)}
                  className={`p-4 rounded cursor-pointer transition ${
                    selectedTournament?.id === tournament.id 
                      ? 'bg-blue-600' 
                      : 'bg-[#0d2645] hover:bg-[#1e3a5f]'
                  }`}
                >
                  <div className="font-semibold mb-1">{tournament.title}</div>
                  <div className="text-sm text-gray-400 mb-2">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tournament.is_started ? 'bg-yellow-600' : 
                      tournament.is_active ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {tournament.is_started ? 'LIVE' : 
                       tournament.is_active ? 'OPEN' : 'CLOSED'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {tournament.registered_players}/{tournament.max_players}
                    </span>
                  </div>
                </div>
              ))}
              
              {tournaments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>No 32v32 tournaments found</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {selectedTournament ? (
              <>
                {/* Tournament Header */}
                <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedTournament.title}</h2>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded font-semibold ${
                          selectedTournament.is_started ? 'bg-yellow-600' : 
                          selectedTournament.is_active ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {selectedTournament.is_started ? 'IN PROGRESS' : 
                           selectedTournament.is_active ? 'REGISTRATION OPEN' : 'CLOSED'}
                        </span>
                        <span className="px-3 py-1 bg-blue-600 rounded">{selectedTournament.bracket_type}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">32v32</div>
                      <div className="text-sm text-gray-400">
                        {participants.length} teams registered
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={generateBracket}
                      disabled={selectedTournament.is_started}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition disabled:opacity-50"
                    >
                      Generate Bracket
                    </button>
                    <button
                      onClick={startTournament}
                      disabled={selectedTournament.is_started || participants.length < 2}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
                    >
                      Start Tournament
                    </button>
                    <button
                      onClick={autoAssignTeams}
                      disabled={selectedTournament.is_started}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition disabled:opacity-50"
                    >
                      Auto-Assign Teams
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                  {[
                    { key: 'overview', label: 'OVERVIEW' },
                    { key: 'teams', label: `TEAMS (${participants.length})` },
                    { key: 'draft', label: 'DRAFT MANAGEMENT' },
                    { key: 'squads', label: 'SQUAD MANAGEMENT' },
                    { key: 'matches', label: 'MATCHES' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-6 py-3 font-semibold border-b-2 transition ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Stats Cards */}
                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-lg font-semibold mb-4">Registration Stats</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Players</span>
                            <span className="font-semibold">{selectedTournament.registered_players}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Target: {selectedTournament.max_players} players
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">Teams</span>
                            <span className="font-semibold">{participants.length}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Max: 32 teams (1,024 players)
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">Avg Team Size</span>
                            <span className="font-semibold">
                              {participants.length > 0 
                                ? Math.round(selectedTournament.registered_players / participants.length)
                                : 0
                              }
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Target: 32 players per team
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-lg font-semibold mb-4">Tournament Status</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Registration</div>
                          <div className={`font-semibold ${
                            selectedTournament.is_active ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {selectedTournament.is_active ? 'Open' : 'Closed'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Tournament State</div>
                          <div className={`font-semibold ${
                            selectedTournament.is_started ? 'text-yellow-400' : 'text-blue-400'
                          }`}>
                            {selectedTournament.is_started ? 'In Progress' : 'Pending'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-1">Start Date</div>
                          <div className="font-semibold">
                            {new Date(selectedTournament.start_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push(`/admin/tournaments/${selectedTournament.id}/edit`)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-left"
                        >
                          Edit Tournament
                        </button>
                        <button
                          onClick={() => router.push(`/admin/tournaments/${selectedTournament.id}/participants`)}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition text-left"
                        >
                          Manage Participants
                        </button>
                        <button
                          onClick={() => router.push(`/admin/tournaments/${selectedTournament.id}/matches`)}
                          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition text-left"
                        >
                          View Matches
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'teams' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Registered Teams</h3>
                      <div className="text-sm text-gray-400">
                        {participants.length} teams • {selectedTournament.registered_players} total players
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {participants.map((participant) => {
                        const readiness = getTeamReadiness(participant.team);
                        return (
                          <div
                            key={participant.id}
                            className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-bold mb-1">{participant.team.name}</h4>
                                <p className="text-sm text-gray-400">
                                  Lead: {participant.team.lead_player.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {participant.team.lead_player.email}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-semibold bg-${participant.team.tier.toLowerCase()}-600`}>
                                  {participant.team.tier}
                                </span>
                                <div className={`text-sm mt-1 ${readiness.color}`}>
                                  {readiness.status}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-400">Team Size</span>
                                  <span className="text-sm font-semibold">
                                    {participant.team.member_count}/32
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${Math.min((participant.team.member_count / 32) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-400">Squad Setup</span>
                                  <span className="text-sm font-semibold">
                                    {participant.team.squads?.length || 0}/8
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${getSquadCompleteness(participant.team)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-700">
                                <span className="text-gray-500">
                                  Registered: {new Date(participant.registered_at).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => router.push(`/admin/teams/${participant.team.id}/manage`)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Manage →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {participants.length === 0 && (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-2xl font-semibold mb-2">No Teams Registered</h3>
                        <p className="text-gray-400">Teams will appear here once they register for this tournament</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'draft' && (
                  <div className="space-y-6">
                    
                    {/* Draft Control Panel */}
                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-xl font-semibold mb-4">Draft Management Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button
                          onClick={autoAssignTeams}
                          disabled={selectedTournament.is_started}
                          className="p-4 bg-blue-600 hover:bg-blue-700 rounded transition disabled:opacity-50 text-left"
                        >
                          <div className="font-semibold mb-1">🔄 Auto-Balance</div>
                          <div className="text-sm text-gray-300">Balance teams by skill tier</div>
                        </button>
                        <button
                          onClick={() => setActiveTab('teams')}
                          className="p-4 bg-green-600 hover:bg-green-700 rounded transition text-left"
                        >
                          <div className="font-semibold mb-1">✏️ Manual Assignment</div>
                          <div className="text-sm text-gray-300">Manually move players</div>
                        </button>
                        <button
                          onClick={() => setActiveTab('squads')}
                          className="p-4 bg-purple-600 hover:bg-purple-700 rounded transition text-left"
                        >
                          <div className="font-semibold mb-1">🏗️ Squad Builder</div>
                          <div className="text-sm text-gray-300">Configure squad structure</div>
                        </button>
                        <button
                          onClick={() => fetchTournamentDetails()}
                          className="p-4 bg-gray-600 hover:bg-gray-700 rounded transition text-left"
                        >
                          <div className="font-semibold mb-1">🔄 Refresh Data</div>
                          <div className="text-sm text-gray-300">Update team information</div>
                        </button>
                      </div>
                    </div>

                    {/* Team Balance Analysis */}
                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-xl font-semibold mb-4">Team Balance Analysis</h3>
                      
                      {participants.length >= 2 ? (
                        <div className="space-y-4">
                          {/* Balance Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-[#0d2645] rounded p-4">
                              <div className="text-sm text-gray-400 mb-1">Average Team Size</div>
                              <div className="text-2xl font-bold">
                                {Math.round(selectedTournament.registered_players / participants.length)}
                              </div>
                            </div>
                            <div className="bg-[#0d2645] rounded p-4">
                              <div className="text-sm text-gray-400 mb-1">Teams Ready</div>
                              <div className="text-2xl font-bold text-green-400">
                                {participants.filter(p => p.team.member_count >= 32).length}/{participants.length}
                              </div>
                            </div>
                            <div className="bg-[#0d2645] rounded p-4">
                              <div className="text-sm text-gray-400 mb-1">Balance Score</div>
                              <div className="text-2xl font-bold text-blue-400">85%</div>
                            </div>
                          </div>

                          {/* Team Comparison */}
                          <div className="space-y-3">
                            <h4 className="font-semibold">Team Size Comparison</h4>
                            {participants.map((participant, index) => {
                              const readiness = getTeamReadiness(participant.team);
                              return (
                                <div key={participant.id} className="bg-[#0d2645] rounded p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-6 h-6 bg-blue-600 rounded text-center text-sm font-bold">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <div className="font-semibold">{participant.team.name}</div>
                                        <div className="text-sm text-gray-400">
                                          Lead: {participant.team.lead_player.username}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">
                                        {participant.team.member_count}/32 players
                                      </div>
                                      <div className={`text-sm ${readiness.color}`}>
                                        {readiness.status}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                      className="bg-blue-500 h-3 rounded-full"
                                      style={{ width: `${Math.min((participant.team.member_count / 32) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">⚖️</div>
                          <p className="text-gray-400">Need at least 2 teams to analyze balance</p>
                        </div>
                      )}
                    </div>

                    {/* Auto-Assignment Settings */}
                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-xl font-semibold mb-4">Auto-Assignment Configuration</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Balancing Criteria</h4>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span>Balance by skill tier</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span>Maintain squad integrity</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded" />
                              <span>Regional preferences</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded" />
                              <span>Previous match history</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Assignment Rules</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-400">Target Team Size</label>
                              <select className="w-full p-2 bg-[#0d2645] rounded border border-gray-600 mt-1">
                                <option value="32">32 players (Full)</option>
                                <option value="28">28 players (Partial)</option>
                                <option value="24">24 players (Minimum)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Squad Formation</label>
                              <select className="w-full p-2 bg-[#0d2645] rounded border border-gray-600 mt-1">
                                <option value="auto">Auto-generate squads</option>
                                <option value="preserve">Preserve existing squads</option>
                                <option value="manual">Manual squad assignment</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex space-x-4">
                        <button
                          onClick={autoAssignTeams}
                          disabled={selectedTournament.is_started || participants.length < 2}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition disabled:opacity-50"
                        >
                          🤖 Run Auto-Assignment
                        </button>
                        <button
                          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded transition"
                        >
                          📊 Preview Changes
                        </button>
                        <button
                          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded transition"
                        >
                          💾 Save Draft Settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'squads' && (
                  <div className="space-y-6">
                    
                    {/* Squad Overview */}
                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-xl font-semibold mb-4">Squad Structure Management</h3>
                      
                      {participants.length > 0 ? (
                        <div className="space-y-6">
                          {participants.map((participant, teamIndex) => (
                            <div key={participant.id} className="bg-[#0d2645] rounded-lg p-6">
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <h4 className="text-lg font-bold">{participant.team.name}</h4>
                                  <p className="text-sm text-gray-400">
                                    {participant.team.member_count} members • {participant.team.squads?.length || 0} squads configured
                                  </p>
                                </div>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition">
                                  Configure Squads
                                </button>
                              </div>

                              {/* Squad Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'].map((squadType) => {
                                  const existingSquad = participant.team.squads?.find(s => s.squad_type === squadType);
                                  return (
                                    <div 
                                      key={squadType} 
                                      className={`rounded-lg p-4 border-2 ${ 
                                        existingSquad 
                                          ? 'border-green-500 bg-green-900/20' 
                                          : 'border-gray-600 bg-gray-900/20'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">{squadType === 'ALPHA' ? '🅰️' : squadType === 'BRAVO' ? '🅱️' : '🔤'}</span>
                                          <span className="font-semibold text-sm">{squadType}</span>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded ${existingSquad ? 'bg-green-600' : 'bg-gray-600'}`}>
                                          {existingSquad ? existingSquad.members?.length || 0 : 0}/4
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-1 text-xs">
                                        {existingSquad?.members?.slice(0, 4).map((member, idx) => (
                                          <div key={member.id} className="flex items-center space-x-1">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                            <span className="truncate">{member.player.username}</span>
                                            <span className="text-gray-500">({member.role})</span>
                                          </div>
                                        )) || (
                                          <div className="text-gray-500 italic">No members assigned</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Squad Stats */}
                              <div className="mt-4 flex justify-between items-center text-sm">
                                <div className="flex space-x-6">
                                  <div>
                                    <span className="text-gray-400">Squads Complete:</span>
                                    <span className="ml-2 font-semibold text-green-400">
                                      {participant.team.squads?.filter(s => s.members?.length === 4).length || 0}/8
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Players Assigned:</span>
                                    <span className="ml-2 font-semibold">
                                      {participant.team.squads?.reduce((total, squad) => total + (squad.members?.length || 0), 0) || 0}/{participant.team.member_count}
                                    </span>
                                  </div>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300">
                                  Auto-Generate Squads →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-2">🏗️</div>
                          <p className="text-gray-400">No teams registered to configure squads</p>
                        </div>
                      )}
                    </div>

                    {/* Squad Templates */}
                    <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                      <h3 className="text-xl font-semibold mb-4">Squad Templates & Roles</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Standard 32v32 Formation</h4>
                          <div className="space-y-3">
                            {[
                              { squad: 'ALPHA & BRAVO', role: 'Assault Squads', desc: 'Infantry-focused frontline assault' },
                              { squad: 'CHARLIE & DELTA', role: 'Support Squads', desc: 'Medics, engineers, and resupply' },
                              { squad: 'ECHO & FOXTROT', role: 'Armor Squads', desc: 'Tank crews and armored support' },
                              { squad: 'GOLF & HOTEL', role: 'Air Squads', desc: 'Helicopter and jet pilots' }
                            ].map((template, idx) => (
                              <div key={idx} className="bg-[#0d2645] rounded p-3">
                                <div className="font-semibold text-sm">{template.squad}</div>
                                <div className="text-blue-400 text-sm">{template.role}</div>
                                <div className="text-xs text-gray-400 mt-1">{template.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Role Assignments</h4>
                          <div className="space-y-3">
                            {[
                              { role: '👑 Squad Leader', count: '1 per squad', desc: 'Commands and coordinates squad' },
                              { role: '🪖 Infantry', count: '2-3 per squad', desc: 'Core combat troops' },
                              { role: '🎯 Specialist', count: '1 per squad', desc: 'Engineer, medic, or sniper' },
                              { role: '🚗 Vehicle Operator', count: 'As needed', desc: 'Tank, heli, or jet pilot' }
                            ].map((role, idx) => (
                              <div key={idx} className="bg-[#0d2645] rounded p-3">
                                <div className="flex justify-between items-start">
                                  <div className="font-semibold text-sm">{role.role}</div>
                                  <div className="text-xs text-blue-400">{role.count}</div>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{role.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex space-x-4">
                        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded transition">
                          🏗️ Apply Standard Formation
                        </button>
                        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded transition">
                          🤖 Auto-Assign All Squads
                        </button>
                        <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded transition">
                          💾 Save Squad Templates
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-8 text-center">
                    <div className="text-6xl mb-4">⚔️</div>
                    <h3 className="text-2xl font-semibold mb-4">Match Management</h3>
                    <p className="text-gray-400 mb-6">
                      Tournament bracket and match scheduling for 32v32 battles
                    </p>
                    <button
                      onClick={generateBracket}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded transition"
                    >
                      Generate Tournament Bracket
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-8 text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-semibold mb-4">Select a Tournament</h3>
                <p className="text-gray-400">Choose a 32v32 tournament from the sidebar to manage</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Admin32v32Management;