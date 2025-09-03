'use client';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tournamentDb } from '@/lib/database/tournaments';

interface Tournament {
  id: string;
  title: string;
  start_date: string;
  mode: string;
  region: string;
  platform: string;
  language: string;
  registered_players: number;
  max_players: number;
  is_active: boolean;
  games?: {
    name: string;
    code: string;
  };
}

interface MemberStats {
  total_members: number;
  online_members: number;
}

export default function BattlefieldHome() {
  const router = useRouter();
  const tournamentsScrollRef = useRef<HTMLDivElement>(null);
  const newsScrollRef = useRef<HTMLDivElement>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsPageIndex, setNewsPageIndex] = useState(0);
  const [memberStats, setMemberStats] = useState<MemberStats>({
    total_members: 0,
    online_members: 0
  });
  const [loading, setLoading] = useState({
    tournaments: true,
    stats: true
  });

  const CACHE_EXPIRATION = 5 * 60 * 1000;

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
    const fetchData = async () => {
      try {
        // Fetch tournaments from our new API
        const cachedTournaments = getCachedData('cachedTournaments');
        if (cachedTournaments) {
          setTournaments(cachedTournaments);
        } else {
          const tournamentsData = await tournamentDb.getTournaments({
            active: true,
            limit: 10
          });
          setTournaments(tournamentsData);
          cacheData('cachedTournaments', tournamentsData);
        }

        // Mock member stats for now (you can implement this API later)
        const cachedStats = getCachedData('cachedMemberStats');
        if (cachedStats) {
          setMemberStats(cachedStats);
        } else {
          const mockStats = { total_members: 15432, online_members: 1247 };
          setMemberStats(mockStats);
          cacheData('cachedMemberStats', mockStats);
        }

        // Mock news data for now 
        const mockNews = [
          {
            id: 1,
            title: "New 32v32 Tournament Series",
            date: "Dec 15, 2024",
            description: "Join our new tournament series featuring intense 32v32 battles.",
            image: "/bfMiniImg.jpg",
            more_link: "#"
          },
          {
            id: 2, 
            title: "Winter Championship Results",
            date: "Dec 10, 2024", 
            description: "Check out the results from our winter championship tournament.",
            image: "/bfMiniImg.jpg",
            more_link: "#"
          }
        ];
        setNewsItems(mockNews);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading({ tournaments: false, stats: false });
        setNewsLoading(false);
      }
    };

    fetchData();

    // Set up polling for member stats
    const pollInterval = setInterval(async () => {
      try {
        const mockStats = { 
          total_members: 15432 + Math.floor(Math.random() * 10), 
          online_members: 1200 + Math.floor(Math.random() * 100) 
        };
        setMemberStats(mockStats);
        cacheData('cachedMemberStats', mockStats);
      } catch (error) {
        console.error('Error polling member stats:', error);
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const scrollTournaments = (offset: number) => {
    if (tournamentsScrollRef.current) {
      tournamentsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollNews = (direction: 'left' | 'right') => {
    if (!newsScrollRef.current) return;

    const container = newsScrollRef.current;
    const scrollAmount = container.offsetWidth;

    if (direction === 'right') {
      setNewsPageIndex((prev) => {
        const next = Math.min(prev + 1, pages.length - 1);
        container.scrollTo({ left: scrollAmount * next, behavior: 'smooth' });
        return next;
      });
    } else {
      setNewsPageIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        container.scrollTo({ left: scrollAmount * next, behavior: 'smooth' });
        return next;
      });
    }
  };

  const pages: any[][] = [];
  for (let i = 0; i < newsItems.length; i += 4) {
    pages.push(newsItems.slice(i, i + 4));
  }


  const tournamentCards = tournaments.map(t => ({
    id: t.id,
    title: t.title,
    date: new Date(t.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    players: `${t.registered_players}/${t.max_players}`,
    button: t.is_active ? 'REGISTER NOW' : 'LIMIT REACHED',
    mode: t.mode,
    region: t.region,
    platform: t.platform,
    language: t.language
  }));

  const renderTournaments = () => {
    if (loading.tournaments) {
      return (
        <div className="flex justify-center items-center h-[400px] w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (tournamentCards.length === 0) {
      return (
        <div className="flex justify-center items-center h-[400px] w-full rounded">
          <p className="text-xl text-gray-300">NO AVAILABLE TOURNAMENTS</p>
        </div>
      );
    }

    return (
      <div ref={tournamentsScrollRef} className="flex gap-5 overflow-x-auto scrollbar-transparent">
        {tournamentCards.map((t, i) => (
          <div key={i} className={`flex-shrink-0 w-[300px] p-[2px] ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-b from-[#5a4451] to-[#12436c]' : 'bg-gradient-to-b from-[#377cca] to-[#12436c]'} rounded hover:brightness-110 transition cursor-pointer`}>
            <div className="relative bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded h-full w-full">
              <div>
                <h1 className='absolute text-xl text-white-300 z-10 ml-3 mt-4 font-bold font-bank tracking-[0.08em] text-[24px]'>
                  {t.title.split(' ').slice(0, 2).join(' ')}<br />{t.title.split(' ').slice(2).join(' ')}
                </h1>
                <div className={`absolute p-[2px] ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-r from-[#a98899] to-[#12436c]' : 'bg-gradient-to-r from-[#377cca] to-[#12436c]'} rounded mt-24 z-10 ml-3`}>
                  <div className={`flex p-2 mr-2 ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-r from-[#5a4451] to-[#2d4a5c]' : 'bg-gradient-to-r from-[#12436c] to-[#2d4a5c]'} rounded h-full w-full`}>
                    <p>{t.players} Players</p>
                  </div>
                </div>
                <img
                  src={"/bfMiniImg.jpg"}
                  alt="Battlefield"
                  className="inset-0 w-full h-[150px] object-cover rounded-t"
                  style={{opacity: 0.5}}
                />
              </div>
              <div className='flex p-4 w-full'>
                <div className='mt-2 w-1/2'>
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>MODE</p>
                  <p className='font-semibold text-[#3791dd]'>{t.mode}</p>
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>REGION</p>
                  <p className='font-semibold'>{t.region}</p>
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>PLATFORM</p>
                  <p className='font-semibold'>{t.platform}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>DATE</p>
                  <p className='font-semibold text-[#3791dd]'>{t.date}</p>
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>LANGUAGE</p>
                  <p className='font-semibold'>{t.language}</p>
                </div>
              </div>
              <div className='flex justify-center mb-4'>
                <button 
                  className={`w-60 ml-4 mr-4 flex-1 py-2 rounded-md mb-0 ${t.button === 'LIMIT REACHED' ? 'border border-[#46a7d4] cursor-not-allowed' : 'bg-gradient-to-r from-[#46a7d4] to-[#377cca] hover:brightness-110 transition'}`}
                  onClick={() => t.button === 'REGISTER NOW' && router.push(`/battlefield/register?tournament=${t.id}`)}
                >
                  {t.button}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="hero-gradient min-h-screen text-white relative bg-[#08182a] font-bahnschrift overflow-x-hidden">
      <img
        src="/player.png"
        alt="Players"
        className="fixed top-20 right-0 w-[200px] h-[auto] z-0 pointer-events-none players-img absolute"
      />
      <Header/>
      <Header2/>
      <div className="relative flex z-10">
        <div className="flex-1 bg-gradient-to-r from-[#061526] to-[#0b1f30]/70 pl-[158px] bg-black w-full" style={{opacity: 0.85}}>
          <div className='pt-[48px] bg-gradient-to-r from-[#08182a] to-[#0a3152]/10'>
            <div className="flex p-[2px] bg-gradient-to-r from-[#377cca] to-[#0d2a42]/10 rounded-md flex]">
              <div className="flex p-2 rounded-md bg-gradient-to-r from-[#0e3250] via-[#0f2f49] to-[#0a3152]/10 rounded h-full w-full">
                <img
                  src={"/bfVImg.jpg"}
                  alt="Battlefield"
                  className="inset-0 h-[278px] w-[190px] object-cover mr-4 rounded-md"
                />
                <div className='ml-2'>
                  <div className='flex mt-3'>
                    <div className="p-[2px] bg-gradient-to-r from-[#377cca] to-[#12436c] rounded mr-4">
                      <div className="flex p-2 mr-2 bg-[#12436c] rounded h-full w-full">
                        <p><span className="font-bold mr-[5px]">
                            {loading.stats ? '...' : memberStats.total_members.toLocaleString()}
                          </span><span>Members</span></p>
                      </div>
                    </div>
                    <div className="p-[2px] bg-gradient-to-r from-[#377cca] to-[#12436c] rounded mr-4">
                      <div className="flex p-2 mr-2 bg-[#12436c] rounded h-full w-full">
                        <img src={"online-img.png"} className='w-4 h-4 mt-auto mb-auto mr-2'/>
                        <p>
                          {loading.stats ? '...' : memberStats.online_members} Online
                        </p>
                      </div>
                    </div>
                    <div className='flex mt-2 ml-2'>
                      <img src={"/vector.png"} className='w-[20px] h-[20px] mr-2'/>
                      <h2 className='font-bold'>PC-EA</h2>
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold mb-2 font-bank font-xl mt-4 mb-4 tracking-[0.08em]">
                    <span>REGISTER FOR UPCOMING </span><br/> TOURNAMENTS</h2>
                  <p className="text-sm text-gray-300 mb-4">
                    Register & pick your role and sign up for upcoming battlefield tournaments, make sure you read the <br/> requirements for each tournament.
                  </p>
                  <button 
                    onClick={() => router.push('/battlefield/register')} 
                    className="bg-gradient-to-r from-[#06B6D4] to-[#097CCE] hover:bg-blue-700 px-4 py-2 rounded font-semibold hover:brightness-110 transition"
                  >
                    REGISTER NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='relative overflow-x-auto w-full pr-[158px]'>
            <section>
              <div className="flex justify-between mt-16">
                <h3 className="text-2xl font-semibold font-bank tracking-[0.08em] text-[28px]">UPCOMING TOURNAMENTS</h3>
                <div className='flex'>
                  <button className="mr-[20px] bg-gradient-to-r from-[#06B6D4] to-[#097CCE] hover:bg-blue-700 px-4 py-2 rounded font-semibold hover:brightness-110 transition">VIEW ALL</button>         
                  <img src="arrow-left.png" alt="Scroll left" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollTournaments(-600)}/>
                  <img src="arrow-right.png" alt="Scroll right" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollTournaments(600)}/>
                </div>
              </div>
              <p className="text-xl mb-4 mb-2 text-[14px] mt-[8px]">Register for upcoming tournament</p>
              
              <div className='flex gap-4 overflow-x-auto scrollbar-transparent'>
                {renderTournaments()}
              </div>
            </section>

            <section className='mt-48 relative max-w-screen'>
              <div className="flex justify-between items-center mt-[100px]">
                <h3 className="text-2xl font-semibold font-bank tracking-[0.08em]">NEWS</h3>
                <div className='flex'>
                  <img src="/arrow-left.png" alt="Left arrow" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollNews("left")}/>
                  <img src="/arrow-right.png" alt="Right arrow" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollNews("right")}/>
                </div>
              </div>

              {newsLoading ? (
                <div className="flex justify-center items-center w-full h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : newsItems.length === 0 ? (
                <div className="flex justify-center items-center w-full h-[400px]">
                  <p className="text-xl text-gray-300">NO AVAILABLE NEWS</p>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto scrollbar-transparent" ref={newsScrollRef} >                    
                  <div className="flex gap-8 scroll-smooth">
                    {pages.map((group, pageIndex) => (
                      <div
                        key={pageIndex}
                        className="min-w-full grid grid-cols-2 grid-rows-2 gap-4 mb-64"
                      >
                        {group.map((item) => (
                          <div
                            key={item.id}
                            className="flex border border-[#2b4b6f] rounded p-4 bg-gradient-to-r from-[#0b243a] to-transparent"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/warzone.png';
                              }}
                              className="w-[200px] mr-[10px] h-[250px] object-cover rounded mb-4"
                            />
                            <div className='mt-[10px]'>
                              <h4 className="text-white font-bold uppercase text-sm font-bank tracking-[0.08em]">{item.title}</h4>
                              <p className="text-[#CCCCCC] text-xs mt-1">{item.date}</p>
                              <p className="text-white text-sm mt-2">{item.description}</p>
                              <a
                                href={item.more_link}
                                className="inline-block mt-4 px-4 py-2 text-sm font-semibold rounded bg-gradient-to-r from-[#06B6D4] to-[#097CCE] text-white hover:brightness-110 transition"
                              >
                                FIND OUT MORE
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}