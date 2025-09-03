'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/teams', label: 'Teams', icon: '🛡️' },
  { href: '/admin/matches', label: 'Matches', icon: '⚔️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <main className="hero-gradient min-h-screen text-white relative bg-[#08182a] font-bahnschrift">
      <img
        src="/player.png"
        alt="Players"
        className="fixed top-20 right-0 w-[200px] h-[auto] z-0 pointer-events-none"
      />
      <Header />
      <Header2 />
      
      <div className="relative z-10">
        <div className="flex-1 bg-gradient-to-r from-[#061526] to-[#0b1f30]/70 pl-[158px] pr-[158px]">
          <div className="pt-[48px] bg-gradient-to-r from-[#08182a] to-[#0a3152]/10">
            
            {/* Admin Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-2">
                    ADMIN PANEL
                  </h1>
                  <p className="text-gray-300 text-lg">Platform Management & Controls</p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] rounded font-semibold">
                  🛡️ ADMIN ACCESS
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              {/* Sidebar Navigation */}
              <div className="w-64 flex-shrink-0">
                <nav className="space-y-2">
                  {adminNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                          isActive
                            ? 'bg-gradient-to-r from-[#06B6D4] to-[#097CCE] text-white font-semibold'
                            : 'bg-[#12436c] hover:bg-[#377cca]/30 text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                
                {/* Quick Actions */}
                <div className="mt-8 p-4 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">QUICK ACTIONS</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm bg-[#12436c] hover:bg-[#377cca]/30 rounded transition">
                      Create Tournament
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-[#12436c] hover:bg-[#377cca]/30 rounded transition">
                      Ban User
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-[#12436c] hover:bg-[#377cca]/30 rounded transition">
                      System Announcement
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-h-[600px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}