'use client';

import { useState } from 'react';

interface TeamFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
  loading?: boolean;
}

export function TeamForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitText = 'CREATE TEAM',
  loading = false 
}: TeamFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    is_recruiting: true,
    ...initialData
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      return;
    }
    
    const processedData = {
      ...formData,
      name: formData.name.trim(),
      tag: formData.tag.trim() || null,
      description: formData.description.trim() || null,
    };

    await onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 font-bank">BASIC INFORMATION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">TEAM NAME *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength={50}
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="Enter your team name"
            />
            <p className="text-xs text-gray-400 mt-1">
              Choose a unique name that represents your team's identity
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">TEAM TAG</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleInputChange}
              maxLength={6}
              className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
              placeholder="e.g., ALPHA"
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional 2-6 character abbreviation
            </p>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_recruiting"
                checked={formData.is_recruiting}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#377cca] bg-[#12436c] border-[#377cca] rounded focus:ring-[#377cca] focus:ring-2"
              />
              <div>
                <span className="text-sm font-semibold text-gray-300">OPEN FOR RECRUITMENT</span>
                <p className="text-xs text-gray-400">
                  Allow new players to join your team
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Team Description */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 font-bank">TEAM DESCRIPTION</h3>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">ABOUT YOUR TEAM</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            maxLength={500}
            className="w-full px-3 py-2 bg-[#12436c] border border-[#377cca] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#377cca]"
            placeholder="Describe your team's playstyle, goals, requirements, and what kind of players you're looking for..."
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-400">
              Tell potential members what makes your team unique
            </p>
            <span className="text-xs text-gray-500">
              {formData.description.length}/500
            </span>
          </div>
        </div>
      </div>

      {/* Team Guidelines */}
      <div className="p-6 bg-gradient-to-r from-[#0e3250] to-[#0a3152]/10 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 font-bank">TEAM GUIDELINES</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-[#3791dd] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p>As team captain, you'll have full management rights over your team</p>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-[#3791dd] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p>You can organize members into military-style squads (Alpha, Bravo, etc.)</p>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-[#3791dd] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p>Assign specific roles like Infantry, Armor, Heli, Jet, and Support</p>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-[#3791dd] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p>Register your team for tournaments and competitive matches</p>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-[#3791dd] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p>A unique join code will be generated for easy recruitment</p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-[#377cca] rounded hover:bg-[#377cca]/20 transition"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="px-8 py-2 bg-gradient-to-r from-[#06B6D4] to-[#097CCE] rounded hover:brightness-110 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'PROCESSING...' : submitText}
        </button>
      </div>
    </form>
  );
}