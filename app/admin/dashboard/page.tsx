'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCards } from '@/components/admin/StatsCards';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'tournament_created' | 'team_created' | 'match_completed';
  message: string;
  timestamp: string;
  user?: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

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
    
    fetchDashboardData();
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual admin endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'tournament_created',
          message: 'New tournament "Winter Championship" created',
          timestamp: '2024-01-15T10:30:00Z',
          user: 'admin_user'
        },
        {
          id: '2',
          type: 'user_signup',
          message: 'New user "ProGamer2024" registered',
          timestamp: '2024-01-15T10:25:00Z'
        },
        {
          id: '3',
          type: 'team_created',
          message: 'Team "Elite Squad [ELTS]" formed',
          timestamp: '2024-01-15T10:15:00Z',
          user: 'team_captain'
        },
        {
          id: '4',
          type: 'match_completed',
          message: 'Match completed: Alpha vs Bravo (2-1)',
          timestamp: '2024-01-15T09:45:00Z'
        },
        {
          id: '5',
          type: 'user_signup',
          message: 'New user "SnipeKing" registered',
          timestamp: '2024-01-15T09:30:00Z'
        }
      ]);

      // Mock system alerts
      setSystemAlerts([
        {
          id: '1',
          type: 'warning',
          message: 'Server load is high (85%)',
          timestamp: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          type: 'info',
          message: 'Database maintenance scheduled for tonight',
          timestamp: '2024-01-15T08:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      user_signup: '👤',
      tournament_created: '🏆',
      team_created: '🛡️',
      match_completed: '⚔️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getAlertColor = (type: string) => {
    const colors = {
      error: 'border-red-500 bg-red-500/10',
      warning: 'border-yellow-500 bg-yellow-500/10',
      info: 'border-blue-500 bg-blue-500/10'
    };
    return colors[type as keyof typeof colors] || 'border-gray-500 bg-gray-500/10';
  };

  if (!user || !profile?.is_admin) {
    return null; // Will redirect
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats Overview */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-bank">RECENT ACTIVITY</h2>
              <button 
                onClick={fetchDashboardData}
                className="text-sm text-[#3791dd] hover:text-white transition"
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-600 rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-[#12436c] rounded">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                        {activity.user && ` • by ${activity.user}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Alerts */}
          <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
            <h2 className="text-xl font-bold font-bank mb-6">SYSTEM ALERTS</h2>
            
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded animate-pulse bg-gray-600/20">
                    <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : systemAlerts.length > 0 ? (
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 border rounded ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button className="text-gray-400 hover:text-white ml-2">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No system alerts</p>
                <p className="text-sm">✅ All systems operational</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
          <h2 className="text-xl font-bold font-bank mb-6">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/battlefield/tournaments/create')}
              className="p-4 bg-[#12436c] hover:bg-[#377cca]/30 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-semibold">Create Tournament</div>
            </button>
            
            <button 
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-[#12436c] hover:bg-[#377cca]/30 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-semibold">Manage Users</div>
            </button>
            
            <button 
              onClick={() => router.push('/admin/tournaments')}
              className="p-4 bg-[#12436c] hover:bg-[#377cca]/30 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-semibold">Tournament Settings</div>
            </button>
            
            <button 
              onClick={() => toast.info('Feature coming soon!')}
              className="p-4 bg-[#12436c] hover:bg-[#377cca]/30 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">📢</div>
              <div className="text-sm font-semibold">Send Announcement</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}