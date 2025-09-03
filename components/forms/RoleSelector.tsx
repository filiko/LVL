'use client';

import { useState } from 'react';

const ROLES = [
  { value: 'INFANTRY', label: 'Infantry', icon: '/infantry2.png', description: 'Primary ground forces' },
  { value: 'ARMOR', label: 'Armor', icon: '/armour2.png', description: 'Tank specialists' },
  { value: 'HELI', label: 'Helicopter', icon: '/heli.png', description: 'Air support and transport' },
  { value: 'JET', label: 'Jet', icon: '/jet.png', description: 'Air superiority' },
  { value: 'SUPPORT', label: 'Support', icon: '/infantry2.png', description: 'Logistics and medical' }
];

const SQUADS = [
  'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'
];

interface RoleSelectorProps {
  selectedRole: string;
  selectedSquad?: string;
  onRoleChange: (role: string) => void;
  onSquadChange?: (squad: string) => void;
  showSquads?: boolean;
  disabled?: boolean;
}

export function RoleSelector({ 
  selectedRole, 
  selectedSquad, 
  onRoleChange, 
  onSquadChange, 
  showSquads = false,
  disabled = false 
}: RoleSelectorProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">SELECT YOUR ROLE</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROLES.map((role) => (
            <div key={role.value} className="relative">
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onRoleChange(role.value);
                  setExpandedRole(expandedRole === role.value ? null : role.value);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === role.value
                    ? 'border-[#377cca] bg-[#377cca]/20 text-white'
                    : 'border-gray-600 bg-[#12436c] text-gray-300 hover:border-[#377cca]/50 hover:bg-[#377cca]/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={role.icon} 
                    alt={role.label} 
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-semibold">{role.label}</div>
                    <div className="text-xs opacity-80">{role.description}</div>
                  </div>
                  {selectedRole === role.value && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-[#377cca]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {showSquads && onSquadChange && (
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">SELECT SQUAD (OPTIONAL)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SQUADS.map((squad) => (
              <button
                key={squad}
                type="button"
                disabled={disabled}
                onClick={() => onSquadChange(selectedSquad === squad ? '' : squad)}
                className={`p-2 rounded border text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedSquad === squad
                    ? 'border-[#377cca] bg-[#377cca] text-white'
                    : 'border-gray-600 bg-[#12436c] text-gray-300 hover:border-[#377cca]/50 hover:bg-[#377cca]/10'
                }`}
              >
                {squad}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Squad assignment can be changed later by team captains
          </p>
        </div>
      )}
    </div>
  );
}