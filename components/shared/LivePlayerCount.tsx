'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LivePlayerCountProps {
  tournamentId: string;
  maxPlayers: number;
  className?: string;
}

export function LivePlayerCount({ tournamentId, maxPlayers, className = '' }: LivePlayerCountProps) {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial load
    fetchPlayerCount();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`tournament-${tournamentId}-players`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('Registration change:', payload);
          // Refetch count on any registration change
          fetchPlayerCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);

  const fetchPlayerCount = async () => {
    try {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)
        .eq('status', 'CONFIRMED');

      if (error) throw error;
      
      setPlayerCount(count || 0);
    } catch (error) {
      console.error('Error fetching player count:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    const percentage = (playerCount / maxPlayers) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusText = () => {
    const percentage = (playerCount / maxPlayers) * 100;
    if (percentage >= 100) return 'FULL';
    if (percentage >= 90) return 'NEARLY FULL';
    if (percentage >= 50) return 'FILLING UP';
    return 'AVAILABLE';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-600 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Live indicator dot */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400">LIVE</span>
      </div>
      
      {/* Player count */}
      <div className="flex items-center space-x-2">
        <span className={`font-bold ${getStatusColor()}`}>
          {playerCount}/{maxPlayers}
        </span>
        <span className="text-xs text-gray-400">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}

// Extended version with progress bar
export function LivePlayerCountDetailed({ 
  tournamentId, 
  maxPlayers, 
  className = '' 
}: LivePlayerCountProps) {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [recentRegistrations, setRecentRegistrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPlayerCount();
    
    const subscription = supabase
      .channel(`tournament-${tournamentId}-detailed`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'registrations',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          // Add animation for new registration
          setRecentRegistrations(prev => [...prev.slice(-2), payload.new.id]);
          setTimeout(() => {
            setRecentRegistrations(prev => prev.filter(id => id !== payload.new.id));
          }, 3000);
          
          fetchPlayerCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'registrations',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchPlayerCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);

  const fetchPlayerCount = async () => {
    try {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)
        .eq('status', 'CONFIRMED');

      if (error) throw error;
      
      setPlayerCount(count || 0);
    } catch (error) {
      console.error('Error fetching player count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
        <div className="h-2 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const percentage = Math.min((playerCount / maxPlayers) * 100, 100);
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">LIVE REGISTRATION</span>
        </div>
        <div className="text-sm font-bold">
          {playerCount}/{maxPlayers}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage >= 100 ? 'bg-red-500' :
              percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Recent registration indicator */}
        {recentRegistrations.length > 0 && (
          <div className="absolute -top-1 right-0 w-4 h-4 bg-green-400 rounded-full animate-ping" />
        )}
      </div>
      
      {/* Status Text */}
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">
          {Math.round(percentage)}% Full
        </span>
        <span className={
          percentage >= 100 ? 'text-red-400' :
          percentage >= 80 ? 'text-yellow-400' : 'text-green-400'
        }>
          {percentage >= 100 ? 'TOURNAMENT FULL' :
           percentage >= 80 ? 'FILLING FAST' : 'SPOTS AVAILABLE'}
        </span>
      </div>
      
      {/* Recent activity indicator */}
      {recentRegistrations.length > 0 && (
        <div className="text-xs text-green-400 animate-pulse">
          ⚡ {recentRegistrations.length} new registration{recentRegistrations.length > 1 ? 's' : ''}!
        </div>
      )}
    </div>
  );
}