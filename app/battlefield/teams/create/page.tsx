'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';
import { TeamForm } from '@/components/teams/TeamForm';
import { teamDb } from '@/lib/database/teams';
import { useAuthState } from '@/lib/auth';
import { toast } from 'react-toastify';

export default function CreateTeamPage() {
  const router = useRouter();
  const { user, profile } = useAuthState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user]);

  const handleCreateTeam = async (teamData: any) => {
    if (!user) return;

    try {
      setLoading(true);
      const team = await teamDb.createTeam(user.id, teamData);
      toast.success('Team created successfully!');
      router.push(`/battlefield/teams/${team.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/battlefield/teams');
  };

  if (!user) {
    return null; // Will redirect to login
  }

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
            
            <div className="mb-8">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-300 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Teams
              </button>
              <h1 className="text-4xl font-bold font-bank tracking-[0.08em] mb-2">CREATE TEAM</h1>
              <p className="text-gray-300 text-lg">Start building your competitive squad</p>
            </div>

            <TeamForm
              onSubmit={handleCreateTeam}
              onCancel={handleCancel}
              submitText="CREATE TEAM"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}