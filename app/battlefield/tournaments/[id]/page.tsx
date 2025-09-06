'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { tournamentDb } from '@/lib/database/tournaments';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

interface Tournament {
  id: string;
  title: string;
  start_date: string;
  end_date?: string;
  mode: string;
  region: string;
  platform: string;
  language: string;
  registered_players: number;
  max_players: number;
  is_active: boolean;
  is_started: boolean;
  is_completed: boolean;
  description?: string;
  rules?: string;
  prize_pool?: number;
  entry_fee?: number;
  bracket_type: string;
  games?: {
    name: string;
    code: string;
    description: string;
  };
  profiles?: {
    username: string;
    tier: string;
  };
  registrations?: Array<{
    id: string;
    status: string;
    registered_at: string;
    teams: {
      id: string;
      name: string;
      tag: string;
      tier: string;
      captain_id: string;
      member_count: number;
      profiles: {
        id: string;
        username: string;
        tier: string;
      };
    };
  }>;
}

export default function TournamentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuthState();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTournament();
    }
  }, [params.id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const data = await tournamentDb.getTournament(params.id as string);
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !tournament) return;
    
    router.push(`/battlefield/tournaments/${tournament.id}/register`);
  };

  const getTournamentStatus = (tournament: Tournament) => {
    if (tournament.is_completed) return { text: 'COMPLETED', color: 'text-gray-400', bg: 'bg-gray-600' };
    if (tournament.is_started) return { text: 'IN PROGRESS', color: 'text-yellow-400', bg: 'bg-yellow-600' };
    if (!tournament.is_active) return { text: 'INACTIVE', color: 'text-red-400', bg: 'bg-red-600' };
    if (tournament.registered_players >= tournament.max_players) return { text: 'FULL', color: 'text-orange-400', bg: 'bg-orange-600' };
    return { text: 'OPEN', color: 'text-green-400', bg: 'bg-green-600' };
  };

  const canRegister = (tournament: Tournament) => {
    return tournament.is_active && 
           !tournament.is_started && 
           !tournament.is_completed && 
           tournament.registered_players < tournament.max_players;
  };

  const canManageTournament = (tournament: Tournament) => {
    return user && profile && (
      profile.is_admin || 
      tournament.profiles?.username === profile.username
    );
  };

  if (loading) {
    return (
      <main className="hero-gradient min-h-screen text-white relative bg-[#08182a] font-bahnschrift">
        <Header />
        <Header2 />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="hero-gradient min-h-screen text-white relative bg-[#08182a] font-bahnschrift">
        <Header />
        <Header2 />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Tournament Not Found</h1>
            <p className="text-gray-300 mb-6">The tournament you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/battlefield/tournaments')}
              className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition"
            >
              Back to Tournaments
            </button>
          </div>
        </div>
      </main>
    );
  }

  const status = getTournamentStatus(tournament);
  const confirmedTeams = tournament.registrations?.filter(reg => reg.status === 'CONFIRMED') || [];
  const pendingTeams = tournament.registrations?.filter(reg => reg.status === 'PENDING') || [];

  return (
    <main className="hero-gradient min-h-screen text-white relative bg-[#08182a] font-bahnschrift">
      <img
        src="/player.png"
        alt="Players"
        className="fixed top-20 right-0 w-[200px] h-[auto] z-0 pointer-events-none"
      />
      <Header />
      <Header2 />
      
      <div className="relative z-10">
        <div className="flex-1 bg-gradient-to-r from-[#061526] to-[#0b1f30]/70 pl-[158px] pr-[158px]">
          <div className="pt-[48px] bg-gradient-to-r from-[#08182a] to-[#0a3152]/10">
            
            {/* Tournament Header */}
            <div className="mb-8 p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                    <span className="ml-4 text-sm text-gray-300">
                      Created by {tournament.profiles?.username || 'Unknown'}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-2">{tournament.title}</h1>
                  <p className="text-lg text-gray-300">{tournament.games?.description || 'Competitive tournament'}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#3791dd] mb-1">
                    {tournament.registered_players}/{tournament.max_players}
                  </div>
                  <div className="text-sm text-gray-300">Players Registered</div>
                  {tournament.prize_pool && (
                    <div className="mt-2">
                      <div className="text-xl font-bold text-green-400">
                        ${tournament.prize_pool.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300">Prize Pool</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">GAME</p>
                  <p className="font-semibold text-white">{tournament.games?.name || 'Battlefield 2042'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">MODE</p>
                  <p className="font-semibold text-[#3791dd]">{tournament.mode}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">BRACKET TYPE</p>
                  <p className="font-semibold text-white">{tournament.bracket_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">ENTRY FEE</p>
                  <p className="font-semibold text-white">
                    {tournament.entry_fee ? `$${tournament.entry_fee}` : 'Free'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">REGION</p>
                  <p className="font-semibold text-white">{tournament.region}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">PLATFORM</p>
                  <p className="font-semibold text-white">{tournament.platform}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">LANGUAGE</p>
                  <p className="font-semibold text-white">{tournament.language}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">START DATE</p>
                  <p className="font-semibold text-white">{new Date(tournament.start_date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-300">{new Date(tournament.start_date).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => router.push('/battlefield/tournaments')}
                  className="px-4 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition"
                >
                  ← Back to Tournaments
                </button>
                
                {canRegister(tournament) && user ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold disabled:opacity-50"
                  >
                    {registering ? 'Processing...' : 'REGISTER NOW'}
                  </button>
                ) : !user ? (
                  <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                  >
                    LOGIN TO REGISTER
                  </button>
                ) : null}

                {canManageTournament(tournament) && (
                  <button
                    onClick={() => router.push(`/battlefield/tournaments/${tournament.id}/manage`)}
                    className="px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded hover:brightness-110 transition"
                  >
                    Manage Tournament
                  </button>
                )}
              </div>
            </div>

            {/* Description and Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {tournament.description && (
                <div className="p-6 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg">
                  <h3 className="text-xl font-bold font-bank tracking-[0.08em] mb-4">DESCRIPTION</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{tournament.description}</p>
                </div>
              )}
              
              {tournament.rules && (
                <div className="p-6 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg">
                  <h3 className="text-xl font-bold font-bank tracking-[0.08em] mb-4">RULES</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{tournament.rules}</p>
                </div>
              )}
            </div>

            {/* Registered Teams */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold font-bank tracking-[0.08em] mb-6">REGISTERED TEAMS</h3>
              
              <div className="space-y-4">
                {confirmedTeams.length === 0 && pendingTeams.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No teams registered yet</p>
                  </div>
                ) : (
                  <>
                    {confirmedTeams.map((registration) => (
                      <div key={registration.id} className="p-4 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-green-600/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-bold">{registration.teams.name}</h4>
                              {registration.teams.tag && (
                                <span className="px-2 py-1 bg-[#377cca] rounded text-sm">[{registration.teams.tag}]</span>
                              )}
                              <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold">CONFIRMED</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
                              <span>Captain: {registration.teams.profiles.username}</span>
                              <span>Tier: {registration.teams.tier}</span>
                              <span>Members: {registration.teams.member_count}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-300">
                            Registered: {new Date(registration.registered_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {pendingTeams.map((registration) => (
                      <div key={registration.id} className="p-4 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-yellow-600/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-bold">{registration.teams.name}</h4>
                              {registration.teams.tag && (
                                <span className="px-2 py-1 bg-[#377cca] rounded text-sm">[{registration.teams.tag}]</span>
                              )}
                              <span className="px-2 py-1 bg-yellow-600 rounded text-xs font-semibold">PENDING</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
                              <span>Captain: {registration.teams.profiles.username}</span>
                              <span>Tier: {registration.teams.tier}</span>
                              <span>Members: {registration.teams.member_count}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-300">
                            Registered: {new Date(registration.registered_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 