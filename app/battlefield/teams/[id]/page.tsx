'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { TeamRoster } from '@/components/teams/TeamRoster';
import { teamDb } from '@/lib/database/teams';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

interface TeamDetails {
  id: string;
  name: string;
  tag?: string;
  description?: string;
  is_recruiting: boolean;
  join_code?: string;
  created_at: string;
  captain_id: string;
  member_count: number;
  captain?: {
    id: string;
    username: string;
    tier: string;
  };
}

interface TeamMember {
  id: string;
  user_id: string;
  role: 'CAPTAIN' | 'CO_LEADER' | 'MEMBER';
  squad?: string;
  position?: string;
  joined_at: string;
  profiles: {
    id: string;
    username: string;
    tier: string;
    avatar_url?: string;
  };
}

export default function TeamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuthState();
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTeamDetails();
    }
  }, [params.id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const [teamData, membersData] = await Promise.all([
        teamDb.getTeam(params.id as string),
        teamDb.getTeamMembers(params.id as string)
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user || !team) return;

    try {
      setJoining(true);
      await teamDb.joinTeam(team.id, user.id);
      toast.success('Successfully joined the team!');
      fetchTeamDetails(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !team) return;
    
    if (window.confirm('Are you sure you want to leave this team?')) {
      try {
        await teamDb.leaveTeam(team.id, user.id);
        toast.success('Left the team successfully');
        router.push('/battlefield/teams');
      } catch (error: any) {
        toast.error(error.message || 'Failed to leave team');
      }
    }
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

  if (!team) {
    return (
      <main className="hero-gradient min-h-screen text-white relative bg-[#08182a] font-bahnschrift">
        <Header />
        <Header2 />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Team Not Found</h1>
            <button
              onClick={() => router.push('/battlefield/teams')}
              className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition"
            >
              Back to Teams
            </button>
          </div>
        </div>
      </main>
    );
  }

  const userMember = members.find(m => m.user_id === user?.id);
  const isMember = !!userMember;
  const isCaptain = userMember?.role === 'CAPTAIN';
  const isCoLeader = userMember?.role === 'CO_LEADER';
  const canManage = isCaptain || isCoLeader;

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
                onClick={() => router.push('/battlefield/teams')}
                className="flex items-center text-gray-300 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Teams
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-4xl font-bold font-bank tracking-[0.08em]">
                    {team.name}
                  </h1>
                  {team.tag && (
                    <span className="px-4 py-2 bg-[#377cca] rounded text-xl font-bold">[{team.tag}]</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {!isMember && team.is_recruiting && (
                    <button
                      onClick={handleJoinTeam}
                      disabled={joining}
                      className="px-6 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] rounded hover:brightness-110 transition font-semibold disabled:opacity-50"
                    >
                      {joining ? 'JOINING...' : 'JOIN TEAM'}
                    </button>
                  )}
                  {isMember && !isCaptain && (
                    <button
                      onClick={handleLeaveTeam}
                      className="px-6 py-2 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] rounded hover:brightness-110 transition font-semibold"
                    >
                      LEAVE TEAM
                    </button>
                  )}
                  {canManage && (
                    <button
                      onClick={() => router.push(`/battlefield/teams/${team.id}/edit`)}
                      className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
                    >
                      MANAGE TEAM
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">MEMBERS</h3>
                <p className="text-3xl font-bold text-[#3791dd]">{team.member_count}</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">CAPTAIN</h3>
                <p className="text-lg font-bold">{team.captain?.username || 'Unknown'}</p>
                <p className="text-sm text-gray-400">{team.captain?.tier || 'Unranked'}</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">STATUS</h3>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  team.is_recruiting 
                    ? 'bg-green-600 text-green-100' 
                    : 'bg-red-600 text-red-100'
                }`}>
                  {team.is_recruiting ? 'RECRUITING' : 'CLOSED'}
                </span>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">CREATED</h3>
                <p className="text-lg font-bold">{new Date(team.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Team Description */}
            {team.description && (
              <div className="mb-8 p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 font-bank">ABOUT</h3>
                <p className="text-gray-300 leading-relaxed">{team.description}</p>
              </div>
            )}

            {/* Join Code (for members only) */}
            {isMember && team.join_code && (
              <div className="mb-8 p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 font-bank">JOIN CODE</h3>
                <div className="flex items-center space-x-4">
                  <code className="px-4 py-2 bg-[#12436c] border border-[#377cca] rounded font-mono text-lg">
                    {team.join_code}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(team.join_code || '');
                      toast.success('Join code copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-[#377cca] rounded hover:brightness-110 transition"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Share this code with players you want to recruit
                </p>
              </div>
            )}

            {/* Team Roster */}
            <TeamRoster 
              members={members} 
              canManage={canManage}
              onRefresh={fetchTeamDetails}
            />
          </div>
        </div>
      </div>
    </main>
  );
}