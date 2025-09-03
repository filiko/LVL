'use client';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import {
  tournamentCards,
  newsItems
} from '@/mock/mockData';
import { useRef } from 'react';

interface HubLink {
  name: string;
  icon: string;
  selected?: boolean;
  badge?: string;
  badgeColor?: string;
}

export default function BattlefieldHome() {

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: any) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const pages = [];
  for (let i = 0; i < newsItems.length; i += 4) {
    pages.push(newsItems.slice(i, i + 4));
  }
  
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
                      BATTLEFIELD REGISTRATION</h2>
                    <p className="text-sm text-gray-300 mb-4">
                        <span>Register for the upcoming tournament by filling out the required information, selecting role</span><br></br>
                        <span>preferences and vital squad info</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <section className="justify-center items-center pr-[200px] mt-[100px]">
              <h1 className="text-2xl font-semibold font-bank text-center text-white mb-[20px]">SELECT YOUR ROLE</h1>
              <div className='flex justify-center mt-2 p-4 gap-8'>
                <div className='p-[2px] bg-gradient-to-b from-[#15507e] to-transparent rounded'>
                    <div className='justify-center  w-[250px] h-[320px] p-4 rounded bg-gradient-to-r from-[#0b243c] via-[#0b2137] to-[#0a1b2f]'>
                        <h5 className='text-center font-bank text-sm'>INFANTRY</h5>
                        <img
                        src='infantry.png'
                        alt="Battlefield"
                        className="inset-0 w-[120px] object-cover rounded-md mr-auto ml-auto mt-[60px]"
                        />
                    </div>
                </div>
                <div className='p-[2px] bg-gradient-to-b from-[#15507e] to-transparent rounded'>
                    <div className='justify-center  w-[250px] h-[320px] p-4 rounded bg-gradient-to-r from-[#0a243c] via-[#0a1f34] to-[#0a1d30]'>
                        <h3 className='text-center font-bank text-sm'>ARMOR</h3>
                        <img
                        src='armour.png'
                        alt="Battlefield"
                        className="inset-0 h-[200px] object-cover rounded-md mr-auto ml-auto mt-[20px]"
                        />
                    </div>
                </div>
                
                <div className='p-[2px] bg-gradient-to-b from-[#15507e] to-transparent rounded'>
                    <div className='justify-center  w-[250px] h-[320px] p-4 rounded bg-gradient-to-r from-[#0c2741] via-[#0b2238] to-[#0c2032]'>
                        <h3 className='text-center font-bank text-sm'>HELI</h3>
                        <img
                        src='heli.png'
                        alt="Battlefield"
                        className="inset-0 h-[150px] object-cover rounded-mdmr-auto ml-auto mt-[40px]"
                        />
                    </div>
                </div>
                <div className='p-[2px] bg-gradient-to-b from-[#15507e] to-transparent rounded'>
                    <div className='justify-center w-[250px] h-[320px] p-4 bg-gradient-to-r from-[#0c2841] to-[#0c2237] rounded'>
                        <h3 className='text-center font-bank text-sm'>JET</h3>
                        <img
                        src='jet.png'
                        alt="Battlefield"
                        className="inset-0 w-[200px] object-cover rounded-mr-auto ml-auto mt-[20px]"
                        />
                    </div>
                </div>
              </div>
            </section>
            <section className="justify-center items-center pr-[200px] mt-[40px]">
                <h1 className="text-2xl font-semibold font-bank text-center mb-[40px]">INTERESTED IN LEADING?</h1>
                <div className='flex justify-center gap-4 mt-[30px]'>
                    <div className="flex justify-center space-x-4">
                        <div className="w-64 h-48 border border-blue-500 rounded-md bg-gradient-to-r from-[#092034] to-[#081724] flex flex-col items-center justify-center space-y-2 shadow-lg">
                            <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-8 h-4 bg-transparent border border-gray-500 rounded peer-checked:bg-blue-500 peer-focus:outline-none transition-colors duration-300"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-3 bg-[#209cf5] rounded transition-all duration-300 peer-checked:translate-x-full"></div>
                            </label><div className="text-white font-bold text-sm tracking-wide">TEAM CAPTAIN</div>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <div className="w-64 h-48 border border-blue-500 rounded-md bg-gradient-to-b from-[#092034] to-[#081724] flex flex-col items-center justify-center space-y-2 shadow-lg">
                            <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-8 h-4 bg-transparent border border-gray-500 rounded peer-checked:bg-blue-500 peer-focus:outline-none transition-colors duration-300"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-3 bg-[#209cf5] rounded transition-all duration-300 peer-checked:translate-x-full"></div>
                            </label><div className="text-white font-bold text-sm tracking-wide">SQUAD LEAD</div>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <div className="w-64 h-48 border border-blue-500 rounded-md bg-gradient-to-b from-[#092034] to-[#081724] flex flex-col items-center justify-center space-y-2 shadow-lg">
                            <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-8 h-4 bg-transparent border border-gray-500 rounded peer-checked:bg-blue-500 peer-focus:outline-none transition-colors duration-300"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-3 bg-[#209cf5] rounded transition-all duration-300 peer-checked:translate-x-full"></div>
                            </label><div className="text-white font-bold text-sm tracking-wide">NONE</div>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center mt-14 mb-14'>
                    <button className="bg-gradient-to-r from-[#64bdfc] to-[#209cf5] hover:bg-blue-700 px-4 py-2 rounded font-semibold hover:brightness-110 transition w-80 text-xs">CONTINUE</button>
                </div>
            </section>
         </main>
        </div>
    </main>
  );
}