'use client';

import { useState } from 'react';

interface TournamentFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
  loading?: boolean;
}

const GAMES = [
  { id: 'bf2042', name: 'Battlefield 2042' },
  { id: 'nhl24', name: 'NHL 24' }
];

const MODES = [
  { value: '16v16', label: '16v16', maxPlayers: 32 },   // 16 per team
  { value: '32v32', label: '32v32', maxPlayers: 64 },   // 32 per team
  { value: '64v64', label: '64v64', maxPlayers: 128 }   // 64 per team
];

const BRACKET_TYPES = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'SWISS', label: 'Swiss System' }
];

export function TournamentForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitText = 'CREATE TOURNAMENT',
  loading = false 
}: TournamentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    game_id: 'bf2042',
    mode: '32v32',
    max_players: 64,  // Fixed: 32v32 = 64 total players (32 per team)
    start_date: '',
    end_date: '',
    region: 'EAST_COAST',
    platform: 'PC',
    language: 'English',
    bracket_type: 'SINGLE_ELIMINATION',
    prize_pool: '',
    entry_fee: '',
    description: '',
    rules: '',
    discord_channel: '',
    ...initialData
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update max_players when mode changes
      if (name === 'mode') {
        const selectedMode = MODES.find(m => m.value === value);
        if (selectedMode) {
          updated.max_players = selectedMode.maxPlayers;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string numbers to numbers
    const processedData = {
      ...formData,
      max_players: parseInt(formData.max_players.toString()),
      prize_pool: formData.prize_pool ? parseFloat(formData.prize_pool.toString()) : null,
      entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee.toString()) : null,
    };

    await onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 font-bank">BASIC INFORMATION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">TOURNAMENT TITLE *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="Enter tournament name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">GAME *</label>
            <select
              name="game_id"
              value={formData.game_id}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            >
              {GAMES.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">MODE *</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            >
              {MODES.map(mode => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">MAX PLAYERS *</label>
            <input
              type="number"
              name="max_players"
              value={formData.max_players}
              onChange={handleInputChange}
              required
              min="32"
              max="2048"
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            />
          </div>
        </div>
      </div>

      {/* Schedule & Location */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 font-bank">SCHEDULE & LOCATION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">START DATE & TIME *</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">END DATE & TIME</label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">REGION *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            >
              <option value="EAST_COAST">East Coast</option>
              <option value="WEST_COAST">West Coast</option>
              <option value="MIDWEST">Midwest</option>
              <option value="SOUTH">South</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">PLATFORM *</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            >
              <option value="PC">PC</option>
              <option value="XBOX">Xbox</option>
              <option value="PLAYSTATION">PlayStation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">LANGUAGE *</label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="e.g., English"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">BRACKET TYPE *</label>
            <select
              name="bracket_type"
              value={formData.bracket_type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            >
              {BRACKET_TYPES.map(bracket => (
                <option key={bracket.value} value={bracket.value}>{bracket.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 font-bank">FINANCIAL DETAILS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">ENTRY FEE ($)</label>
            <input
              type="number"
              name="entry_fee"
              value={formData.entry_fee}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="0.00 (leave empty for free)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">PRIZE POOL ($)</label>
            <input
              type="number"
              name="prize_pool"
              value={formData.prize_pool}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="0.00 (optional)"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 font-bank">ADDITIONAL INFORMATION</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">DESCRIPTION</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="Describe your tournament..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">RULES</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="Tournament rules and regulations..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">DISCORD CHANNEL</label>
            <input
              type="text"
              name="discord_channel"
              value={formData.discord_channel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="Discord channel link (optional)"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'PROCESSING...' : submitText}
        </button>
      </div>
    </form>
  );
}