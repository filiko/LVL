"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const Create32v32League = () => {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    max_players: 64, // Default for 32v32 (32 per team, 2 teams max)
    mode: '32v32',
    region: 'NA',
    level: 'ALL',
    platform: 'PC',
    start_date: '',
    language: 'English',
    tournament_type: 'League',
    bracket_type: 'ROUND_ROBIN',
    game: 'BATTLEFIELD'
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!backendUrl || !accessToken) {
      toast.error("Configuration not loaded");
      return;
    }

    if (!formData.title || !formData.start_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/tournaments/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success("32v32 League created successfully!");
      router.push('/admin');
    } catch (error: any) {
      console.error('Error creating league:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Failed to create league';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.push('/admin')}
            className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
          >
            ← Back to Admin
          </button>
          <h1 className="text-4xl font-bold font-bank">Create 32v32 League</h1>
        </div>

        <div className="bg-[#0e1c33] rounded-lg p-8 border border-[#114369]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tournament Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold mb-2">
                League Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Winter 32v32 Battlefield League"
                className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-lg font-semibold mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Max Players */}
              <div>
                <label htmlFor="max_players" className="block text-lg font-semibold mb-2">
                  Max Players
                </label>
                <input
                  type="number"
                  id="max_players"
                  name="max_players"
                  value={formData.max_players}
                  onChange={handleInputChange}
                  min="32"
                  max="1024"
                  className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Region */}
              <div>
                <label htmlFor="region" className="block text-lg font-semibold mb-2">
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="NA">North America</option>
                  <option value="EU">Europe</option>
                  <option value="ASIA">Asia</option>
                  <option value="OCE">Oceania</option>
                </select>
              </div>

              {/* Platform */}
              <div>
                <label htmlFor="platform" className="block text-lg font-semibold mb-2">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="PC">PC</option>
                  <option value="XBOX">Xbox</option>
                  <option value="PS">PlayStation</option>
                  <option value="MOBILE">Mobile</option>
                  <option value="CROSS">Cross-Platform</option>
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label htmlFor="level" className="block text-lg font-semibold mb-2">
                  Skill Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-lg font-semibold mb-2">
                  Language
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  placeholder="e.g., English, Spanish, etc."
                  className="w-full p-3 rounded bg-[#0d2645] text-white border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* League Configuration Info */}
            <div className="bg-[#0a1a2e] rounded-lg p-6 border border-[#1e3a5f]">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">League Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-gray-300">Mode:</strong>
                  <p className="text-white">32v32 Large Scale Warfare</p>
                </div>
                <div>
                  <strong className="text-gray-300">Format:</strong>
                  <p className="text-white">Round Robin League</p>
                </div>
                <div>
                  <strong className="text-gray-300">Squad Limits:</strong>
                  <p className="text-white">6-8 Squads per Team</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-3 rounded bg-gray-600 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded bg-green-600 hover:bg-green-700 transition disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="loader border-white border-t-transparent rounded-full border-2 w-5 h-5 animate-spin mr-2" />
                    Creating League...
                  </>
                ) : (
                  'Create 32v32 League'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Create32v32League;