'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

interface User {
  id: string;
  username: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  is_admin: boolean;
  is_team_lead: boolean;
  is_banned: boolean;
  last_login?: string;
  created_at: string;
  team_count: number;
  tournament_count: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admins' | 'team_leads' | 'banned'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!profile?.is_admin) {
      toast.error('Admin access required');
      router.push('/battlefield');
      return;
    }
    
    fetchUsers();
  }, [user, profile]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual admin users endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      setUsers([
        {
          id: '1',
          username: 'ProGamer2024',
          email: 'progamer@example.com',
          tier: 'PLATINUM',
          is_admin: false,
          is_team_lead: true,
          is_banned: false,
          last_login: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          team_count: 2,
          tournament_count: 15
        },
        {
          id: '2',
          username: 'AdminUser',
          email: 'admin@levelgg.com',
          tier: 'DIAMOND',
          is_admin: true,
          is_team_lead: true,
          is_banned: false,
          last_login: '2024-01-15T11:00:00Z',
          created_at: '2023-12-01T00:00:00Z',
          team_count: 1,
          tournament_count: 50
        },
        {
          id: '3',
          username: 'SnipeKing',
          email: 'snipe@example.com',
          tier: 'GOLD',
          is_admin: false,
          is_team_lead: false,
          is_banned: false,
          last_login: '2024-01-14T20:15:00Z',
          created_at: '2024-01-10T00:00:00Z',
          team_count: 0,
          tournament_count: 3
        },
        {
          id: '4',
          username: 'BannedPlayer',
          email: 'banned@example.com',
          tier: 'BRONZE',
          is_admin: false,
          is_team_lead: false,
          is_banned: true,
          last_login: '2024-01-10T15:00:00Z',
          created_at: '2024-01-05T00:00:00Z',
          team_count: 0,
          tournament_count: 1
        },
        {
          id: '5',
          username: 'ElitePlayer',
          email: 'elite@example.com',
          tier: 'DIAMOND',
          is_admin: false,
          is_team_lead: true,
          is_banned: false,
          last_login: '2024-01-15T09:45:00Z',
          created_at: '2023-11-15T00:00:00Z',
          team_count: 3,
          tournament_count: 25
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId: string, username: string, isBanned: boolean) => {
    const action = isBanned ? 'unban' : 'ban';
    if (window.confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_banned: !isBanned } : u
        ));
        
        toast.success(`User ${action}ned successfully`);
      } catch (error: any) {
        toast.error(`Failed to ${action} user`);
      }
    }
  };

  const handleToggleTeamLead = async (userId: string, username: string, isTeamLead: boolean) => {
    const action = isTeamLead ? 'remove team lead status from' : 'promote';
    if (window.confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_team_lead: !isTeamLead } : u
        ));
        
        toast.success(`User ${isTeamLead ? 'demoted' : 'promoted'} successfully`);
      } catch (error: any) {
        toast.error('Failed to update user role');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = (() => {
      switch (filter) {
        case 'admins':
          return user.is_admin;
        case 'team_leads':
          return user.is_team_lead && !user.is_admin;
        case 'banned':
          return user.is_banned;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesFilter;
  });

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

  if (!user || !profile?.is_admin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-bank">USER MANAGEMENT</h2>
            <p className="text-gray-300 mt-1">Monitor and manage user accounts</p>
          </div>
          <div className="text-sm text-gray-400">
            {users.length} total users
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-300">FILTER:</span>
            {(['all', 'admins', 'team_leads', 'banned'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded text-sm font-semibold transition ${
                  filter === filterOption
                    ? 'bg-[#377cca] text-white'
                    : 'bg-[#12436c] text-gray-300 hover:bg-[#377cca]/30'
                }`}
              >
                {filterOption.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#12436c] rounded animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-32"></div>
                        <div className="h-3 bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-16 bg-gray-600 rounded"></div>
                      <div className="h-8 w-16 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="p-6 hover:bg-[#377cca]/10 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar placeholder */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getTierBadgeColor(userData.tier)}`}>
                        {userData.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold">{userData.username}</h3>
                          
                          {userData.is_admin && (
                            <span className="px-2 py-1 bg-red-600 rounded text-xs font-semibold">ADMIN</span>
                          )}
                          {userData.is_team_lead && !userData.is_admin && (
                            <span className="px-2 py-1 bg-blue-600 rounded text-xs font-semibold">TEAM LEAD</span>
                          )}
                          {userData.is_banned && (
                            <span className="px-2 py-1 bg-gray-600 rounded text-xs font-semibold">BANNED</span>
                          )}
                          
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTierBadgeColor(userData.tier)}`}>
                            {userData.tier}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-400">{userData.email}</p>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Teams: {userData.team_count}</span>
                          <span>Tournaments: {userData.tournament_count}</span>
                          <span>Joined: {new Date(userData.created_at).toLocaleDateString()}</span>
                          {userData.last_login && (
                            <span>Last login: {new Date(userData.last_login).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!userData.is_admin && (
                        <>
                          <button
                            onClick={() => handleToggleTeamLead(userData.id, userData.username, userData.is_team_lead)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition ${
                              userData.is_team_lead
                                ? 'bg-orange-600 hover:brightness-110'
                                : 'bg-blue-600 hover:brightness-110'
                            }`}
                          >
                            {userData.is_team_lead ? 'DEMOTE' : 'PROMOTE'}
                          </button>
                          
                          <button
                            onClick={() => handleToggleBan(userData.id, userData.username, userData.is_banned)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition ${
                              userData.is_banned
                                ? 'bg-green-600 hover:brightness-110'
                                : 'bg-red-600 hover:brightness-110'
                            }`}
                          >
                            {userData.is_banned ? 'UNBAN' : 'BAN'}
                          </button>
                        </>
                      )}
                      
                      {userData.is_admin && (
                        <span className="px-3 py-1 bg-gray-600 rounded text-sm text-gray-400">
                          Protected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">No Users Found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'No users match your search criteria.' : 'No users in this category.'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-[#3791dd]">{users.length}</p>
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-400">
                {users.filter(u => u.is_admin).length}
              </p>
              <p className="text-sm text-gray-400">Admins</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">
                {users.filter(u => u.is_team_lead && !u.is_admin).length}
              </p>
              <p className="text-sm text-gray-400">Team Leads</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-400">
                {users.filter(u => u.is_banned).length}
              </p>
              <p className="text-sm text-gray-400">Banned</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">
                {users.filter(u => !u.is_banned && !u.is_admin).length}
              </p>
              <p className="text-sm text-gray-400">Active Players</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}