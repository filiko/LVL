'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Header } from '@/components/shared/Header';
import { Header2 } from '@/components/shared/Header2';

type RoleKey = 'teamCaptain' | 'squadLead' | 'none';

export default function BattlefieldHome() {
  const router = useRouter();
  const scrollRef = useRef(null);

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [teamJoined, setTeamJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<{ teamCaptain: boolean; squadLead: boolean }>({
    teamCaptain: true,
    squadLead: true,
  });
  const [selectedRoles, setSelectedRoles] = useState<{ teamCaptain: boolean; squadLead: boolean; none: boolean }>({
    teamCaptain: false,
    squadLead: false,
    none: true,
  });
  const [selectedCombatRole, setSelectedCombatRole] = useState('');
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [teamId, setTeamId] = useState<any>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {

    const fetchBackendUrl = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const data = await res.json();
        if (!data.BACKEND_URL) throw new Error('Missing BACKEND_URL');
        setBackendUrl(data.BACKEND_URL);
      } catch {
        toast.error('Could not load backend configuration.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchBackendUrl();
  }, [router]);

  useEffect(() => {
    if (!backendUrl) return;
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/teams/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTeamId(data[0].id);
            setTeamJoined(true);
          }else {
            setTeamJoined(false);
          }
        }

        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (!backendUrl || !teamJoined || !teamId) return;

    fetch(`${backendUrl}/api/allteamdetails/?teamId=${teamId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw data;
        return data;
      })
      .then(data => {
        setTeamDetails(data);

        setAvailableRoles({
          teamCaptain: !data.has_team_captain,
          squadLead: data.squads.some((squad: any) => !squad.has_squad_lead),
        });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        toast.error(error.detail || 'Error fetching team details');
      });
  }, [backendUrl, teamJoined, teamId]);

  const handleJoinTeam = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/team/join/`,
        { join_code: joinCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeamJoined(true);
      sessionStorage.setItem('in_team', 'true');
      setJoinError('');
    } catch (err: any) {
      setJoinError(err.response?.data?.detail || 'Failed to join team.');
    }
  };

  const handleContinue = async () => {
    if(!selectedCombatRole)
      return;
    
    setIsSubmitting(true)

    try {
      await axios.post(`${backendUrl}/api/assign-roles/`, { is_team_captain: selectedRoles.teamCaptain, is_squad_lead: selectedRoles.squadLead, action_role: selectedCombatRole}, {
          headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Role assignment successful!');
      router.push('/battlefield');
    } catch {
      toast.error('Failed to assign roles.');
    }finally {
      setIsSubmitting(false)
    }
  };

  const toggleLeadershipRole = (role: RoleKey) => {
    let updated = { ...selectedRoles };

    if (role === 'none') {
      updated = { teamCaptain: false, squadLead: false, none: true };
    } else {
      updated[role] = !updated[role];
      updated.none = !updated.teamCaptain && !updated.squadLead;
    }

    setSelectedRoles(updated);
  };

  const combatRoles = ['INFANTRY', 'ARMOR', 'HELI', 'JET'];

  return (
    <div className="hero-gradient text-white relative bg-[#08182a] overflow-x-hidden font-bahnschrift min-h-screen">
      <img src="/player.png" alt="Players" className="fixed top-20 right-0 w-[200px] h-auto z-0 pointer-events-none players-img" />
      <Header />
      <Header2 />

      <div className="relative z-20">
        <div className="flex-1 bg-gradient-to-r from-[#061526] to-[#0b1f30]/70 min-h-screen">
          <div className="pt-[48px] bg-gradient-to-r from-[#08182a] to-[#0a3152]/10 h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-16 w-16 border-t-2 border-b-2 border-blue-500 rounded-full" />
              </div>
            ) : !teamJoined ? (
              <div className="flex justify-center mt-20 h-full overflow-hidden h-full">
                <div className="bg-gradient-to-r from-[#0d2b4b] to-[#081d31] p-6 rounded-md w-[400px] shadow-xl">
                  <h2 className="text-2xl font-bank mb-4 text-center">ENTER TEAM CODE</h2>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="TEAM JOIN CODE"
                    className="w-full px-4 py-2 mb-2 rounded bg-[#081d31] border border-gray-600 text-white placeholder-gray-400"
                  />
                  {joinError && <p className="text-red-500 text-sm mb-2">{joinError}</p>}
                  <button
                    onClick={handleJoinTeam}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2"
                  >
                    JOIN TEAM
                  </button>
                </div>
              </div>
            ) : (
              <>
                <section className="text-center mt-24">
                  <h1 className="text-4xl font-bank mb-8">SELECT YOUR ROLE</h1>
                  <div className="flex justify-center gap-8">
                    {combatRoles.map(role => (
                      <div
                        key={role}
                        onClick={() => setSelectedCombatRole(role)}
                        className={`cursor-pointer p-[2px] bg-gradient-to-b from-[#15507e] to-transparent rounded transition-transform ${
                          selectedCombatRole === role ? 'brightness-110 bg-[#145e95]' : 'hover:brightness-110'
                        }`}
                      >
                        <div className="w-64 h-80 p-4 bg-gradient-to-r from-[#0b243c] via-[#0b2137] to-[#0a1b2f] rounded">
                          <h5 className="text-2xl font-bank mb-4 mt-4">{role}</h5>
                          <img
                            src={`/${role.toLowerCase()}.png`}
                            alt={role}
                            className="mx-auto mt-10 w-36 h-36 object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="text-center mt-16 py-10">
                  <h1 className="text-4xl font-bank mb-10">INTERESTED IN LEADING?</h1>
                  <div className="flex justify-center gap-6">
                    {[
                      { label: 'TEAM CAPTAIN', key: 'teamCaptain' },
                      { label: 'SQUAD LEAD', key: 'squadLead' },
                      { label: 'NONE', key: 'none' },
                    ].map(({ label, key }) => {
                      const disabled =
                        (key === 'teamCaptain' && !availableRoles.teamCaptain) ||
                        (key === 'squadLead' && !availableRoles.squadLead);
                      const checked = selectedRoles[key as RoleKey];

                      return (
                        <div
                          key={key}
                          className={`w-64 h-48 border border-[#145e95] rounded-md bg-gradient-to-b from-[#092034] to-[#081724] flex flex-col items-center justify-center shadow-lg`}
                        >
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={checked}
                              onChange={() => toggleLeadershipRole(key as RoleKey)}
                              disabled={disabled}
                            />
                            <div className={`w-11 h-6 bg-transparent border border-[#145e95] peer-focus:outline-none rounded-md peer peer-checked:bg-blue-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-md transition-transform peer-checked:translate-x-full ${disabled ? 'opacity-50' : ''}`}></div>
                          </label>
                          <div className="mt-2 font-bank text-xl text-white">{label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center mt-12">
                    <button
                      onClick={handleContinue}
                      disabled={isSubmitting}
                      className="w-80 py-3 rounded bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
                    >
                      {isSubmitting ? (
                        <span className="loader border-white border-t-transparent rounded-full border-2 w-5 h-5 animate-spin" />
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}