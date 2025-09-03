'use client';

import { useState, useEffect } from 'react';
import { useTournamentSubscription } from '@/lib/realtime/tournamentSubscriptions';

interface Match {
  id: string;
  tournament_id: string;
  round: number;
  position: number;
  team1_id?: string;
  team2_id?: string;
  team1_score?: number;
  team2_score?: number;
  winner_id?: string;
  is_completed: boolean;
  scheduled_time?: string;
  teams1?: {
    name: string;
    tag?: string;
  };
  teams2?: {
    name: string;
    tag?: string;
  };
}

interface TournamentBracketProps {
  tournamentId: string;
  matches: Match[];
  bracketType: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
  onMatchUpdate?: () => void;
}

export function TournamentBracket({ 
  tournamentId, 
  matches, 
  bracketType, 
  onMatchUpdate 
}: TournamentBracketProps) {
  const [bracketMatches, setBracketMatches] = useState<Match[]>(matches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Subscribe to real-time match updates
  useTournamentSubscription(
    tournamentId,
    (update) => {
      if (update.type === 'match_result') {
        // Refresh bracket data when matches update
        onMatchUpdate?.();
      }
    }
  );

  useEffect(() => {
    setBracketMatches(matches);
  }, [matches]);

  const renderSingleElimination = () => {
    const rounds = groupMatchesByRound(bracketMatches);
    const maxRound = Math.max(...Object.keys(rounds).map(Number));

    return (
      <div className="flex space-x-8 overflow-x-auto pb-4">
        {Object.entries(rounds)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([roundNum, roundMatches]) => (
            <div key={roundNum} className="flex flex-col space-y-4 min-w-[300px]">
              <h3 className="text-lg font-bold text-center mb-4 font-bank">
                {getRoundName(Number(roundNum), maxRound, bracketType)}
              </h3>
              {roundMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          ))}
      </div>
    );
  };

  const renderDoubleElimination = () => {
    // For double elimination, we'd need winner/loser bracket logic
    // This is a simplified version
    return renderSingleElimination();
  };

  const renderRoundRobin = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-center font-bank">ROUND ROBIN MATCHES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bracketMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={() => setSelectedMatch(match)}
              showRound={true}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderBracket = () => {
    switch (bracketType) {
      case 'SINGLE_ELIMINATION':
        return renderSingleElimination();
      case 'DOUBLE_ELIMINATION':
        return renderDoubleElimination();
      case 'ROUND_ROBIN':
      case 'SWISS':
        return renderRoundRobin();
      default:
        return <div>Unsupported bracket type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bank">TOURNAMENT BRACKET</h2>
        <div className="text-sm text-gray-400">
          {bracketType.replace('_', ' ')} Format
        </div>
      </div>

      {bracketMatches.length > 0 ? (
        <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
          {renderBracket()}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Bracket Not Ready</h3>
          <p className="text-gray-400">
            The tournament bracket will be generated once registration closes.
          </p>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  onClick: () => void;
  showRound?: boolean;
}

function MatchCard({ match, onClick, showRound = false }: MatchCardProps) {
  const getMatchStatus = () => {
    if (match.is_completed) {
      return 'COMPLETED';
    }
    if (match.team1_id && match.team2_id) {
      return 'READY';
    }
    return 'WAITING';
  };

  const getStatusColor = () => {
    const status = getMatchStatus();
    switch (status) {
      case 'COMPLETED':
        return 'border-green-500';
      case 'READY':
        return 'border-blue-500';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-[#12436c] border-2 rounded-lg cursor-pointer hover:brightness-110 transition ${getStatusColor()}`}
    >
      {showRound && (
        <div className="text-xs text-gray-400 mb-2">Round {match.round}</div>
      )}
      
      <div className="space-y-3">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {match.teams1?.name || 'TBD'}
            </span>
            {match.teams1?.tag && (
              <span className="px-1 py-0.5 bg-[#377cca] rounded text-xs">
                [{match.teams1.tag}]
              </span>
            )}
          </div>
          <div className="text-xl font-bold">
            {match.team1_score !== undefined ? match.team1_score : '-'}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center text-gray-400 text-sm font-semibold">VS</div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {match.teams2?.name || 'TBD'}
            </span>
            {match.teams2?.tag && (
              <span className="px-1 py-0.5 bg-[#377cca] rounded text-xs">
                [{match.teams2.tag}]
              </span>
            )}
          </div>
          <div className="text-xl font-bold">
            {match.team2_score !== undefined ? match.team2_score : '-'}
          </div>
        </div>
      </div>

      {/* Match Status */}
      <div className="mt-3 flex justify-between items-center text-sm">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          getMatchStatus() === 'COMPLETED' ? 'bg-green-600' :
          getMatchStatus() === 'READY' ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {getMatchStatus()}
        </span>
        
        {match.scheduled_time && (
          <span className="text-gray-400">
            {new Date(match.scheduled_time).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

interface MatchDetailsModalProps {
  match: Match;
  onClose: () => void;
}

function MatchDetailsModal({ match, onClose }: MatchDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#08182a] border border-[#377cca] rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-bank">MATCH DETAILS</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Round:</span>
              <p className="font-semibold">{match.round}</p>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <p className="font-semibold">
                {match.is_completed ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>

          {/* Teams */}
          <div className="space-y-4">
            <div className="p-4 bg-[#12436c] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">
                    {match.teams1?.name || 'Team 1'}
                  </h4>
                  {match.teams1?.tag && (
                    <span className="text-sm text-gray-400">[{match.teams1.tag}]</span>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  {match.team1_score !== undefined ? match.team1_score : '-'}
                </div>
              </div>
            </div>

            <div className="text-center text-gray-400 font-semibold">VS</div>

            <div className="p-4 bg-[#12436c] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">
                    {match.teams2?.name || 'Team 2'}
                  </h4>
                  {match.teams2?.tag && (
                    <span className="text-sm text-gray-400">[{match.teams2.tag}]</span>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  {match.team2_score !== undefined ? match.team2_score : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Winner */}
          {match.winner_id && (
            <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg">
              <h4 className="font-bold text-lg text-center">
                🏆 Winner: {
                  match.winner_id === match.team1_id 
                    ? match.teams1?.name 
                    : match.teams2?.name
                }
              </h4>
            </div>
          )}

          {/* Scheduled Time */}
          {match.scheduled_time && (
            <div className="text-center text-sm text-gray-400">
              Scheduled: {new Date(match.scheduled_time).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function groupMatchesByRound(matches: Match[]) {
  return matches.reduce((rounds, match) => {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
    return rounds;
  }, {} as Record<number, Match[]>);
}

function getRoundName(round: number, maxRound: number, bracketType: string): string {
  if (bracketType === 'SINGLE_ELIMINATION') {
    if (round === maxRound) return 'FINAL';
    if (round === maxRound - 1) return 'SEMI-FINAL';
    if (round === maxRound - 2) return 'QUARTER-FINAL';
    return `ROUND ${round}`;
  }
  return `ROUND ${round}`;
}