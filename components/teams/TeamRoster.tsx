'use client';

import { useState } from 'react';
import { RoleSelector } from '@/components/shared/RoleSelector';
import { teamDb } from '@/lib/database/teams';
import { toast } from 'react-toastify';

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

interface TeamRosterProps {
  members: TeamMember[];
  canManage: boolean;
  onRefresh: () => void;
}

const SQUADS = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT'];
const ROLES = ['CAPTAIN', 'CO_LEADER', 'MEMBER'];

const getTierColor = (tier: string) => {
  const colors = {
    'BRONZE': 'text-orange-600',
    'SILVER': 'text-gray-400',
    'GOLD': 'text-yellow-500',
    'PLATINUM': 'text-cyan-400',
    'DIAMOND': 'text-purple-400'
  };
  return colors[tier as keyof typeof colors] || 'text-gray-400';
};

const getTierBadgeColor = (tier: string) => {
  const colors = {
    'BRONZE': 'bg-orange-600',
    'SILVER': 'bg-gray-500',
    'GOLD': 'bg-yellow-500',
    'PLATINUM': 'bg-cyan-500',
    'DIAMOND': 'bg-purple-500'
  };
  return colors[tier as keyof typeof colors] || 'bg-gray-500';
};

const getRoleColor = (role: string) => {
  const colors = {
    'CAPTAIN': 'bg-yellow-600',
    'CO_LEADER': 'bg-blue-600',
    'MEMBER': 'bg-gray-600'
  };
  return colors[role as keyof typeof colors] || 'bg-gray-600';
};

export function TeamRoster({ members, canManage, onRefresh }: TeamRosterProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleUpdateMember = async (memberId: string, updates: { role?: string; squad?: string; position?: string }) => {
    try {
      setUpdating(true);
      await teamDb.updateTeamMember(memberId, updates);
      toast.success('Member updated successfully');
      setEditingMember(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      try {
        await teamDb.removeTeamMember(memberId);
        toast.success('Member removed successfully');
        onRefresh();
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove member');
      }
    }
  };

  // Group members by squad
  const membersBySquad = members.reduce((acc, member) => {
    const squad = member.squad || 'UNASSIGNED';
    if (!acc[squad]) acc[squad] = [];
    acc[squad].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  // Sort squads: ALPHA first, then alphabetically, UNASSIGNED last
  const sortedSquads = Object.keys(membersBySquad).sort((a, b) => {
    if (a === 'ALPHA') return -1;
    if (b === 'ALPHA') return 1;
    if (a === 'UNASSIGNED') return 1;
    if (b === 'UNASSIGNED') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bank tracking-[0.08em]">TEAM ROSTER</h2>
        <div className="text-sm text-gray-400">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
      </div>

      {sortedSquads.map(squadName => (
        <div key={squadName} className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold font-bank">
              {squadName === 'UNASSIGNED' ? 'UNASSIGNED MEMBERS' : `${squadName} SQUAD`}
            </h3>
            <span className="px-3 py-1 bg-[#377cca] rounded text-sm font-semibold">
              {membersBySquad[squadName].length} member{membersBySquad[squadName].length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {membersBySquad[squadName].map(member => (
              <div key={member.id} className="p-4 bg-[#12436c] rounded-lg border border-gray-600">
                {editingMember === member.id ? (
                  <EditMemberForm 
                    member={member}
                    onSave={(updates) => handleUpdateMember(member.id, updates)}
                    onCancel={() => setEditingMember(null)}
                    updating={updating}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-bold">{member.profiles.username}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTierBadgeColor(member.profiles.tier)}`}>
                            {member.profiles.tier}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(member.role)}`}>
                            {member.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-300">
                          {member.position && (
                            <span>Position: <strong>{member.position}</strong></span>
                          )}
                          <span>Joined: {new Date(member.joined_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {canManage && member.role !== 'CAPTAIN' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingMember(member.id)}
                          className="px-3 py-1 bg-[#377cca] rounded text-sm hover:brightness-110 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id, member.profiles.username)}
                          className="px-3 py-1 bg-red-600 rounded text-sm hover:brightness-110 transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface EditMemberFormProps {
  member: TeamMember;
  onSave: (updates: { role?: string; squad?: string; position?: string }) => void;
  onCancel: () => void;
  updating: boolean;
}

function EditMemberForm({ member, onSave, onCancel, updating }: EditMemberFormProps) {
  const [role, setRole] = useState(member.role);
  const [squad, setSquad] = useState(member.squad || '');
  const [position, setPosition] = useState(member.position || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      role: role !== member.role ? role : undefined,
      squad: squad !== member.squad ? squad : undefined,
      position: position !== member.position ? position : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">ROLE</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-[#0e3250] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
          >
            {ROLES.filter(r => r !== 'CAPTAIN' || member.role === 'CAPTAIN').map(roleOption => (
              <option key={roleOption} value={roleOption}>
                {roleOption.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">SQUAD</label>
          <select
            value={squad}
            onChange={(e) => setSquad(e.target.value)}
            className="w-full px-3 py-2 bg-[#0e3250] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
          >
            <option value="">No Squad</option>
            {SQUADS.map(squadOption => (
              <option key={squadOption} value={squadOption}>{squadOption}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">POSITION</label>
          <RoleSelector
            value={position}
            onChange={setPosition}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-600/20 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updating}
          className="px-4 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition disabled:opacity-50"
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}