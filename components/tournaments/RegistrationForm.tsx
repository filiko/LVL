'use client';

import { useState } from 'react';

interface Team {
  id: string;
  name: string;
  tag?: string;
  member_count: number;
  role: string;
}

interface RegistrationFormProps {
  teams: Team[];
  tournamentId: string;
  onRegister: (teamId: string) => Promise<void>;
  loading?: boolean;
}

export function RegistrationForm({ teams, tournamentId, onRegister, loading = false }: RegistrationFormProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeamId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onRegister(selectedTeamId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (teams.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-r from-[#d97706] to-[#92400e] rounded-lg">
        <h3 className="text-xl font-semibold mb-2">No Teams Available</h3>
        <p className="text-gray-200 mb-4">
          You need to be a team captain to register for tournaments.
        </p>
        <a
          href="/battlefield/teams/create"
          className="inline-block px-6 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold"
        >
          CREATE A TEAM
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 font-bank">SELECT YOUR TEAM</h3>
        <p className="text-gray-300 mb-6">
          Choose which team you want to register for this tournament. You can only register teams where you are the captain.
        </p>
        
        <div className="space-y-4">
          {teams.map((team) => (
            <label key={team.id} className="block">
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedTeamId === team.id
                  ? 'border-[#377cca] bg-[#377cca]/20'
                  : 'border-gray-600 bg-[#12436c] hover:border-[#377cca]/50'
              }`}>
                <input
                  type="radio"
                  name="team"
                  value={team.id}
                  checked={selectedTeamId === team.id}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="sr-only"
                />
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-bold">{team.name}</h4>
                      {team.tag && (
                        <span className="px-2 py-1 bg-[#377cca] rounded text-sm">[{team.tag}]</span>
                      )}
                      <span className="px-2 py-1 bg-yellow-600 rounded text-xs font-semibold">
                        {team.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      {team.member_count} members
                    </p>
                  </div>
                  {selectedTeamId === team.id && (
                    <svg className="w-6 h-6 text-[#377cca]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!selectedTeamId || isSubmitting || loading}
          className="px-8 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'REGISTERING...' : 'REGISTER TEAM'}
        </button>
      </div>
    </form>
  );
}