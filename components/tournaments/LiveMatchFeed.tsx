'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTournamentSubscription } from '@/lib/realtime/tournamentSubscriptions';

interface MatchUpdate {
  id: string;
  type: 'score_update' | 'match_start' | 'match_complete';
  match_id: string;
  tournament_id: string;
  team1_name: string;
  team2_name: string;
  team1_score?: number;
  team2_score?: number;
  winner?: string;
  timestamp: string;
  round?: number;
}

interface LiveMatchFeedProps {
  tournamentId: string;
  className?: string;
}

export function LiveMatchFeed({ tournamentId, className = '' }: LiveMatchFeedProps) {
  const [updates, setUpdates] = useState<MatchUpdate[]>([]);
  const [isLive, setIsLive] = useState(false);
  const supabase = createClient();

  // Subscribe to tournament updates
  useTournamentSubscription(
    tournamentId,
    (update) => {
      if (update.type === 'match_result') {
        handleMatchUpdate(update.data);
      }
    }
  );

  useEffect(() => {
    fetchRecentUpdates();
  }, [tournamentId]);

  const fetchRecentUpdates = async () => {
    try {
      // Fetch recent matches for this tournament
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          round,
          team1_score,
          team2_score,
          is_completed,
          updated_at,
          winner_id,
          teams1:team1_id(name, tag),
          teams2:team2_id(name, tag)
        `)
        .eq('tournament_id', tournamentId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Convert matches to update format
      const matchUpdates: MatchUpdate[] = matches?.map(match => ({
        id: `${match.id}-${match.updated_at}`,
        type: match.is_completed ? 'match_complete' : 'score_update',
        match_id: match.id,
        tournament_id: tournamentId,
        team1_name: (match.teams1 as any)?.name || 'TBD',
        team2_name: (match.teams2 as any)?.name || 'TBD',
        team1_score: match.team1_score,
        team2_score: match.team2_score,
        winner: match.winner_id === match.teams1?.id 
          ? (match.teams1 as any)?.name 
          : match.winner_id === match.teams2?.id 
            ? (match.teams2 as any)?.name 
            : undefined,
        timestamp: match.updated_at,
        round: match.round
      })) || [];

      setUpdates(matchUpdates);
      setIsLive(matchUpdates.some(u => u.type !== 'match_complete'));
    } catch (error) {
      console.error('Error fetching match updates:', error);
    }
  };

  const handleMatchUpdate = (data: any) => {
    if (data.event === 'UPDATE' || data.event === 'INSERT') {
      const match = data.match;
      const newUpdate: MatchUpdate = {
        id: `${match.id}-${Date.now()}`,
        type: match.is_completed ? 'match_complete' : 'score_update',
        match_id: match.id,
        tournament_id: tournamentId,
        team1_name: 'Team 1', // Would need to fetch team names
        team2_name: 'Team 2',
        team1_score: match.team1_score,
        team2_score: match.team2_score,
        timestamp: new Date().toISOString(),
        round: match.round
      };

      setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]);
      setIsLive(true);
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'match_complete':
        return '🏆';
      case 'score_update':
        return '⚔️';
      case 'match_start':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'match_complete':
        return 'border-l-green-500';
      case 'score_update':
        return 'border-l-blue-500';
      case 'match_start':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatUpdateText = (update: MatchUpdate) => {
    switch (update.type) {
      case 'match_complete':
        return (
          <span>
            <strong>{update.winner}</strong> defeated{' '}
            <strong>
              {update.winner === update.team1_name ? update.team2_name : update.team1_name}
            </strong>{' '}
            ({update.team1_score}-{update.team2_score})
          </span>
        );
      case 'score_update':
        return (
          <span>
            <strong>{update.team1_name}</strong> {update.team1_score} -{' '}
            {update.team2_score} <strong>{update.team2_name}</strong>
          </span>
        );
      case 'match_start':
        return (
          <span>
            Match started: <strong>{update.team1_name}</strong> vs{' '}
            <strong>{update.team2_name}</strong>
          </span>
        );
      default:
        return 'Match update';
    }
  };

  if (updates.length === 0) {
    return (
      <div className={`p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <h3 className="text-lg font-bold mb-2">No Live Updates</h3>
          <p className="text-gray-400 text-sm">
            Match updates will appear here when games are in progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-bank">LIVE MATCH FEED</h3>
        <div className="flex items-center space-x-2">
          {isLive && (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400 font-semibold">LIVE</span>
            </>
          )}
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {updates.map((update) => (
          <div
            key={update.id}
            className={`p-4 bg-[#12436c] rounded-lg border-l-4 ${getUpdateColor(update.type)} transition-all duration-300 hover:bg-[#377cca]/10`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl">{getUpdateIcon(update.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white">
                  {formatUpdateText(update)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  {update.round && (
                    <span className="text-xs text-gray-400">
                      Round {update.round}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
          <span>Updates automatically</span>
        </div>
      </div>
    </div>
  );
}

// Compact version for tournament cards
export function CompactLiveMatchFeed({ 
  tournamentId, 
  maxUpdates = 3,
  className = '' 
}: LiveMatchFeedProps & { maxUpdates?: number }) {
  const [updates, setUpdates] = useState<MatchUpdate[]>([]);
  const supabase = createClient();

  useTournamentSubscription(
    tournamentId,
    (update) => {
      if (update.type === 'match_result') {
        // Add new update to the beginning
        setUpdates(prev => [
          {
            id: `${Date.now()}`,
            type: 'score_update',
            match_id: update.data.match.id,
            tournament_id: tournamentId,
            team1_name: 'Team 1',
            team2_name: 'Team 2',
            timestamp: new Date().toISOString()
          },
          ...prev.slice(0, maxUpdates - 1)
        ]);
      }
    }
  );

  if (updates.length === 0) {
    return (
      <div className={`text-center text-gray-400 text-sm ${className}`}>
        <span>🔄 Waiting for match updates...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {updates.slice(0, maxUpdates).map((update) => (
        <div key={update.id} className="flex items-center space-x-2 text-sm">
          <span>{getUpdateIcon(update.type)}</span>
          <span className="text-gray-300 truncate">
            {formatUpdateText(update)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Helper functions (moved outside component to avoid redefinition)
function getUpdateIcon(type: string) {
  switch (type) {
    case 'match_complete': return '🏆';
    case 'score_update': return '⚔️';
    case 'match_start': return '🎯';
    default: return '📝';
  }
}

function formatUpdateText(update: MatchUpdate) {
  switch (update.type) {
    case 'match_complete':
      return `${update.winner} won!`;
    case 'score_update':
      return `${update.team1_name} ${update.team1_score}-${update.team2_score} ${update.team2_name}`;
    default:
      return 'Match update';
  }
}