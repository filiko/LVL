'use client';
import { useEffect, useRef } from 'react';

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
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
    <main className="hero-gradient min-h-screen text-white px-[100px] relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      <img
        src="players.png"
        alt="Players"
        className="fixed top-20 right-0 w-[600px] z-10 pointer-events-none players-img"
      />
      <div
        className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #0b192c, #0e2639)',
          opacity: 0.85,
        }}
      />
      <div className="relative z-30">
        <header className="flex justify-between items-center py-6">
          <div className="flex flex-col items-center">
            <img src="icon1.png" alt="Logo" className="custom-logo" />
            <span className="mt-1 text-white font-semibold font-bank" style={{ fontSize: '6px' }}>LEVEL GAMING</span>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 border border-[#0281d6] text-[#0281d6] rounded hover:brightness-110 hover:text-[#0281d6] transition">
              LOG IN
            </button>
            <button
              className="bg-gradient-to-r from-[#46a7d4] to-[#377cca] px-6 py-3 text-white rounded hover:brightness-110 transition"
            >
              SIGN UP NOW
            </button>
          </div>
        </header>

        <section className="py-24 relative">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-2xl mb-10 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold leading-snug mb-4 font-bank">
                HOME OF YOUR TOP <br />
                <span style={{ color: '#9cd4fd' }}>TOURNAMENTS IN</span> <br />
                <span style={{ color: '#3daffb' }}>GAMING</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Sign up now and jump into tournaments and help lead your teams to
                victory in a handful of different game modes across Battlefield and NHL.
              </p>
              <button
                className="bg-gradient-to-r bg-gradient-to-r from-[#46a7d4] to-[#377cca] px-6 py-3 text-white rounded hover:brightness-110 transition"
              >
                SIGN UP NOW
              </button>
            </div>
            <div className="relative">
              <img
                src="trophy.png"
                alt="Trophy"
                className="trophy-img"
              />
            </div>
          </div>
        </section>

        <section className="text-center py-20">
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 font-bank">
            <span style={{color: '#a4bce5'}}>HAND CRAFTED, HIGH STAKE </span><br/>
            <span>TOURNAMENTS</span>
          </h3>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="p-[2px] bg-gradient-to-b from-[#314d65] via-transparent to-transparent rounded-lg w-60 h-40">
              <div className="bg-[#0f172a] rounded-lg overflow-hidden w-full h-full flex items-center justify-center border border-gray-700 shadow-md bf-cont relative">
                <div className='h-full w-full z-0' style={{
                  background: 'linear-gradient(to bottom, #0b192c, #0e2639)',
                  opacity: 0.7,
                }}></div>
                <img src="/bfLogo.png" alt="Battlefield" className="h-12 bfLogo z-10 absolute" />
              </div>
            </div>
            <div className="p-[2px] bg-gradient-to-b from-[#314d65] via-transparent to-transparent rounded-lg w-60 h-40">
              <div className="bg-[#0f172a] rounded-lg overflow-hidden w-full h-full flex items-center justify-center border border-gray-700 shadow-md bf-cont relative">
                <div className='h-full w-full z-0' style={{
                  background: 'linear-gradient(to bottom, #0b192c, #0e2639)',
                  opacity: 0.7,
                }}></div>
                <img src="/eSHLogo.png" alt="Battlefield" className="bfLogo z-10 absolute" />
              </div>
            </div>
          </div>
          <p className="text-gray-400 mt-6">And much more games to be added soon...</p>
        </section>

        <section className="text-left py-20">
          <div className="flex gap-8 flex-wrap">
            <div>
               <h4 className="text-2xl md:text-3xl font-bold mb-4 font-bank">
                  <span style={{color: '#a4bce5'}}>REAL TIME</span>
                  <br /><span className="text-white" >STATS</span>
                </h4>
                <p className="text-gray-300 max-w-xl">
                  Keep track of you and your teams performance with live, high level stats dashboards.
                </p>
            </div>
            <div className="h-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-xl border border-gray-700" style={{width: 600,}}></div>
          </div>
        </section>
      </div>
    </main>
  );
}