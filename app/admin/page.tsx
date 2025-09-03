"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_players: 0,
    total_teams: 0,
    total_tournaments: 0,
    active_tournaments: 0,
  });
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [recentTeams, setRecentTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      fetchDashboardData();
    }
  }, [backendUrl, accessToken]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsRes, playersRes, teamsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/stats/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        axios.get(`${backendUrl}/api/admin/recent-players/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        axios.get(`${backendUrl}/api/admin/recent-teams/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
      ]);

      setStats(statsRes.data);
      setRecentPlayers(playersRes.data);
      setRecentTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 font-bank">Admin Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Players</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.total_players}</p>
          </div>
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Teams</h3>
            <p className="text-3xl font-bold text-green-400">{stats.total_teams}</p>
          </div>
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Tournaments</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.total_tournaments}</p>
          </div>
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Active Tournaments</h3>
            <p className="text-3xl font-bold text-orange-400">{stats.active_tournaments}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Players */}
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h2 className="text-2xl font-semibold mb-4">Recent Players</h2>
            <div className="space-y-3">
              {recentPlayers.length > 0 ? (
                recentPlayers.map((player: any) => (
                  <div key={player.id} className="flex justify-between items-center p-3 bg-[#0d2645] rounded">
                    <div>
                      <p className="font-semibold">{player.username}</p>
                      <p className="text-sm text-gray-400">{player.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(player.date_joined).toLocaleDateString()}
                      </p>
                      {player.is_team_lead && (
                        <span className="text-xs bg-blue-600 px-2 py-1 rounded">Team Lead</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No recent players</p>
              )}
            </div>
          </div>

          {/* Recent Teams */}
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h2 className="text-2xl font-semibold mb-4">Recent Teams</h2>
            <div className="space-y-3">
              {recentTeams.length > 0 ? (
                recentTeams.map((team: any) => (
                  <div key={team.id} className="flex justify-between items-center p-3 bg-[#0d2645] rounded">
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-gray-400">Code: {team.join_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(team.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Lead: {team.lead_player?.username || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No recent teams</p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
          <h2 className="text-2xl font-semibold mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button 
              onClick={() => window.open(`${backendUrl}/admin/`, '_blank')}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Django Admin Panel
            </button>
            <button 
              onClick={fetchDashboardData}
              className="p-4 bg-green-600 hover:bg-green-700 rounded transition"
            >
              Refresh Data
            </button>
            <button 
              onClick={() => window.location.href = '/admin/create-league'}
              className="p-4 bg-orange-600 hover:bg-orange-700 rounded transition"
            >
              Create 32v32 League
            </button>
            <button 
              onClick={() => window.location.href = '/admin/tournaments/32v32'}
              className="p-4 bg-red-600 hover:bg-red-700 rounded transition"
            >
              32v32 Tournament Admin
            </button>
            <button 
              onClick={() => window.location.href = '/admin/team-management'}
              className="p-4 bg-purple-600 hover:bg-purple-700 rounded transition"
            >
              Manage Teams
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;