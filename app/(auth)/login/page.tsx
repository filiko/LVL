"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const redirectTo = searchParams.get('redirect') || '/battlefield';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      setError(errorParam);
      toast.error(errorParam);
    }
  }, [errorParam]);

  const handleOAuthLogin = async (provider: 'discord' | 'google') => {
    try {
      setLoading(true);
      setError(null);
      
      await authClient.signInWithOAuth(provider);
      
      // OAuth will redirect automatically, so we don't need to handle success here
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-bank mb-2">
            Welcome to LevelGG
          </h1>
          <p className="text-gray-300">
            Join the ultimate competitive gaming platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0e1c33] rounded-lg border border-[#114369] p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">Sign In</h2>
            <p className="text-gray-400">Choose your preferred login method</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-4">
            
            {/* Discord Login */}
            <button
              onClick={() => handleOAuthLogin('discord')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="font-semibold text-white">
                {loading ? 'Connecting...' : 'Continue with Discord'}
              </span>
            </button>

            {/* Google Login */}
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-semibold text-gray-700">
                {loading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0e1c33] text-gray-400">
                  New to LevelGG?
                </span>
              </div>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              First time here?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Tournament Info */}
          <div className="mt-8 p-4 bg-[#041529] rounded-lg border border-[#114369]">
            <div className="text-center">
              <div className="text-2xl mb-2">🎮</div>
              <h3 className="font-semibold text-white mb-1">Ready for Battle?</h3>
              <p className="text-sm text-gray-400">
                Join 32v32 tournaments, lead your team, and dominate the battlefield
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;