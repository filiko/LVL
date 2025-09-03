// pages/login.tsx or app/login/page.tsx
import React from 'react';

const LoginPage = () => {
  return (
    <main className='font-bahnschrift' style={{
          background: 'linear-gradient(to right, #0a1d2f, ##0b2840)'
        }}>
    <div className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] flex items-center justify-center">
      <div className="w-[360px] bg-[#0e1c33] rounded-md px-6 py-8 shadow-2xl text-white border border-[#114369]" style={{
        background: 'linear-gradient(to right, #0b2840, #0a1d2f)'
        }}>
        
        <div className="text-center mb-6">
          <img src="/footer_logo.png" alt="Level Gaming" className="mx-auto w-24" />
        </div>

        <h1 className="text-center text-2xl font-bold mb-4 font-bank mt-[41px]">LOG IN</h1>
        <p className="text-center text-sm text-white/60 mb-6 font-extralight">
          Don’t have an account?{' '}
          <a href="#" className="text-blue-400 underline">Sign up</a>
        </p>

        <div className="space-y-2 mb-4">
          <button className="w-full py-2 bg-[#5865F2] hover:bg-[#4752c4] rounded-sm text-sm font-semibold">LOG IN WITH DISCORD</button>
          <button className="w-full py-2 bg-[#9146FF] hover:bg-[#7439cc] rounded-sm text-sm font-semibold">LOG IN WITH TWITCH</button>
          <button className="w-full py-2 bg-[#1877F2] hover:bg-[#155cc1] rounded-sm text-sm font-semibold">LOG IN WITH FACEBOOK</button>
        </div>

        <div className="flex items-center my-4 mt-4 mb-4">
          <hr className="flex-1 border-gray-600" />
          <span className="mx-3 text-xs text-gray-400">OR</span>
          <hr className="flex-1 border-gray-600" />
        </div>

        <form>
        <div className="mb-3">
            <label htmlFor="email" className="block text-sm mb-1 text-white/80">Email</label>
            <input
            id="email"
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 bg-transparent focus:border-[#65bdfc] focus:outline-none border border-[#114369] rounded-sm text-sm placeholder-white/50"
            />
        </div>

        <div className="mb-4">
            <label htmlFor="password" className="block text-sm mb-1 text-white/80">Password</label>
            <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 bg-transparent focus:border-[#65bdfc] focus:outline-none border border-[#114369] rounded-sm text-sm placeholder-white/50"
            />
        </div>

        <div className="flex items-center mb-4">
        <label htmlFor="remember" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="remember" className="sr-only peer" />
            <div className="w-11 h-6 bg-transparent border border-gray-500 peer-focus:outline-none rounded peer peer-checked:bg-blue-500 transition-all duration-300"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-[#209cf5] rounded transition-all duration-300 peer-checked:translate-x-full"></div>
            <span className="ml-3 text-sm text-white/80">Remember me</span>
        </label>
        </div>

        <button
            type="submit"
            className="w-full py-2 bg-[#1a73e8] hover:bg-[#1664c4] rounded-sm text-sm font-semibold"
        style={{
          background: 'linear-gradient(to right, #65bdfc, #209cf5)'
        }}>
            LOG IN
        </button>
        </form>
        <p className="text-center text-xs text-white/40 mt-4">
          Can’t log in? <a href="#" className="text-blue-400 hover:underline">Click here</a>
        </p>
      </div>
    </div>
    </main>
  );
};

export default LoginPage;
