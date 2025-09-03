'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { teamDb } from '@/lib/database/teams';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

const roleIcons: Record<string, string> = {
  INFANTRY: "/infantry2.png",
  ARMOR: "/armour2.png",
  HELI: "/heli.png",
  JET: "/jet.png"
};

interface Team {
  id: string;
  name: string;
  tag?: string;
  description?: string;
  tier: string;
  region?: string;
  language?: string;
  member_count: number;
  max_members: number;
  is_recruiting: boolean;
  discord_server?: string;
  profiles?: {
    id: string;
    username: string;
    tier: string;
    avatar_url?: string;
  };
  team_members?: Array<{
    id: string;
    role: string;
    position: string;
    squad_assignment?: string;
    profiles?: {
      id: string;
      username: string;
      tier: string;
      avatar_url?: string;
    };
  }>;
}

export default function TeamsPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    tier: '',
    recruiting: '',
    view: 'browse' // 'browse' or 'my-teams'
  });

  useEffect(() => {
    fetchTeams();
    if (user && filters.view === 'my-teams') {
      fetchUserTeams();
    }
  }, [filters, user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamDb.getTeams({
        region: filters.region || undefined,
        tier: filters.tier || undefined,
        recruiting: filters.recruiting ? filters.recruiting === 'true' : undefined,
        limit: 50
      });
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    if (!user) return;
    
    try {
      const data = await teamDb.getUserTeams(user.id);
      const teamsData = data.map(membership => ({
        ...membership.teams,
        user_role: membership.role,
        user_position: membership.position,
        user_squad: membership.squad_assignment
      }));
      setUserTeams(teamsData);
    } catch (error) {
      console.error('Error fetching user teams:', error);
      toast.error('Failed to load your teams');
    }
  };

  const handleJoinTeam = (teamId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/battlefield/teams/${teamId}/join`);
  };

  const handleCreateTeam = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!profile?.is_team_lead && !profile?.is_admin) {
      toast.error('Only team leads can create teams');
      return;
    }
    router.push('/battlefield/teams/create');
  };

  const displayTeams = filters.view === 'my-teams' ? userTeams : teams;

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
              <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-4">TEAMS</h1>
              <p className="text-gray-300 text-lg">Find and join competitive Battlefield teams</p>
            </div>

            {/* View Toggle & Create Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2 bg-[#0e3250] rounded-lg p-1">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: 'browse' }))}
                  className={`px-4 py-2 rounded-md transition ${
                    filters.view === 'browse'
                      ? 'bg-[#377cca] text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Browse Teams
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: 'my-teams' }))}
                  className={`px-4 py-2 rounded-md transition ${
                    filters.view === 'my-teams'
                      ? 'bg-[#377cca] text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  My Teams ({userTeams.length})
                </button>
              </div>

              {profile?.is_team_lead && (
                <button
                  onClick={handleCreateTeam}
                  className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                >
                  CREATE TEAM
                </button>
              )}
            </div>

            {/* Filters */}
            {filters.view === 'browse' && (
              <div className="mb-8 p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 font-bank">FILTERS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select 
                    value={filters.tier}
                    onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
                    className="bg-[#12436c] border border-[#377cca] rounded px-3 py-2 text-white"
                  >
                    <option value="">All Tiers</option>
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="DIAMOND">Diamond</option>
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
                    value={filters.recruiting}
                    onChange={(e) => setFilters(prev => ({ ...prev, recruiting: e.target.value }))}
                    className="bg-[#12436c] border border-[#377cca] rounded px-3 py-2 text-white"
                  >
                    <option value="">All Teams</option>
                    <option value="true">Recruiting</option>
                    <option value="false">Not Recruiting</option>
                  </select>
                </div>
              </div>
            )}

            {/* Teams List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : displayTeams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-300">
                    {filters.view === 'my-teams' 
                      ? "You haven't joined any teams yet" 
                      : "No teams found matching your criteria"
                    }
                  </p>
                  {filters.view === 'browse' && (
                    <button 
                      onClick={() => setFilters({ region: '', tier: '', recruiting: '', view: 'browse' })}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                displayTeams.map((team) => (
                  <div key={team.id} className="p-6 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-[#2b4b6f] hover:border-[#377cca] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold font-bank tracking-[0.08em]">{team.name}</h3>
                          {team.tag && (
                            <span className="px-2 py-1 bg-[#377cca] rounded text-sm">[{team.tag}]</span>
                          )}
                          {team.is_recruiting ? (
                            <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold">RECRUITING</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-600 rounded text-xs font-semibold">CLOSED</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span>Captain: {team.profiles?.username || 'Unknown'}</span>
                          <span>Tier: {team.tier}</span>
                          {team.region && <span>Region: {team.region}</span>}
                        </div>
                        {team.description && (
                          <p className="text-gray-300 mt-2 text-sm">{team.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#3791dd]">
                          {team.member_count}/{team.max_members}
                        </div>
                        <div className="text-sm text-gray-300">Members</div>
                      </div>
                    </div>

                    {/* Team Members Preview */}
                    {team.team_members && team.team_members.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">MEMBERS</h4>
                        <div className="flex flex-wrap gap-2">
                          {team.team_members.slice(0, 8).map((member) => (
                            <div key={member.id} className="flex items-center space-x-2 bg-[#12436c] rounded px-2 py-1 text-xs">
                              <img 
                                src={member.profiles?.avatar_url || '/bfMiniImg.jpg'} 
                                alt={member.profiles?.username || 'Member'} 
                                className="w-4 h-4 rounded-full" 
                              />
                              <span>{member.profiles?.username || 'Unknown'}</span>
                              <span className="text-gray-400">({member.position})</span>
                            </div>
                          ))}
                          {team.team_members.length > 8 && (
                            <div className="flex items-center px-2 py-1 text-xs text-gray-400">
                              +{team.team_members.length - 8} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => router.push(`/battlefield/teams/${team.id}`)}
                        className="px-4 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition"
                      >
                        View Details
                      </button>
                      
                      {filters.view === 'browse' && team.is_recruiting && (
                        <button
                          onClick={() => handleJoinTeam(team.id)}
                          className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                        >
                          JOIN TEAM
                        </button>
                      )}
                      
                      {filters.view === 'my-teams' && (
                        <div className="flex space-x-2">
                          <span className="px-3 py-1 bg-[#377cca] rounded text-sm">
                            {(team as any).user_role}
                          </span>
                          <button
                            onClick={() => router.push(`/battlefield/teams/${team.id}/manage`)}
                            className="px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded hover:brightness-110 transition"
                          >
                            Manage
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

