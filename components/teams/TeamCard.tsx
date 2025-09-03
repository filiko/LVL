'use client';

import { useRouter } from 'next/navigation';

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    tag?: string;
    description?: string;
    tier: string;
    region?: string;
    member_count: number;
    max_members: number;
    is_recruiting: boolean;
    profiles?: {
      username: string;
      tier: string;
      avatar_url?: string;
    };
    team_members?: Array<{
      id: string;
      role: string;
      position: string;
      profiles?: {
        username: string;
        avatar_url?: string;
      };
    }>;
  };
  onJoin?: (teamId: string) => void;
  compact?: boolean;
  showUserRole?: string;
}

export function TeamCard({ team, onJoin, compact = false, showUserRole }: TeamCardProps) {
  const router = useRouter();

  if (compact) {
    return (
      <div className="p-4 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-[#2b4b6f] hover:border-[#377cca] transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold font-bank tracking-[0.08em]">{team.name}</h3>
            {team.tag && (
              <span className="px-2 py-1 bg-[#377cca] rounded text-xs">[{team.tag}]</span>
            )}
            {showUserRole && (
              <span className="px-2 py-1 bg-green-600 rounded text-xs font-semibold">{showUserRole}</span>
            )}
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            team.is_recruiting ? 'bg-green-600' : 'bg-gray-600'
          }`}>
            {team.is_recruiting ? 'RECRUITING' : 'CLOSED'}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-300">
          <div>
            <span>Captain: {team.profiles?.username || 'Unknown'}</span>
            <div className="text-[#3791dd] font-semibold">
              {team.member_count}/{team.max_members} members • {team.tier}
            </div>
          </div>
          <button
            onClick={() => router.push(`/battlefield/teams/${team.id}`)}
            className="px-3 py-1 border border-[#377cca] rounded text-xs hover:bg-[#377cca]/20 transition"
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-[#2b4b6f] hover:border-[#377cca] transition-colors">
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
            {showUserRole && (
              <span className="px-2 py-1 bg-blue-600 rounded text-xs font-semibold">YOUR ROLE: {showUserRole}</span>
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
                {member.role === 'CAPTAIN' && (
                  <span className="text-yellow-400">★</span>
                )}
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
        
        {team.is_recruiting && !showUserRole && onJoin && (
          <button
            onClick={() => onJoin(team.id)}
            className="px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
          >
            JOIN TEAM
          </button>
        )}
        
        {showUserRole && (
          <button
            onClick={() => router.push(`/battlefield/teams/${team.id}/manage`)}
            className="px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded hover:brightness-110 transition"
          >
            Manage Team
          </button>
        )}
      </div>
    </div>
  );
}