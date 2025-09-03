"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Player {
  id: number;
  username: string;
  email: string;
  discord_id: string;
  tier: string;
  is_online: boolean;
}

interface TeamMember {
  id: number;
  player: Player;
  role: 'MEMBER' | 'CO_LEAD' | 'CAPTAIN';
  joined_at: string;
}

interface Team {
  id: number;
  name: string;
  lead_player: Player;
  join_code: string;
  tier: string;
  members: TeamMember[];
}

const TeamManagement = () => {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      fetchTeams();
    }
  }, [backendUrl, accessToken]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchPlayers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/teams/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const searchPlayers = async () => {
    if (!backendUrl || !accessToken) return;
    
    try {
      setIsSearching(true);
      const response = await axios.get(`${backendUrl}/api/players/search/`, {
        params: { q: searchQuery },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSearchResults(response.data.players);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMemberToTeam = async (player: Player, role: string = 'MEMBER') => {
    if (!selectedTeam || !backendUrl || !accessToken) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${backendUrl}/api/team/manage/`, {
        action: 'add_member',
        team_id: selectedTeam.id,
        search_value: player.email,
        role: role
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      toast.success(response.data.message);
      setSearchQuery('');
      setSearchResults([]);
      fetchTeams();
      
      // Refresh selected team
      const updatedTeam = teams.find(t => t.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam({...updatedTeam, members: [...updatedTeam.members, response.data.member]});
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add member';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMember = async (playerId: number) => {
    if (!selectedTeam || !backendUrl || !accessToken) return;

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${backendUrl}/api/team/manage/`, {
        action: 'remove_member',
        team_id: selectedTeam.id,
        player_id: playerId
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      toast.success(response.data.message);
      fetchTeams();
      
      // Update selected team
      setSelectedTeam(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.player.id !== playerId)
      } : null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove member';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeRole = async (playerId: number, newRole: string) => {
    if (!selectedTeam || !backendUrl || !accessToken) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${backendUrl}/api/team/manage/`, {
        action: 'change_role',
        team_id: selectedTeam.id,
        player_id: playerId,
        new_role: newRole
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      toast.success(response.data.message);
      fetchTeams();
      
      // Update selected team
      setSelectedTeam(prev => prev ? {
        ...prev,
        members: prev.members.map(m => 
          m.player.id === playerId ? response.data.member : m
        )
      } : null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change role';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CO_LEAD': return 'bg-purple-600';
      case 'CAPTAIN': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.push('/admin')}
            className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
          >
            ← Back to Admin
          </button>
          <h1 className="text-4xl font-bold font-bank">Team Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Teams List */}
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h2 className="text-2xl font-semibold mb-4">Teams</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`p-4 rounded cursor-pointer transition ${
                      selectedTeam?.id === team.id 
                        ? 'bg-blue-600' 
                        : 'bg-[#0d2645] hover:bg-[#1e3a5f]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-gray-400">
                          Lead: {team.lead_player.username}
                        </p>
                        <p className="text-sm text-gray-400">
                          Members: {team.members?.length || 0}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(team.tier)}`}>
                        {team.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Details & Member Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedTeam ? (
              <>
                {/* Team Info */}
                <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{selectedTeam.name}</h2>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded ${getRoleBadgeColor(selectedTeam.tier)}`}>
                        {selectedTeam.tier}
                      </span>
                      <span className="text-sm bg-gray-700 px-3 py-1 rounded">
                        Code: {selectedTeam.join_code}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400">
                    Lead: {selectedTeam.lead_player.username} ({selectedTeam.lead_player.email})
                  </p>
                </div>

                {/* Add Member Section */}
                <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
                  <h3 className="text-xl font-semibold mb-4">Add Member</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by email, username, or Discord ID..."
                      className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-[#0d2645] border border-gray-300 rounded-b mt-1 max-h-60 overflow-y-auto z-10">
                        {searchResults.map((player) => (
                          <div
                            key={player.id}
                            className="p-3 hover:bg-[#1e3a5f] cursor-pointer border-b border-gray-600 last:border-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{player.username}</p>
                                <p className="text-sm text-gray-400">{player.email}</p>
                                {player.discord_id && (
                                  <p className="text-sm text-gray-400">Discord: {player.discord_id}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`w-3 h-3 rounded-full ${player.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
                                <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(player.tier)}`}>
                                  {player.tier}
                                </span>
                                <select
                                  onChange={(e) => addMemberToTeam(player, e.target.value)}
                                  className="ml-2 p-1 rounded bg-[#0a1a2e] text-white text-sm"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Add as...</option>
                                  <option value="MEMBER">Member</option>
                                  <option value="CAPTAIN">Captain</option>
                                  <option value="CO_LEAD">Co-Lead</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {isSearching && (
                    <p className="text-sm text-gray-400 mt-2">Searching...</p>
                  )}
                </div>

                {/* Team Members */}
                <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
                  <h3 className="text-xl font-semibold mb-4">Team Members ({selectedTeam.members?.length || 0})</h3>
                  <div className="space-y-3">
                    {/* Team Lead */}
                    <div className="p-4 bg-[#0d2645] rounded border-l-4 border-yellow-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{selectedTeam.lead_player.username}</p>
                          <p className="text-sm text-gray-400">{selectedTeam.lead_player.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${selectedTeam.lead_player.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <span className="px-3 py-1 rounded bg-yellow-600 text-xs font-semibold">
                            TEAM LEAD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Other Members */}
                    {selectedTeam.members?.map((member) => (
                      <div key={member.id} className="p-4 bg-[#0d2645] rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{member.player.username}</p>
                            <p className="text-sm text-gray-400">{member.player.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined: {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${member.player.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <select
                              value={member.role}
                              onChange={(e) => changeRole(member.player.id, e.target.value)}
                              className="p-1 rounded bg-[#0a1a2e] text-white text-sm"
                              disabled={isSubmitting}
                            >
                              <option value="MEMBER">Member</option>
                              <option value="CAPTAIN">Captain</option>
                              <option value="CO_LEAD">Co-Lead</option>
                            </select>
                            <button
                              onClick={() => removeMember(member.player.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                              disabled={isSubmitting}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                      <div className="text-center py-8 text-gray-400">
                        No additional members in this team
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369] text-center">
                <p className="text-xl text-gray-400">Select a team to manage members</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default TeamManagement;