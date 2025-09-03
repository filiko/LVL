"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

const AuthButton = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuthState();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="flex items-center space-x-4">
        
        {/* User Avatar & Info */}
        <div className="flex items-center space-x-2">
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            alt={profile.username}
            className="w-8 h-8 rounded-full border-2 border-gray-600"
          />
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-white">
              {profile.username}
            </div>
            <div className="text-xs text-gray-400">
              {profile.tier}
            </div>
          </div>
        </div>

        {/* User Menu Dropdown */}
        <div className="relative group">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-[#0e1c33] border border-[#114369] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              
              {/* Profile Link */}
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2f4a] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </div>
              </button>

              {/* Settings Link */}
              <button
                onClick={() => router.push('/settings')}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2f4a] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </div>
              </button>

              {/* My Teams Link */}
              <button
                onClick={() => router.push('/battlefield/teams')}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2f4a] hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>My Teams</span>
                </div>
              </button>

              {/* Team Lead Dashboard (if team lead or admin) */}
              {(profile.is_team_lead || profile.is_admin) && (
                <button
                  onClick={() => router.push('/team-lead/dashboard')}
                  className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-[#1a2f4a] hover:text-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Team Lead Dashboard</span>
                  </div>
                </button>
              )}

              {/* Admin Panel (if admin) */}
              {profile.is_admin && (
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-[#1a2f4a] hover:text-yellow-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Admin Panel</span>
                  </div>
                </button>
              )}

              <div className="border-t border-gray-600 my-2"></div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1a2f4a] hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSignIn}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Sign In
      </button>
    </div>
  );
};

export default AuthButton;