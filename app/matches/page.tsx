'use client';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import {
  matches
} from '@/mock/mockData';
import { useRef } from 'react';

export default function BattlefieldHome() {

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: any) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };
  
  return (
    <main className="hero-gradient min-h-screen text-white relative overflow-hidden bg-[#08182a] font-bahnschrift">
      <img
        src="battlefieldXter.png"
        alt="Players"
        className="fixed top-20 right-0 w-[200px] h-[auto] z-0 pointer-events-none players-img"
      />
      <Header/>
      <Header2/>

        <div className="relative flex z-20">
          <main className="flex-1 bg-[#08182a] pl-64"  style={{opacity: 0.8}}>
            <div className='pt-6 bg-gradient-to-r from-[#08182a] to-[#0a3152]'>
              <div className="flex bg-gradient-to-r from-[#377cca] to-[#102b42] p-[2px] rounded-md flex mb-8 mt-4">
                <div className="flex p-2 mr-2 bg-gradient-to-r from-[#12436c] to-[#0a3152] rounded h-full w-full">
                  <img
                      src={"bfVImg.jpg"}
                      alt="Battlefield"
                      className="inset-0 h-[200px] object-cover mr-4 rounded-md"
                    />
                  <div>
                    <h2 className="text-2xl font-bold mb-2 font-bank font-xl mt-4 mb-4 text-white">
                      MATCHES</h2>
                    <p className="text-sm text-gray-300 mb-4">
                        <span>Browse a list of latest hard fought tournaments and matches across different game modes,</span><br></br>
                        <span>events and large scale brawls</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <section className="justify-between mt-4 mb-16">
                <div className='flex justify-between w-[80%]'> 
                    <h1 className="text-4xl font-bold font-bank">LATEST MATCHES</h1>
                    <div className="flex items-center space-x-4 border-[2px] border-[#377cca] p-2 rounded-md">
                        <select className="bg-transparent text-white-700 text-xs pr-4 text-[#1e8ede]">
                            <option>FILTER MATCHES</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 overflow-x-auto gap-6 pb-4 w-[80%]" ref={scrollRef}>
                    {matches.map((t, i) => (
                    <div key={i} className="w-full mt-4">
                        <div className='mt-2 mb-2 bg-[#081929] flex justify-between'>
                            <p className='text-xs font-bahnshrift'>{t.date}</p>
                            <p className='text-xs font-bahnshrift'>{t.zone}</p>
                        </div>
                        <div className="w-full flex p-0 gap-4 justify-center">
                            <div className="w-[45%] relative flex justify-between items-center">
                            <img
                                src={t.bgImg}
                                alt="background"
                                className="w-48 h-14 object-cover z-0 rounded"
                            />

                            <div
                                className={`absolute inset-0 z-10 rounded ${
                                t.winner === 'A'
                                    ? 'bg-gradient-to-r from-[rgba(34,197,94,0.2)] to-[#081c2d]'
                                    : 'bg-gradient-to-r from-[#081c2d]/80 to-[#081c2d]'
                                }`}
                            ></div>

                            <div className="absolute top-1 left-2 z-20">
                                <h2 className="text-white font-bold font-bank text-sm">{t.mode}</h2>
                                <h2 className="text-white font-bank mt-1 text-sm">{t.players}</h2>
                            </div>

                            <div className="absolute top-1 right-2 text-right z-20">
                                <h2 className="text-white font-bold font-bank text-sm">{t.teamA}</h2>
                                <h2
                                className={`font-bahnshrift text-sm ${
                                    t.winner === 'A' ? 'text-green-400' : 'text-red-400'
                                }`}
                                >
                                {t.winner === 'A' ? 'Winner' : 'Loser'}
                                </h2>
                            </div>
                            </div>

                            <div className='p-[2px] bg-gradient-to-b from-[#155282] to-transparent w-[10%] rounded'>
                                <div className="w-full flex items-center justify-center p-2 bg-[#0d2c48] rounded">
                                <h2 className="text-white font-bold text-xl">{t.score}</h2>
                                </div>
                            </div>

                            <div className="w-[45%] relative flex justify-between items-center p-2">
                                <div
                                    className={`absolute inset-0 z-10 rounded ${
                                    t.winner === 'B'
                                        ? 'bg-gradient-to-l from-[rgba(34,197,94,0.2)] to-[#081c2d]'
                                        : 'bg-gradient-to-l from-[#081c2d]/80 to-[#081c2d]'
                                    }`}
                                ></div>

                                <div className="z-20">
                                    <h2 className="text-white font-bold font-bank text-sm">{t.teamB}</h2>
                                    <h2
                                    className={`font-bahnshrift text-sm ${
                                        t.winner === 'B' ? 'text-green-400' : 'text-red-400'
                                    }`}
                                    >
                                    {t.winner === 'B' ? 'Winner' : 'Loser'}
                                    </h2>
                                </div>

                                <div className="text-right z-20">
                                    <div className="flex border-[2px] border-[#155282] px-4 py-2 rounded">
                                    <img src="watch.png" alt="Watch Now" className="h-[20px] mr-2" />
                                    <h3 className="text-white font-bahnshrift text-sm text-[#1e8ede]">Watch</h3>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    ))}
                </div>

            </section>

         </main>
        </div>
    </main>
  );
}