'use client';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';

interface Tournament {
  id: number;
  title: string;
  start_date: string;
  mode: string;
  region: string;
  platform: string;
  language: string;
  registered_players: number;
  max_players: number;
  is_active: boolean;
  game: string;
}

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const battlefieldScrollRef = useRef<HTMLDivElement>(null);
  const nhlScrollRef = useRef<HTMLDivElement>(null);
  const newsScrollRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newsPageIndex, setNewsPageIndex] = useState(0);


  const navItems = [
    { label: 'Home', href: '/home' },
    { label: 'Games', href: '/battlefield' },
    { label: 'About', href: '/about' },
  ];
  
  useEffect(() => {
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
    let backendUrl = ''
    const fetchTournaments = async () => {
      const res = await fetch('/api/my-wrapper/');
      const config = await res.json();
      backendUrl = config.BACKEND_URL;
      try {
        const accessToken = localStorage.getItem('access_token')
        console.log(accessToken)
        if (accessToken) {
          setIsAuthenticated(true);
        }

        if (!accessToken) {
          router.push('/login');
          return;
        }

        const cachedTournaments = getCachedData('cachedTournaments');
        if (cachedTournaments) {
          setTournaments(cachedTournaments);
        } else {
          const response = await axios.get(`${backendUrl}/api/upcoming_tournaments/`);
          setTournaments(response.data.tournaments);
          cacheData('cachedTournaments', response.data.tournaments);
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNews = async () => {
      const res = await fetch('/api/my-wrapper/');
      const config = await res.json();
      backendUrl = config.BACKEND_URL;
      try {
        const cachedNews = getCachedData('cachedNewsItems');
        if (cachedNews) {
          setNewsItems(cachedNews);
        } else {
          const response = await axios.get(`${backendUrl}/api/news/`);
          setNewsItems(response.data);
          cacheData('cachedNewsItems', response.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchTournaments();
    fetchNews();

    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const numDots = 100;
    const halfHeight = height / 2;

    const dots = Array.from({ length: numDots }, () => ({
      x: Math.random() * width,
      y: Math.random() * halfHeight,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }));

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        dot.x += dot.dx;
        dot.y += dot.dy;

        if (dot.x > width) dot.x = 0;
        if (dot.x < 0) dot.x = width;
        if (dot.y > halfHeight) dot.y = 0;
        if (dot.y < 0) dot.y = halfHeight;
      }
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  const scrollBattlefield = (offset: number) => {
    if (battlefieldScrollRef.current) {
      battlefieldScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollNHL = (offset: number) => {
    if (nhlScrollRef.current) {
      nhlScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollNews = (direction: 'left' | 'right') => {
    if (!newsScrollRef.current) return;

    const container = newsScrollRef.current;
    const scrollAmount = container.offsetWidth; // width of one "page"

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


  const formatTournament = (t: Tournament) => ({
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
    language: t.language,
    game: t.game
  });

  const filterTournaments = (game: string) => {
    return tournaments
      .filter(t => t.game.toLowerCase() === game.toLowerCase())
      .map(formatTournament);
  };

  const battlefieldTournaments = filterTournaments('Battlefield');
  const nhlTournaments = filterTournaments('NHL');

  const renderTournaments = (tournaments: any[], game: string, scrollRef: React.RefObject<HTMLDivElement>) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center w-full h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }
    if (tournaments.length === 0) {
      return (
        <div className="flex justify-center items-center w-full h-[400px] rounded">
          <p className="text-xl text-gray-300">NO AVAILABLE TOURNAMENTS</p>
        </div>
      );
    }

    return (
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-transparent">
        {tournaments.map((t, i) => (
          <div key={i} className={`relative flex-shrink-0 w-[300px] p-[2px] ${t.button === 'LIMIT REACHED' ? 'bg-gradient-to-b from-[#5a4451] to-[#12436c]' : 'bg-gradient-to-b from-[#377cca] to-[#12436c]'} rounded hover:brightness-110 transition cursor-pointer`}>
            <div className="bg-gradient-to-r from-[#0b243d] to-[#07182a] rounded h-full w-full">
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
                  src={game === 'Battlefield' ? "/bfMiniImg.jpg" : "/warzone.png"}
                  alt={game}
                  className="inset-0 h-[150px] w-full object-cover rounded-t z-0"
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
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>LEVEL</p>
                  <p className='font-semibold'>All Levels</p>
                  <p className='text-gray-300 mt-2' style={{opacity: 0.8}}>LANGUAGE</p>
                  <p className='font-semibold'>{t.language}</p>
                </div>
              </div>
              <div className='flex justify-center mb-4'>
                <button 
                  className={`w-60 py-2 rounded-md mb-0 ${t.button === 'LIMIT REACHED' ? 'border border-[#46a7d4] cursor-not-allowed' : 'bg-gradient-to-r from-[#46a7d4] to-[#377cca] hover:brightness-110 transition'}`}
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

  const pages: any[][] = [];
  for (let i = 0; i < newsItems.length; i += 4) {
    pages.push(newsItems.slice(i, i + 4));
  }

  return (
    <main className="hero-gradient min-h-screen text-white relative overflow-hidden font-bahnschrift">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      <div
        className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #040D18, #0e2639)',
          opacity: 0.9,
        }}
      />
      <div className="relative z-30">
        <header className="flex justify-between items-center bg-[#182d3e] pl-[24px] pr-[24px]">
          <div className="flex items-center">
            <div onClick={() => router.push('/')} className="cursor-pointer">
              <img
                src="/footer_logo.png"
                alt="Logo"
                className="w-[90px] h-[33px] mt-[14px] mb-[14px]"
              />
            </div>

            <div className="flex ml-[69px] text-white text-[16px] h-full gap-[2px]">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <div
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`cursor-pointer flex items-center h-[60px] px-4 ${
                      isActive ? 'border-b-2 border-white font-bold' : ''
                    } hover:border-b-2 hover:border-white transition`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative w-[275px] h-[37px] border border-white/30 rounded-sm flex items-center px-3 py-2 bg-transparent">
            <img src="/searchGlass.svg" alt="search icon" className="h-4 w-4" />
            <input
              id="search"
              type="text"
              placeholder="Search tournaments"
              className="w-full pl-3 bg-transparent border-none focus:outline-none text-sm placeholder-white/50"
            />
          </div>

          <div className="flex space-x-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-2 py-1 border border-[#0281d6] text-[#0281d6] rounded hover:brightness-110 hover:text-[#0281d6] transition text-sm"
                >
                  LOG IN
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="bg-gradient-to-r from-[#06b6d4] to-[#097cce] px-4 py-2 text-white rounded hover:brightness-110 transition text-sm"
                >
                  SIGN UP NOW
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  sessionStorage.removeItem('access_token');
                  setIsAuthenticated(false);
                  router.push('/login');
                }}
                className="px-4 py-2 border border-[#0281d6] text-[#0281d6] rounded hover:brightness-110 transition text-sm"
              >
                LOG OUT
              </button>
            )}
          </div>
        </header>
        <div className='px-[150px]'>
          <section className="py-36 relative">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="max-w-2xl mb-auto mt-auto">
                <h2 className="text-4xl md:text-5xl font-bold leading-snug mb-4 font-bank tracking-[0.08em]">
                  HOME OF YOUR TOP <br />
                  <span style={{ color: '#9cd4fd' }}>TOURNAMENTS IN</span> <br />
                  <span style={{ color: '#3daffb' }}>GAMING</span>
                </h2>
                {!isAuthenticated && (
                  <>
                    <p className="text-gray-300 mb-6">
                      Sign up now and jump into tournaments and help lead your teams to
                      victory in a handful of different game modes across Battlefield and NHL.
                    </p>
                    <button
                      className="bg-gradient-to-r from-[#06b6d4] to-[#097cce] px-6 py-3 text-white rounded hover:brightness-110 transition"
                    >
                      SIGN UP NOW
                    </button>
                  </>
                )}
              </div>
              <div className="relative mt-auto mb-auto">
                <img
                  src="/trophy.png"
                  alt="Trophy"
                  className="trophy-img"
                />
              </div>
            </div>
          </section>
          <section className='relative h-[1000px]'>
            <div className='z-20'>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold font-bank tracking-[0.08em]">BATTLEFIELD TOURNAMENTS</h3>
                <div className='flex'>
                  <img src="/arrow-left.png" alt="Left arrow" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollBattlefield(-1200)}/>
                  <img src="/arrow-right.png" alt="Right arrow" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollBattlefield(1200)}/>
                </div>
              </div>
              <p className="text-xl mb-4 mb-2">Register to join upcoming Battlefield tournaments</p>
              <div>
                <div className='absolute left-[-150px] w-full h-full z-10 bg-gradient-to-r from-[#050f1b]/90 to-transparent bg-opacity-60'></div>
                <img src='/battlefieldXterRight.png' className='absolute h-96 top-32 left-[-200px] z-0 opacity-80'/>
                <div className="relative z-20 scrollbar-custom scrollbar-thin" style={{ minHeight: '400px' }}>
                  {renderTournaments(battlefieldTournaments, 'Battlefield', battlefieldScrollRef)}
                </div>
              </div>

              <div className="flex justify-between items-center mt-[100px] z-20 relative">
                <h3 className="text-2xl font-semibold font-bank tracking-[0.08em]">NHL TOURNAMENTS</h3>
                <div className='flex'>
                  <img src="/arrow-left.png" alt="Left arrow" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] mr-2 p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollNHL(-1200)}/>
                  <img src="/arrow-right.png" alt="Right arrow" className="w-9 h-9 rounded-md border border-[#377cca] mt-[2px] p-[2px] cursor-pointer hover:brightness-110 transition" onClick={() => scrollNHL(1200)}/>
                </div>
              </div>
              <p className="text-xl mb-4 mb-2 z-20 relative">Register to join upcoming NHL tournaments</p>
              <div>
                <img src='/nhlXterRight.png' className='absolute h-96 left-[-250px] z-0 opacity-80'/>
                <div className="relative z-20" style={{ minHeight: '400px' }}>
                  {renderTournaments(nhlTournaments, 'NHL', nhlScrollRef)}
                </div>
              </div>
            </div>
          </section>
          
          <section className='my-48 w-[100%]'>
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
                <div className="flex gap-10 scroll-smooth">
                  {pages.map((group, pageIndex) => (
                    <div
                      key={pageIndex}
                      className="min-w-full grid grid-cols-2 grid-rows-2 gap-4 pr-4"
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
                          <div className="mt-[10px]">
                            <h4 className="text-white font-bold uppercase text-sm font-bank tracking-[0.08em]">
                              {item.title}
                            </h4>
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
    </main>
  );
}