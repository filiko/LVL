'use client';
import { useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const canvasRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navItems = [
    { label: 'Home', href: '/home' },
    { label: 'Games', href: '/battlefield' },
    { label: 'About', href: '/about' },
  ];

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    console.log(accessToken)
    if (accessToken) {
      setIsAuthenticated(true);
    }
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
      if (!ctx) return
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

  return (
    <main className="hero-gradient min-h-screen text-white relative overflow-hidden font-bahnschrift">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      <div className='flex justify-center'>
        <div className='absolute mr-[-650px] mt-[100px]'>
          <img
            src="/players.png"
            alt="Players"
            className=" w-[800px] z-10 pointer-events-none"
          />
        </div>
      </div>

      <div
        className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #040D18, #0e2639)',
          opacity: 0.9,
        }}
      />
      <div className="relative z-30">
        <header className="flex justify-between items-center h-[62px] bg-[#182d3e] pl-[24px] pr-[24px]">
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
                const isActive = false

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

          <div className="ml-[-73px] relative w-[275px] h-[37px] border border-white/30 rounded-sm flex items-center px-3 py-2 bg-transparent">
            <img src="/searchGlass.svg" alt="search icon" className="h-4 w-4" />
            <input
              id="search"
              type="text"
              placeholder="Search tournaments"
              className="w-full pl-3 bg-transparent border-none focus:outline-none text-sm placeholder-white/50"
            />
          </div>
          {!isAuthenticated ? (
            <>
              <div className="flex space-x-4">
                <Link href="/login" passHref>
                  <button className="h-10 px-2 py-1 border border-[#0281d6] text-[#0281d6] rounded hover:brightness-110 hover:text-[#0281d6] transition text-sm mt-2 mb-2">
                    LOG IN
                  </button>
                </Link>
                <Link href="/signup" passHref>
                <button
                  className="h-10 bg-gradient-to-r from-[#06b6d4] to-[#097cce] px-4 py-2 text-white rounded hover:brightness-110 transition text-sm mt-2"
                >
                  SIGN UP NOW
                </button>
                </Link>
              </div>
              </>
          ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  setIsAuthenticated(false);
                  router.push('/login');
                }}
                className="px-4 py-2 border border-[#0281d6] text-[#0281d6] rounded hover:brightness-110 transition text-sm"
              >
                LOG OUT
              </button>
            )}
        </header>
        <div className='mx-[158px]'>
          <section className="py-36 relative">
            <div className="flex gap-56 flex-col md:flex-row items-center justify-center">
              <div className="max-w-2xl mb-10 mt-auto mb-auto">
                <h2 className="text-4xl md:text-5xl font-bold leading-snug mb-4 font-bank tracking-[0.08em]">
                  HOME OF YOUR TOP <br />
                  <span style={{ color: '#9cd4fd' }}>TOURNAMENTS IN</span> <br />
                  <span style={{ color: '#3daffb' }}>GAMING</span>
                </h2>
                <p className="text-gray-300 mb-6">
                  Sign up now and jump into tournaments and help lead your teams to
                  victory in a handful of different game modes across Battlefield and NHL.
                </p>
                <button
                  className="bg-gradient-to-r bg-gradient-to-r from-[#06b6d4] to-[#097cce] px-6 py-3 text-white rounded hover:brightness-110 transition"
                >
                  SIGN UP NOW
                </button>
              </div>
              <div className="relative">
                <img
                  src="trophy.png"
                  alt="Trophy"
                  className="trophy-img w-[300px]"
                />
              </div>
            </div>
          </section>

          <section className="text-center py-20 w-full">
            <h3 className="text-3xl md:text-4xl font-semibold mb-8 font-bank tracking-[0.08em]">
              <span style={{ color: '#a4bce5' }}>YOUR FAVOURITE GAMES</span><br />
            </h3>
            <div className="relative z-10">
              <div className="absolute left-[-50px] top-0 h-full w-[150px] bg-gradient-to-r from-[#040f1b] to-transparent z-20 pointer-events-none"></div>
              <div className="absolute right-[-50px] top-0 h-full w-[200px] bg-gradient-to-l from-[#0e2d47] to-transparent z-20 pointer-events-none"></div>

              <div className="justify-center flex z-10 relative">
                <img src="/counterStrike.png" alt="Trophy" className="fav-games-img" />
                <img src="/apex.png" alt="Trophy" className="fav-games-img" />
                <img src="/nhl.png" alt="Trophy" className="fav-games-img" />
                <img src="/battlefield.png" alt="Trophy" className="fav-games-img" />
                <img src="/valorant.png" alt="Trophy" className="fav-games-img" />
                <img src="/fifa.png" alt="Trophy" className="fav-games-img" />
              </div>
            </div>

            <p className="text-gray-400 mt-8">And much more games to be added soon...</p>

            <div className="flex justify-center mt-[100px] gap-48">
              <div className='flex bg-blue'>
                <div className='mr-[10px]'>
                  <div
                    className="p-[2px] bg-gradient-to-b from-[#314d65] via-transparent to-transparent rounded-xl w-[200px] h-[120px] cursor-pointer"
                    onClick={() => window.location.href = '/battlefield'}
                  >
                    <div className="bg-[#0f172a] rounded-xl overflow-hidden w-full h-full flex items-center justify-center border border-gray-700 shadow-md bf-cont relative">
                      <div
                        className='h-full w-full z-0'
                        style={{
                          background: 'linear-gradient(to bottom, #0b192c, #0e2639)',
                          opacity: 0.7,
                        }}
                      ></div>
                      <img src="/bfLogo.png" alt="Battlefield" className="h-8 bfLogo z-10 absolute" />
                    </div>
                  </div>
                  <div className="p-[2px] bg-gradient-to-b mt-[20px] from-[#314d65] via-transparent to-transparent rounded-xl w-[200px] h-[120px] cursor-pointer">
                    <div className="bg-[#0f172a] rounded-xl overflow-hidden w-full h-full flex items-center justify-center border border-gray-700 shadow-md bf-cont relative">
                      <div
                        className='h-full w-full z-0'
                        style={{
                          background: 'linear-gradient(to bottom, #0b192c, #0e2639)',
                          opacity: 0.7,
                        }}
                      ></div>
                      <img src="/eSHLogo.png" alt="Battlefield" className="h-12 bfLogo z-10 absolute" />
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    className="p-[2px] bg-gradient-to-b from-[#314d65] via-transparent to-transparent rounded-xl w-[200px] h-[120px] cursor-pointer"
                    onClick={() => window.location.href = '/battlefield'}
                  >
                    <div className="bg-[#0f172a] rounded-xl overflow-hidden w-full h-full flex items-center justify-center border border-gray-700 shadow-md bf-cont relative">
                      <div
                        className='h-full w-full z-0'
                        style={{
                          background: 'linear-gradient(to bottom, #0b192c, #0e2639)',
                          opacity: 0.7,
                        }}
                      ></div>
                      <img src="/eSHLogo.png" alt="Battlefield" className="h-12 bfLogo z-10 absolute" />
                    </div>
                  </div>
                  <div className="p-[2px] bg-gradient-to-b mt-[20px] from-[#314d65] via-transparent to-transparent rounded-xl w-[200px] h-[120px] cursor-pointer">
                    <div className="bg-[#0f172a] rounded-xl overflow-hidden w-full h-full flex items-center justify-center border border-gray-700 shadow-md bf-cont relative">
                      <div
                        className='h-full w-full z-0'
                        style={{
                          background: 'linear-gradient(to bottom, #0b192c, #0e2639)',
                          opacity: 0.7,
                        }}
                      ></div>
                      <img src="/bfLogo.png" alt="Battlefield" className="h-8 bfLogo z-10 absolute" />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-auto mb-auto w-[500px]'>
                <h3 className="text-3xl md:text-4xl font-semibold mb-8 font-bank text-left tracking-[0.08em]">
                  <span style={{ color: '#a4bce5' }}>ALL THE POPULAR</span><br />
                  <span className='text-white'>LEAGUES</span><br />
                </h3>
                <p className='text-left'>
                  Keep track of you and your teams performance with. Keep track of you and your teams performance with live, high level stats dashboards
                </p>
                <h3 className="text-left mt-2">
                  <button
                    className="bg-gradient-to-r from-[#06b6d4] to-[#097cce] px-4 py-2 text-white rounded hover:brightness-110 transition text-sm mt-4"
                  >
                    REGISTER NOW
                  </button>
                </h3>
              </div>
            </div>
          </section>
          
          <section className="text-left py-20">
            <div className="flex gap-4 flex-wrap justify-center">
              <div className='w-[500px] mt-auto mb-auto'>
                <h4 className="text-2xl md:text-3xl font-bold mb-4 font-bank tracking-[0.08em]">
                    <span style={{color: '#a4bce5'}}>REAL TIME</span>
                    <br /><span className="text-white" >STATS</span>
                  </h4>
                  <p className="text-gray-300 max-w-xl">
                    <span>Keep track of you and your teams performance</span><br/>
                    <span>with live, high level stats dashboards.</span>
                  </p>
              </div>
              <div className='p-[1px] pb-[0px] bg-gradient-to-b from-[#155c91] to-transparent w-[500px] rounded-xl'>
                    <div className="h-80 bg-gradient-to-b from-[#0a2438] to-transparent rounded-xl"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}