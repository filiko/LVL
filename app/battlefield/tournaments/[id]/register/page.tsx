'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { tournamentDb } from '@/lib/database/tournaments';
import { teamDb } from '@/lib/database/teams';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

interface Tournament {
  id: string;
  title: string;
  mode: string;
  max_players: number;
  registered_players: number;
  is_active: boolean;
  is_started: boolean;
  start_date: string;
  games?: { name: string };
}

interface UserTeam {
  id: string;
  name: string;
  tag?: string;
  member_count: number;
  role: string;
}

export default function TournamentRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuthState();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (params.id) {
      fetchTournamentAndTeams();
    }
  }, [params.id, user]);

  const fetchTournamentAndTeams = async () => {
    try {
      setLoading(true);
      
      // Fetch tournament details
      const tournamentData = await tournamentDb.getTournament(params.id as string);
      setTournament(tournamentData);

      // Fetch user's teams where they are captain
      if (user) {
        const teams = await teamDb.getUserTeams(user.id);
        const captainTeams = teams
          .filter(membership => membership.role === 'CAPTAIN')
          .map(membership => ({
            ...membership.teams,
            role: membership.role
          }));
        setUserTeams(captainTeams);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedTeamId || !tournament || !user) return;

    try {
      setRegistering(true);
      await tournamentDb.registerTeam(tournament.id, selectedTeamId, user.id);
      toast.success('Successfully registered for tournament!');
      router.push(`/battlefield/tournaments/${tournament.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

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

  const canRegister = tournament.is_active && !tournament.is_started && 
                     tournament.registered_players < tournament.max_players;

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
            
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push(`/battlefield/tournaments/${tournament.id}`)}
                className="flex items-center text-gray-300 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Tournament
              </button>
              <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-2">
                REGISTER FOR TOURNAMENT
              </h1>
              <p className="text-xl text-gray-300">{tournament.title}</p>
            </div>

            {/* Tournament Info */}
            <div className="mb-8 p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 font-bank">TOURNAMENT DETAILS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">GAME</p>
                  <p className="font-semibold text-white">{tournament.games?.name || 'Battlefield 2042'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">MODE</p>
                  <p className="font-semibold text-[#3791dd]">{tournament.mode}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">START DATE</p>
                  <p className="font-semibold text-white">{new Date(tournament.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">PLAYERS</p>
                  <p className="font-semibold text-[#3791dd]">{tournament.registered_players}/{tournament.max_players}</p>
                </div>
              </div>
            </div>

            {/* Registration Status Check */}
            {!canRegister ? (
              <div className="mb-8 p-6 bg-gradient-to-r from-[#b91c1c] to-[#7f1d1d] rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Registration Unavailable</h3>
                <p className="text-gray-200">
                  {!tournament.is_active && "Tournament is not active"}
                  {tournament.is_started && "Tournament has already started"}
                  {tournament.registered_players >= tournament.max_players && "Tournament is full"}
                </p>
              </div>
            ) : userTeams.length === 0 ? (
              <div className="mb-8 p-6 bg-gradient-to-r from-[#d97706] to-[#92400e] rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No Teams Available</h3>
                <p className="text-gray-200 mb-4">
                  You need to be a team captain to register for tournaments.
                </p>
                <button
                  onClick={() => router.push('/battlefield/teams/create')}
                  className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                >
                  CREATE A TEAM
                </button>
              </div>
            ) : (
              /* Registration Form */
              <div className="space-y-8">
                <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 font-bank">SELECT YOUR TEAM</h3>
                  <p className="text-gray-300 mb-6">
                    Choose which team you want to register for this tournament. You can only register teams where you are the captain.
                  </p>
                  
                  <div className="space-y-4">
                    {userTeams.map((team) => (
                      <label key={team.id} className="block">
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedTeamId === team.id
                            ? 'border-[#377cca] bg-[#377cca]/20'
                            : 'border-gray-600 bg-[#12436c] hover:border-[#377cca]/50'
                        }`}>
                          <input
                            type="radio"
                            name="team"
                            value={team.id}
                            checked={selectedTeamId === team.id}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-bold">{team.name}</h4>
                                {team.tag && (
                                  <span className="px-2 py-1 bg-[#377cca] rounded text-sm">[{team.tag}]</span>
                                )}
                                <span className="px-2 py-1 bg-yellow-600 rounded text-xs font-semibold">CAPTAIN</span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">
                                {team.member_count} members
                              </p>
                            </div>
                            {selectedTeamId === team.id && (
                              <svg className="w-6 h-6 text-[#377cca]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Registration Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => router.push(`/battlefield/tournaments/${tournament.id}`)}
                    className="px-6 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleRegister}
                    disabled={!selectedTeamId || registering}
                    className="px-8 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? 'REGISTERING...' : 'REGISTER TEAM'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}