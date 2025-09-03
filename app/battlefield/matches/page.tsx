'use client';

import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';

interface Match {
  id: number;
  teamA: string;
  teamB: string;
  winner: 'A' | 'B' | null;
  bgImg: string;
  mode: string;
  players: string;
  zone: string;
  score: string;
  formatted_date: string;
}

const CACHE_EXPIRATION = 5 * 60 * 1000;

export default function BattlefieldHome() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getCachedData = (key: string) => {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        return data;
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }

    return null;
  };

  const cacheData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  };

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      let backendUrl = '';

      try {
        console.log('Fetching BACKEND_URL...');
        const configRes = await fetch('/api/my-wrapper/');
        const config = await configRes.json();
        backendUrl = config.BACKEND_URL;
        console.log('Using backend URL:', backendUrl);

        const cachedMatches = getCachedData('cachedMatches');
        if (cachedMatches) {
          setMatches(cachedMatches);
        } else {
          const res = await axios.get(`${backendUrl}/api/matches/`);
          setMatches(res.data);
          cacheData('cachedMatches', res.data);
        }
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <main className="hero-gradient min-h-screen text-white relative overflow-hidden bg-[#08182a] font-bahnschrift">
      <img
        src="/player.png"
        alt="Players"
        className="fixed top-20 right-0 w-[200px] h-[auto] z-0 pointer-events-none players-img"
      />
      <Header />
      <Header2 />

      <div className="relative flex z-20 min-h-screen">
        <main className="flex-1 bg-gradient-to-r from-[#061526] to-[#0b1f30]/70 pl-[158px] min-h-screen" style={{ opacity: 1.0 }}>
          <div className='pt-[48px] bg-gradient-to-r from-[#08182a] to-[#0a3152]/10'>
            <div className="flex p-[2px] bg-gradient-to-r from-[#377cca] to-[#0d2a42]/10 rounded-md flex mb-8">
              <div className="flex p-2 bg-gradient-to-r from-[#0e3250] via-[#0f2f49] to-[#0a3152]/10 rounded h-full w-full">
                <img
                  src={"/bfVImg.jpg"}
                  alt="Battlefield"
                  className="inset-0 h-[192px] w-[131px] object-cover rounded-md"
                />
                <div className='ml-[30px] mt-auto mb-auto'>
                  <h2 className="text-[38px] tracking-[0.08em] font-bold font-bank text-white">
                    <span>MATCHES</span></h2>
                  <p className="text-sm text-gray-300">
                    <span>Browse a list of latest hard fought tournaments and matches across different game modes,</span><br />
                    <span>events and large scale brawls</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="justify-between mb-16 pr-[158px] mt-[80px]">
            <div className='flex justify-between'>
              <h1 className="text-[38px] font-bold font-bank tracking-[0.08em]">LATEST MATCHES</h1>
              <div className="flex items-center space-x-4 border-[2px] border-[#377cca] p-2 rounded-md">
                <select className="bg-transparent pr-4 text-[#377cca] font-bold">
                  <option>FILTER MATCHES</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#377cca] mr-auto ml-auto mt-16" />
            ) : (
              <div className="mt-4 overflow-x-auto gap-6 pb-4" ref={scrollRef}>
                {matches.map((t, i) => (
                  <div key={i} className="w-full mt-4 bg-[#0c263f] rounded-t">
                    <div className='bg-[#030F184D] flex justify-between text-gray p-2 pl-4 pr-4 rounded-t'>
                      <p className='text-xs font-bahnshrift'>{t.formatted_date}</p>
                      <p className='text-xs text-gray-400 font-bahnshrift'>{t.zone}</p>
                    </div>
                    <div className="w-full flex gap-4 justify-center">
                      <div className="w-[47%] relative flex justify-between items-center">
                        <img
                          src={"/warzone2.png"}
                          alt="background"
                          className="w-52 h-[70px] object-cover z-0 rounded-bl opacity-80"
                        />
                        <div className={`absolute inset-0 z-10 rounded ${t.winner === 'A'
                          ? 'bg-gradient-to-r from-[#4ADE80]/30 to-transparent'
                          : 'bg-gradient-to-r from-[#081c2d] to-transparent'
                          }`} />
                        <div className="absolute top-1 left-2 z-20 p-2">
                          <h2 className="text-white font-bold font-bank tracking-[0.08em] text-md">{t.mode}</h2>
                          <h2 className="text-white font-bank tracking-[0.08em] mt-1 text-md">{t.players}</h2>
                        </div>
                        <div className="absolute top-1 right-2 text-right z-20 p-2">
                          <h2 className="text-white font-bold font-bank tracking-[0.08em] text-md">{t.teamA}</h2>
                          <h2 className={`font-bahnshrift text-sm ${t.winner === 'A' ? 'text-green-400' : 'text-red-400'}`}>
                            {t.winner === 'A' ? 'Winner' : 'Loser'}
                          </h2>
                        </div>
                      </div>

                      <div className='p-[2px] bg-gradient-to-b from-[#155282] to-transparent w-[7%] h-12 rounded mt-3'>
                        <div className="w-full flex items-center justify-center p-2 bg-[#0d2c48] rounded">
                          <h2 className="text-white font-bold text-xl">{t.score}</h2>
                        </div>
                      </div>

                      <div className="w-[47%] relative flex justify-between items-center p-2">
                        <div className={`absolute inset-0 z-10 rounded ${t.winner === 'B'
                          ? 'bg-gradient-to-l from-[#4ADE80]/20 to-transparent'
                          : 'bg-gradient-to-l from-[#081c2d] to-transparent'
                          }`} />
                        <div className="z-20">
                          <h2 className="text-white font-bold font-bank tracking-[0.08em] text-md">{t.teamB}</h2>
                          <h2 className={`font-bahnshrift text-sm ${t.winner === 'B' ? 'text-green-400' : 'text-red-400'}`}>
                            {t.winner === 'B' ? 'Winner' : 'Loser'}
                          </h2>
                        </div>
                        <div className="text-right z-20">
                          <div className="flex border-[2px] border-[#155282] px-5 py-2 mr-2 rounded">
                            <img src="/watch.png" alt="Watch Now" className="h-[20px] mr-2" />
                            <h3 className="text-white font-bahnshrift text-sm text-[#1e8ede]">Watch</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </main>
  );
}