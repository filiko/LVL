'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { tournamentDb } from '@/lib/database/tournaments';
import { useAuthState } from '@/lib/auth';

interface Tournament {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  mode: string;
  region: string;
  platform: string;
  language: string;
  registered_players: number;
  max_players: number;
  is_active: boolean;
  is_started: boolean;
  is_completed: boolean;
  games?: {
    name: string;
    code: string;
  };
  profiles?: {
    username: string;
    tier: string;
  };
}

export default function TournamentsPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    mode: '',
    region: '',
    platform: '',
    status: 'active'
  });

  useEffect(() => {
    fetchTournaments();
  }, [filters]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentDb.getTournaments({
        mode: filters.mode || undefined,
        region: filters.region || undefined,
        platform: filters.platform || undefined,
        active: filters.status === 'active' ? true : undefined,
        limit: 50
      });
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (tournamentId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/battlefield/tournaments/${tournamentId}/register`);
  };

  const getTournamentStatus = (tournament: Tournament) => {
    if (tournament.is_completed) return { text: 'COMPLETED', color: 'text-gray-400' };
    if (tournament.is_started) return { text: 'IN PROGRESS', color: 'text-yellow-400' };
    if (!tournament.is_active) return { text: 'INACTIVE', color: 'text-red-400' };
    if (tournament.registered_players >= tournament.max_players) return { text: 'FULL', color: 'text-orange-400' };
    return { text: 'OPEN', color: 'text-green-400' };
  };

  const canRegister = (tournament: Tournament) => {
    return tournament.is_active && 
           !tournament.is_started && 
           !tournament.is_completed && 
           tournament.registered_players < tournament.max_players;
  };

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
            
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-4">TOURNAMENTS</h1>
              <p className="text-gray-300 text-lg">Join competitive Battlefield tournaments and compete for glory</p>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 font-bank">FILTERS</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  value={filters.mode}
                  onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                  className="bg-[#12436c] border border-[#377cca] rounded px-3 py-2 text-white"
                >
                  <option value="">All Modes</option>
                  <option value="16v16">16v16</option>
                  <option value="32v32">32v32</option>
                  <option value="64v64">64v64</option>
                </select>

                <select 
                  value={filters.region}
                  onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                  className="bg-[#12436c] border border-[#377cca] rounded px-3 py-2 text-white"
                >
                  <option value="">All Regions</option>
                  <option value="NA">North America</option>
                  <option value="EU">Europe</option>
                  <option value="ASIA">Asia</option>
                  <option value="OCE">Oceania</option>
                </select>

                <select 
                  value={filters.platform}
                  onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                  className="bg-[#12436c] border border-[#377cca] rounded px-3 py-2 text-white"
                >
                  <option value="">All Platforms</option>
                  <option value="PC">PC</option>
                  <option value="XBOX">Xbox</option>
                  <option value="PLAYSTATION">PlayStation</option>
                </select>

                <select 
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="bg-[#12436c] border border-[#377cca] rounded px-3 py-2 text-white"
                >
                  <option value="active">Active Only</option>
                  <option value="all">All Tournaments</option>
                </select>
              </div>
            </div>

            {/* Tournament List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-300">No tournaments found matching your criteria</p>
                  <button 
                    onClick={() => setFilters({ mode: '', region: '', platform: '', status: 'active' })}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                tournaments.map((tournament) => {
                  const status = getTournamentStatus(tournament);
                  return (
                    <div key={tournament.id} className="p-6 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-[#2b4b6f] hover:border-[#377cca] transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold font-bank tracking-[0.08em] mb-2">{tournament.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${status.color.replace('text-', 'bg-')}`}></span>
                              <span className={status.color}>{status.text}</span>
                            </span>
                            <span>Created by: {tournament.profiles?.username || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#3791dd]">
                            {tournament.registered_players}/{tournament.max_players}
                          </div>
                          <div className="text-sm text-gray-300">Players</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">GAME & MODE</p>
                          <p className="font-semibold text-[#3791dd]">{tournament.games?.name || 'Battlefield 2042'}</p>
                          <p className="text-white">{tournament.mode}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">REGION & PLATFORM</p>
                          <p className="text-white">{tournament.region}</p>
                          <p className="text-white">{tournament.platform}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">START DATE</p>
                          <p className="text-white">{new Date(tournament.start_date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-300">{new Date(tournament.start_date).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => router.push(`/battlefield/tournaments/${tournament.id}`)}
                          className="px-4 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition"
                        >
                          View Details
                        </button>
                        {canRegister(tournament) ? (
                          <button
                            onClick={() => handleRegister(tournament.id)}
                            className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                          >
                            REGISTER NOW
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-6 py-2 bg-gray-600 rounded cursor-not-allowed opacity-50"
                          >
                            {status.text}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Create Tournament Button (Admin/Team Lead Only) */}
            {profile && (profile.is_admin || profile.is_team_lead) && (
              <div className="fixed bottom-6 right-6">
                <button
                  onClick={() => router.push('/battlefield/tournaments/create')}
                  className="w-14 h-14 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded-full flex items-center justify-center hover:brightness-110 transition shadow-lg"
                  title="Create Tournament"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 