"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamName, setTeamName] = useState('');

  const countryOptions = [
    ["Afghanistan", "af"], ["Albania", "al"], ["Algeria", "dz"], ["Andorra", "ad"],
    ["Angola", "ao"], ["Argentina", "ar"], ["Australia", "au"], ["Austria", "at"],
    ["Belgium", "be"], ["Brazil", "br"], ["Canada", "ca"], ["China", "cn"],
    ["Denmark", "dk"], ["France", "fr"], ["Germany", "de"], ["India", "in"],
    ["Italy", "it"], ["Japan", "jp"], ["Mexico", "mx"], ["Netherlands", "nl"],
    ["Norway", "no"], ["Poland", "pl"], ["Russia", "ru"], ["Spain", "es"],
    ["Sweden", "se"], ["Switzerland", "ch"], ["United Kingdom", "gb"], ["United States", "us"]
  ];

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const data = await res.json();
        setBackendUrl(data.BACKEND_URL);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };

    setAccessToken(localStorage.getItem('access_token'));
    fetchConfig();
  }, []);

  const handleAccountTypeUpdate = async () => {
    if (!backendUrl || !accessToken || !accountType) {
      toast.error("Please select an account type");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.patch(
        `${backendUrl}/api/player/account-type/`,
        { is_team_lead: accountType === 'team_lead' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Account type updated");
    } catch (error) {
      toast.error("Failed to update account type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationUpdate = async () => {
    if (!backendUrl || !accessToken || !countryCode) {
      toast.error("Please select a location");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.patch(
        `${backendUrl}/api/player/country-code/`,
        { country_code: countryCode },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Location updated");
    } catch (error) {
      toast.error("Failed to update location");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamCreate = async () => {
    if (!backendUrl || !accessToken || !teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/teams/`,
        { name: teamName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success(`Team created! Code: ${res.data.code}`);
      setTeamName('');
    } catch (error) {
      toast.error("Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-bank">User Settings</h1>
        
        <div className="space-y-8">
          {/* Account Type Section */}
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h2 className="text-xl font-semibold mb-4">Account Type</h2>
            <div className="space-y-4">
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300"
              >
                <option value="">-- Select account type --</option>
                <option value="team_lead">Team Lead</option>
                <option value="player">Player</option>
              </select>
              <button
                onClick={handleAccountTypeUpdate}
                disabled={isSubmitting}
                className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                Update Account Type
              </button>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300"
              >
                <option value="">-- Select your location --</option>
                {countryOptions.map(([name, code]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleLocationUpdate}
                disabled={isSubmitting}
                className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                Update Location
              </button>
            </div>
          </div>

          {/* Team Creation Section */}
          <div className="bg-[#0e1c33] rounded-lg p-6 border border-[#114369]">
            <h2 className="text-xl font-semibold mb-4">Create Team</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300"
              />
              <button
                onClick={handleTeamCreate}
                disabled={isSubmitting}
                className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;