"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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
    id: number;
    username: string;
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

const Tournament32v32Detail = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'squads'>('overview');

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
      fetchTournamentData();
    }
  }, [backendUrl, accessToken, params.id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${accessToken}` };

      const [tournamentRes, participantsRes, teamsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/tournaments/${params.id}/`, { headers }),
        axios.get(`${backendUrl}/api/tournaments/${params.id}/participants/`, { headers }),
        axios.get(`${backendUrl}/api/teams/`, { headers })
      ]);

      setTournament(tournamentRes.data);
      setParticipants(participantsRes.data);
      
      // Find user's team
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userTeamFound = teamsRes.data.find((team: Team) => 
        team.lead_player.id === currentUser.id
      );
      setUserTeam(userTeamFound || null);

    } catch (error) {
      console.error('Failed to fetch tournament data:', error);
      toast.error('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!userTeam) {
      toast.error('You need to be a team leader to register');
      router.push('/teams/create');
      return;
    }

    if (userTeam.member_count < 32) {
      toast.error('Your team needs at least 32 members for 32v32 tournaments');
      return;
    }

    try {
      setRegistering(true);
      await axios.post(
        `${backendUrl}/api/tournaments/${params.id}/register/`,
        { team_id: userTeam.id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success('Successfully registered for tournament!');
      fetchTournamentData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to register';
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const isUserRegistered = () => {
    if (!userTeam) return false;
    return participants.some(p => p.team.id === userTeam.id);
  };

  const getSquadIcon = (squadType: string) => {
    const icons = {
      'ALPHA': '🅰️', 'BRAVO': '🅱️', 'CHARLIE': '🔤', 'DELTA': '🔺',
      'ECHO': '📡', 'FOXTROT': '🦊', 'GOLF': '⛳', 'HOTEL': '🏨'
    };
    return icons[squadType as keyof typeof icons] || '🔹';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      'INFANTRY': '🪖', 'ARMOR': '🚗', 'HELI': '🚁', 'JET': '✈️'
    };
    return icons[role as keyof typeof icons] || '👤';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <button
            onClick={() => router.push('/battlefield/32v32')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition"
          >
            Back to Tournaments
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/battlefield/32v32')}
              className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-400">32v32 Tournament</div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold font-bank mb-2">{tournament.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-4 py-2 rounded font-semibold ${
                  tournament.is_started ? 'bg-yellow-600' : 
                  tournament.is_active ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {tournament.is_started ? 'IN PROGRESS' : 
                   tournament.is_active ? 'OPEN FOR REGISTRATION' : 'CLOSED'}
                </span>
                <span className="px-3 py-1 bg-blue-600 rounded text-sm">{tournament.bracket_type}</span>
                <span className="px-3 py-1 bg-purple-600 rounded text-sm">{tournament.tournament_type}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400 mb-1">32v32</div>
              <div className="text-sm text-gray-400">LARGE SCALE WARFARE</div>
              <div className="text-lg font-semibold mt-2">
                {tournament.registered_players}/{tournament.max_players} Players
              </div>
            </div>
          </div>
        </div>

        {/* Registration Section */}
        {tournament.is_active && !tournament.is_started && (
          <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2">Tournament Registration</h3>
                <p className="text-gray-400">
                  {isUserRegistered() 
                    ? 'Your team is registered for this tournament'
                    : 'Register your team to participate in this 32v32 tournament'
                  }
                </p>
              </div>
              <div>
                {isUserRegistered() ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓ Registered</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering || !tournament.is_active}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded transition disabled:opacity-50"
                  >
                    {registering ? 'Registering...' : 'Register Team'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          {[
            { key: 'overview', label: 'OVERVIEW' },
            { key: 'teams', label: `TEAMS (${participants.length})` },
            { key: 'squads', label: 'SQUAD STRUCTURE' }
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

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Tournament Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                <h3 className="text-xl font-semibold mb-4">Tournament Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Start Date</div>
                    <div className="font-semibold">
                      {new Date(tournament.start_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Region</div>
                    <div className="font-semibold">{tournament.region}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Platform</div>
                    <div className="font-semibold">{tournament.platform}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Language</div>
                    <div className="font-semibold">{tournament.language}</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                <h3 className="text-xl font-semibold mb-4">32v32 Format</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚔️</span>
                    <div>
                      <div className="font-semibold">Large Scale Combat</div>
                      <div className="text-sm text-gray-400">Two teams of 32 players each engage in epic battles</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏗️</span>
                    <div>
                      <div className="font-semibold">Squad Structure</div>
                      <div className="text-sm text-gray-400">6-8 squads per team with specialized roles</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-semibold">Tactical Gameplay</div>
                      <div className="text-sm text-gray-400">Combined arms warfare with infantry, armor, air support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                <h3 className="text-lg font-semibold mb-4">Registration Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Players Registered</span>
                      <span className="font-semibold">{tournament.registered_players}/{tournament.max_players}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${(tournament.registered_players / tournament.max_players) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Teams Registered</span>
                      <span className="font-semibold">{participants.length}/32</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${(participants.length / 32) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Registration Status</div>
                    <div className={`font-semibold ${
                      tournament.is_active ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tournament.is_active ? 'Open' : 'Closed'}
                    </div>
                  </div>
                </div>
              </div>

              {userTeam && (
                <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Team</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold">{userTeam.name}</div>
                      <div className="text-sm text-gray-400">
                        {userTeam.member_count}/32 members
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(userTeam.member_count / 32) * 100}%` }}
                      />
                    </div>
                    <div className={`text-sm ${
                      userTeam.member_count >= 32 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {userTeam.member_count >= 32 ? 'Ready for 32v32' : 'Needs more members'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => router.push(`/teams/${participant.team.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{participant.team.name}</h3>
                    <p className="text-sm text-gray-400">
                      Lead: {participant.team.lead_player.username}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold bg-${participant.team.tier.toLowerCase()}-600`}>
                    {participant.team.tier}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Squad Count:</span>
                    <span className="font-semibold">{participant.team.squads?.length || 0}/8</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Registered:</span>
                    <span className="text-sm">
                      {new Date(participant.registered_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Ready Status</span>
                    <span className="text-green-400">CONFIRMED</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="space-y-8">
            <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
              <h3 className="text-xl font-semibold mb-4">32v32 Squad Structure</h3>
              <p className="text-gray-400 mb-6">
                Each team is organized into 6-8 specialized squads with specific roles and responsibilities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'].map((squadType) => (
                  <div key={squadType} className="bg-[#0d2645] rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">{getSquadIcon(squadType)}</span>
                      <div>
                        <div className="font-semibold">{squadType} SQUAD</div>
                        <div className="text-xs text-gray-400">4 members</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">👑</span>
                        <span>Squad Leader</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🪖</span>
                        <span>Infantry (x2)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🎯</span>
                        <span>Specialist</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-6">
              <h3 className="text-xl font-semibold mb-4">Role Specializations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { role: 'INFANTRY', icon: '🪖', desc: 'Ground assault and defense' },
                  { role: 'ARMOR', icon: '🚗', desc: 'Tank operations and heavy support' },
                  { role: 'HELI', icon: '🚁', desc: 'Air transport and close air support' },
                  { role: 'JET', icon: '✈️', desc: 'Air superiority and ground attack' }
                ].map((role) => (
                  <div key={role.role} className="bg-[#0d2645] rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <div className="font-semibold mb-1">{role.role}</div>
                    <div className="text-xs text-gray-400">{role.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Tournament32v32Detail;