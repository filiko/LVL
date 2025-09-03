'use client';

import { useRef, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { teams, roleIcons } from '@/mock/mockData';

export default function BattlefieldHome() {
  type Player = {
    name: string;
    icon: string;
    rank: string;
    country: string;
    country_icon: string;
    points: number;
    kd: number;
    winrate: number;
  };

  type Teams = {
    RED: Record<string, Record<string, Player[]>>;
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const [collapsedRoles, setCollapsedRoles] = useState<Record<string, boolean>>({});

  const toggleCollapse = (role: string) => {
    setCollapsedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const redTeam = teams.RED;

  return (
    <main className="hero-gradient min-h-screen text-white relative overflow-hidden bg-[#08182a] font-bahnschrift">
      <img
        src="/battlefieldXter.png"
        alt="Players"
        className="fixed top-20 right-0 w-[200px] h-auto z-0 pointer-events-none"
      />

      <Header />
      <Header2 />

      <div className="relative z-20 flex">
        <div className="flex-1 pl-64 bg-[#08182a] bg-opacity-80">
          <section className="pt-6 bg-gradient-to-r from-[#08182a] to-[#0a3152] px-8">
            <div className="flex bg-gradient-to-r from-[#377cca] to-[#102b42] p-[2px] rounded-md mb-16 mt-4">
              <div className="flex p-2 mr-2 bg-gradient-to-r from-[#0c435e] to-[#0a3152] rounded w-full">
                <img
                  src="/bfVImg.jpg"
                  alt="Battlefield"
                  className="h-[200px] object-cover mr-4 rounded-md"
                />
                <div>
                  <div className="flex mt-4">
                    <div className="flex border-2 border-[#1e8ede] p-2 rounded mr-6 bg-gradient-to-r from-[#125181] to-[#0d3658]">
                      <h2 className="mr-2 font-bold">24/64</h2>
                      <span className="text-sm self-center">Players</span>
                    </div>
                    <p className="self-center font-bank text-xs">BATTLEFIELD 2042</p>
                  </div>
                  <h2 className="text-3xl font-bank font-bold mt-4 mb-4">US NORTH GRAND</h2>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <Info label="Mode" value="32 v 32" />
                    <Info label="Date" value="5 May, 15.00 (PT)" />
                    <Info label="Region" value="US North" />
                    <Info label="Level" value="Advanced" />
                    <Info label="Platform" value="PC" />
                    <Info label="Language" value="English" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bank font-bold mt-12">RED TEAM</h2>

            <div className="w-[80%] mt-4">
              {Object.entries(redTeam).map(([role, squads]) => (
                <div
                  key={role}
                  className="relative mb-12 border border-blue-400 p-8 rounded bg-gradient-to-r from-[#0a243e] to-transparent"
                >
                  {!collapsedRoles[role] && (
                    <img
                      src={roleIcons[role as keyof typeof roleIcons]}
                      alt={`${role} icon`}
                      className="absolute w-32 h-48 top-12 right-4 opacity-80 z-10 rounded"
                    />
                  )}

                  <div
                    className="flex items-center mb-4 cursor-pointer z-20 relative"
                    onClick={() => toggleCollapse(role)}
                  >
                    <img
                      src="/arrowDown.png"
                      alt="Toggle"
                      className={`w-8 h-8 border border-[#1e8ede] p-2 rounded transition-transform duration-300 ${
                        collapsedRoles[role] ? 'rotate-180' : ''
                      }`}
                    />
                    <h2 className="ml-3 text-xl font-bank">{role}</h2>
                  </div>

                  {!collapsedRoles[role] && (
                    <div className="max-h-[400px] overflow-y-auto pr-4 z-20">
                      {Object.entries(squads).map(([squadName, players]) => (
                        <div key={squadName} className="mb-8">
                          <h3 className="font-bank mb-2">{squadName}</h3>
                          <div className="flex text-xs text-white/80 ml-[25px] font-bahnschrift">
                            <div className="w-[200px]">Player</div>
                            <div className="w-[200px]">Rank</div>
                            <div className="w-[200px]">Country</div>
                            <div className="w-[200px]">Points</div>
                            <div className="w-[200px]">K/D</div>
                            <div className="w-[200px]">Win Rate</div>
                          </div>

                          {players.map((player, idx) => (
                            <div
                              key={player.name + idx}
                              className={`flex items-center p-2 mt-2 text-sm text-white rounded-md font-bahnschrift ${
                                idx % 2 === 0
                                  ? 'bg-gradient-to-r from-[#0e3b61] to-transparent'
                                  : 'bg-gradient-to-r from-[#0a2e4d] to-transparent'
                              }`}
                            >
                              <div className="w-[230px] flex items-center space-x-2">
                                <img src={player.icon} alt="icon" className="w-6 h-6 rounded-full" />
                                <span>{player.name}</span>
                              </div>
                              <div className="w-[200px]">{player.rank}</div>
                              <div className="w-[200px] flex items-center space-x-2">
                                <img src={player.country_icon} alt="flag" className="w-6 h-6 rounded-full" />
                                <span>{player.country}</span>
                              </div>
                              <div className="w-[200px]">{player.points}</div>
                              <div className="w-[200px]">{player.kd}</div>
                              <div className="w-[200px] flex items-center space-x-2">
                                <WinRateCircle winrate={player.winrate} />
                                <span className="text-xs font-bold">{player.winrate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p className="text-[#1b82cc]">{value}</p>
    </div>
  );
}

function WinRateCircle({ winrate }: { winrate: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * winrate) / 100;

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="transform -rotate-90">
      <circle
        cx="16"
        cy="16"
        r={radius}
        stroke="#11456e"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="16"
        cy="16"
        r={radius}
        stroke="#209CF5"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        fill="none"
      />
    </svg>
  );
}