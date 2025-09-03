'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { useAuthState } from '@/lib/auth';
import { teamDb } from '@/lib/database/teams';
import { tournamentDb } from '@/lib/database/tournaments';
import { toast } from 'react-toastify';

interface TeamStats {
  id: string;
  name: string;
  tag?: string;
  member_count: number;
  tournament_registrations: number;
  recent_activity: string;
  is_recruiting: boolean;
}

interface TournamentRegistration {
  id: string;
  tournament: {
    id: string;
    title: string;
    start_date: string;
    mode: string;
    registered_players: number;
    max_players: number;
  };
  status: string;
  registered_at: string;
}

export default function TeamLeadDashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [myTeams, setMyTeams] = useState<TeamStats[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!profile?.is_team_lead && !profile?.is_admin) {
      toast.error('Team lead access required');
      router.push('/battlefield');
      return;
    }
    
    fetchDashboardData();
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Fetch teams where user is captain or co-leader
      const teams = await teamDb.getUserTeams(user.id);
      const captainTeams = teams.filter(membership => 
        membership.role === 'CAPTAIN' || membership.role === 'CO_LEADER'
      );

      // Transform to team stats format
      const teamStats = await Promise.all(
        captainTeams.map(async (membership) => {
          const team = membership.teams;
          
          // Get tournament registrations for this team
          const { data: regs } = await tournamentDb.getTeamRegistrations(team.id);
          
          return {
            id: team.id,
            name: team.name,
            tag: team.tag,
            member_count: team.member_count,
            tournament_registrations: regs?.length || 0,
            recent_activity: team.updated_at,
            is_recruiting: team.is_recruiting
          };
        })
      );

      setMyTeams(teamStats);

      // Fetch recent tournament registrations
      const allRegistrations = [];
      for (const team of teamStats) {
        const { data: teamRegs } = await tournamentDb.getTeamRegistrations(team.id);
        if (teamRegs) {
          allRegistrations.push(...teamRegs.map(reg => ({
            ...reg,
            team_name: team.name
          })));
        }
      }

      // Sort by registration date and take most recent
      allRegistrations.sort((a, b) => 
        new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime()
      );
      
      setRegistrations(allRegistrations.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string, teamId?: string) => {
    switch (action) {
      case 'create_team':
        router.push('/battlefield/teams/create');
        break;
      case 'view_team':
        if (teamId) router.push(`/battlefield/teams/${teamId}`);
        break;
      case 'manage_members':
        if (teamId) router.push(`/battlefield/teams/${teamId}#members`);
        break;
      case 'browse_tournaments':
        router.push('/battlefield/tournaments');
        break;
      case 'view_teams':
        router.push('/battlefield/teams');
        break;
    }
  };

  if (!user || (!profile?.is_team_lead && !profile?.is_admin)) {
    return null;
  }

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-2">
                    TEAM LEAD DASHBOARD
                  </h1>
                  <p className="text-gray-300 text-lg">Manage your teams and tournament participation</p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded font-semibold">
                  🛡️ TEAM LEADER
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* My Teams Overview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-bank">MY TEAMS</h2>
                    <button
                      onClick={() => handleQuickAction('create_team')}
                      className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                    >
                      CREATE NEW TEAM
                    </button>
                  </div>

                  {myTeams.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                      <div className="text-6xl mb-4">🛡️</div>
                      <h3 className="text-xl font-bold mb-2">No Teams Yet</h3>
                      <p className="text-gray-400 mb-6">
                        Create your first team to start building your competitive squad
                      </p>
                      <button
                        onClick={() => handleQuickAction('create_team')}
                        className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                      >
                        CREATE TEAM
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myTeams.map((team) => (
                        <div key={team.id} className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold">{team.name}</h3>
                                {team.tag && (
                                  <span className="px-2 py-1 bg-[#377cca] rounded text-sm">[{team.tag}]</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{team.member_count} members</p>
                            </div>
                            {team.is_recruiting && (
                              <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold">
                                RECRUITING
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Tournament Registrations:</span>
                              <span className="font-semibold">{team.tournament_registrations}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Last Activity:</span>
                              <span className="font-semibold">
                                {new Date(team.recent_activity).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleQuickAction('view_team', team.id)}
                              className="flex-1 px-3 py-2 bg-[#377cca] rounded hover:brightness-110 transition text-sm font-semibold"
                            >
                              MANAGE
                            </button>
                            <button
                              onClick={() => handleQuickAction('manage_members', team.id)}
                              className="flex-1 px-3 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition text-sm font-semibold"
                            >
                              MEMBERS
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Tournament Activity */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold font-bank">RECENT TOURNAMENT ACTIVITY</h2>
                  
                  {registrations.length === 0 ? (
                    <div className="text-center py-8 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                      <div className="text-4xl mb-2">🏆</div>
                      <p className="text-gray-400">No tournament registrations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((reg) => (
                        <div key={reg.id} className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold">{reg.tournament.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>Mode: {reg.tournament.mode}</span>
                                <span>
                                  Players: {reg.tournament.registered_players}/{reg.tournament.max_players}
                                </span>
                                <span>
                                  Start: {new Date(reg.tournament.start_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                                reg.status === 'CONFIRMED' ? 'bg-green-600' :
                                reg.status === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'
                              }`}>
                                {reg.status}
                              </span>
                              <button
                                onClick={() => router.push(`/battlefield/tournaments/${reg.tournament.id}`)}
                                className="px-4 py-2 bg-[#377cca] rounded hover:brightness-110 transition text-sm font-semibold"
                              >
                                VIEW
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold font-bank">QUICK ACTIONS</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => handleQuickAction('create_team')}
                      className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg hover:brightness-110 transition text-center"
                    >
                      <div className="text-3xl mb-2">🛡️</div>
                      <div className="text-sm font-semibold">Create Team</div>
                    </button>
                    
                    <button 
                      onClick={() => handleQuickAction('browse_tournaments')}
                      className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg hover:brightness-110 transition text-center"
                    >
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="text-sm font-semibold">Browse Tournaments</div>
                    </button>
                    
                    <button 
                      onClick={() => handleQuickAction('view_teams')}
                      className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg hover:brightness-110 transition text-center"
                    >
                      <div className="text-3xl mb-2">👥</div>
                      <div className="text-sm font-semibold">All Teams</div>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/battlefield/tournaments?filter=my-tournaments')}
                      className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg hover:brightness-110 transition text-center"
                    >
                      <div className="text-3xl mb-2">📊</div>
                      <div className="text-sm font-semibold">My Tournaments</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}