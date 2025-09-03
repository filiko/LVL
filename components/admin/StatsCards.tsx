'use client';

import { useState, useEffect } from 'react';

interface StatsData {
  totalUsers: number;
  totalTeams: number;
  activeTournaments: number;
  totalMatches: number;
  onlineUsers: number;
  registrationsToday: number;
  revenue: number;
  avgPlayersPerTournament: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg border border-[#377cca]/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <span className={`text-sm font-semibold ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalTeams: 0,
    activeTournaments: 0,
    totalMatches: 0,
    onlineUsers: 0,
    registrationsToday: 0,
    revenue: 0,
    avgPlayersPerTournament: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Simulate API call - replace with actual admin stats endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with real API data
      setStats({
        totalUsers: 2847,
        totalTeams: 156,
        activeTournaments: 12,
        totalMatches: 89,
        onlineUsers: 342,
        registrationsToday: 23,
        revenue: 4250.75,
        avgPlayersPerTournament: 48
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg border border-[#377cca]/30 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-gray-600 rounded w-20"></div>
                <div className="h-8 bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-6 w-6 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        icon="👥"
        trend={{ value: 12.5, isPositive: true }}
        subtitle="Active players"
      />
      
      <StatCard
        title="Teams"
        value={stats.totalTeams}
        icon="🛡️"
        trend={{ value: 8.2, isPositive: true }}
        subtitle="Registered teams"
      />
      
      <StatCard
        title="Live Tournaments"
        value={stats.activeTournaments}
        icon="🏆"
        trend={{ value: 15.1, isPositive: true }}
        subtitle="Currently active"
      />
      
      <StatCard
        title="Total Matches"
        value={stats.totalMatches}
        icon="⚔️"
        trend={{ value: 22.3, isPositive: true }}
        subtitle="All time"
      />
      
      <StatCard
        title="Online Now"
        value={stats.onlineUsers}
        icon="🟢"
        subtitle="Active users"
      />
      
      <StatCard
        title="Daily Signups"
        value={stats.registrationsToday}
        icon="📈"
        trend={{ value: 5.7, isPositive: true }}
        subtitle="Today"
      />
      
      <StatCard
        title="Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        icon="💰"
        trend={{ value: 18.9, isPositive: true }}
        subtitle="This month"
      />
      
      <StatCard
        title="Avg Players/Tournament"
        value={stats.avgPlayersPerTournament}
        icon="🎯"
        trend={{ value: 3.2, isPositive: false }}
        subtitle="Last 30 days"
      />
    </div>
  );
}