'use client';

import { useRouter } from 'next/navigation';

interface TournamentCardProps {
  tournament: {
    id: string;
    title: string;
    start_date: string;
    mode: string;
    region: string;
    platform: string;
    registered_players: number;
    max_players: number;
    is_active: boolean;
    is_started: boolean;
    is_completed: boolean;
    games?: {
      name: string;
    };
    prize_pool?: number;
  };
  onRegister?: (tournamentId: string) => void;
  compact?: boolean;
}

export function TournamentCard({ tournament, onRegister, compact = false }: TournamentCardProps) {
  const router = useRouter();

  const getTournamentStatus = () => {
    if (tournament.is_completed) return { text: 'COMPLETED', color: 'text-gray-400', buttonDisabled: true };
    if (tournament.is_started) return { text: 'IN PROGRESS', color: 'text-yellow-400', buttonDisabled: true };
    if (!tournament.is_active) return { text: 'INACTIVE', color: 'text-red-400', buttonDisabled: true };
    if (tournament.registered_players >= tournament.max_players) return { text: 'FULL', color: 'text-orange-400', buttonDisabled: true };
    return { text: 'OPEN', color: 'text-green-400', buttonDisabled: false };
  };

  const status = getTournamentStatus();
  const canRegister = !status.buttonDisabled;

  if (compact) {
    return (
      <div className="p-4 bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded-lg border border-[#2b4b6f] hover:border-[#377cca] transition-colors">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold font-bank tracking-[0.08em]">{tournament.title}</h3>
          <span className={`text-xs font-semibold ${status.color}`}>{status.text}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-300">
          <div>
            <span>{tournament.mode} • {tournament.region}</span>
            <div className="text-[#3791dd] font-semibold">
              {tournament.registered_players}/{tournament.max_players} players
            </div>
          </div>
          <button
            onClick={() => router.push(`/battlefield/tournaments/${tournament.id}`)}
            className="px-3 py-1 border border-[#377cca] rounded text-xs hover:bg-[#377cca]/20 transition"
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-[300px] p-[2px] bg-gradient-to-b from-[#377cca] to-[#12436c] rounded hover:brightness-110 transition cursor-pointer">
      <div className="relative bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded h-full w-full">
        <div>
          <h1 className="absolute text-xl text-white z-10 ml-3 mt-4 font-bold font-bank tracking-[0.08em] text-[24px]">
            {tournament.title.split(' ').slice(0, 2).join(' ')}<br />
            {tournament.title.split(' ').slice(2).join(' ')}
          </h1>
          
          <div className="absolute p-[2px] bg-gradient-to-r from-[#377cca] to-[#12436c] rounded mt-24 z-10 ml-3">
            <div className="flex p-2 mr-2 bg-gradient-to-r from-[#12436c] to-[#2d4a5c] rounded h-full w-full">
              <p>{tournament.registered_players}/{tournament.max_players} Players</p>
            </div>
          </div>
          
          <img
            src="/bfMiniImg.jpg"
            alt="Tournament"
            className="inset-0 w-full h-[150px] object-cover rounded-t opacity-50"
          />
        </div>
        
        <div className="flex p-4 w-full">
          <div className="mt-2 w-1/2">
            <p className="text-gray-300 mt-2 opacity-80">MODE</p>
            <p className="font-semibold text-[#3791dd]">{tournament.mode}</p>
            <p className="text-gray-300 mt-2 opacity-80">REGION</p>
            <p className="font-semibold">{tournament.region}</p>
            <p className="text-gray-300 mt-2 opacity-80">PLATFORM</p>
            <p className="font-semibold">{tournament.platform}</p>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-300 mt-2 opacity-80">DATE</p>
            <p className="font-semibold text-[#3791dd]">
              {new Date(tournament.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-gray-300 mt-2 opacity-80">GAME</p>
            <p className="font-semibold">{tournament.games?.name || 'Battlefield'}</p>
            
            {tournament.prize_pool && (
              <>
                <p className="text-gray-300 mt-2 opacity-80">PRIZE</p>
                <p className="font-semibold text-green-400">${tournament.prize_pool.toLocaleString()}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <button
            className={`w-60 ml-4 mr-4 flex-1 py-2 rounded-md mb-0 transition ${
              canRegister 
                ? 'bg-gradient-to-r from-[#46a7d4] to-[#377cca] hover:brightness-110 cursor-pointer' 
                : 'border border-[#46a7d4] cursor-not-allowed opacity-50'
            }`}
            onClick={() => {
              if (canRegister && onRegister) {
                onRegister(tournament.id);
              } else {
                router.push(`/battlefield/tournaments/${tournament.id}`);
              }
            }}
          >
            {canRegister ? 'REGISTER NOW' : status.text}
          </button>
        </div>
      </div>
    </div>
  );
}