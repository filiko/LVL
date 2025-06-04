'use client';
import {
  profile,
  upcomingSidebar,
  hubLinks,
  configLinks,
  tournamentCards,
} from './tournamentData';
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
  
  return (
    <main className="hero-gradient min-h-screen text-white relative overflow-hidden bg-[#0e1f38]">
      <img
        src="battlefieldXter.png"
        alt="Players"
        className="fixed top-20 right-0 w-[300px] h-[auto] z-0 pointer-events-none players-img"
      />
        <div className="relative bg-[#0a3152] py-4 px-6 flex items-center justify-between z-20">
          <div className="flex items-center space-x-4 border border-[#377cca] p-2 rounded-md bg-gradient-to-r from-[#12436c] to-[#0a3152]">
            <img src="bfMiniImg.jpg" alt="Example" className="w-8 h-8 rounded-md border border-[#377cca]" />
            <select className="bg-transparent text-white-700 w-[120px]">
              <option>Battlefield</option>
            </select>
          </div>
          <input 
            type="text" 
            placeholder="Search tournaments..." 
            className="bg-[#1a365d] text-white px-3 py-1 rounded w-1/3 border border-[#698dad]" 
          />
          <div className='flex'>
            <img src="events1.png" alt="Events" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px]" />
            <img src="notificationOn.png" alt="Notifications" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2" />
            <div className="flex items-center space-x-4 border border-[#377cca] p-2 rounded-md bg-gradient-to-r from-[#12436c] to-[#0a3152] h-10 ">
              <img src="bfMiniImg.jpg" alt="Example" className="w-6 h-6 rounded-md border border-[#377cca]" />
              <select className="bg-transparent text-white-700 w-[120px]">
                <option>{profile.name}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="relative flex mt-1 z-20">
          <aside className="w-64 bg-gradient-to-r from-[#051d35] to-[#0a3152] min-h-screen p-6 mr-1">
            <div className='flex mb-5'>
              <div className='border-2 border-[#377cca] rounded-lg mr-2 w-[60px] h-[60px] '>
                <img src={"online-img.png"} className='w-4 h-4 mt-auto mb-auto mr-2 absolute ml-[48px] mt-[-10px]'/>
                <img
                  src="players.png"
                  alt="Players"
                  className="p-[2px] pointer-events-none rounded-lg cover"
                />
              </div>
              
              <div className='mt-4'>
                <p className="text-sm" style={{opacity: 0.4}}>PROFILE</p>
                <h2 className="text-sm font-bold">{profile.name}</h2>
              </div>
            </div>

            <div className="text-sm  mb-2 mt-4 text-m text-gray-300" style={{opacity: 0.4}}>UPCOMING</div>
            {upcomingSidebar.map((item, index) => (
                <div
                  key={index}
                  className="mb-2 relative overflow-hidden h-20 hover:brightness-110 transition cursor-pointer"
                  style={{
                    border: '2px solid',
                    borderImage: `linear-gradient(to right, ${
                      item.today ? '#ffca18, #16436a' : '#3791dd, #16436a'
                    }) 1`,
                  }}
                >
                <div className='h-full w-full z-0 absolute z-10 rounded' style={{
                  background: 'linear-gradient(to right, #16436a, #133550)',
                  opacity: 0.9
                }}></div>
                <img
                  src={item.image_url}
                  alt="Battlefield"
                  className="absolute inset-0 w-full h-full object-cover z-0 rounded"
                />
                <div className="relative z-20 p-2 z-20 rounded">
                  <div className="font-bold text-white">{item.title}</div>
                  {item.no_of_players && (
                    <div className="text-xs text-gray-400 mt-[2px]">{item.no_of_players}</div>
                  )}
                  {item.startsIn && (
                    <div className="text-xs text-yellow-400 mt-[2px]">{item.startsIn}</div>
                  )}
                  {item.date && (
                    <div className="text-xs text-gray-400 mt-[2px]">{item.date}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="text-sm mb-2 text-gray-300 mt-4" style={{opacity: 0.4}}>HUB</div>
              <ul className="space-y-2">
                {hubLinks.map((link: HubLink, i: number) => (
                  link.selected ? (
                    <div key={i} className="flex bg-gradient-to-r from-[#377cca] to-[#0a3152] p-[1px] rounded-md mb-2">
                      <div className="flex p-2 mr-2 bg-gradient-to-r from-[#12436c] to-[#0a3152] rounded h-full w-full">
                        <img src={link.icon} alt="Example" className="w-5 h-5 mr-2 mt-[2px]" />
                        <p className='mr-[20px]'>{link.name}</p>
                        {link.badge && (
                          <span className={`${link.badgeColor || ''} ml-1`}>{link.badge}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="hover:text-blue-400 cursor-pointer flex text-[#3791dd] pt-[5px] pb-[5px]">
                      <img src={link.icon} alt="Example" className="w-5 h-5 mr-2 mt-[2px]" />
                      <p className='mr-[20px]'>{link.name}</p>
                      {link.badge && (
                        <span className={`${link.badgeColor || ''} ml-1`}>{link.badge}</span>
                      )}
                    </div>
                  )
                ))}
              </ul>

            <div className="mt-6 text-sm text-gray-300" style={{opacity: 0.4}}>CONFIGURATION</div>
            <ul className="space-y-2 mt-2">
              {configLinks.map((link, i) => (
                <div key={i} className="hover:text-blue-400 cursor-pointer flex text-[#3791dd] pt-[5px] pb-[5px]">
                  <img src={link.icon} alt="Example" className="w-5 h-5 mr-2 mt-[2px]" />
                  <span key={i} className="hover:text-blue-400 cursor-pointer">
                    {link.name}
                  </span>
                </div>
              ))}
            </ul>
          </aside>

          <main className="flex-1 p-6 bg-[#0a3152]"  style={{opacity: 0.8}}>
            <div className="flex bg-gradient-to-r from-[#377cca] to-[#0a3152] p-[2px] rounded-md flex mb-8">
              <div className="flex p-2 mr-2 bg-gradient-to-r from-[#12436c] to-[#0a3152] rounded h-full w-full">
                <img
                    src={"bfVImg.jpg"}
                    alt="Battlefield"
                    className="inset-0 h-[300px] object-cover mr-4 rounded-md"
                  />
                <div>
                  <div className='flex mt-6'>
                    <div className="p-[2px] bg-gradient-to-r from-[#377cca] to-[#12436c] rounded mr-4">
                      <div className="flex p-2 mr-2 bg-[#12436c] rounded h-full w-full">
                        <p>4,215 Members</p>
                      </div>
                    </div>
                    <div className="p-[2px] bg-gradient-to-r from-[#377cca] to-[#12436c] rounded mr-4">
                      <div className="flex p-2 mr-2 bg-[#12436c] rounded h-full w-full">
                        <img src={"online-img.png"} className='w-4 h-4 mt-auto mb-auto mr-2'/>
                        <p>228 Online</p>
                      </div>
                    </div>
                    <div className='flex mt-2 ml-2'>
                      <img src={"mobileDsktp.jpg"} className='w-[20px] h-[20px] mr-2'/>
                      <img src={"mobileDsktp.jpg"} className='w-[20px] h-[20px] mr-2'/>
                      <img src={"mobileDsktp.jpg"} className='w-[20px] h-[20px] mr-2'/>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 font-bank font-xl mt-4 mb-4">
                    <span>REGISTER FOR UPCOMING </span><br/> TOURNAMENTS</h2>
                  <p className="text-sm text-gray-300 mb-4 max-w-md">
                    Register & pick your role and sign up for upcoming battlefield tournaments, make sure you read the requirements for each tournament.
                  </p>
                  <button className="bg-gradient-to-r from-[#46a7d4] to-[#377cca] hover:bg-blue-700 px-4 py-2 rounded font-semibold hover:brightness-110 transition">REGISTER NOW</button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold font-bank">UPCOMING TOURNAMENTS</h3>
              <div className='flex'>
                <img src="arrow-left.png" alt="Events" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scroll(-200)}/>
                <img src="arrow-right.png" alt="Events" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scroll(200)}/>
              </div>
            </div>
            <p className="text-xl mb-4">Register for upcoming tournament</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto scrollbar-hide">
              {tournamentCards.map((t, i) => (
                <div key={i} className={`p-[2px] ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-b from-[#5a4451] to-[#12436c]' : 'bg-gradient-to-b from-[#377cca] to-[#12436c]'} rounded mr-4 hover:brightness-110 transition cursor-pointer`}>
                  <div className="mr-2 bg-[#12436c] rounded h-full w-full">
                    <div>
                      <h1 className='absolute text-xl text-white-300 z-10 ml-3 mt-4 font-bold font-bank'>
                        {t.title.split(' ').slice(0, 2).join(' ')}<br />{t.title.split(' ').slice(2).join(' ')}
                      </h1>
                      <div className={`absolute p-[2px] ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-r from-[#a98899] to-[#12436c]' : 'bg-gradient-to-r from-[#377cca] to-[#12436c]'} rounded mt-24 z-10 ml-3`}>
                        <div className={`flex p-2 mr-2  ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-r from-[#5a4451] to-[#2d4a5c]' : 'bg-gradient-to-r from-[#12436c] to-[#2d4a5c]'} rounded h-full w-full`}>
                          <p>{t.players} Players</p>
                        </div>
                      </div>
                      <img
                      src={"bfMiniImg.jpg"}
                      alt="Battlefield"
                      className="inset-0 h-[150px] w-full object-cover mr-4 rounded-t z-0"
                      style={{opacity: 0.5}}
                      />
                    </div>
                  <div className='flex p-4'>
                    <div className='mt-2 w-[120px]'>
                      <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>MODE</p>
                      <p className='font-semibold text-[#3791dd]'>32v32</p>

                      <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>REGION</p>
                      <p className='font-semibold'>US North</p>

                      <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>LEVEL</p>
                      <p className='font-semibold'>PC</p>
                    </div>

                    <div className='mt-2'>
                      <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>DATE</p>
                      <p className='font-semibold text-[#3791dd]'>{t.date}</p>

                      <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>PLATFORM</p>
                      <p className='font-semibold'>US North</p>

                      <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>LANGUAGE</p>
                      <p className='font-semibold'>ENGLISH</p>
                    </div>
                  </div>
                  <div className='flex justify-center mb-4'>
                    <button className={`w-60 py-2 rounded-md mb-0 ${t.button === 'LIMIT REACHED' ? 'border border-[#46a7d4] cursor-not-allowed' : 'bg-gradient-to-r from-[#46a7d4] to-[#377cca] hover:brightness-110 transition'}`}>
                    {t.button}
                  </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
    </main>
  );
}