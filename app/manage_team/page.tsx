'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header3 } from '@/components/shared/Header3';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

interface Player {
  id: number;
  username: string;
  email: string;
  tier: string;
  is_online: boolean;
}

interface Team {
  id: number;
  name: string;
  lead_player: number;
  tier: string;
  join_code: string;
}

interface TeamMember {
  id: number;
  player: Player;
  role: 'MEMBER' | 'CO_LEAD' | 'CAPTAIN';
}

interface Tournament {
  id: number;
  title: string;
  game: string;
  start_date: string;
  max_players: number;
  registered_players: number;
  level: string;
  mode: '16v16' | '32v32' | '64v64';
  is_active: boolean;
  is_started: boolean;
  is_completed: boolean;
}

interface TournamentRegistration {
  id: number;
  tournament: Tournament;
  team: Team;
  registered_at: string;
}

interface Squad {
  id: number;
  squad_type: string;
  participant: {
    id: number;
  };
  tournament_id: number;
  tournament_name: string;
}

interface SquadMember {
  id: number;
  player: Player;
  squad: Squad;
  role: 'CAPTAIN' | 'LEADER' | 'NONE';
}

const SQUAD_TYPES = [
  'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 
  'ECHO', 'FOXTROT', 'GOLF', 'HOTEL', 
  'INDIA', 'JULIET'
];

const TeamManagementPage: React.FC = () => {
  const [teamId, setTeamId] = useState<string | null>(null);
  const router = useRouter();
  
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);
  const [registeredTournaments, setRegisteredTournaments] = useState<TournamentRegistration[]>([]);
  const [registeringTournament, setRegisteringTournament] = useState<number | null>(null);
  
  const [tournamentTeams, setTournamentTeams] = useState<any[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([]);
  
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'MEMBER' | 'CO_LEAD' | 'CAPTAIN'>('MEMBER');
  const [createSquadModalOpen, setCreateSquadModalOpen] = useState(false);
  const [newSquadType, setNewSquadType] = useState(SQUAD_TYPES[0]);
  const [newSquadParticipant, setNewSquadParticipant] = useState<number | ''>('');
  const [addSquadMemberModalOpen, setAddSquadMemberModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<number | null>(null);
  const [newSquadMemberPlayer, setNewSquadMemberPlayer] = useState<number | ''>('');
  const [newSquadMemberRole, setNewSquadMemberRole] = useState<'CAPTAIN' | 'LEADER' | 'NONE'>('NONE');
  const [squadCreationError, setSquadCreationError] = useState<string | null>(null);
  const [selectedSquadMembers, setSelectedSquadMembers] = useState<any[]>([]);
  const [viewMembersModalOpen, setViewMembersModalOpen] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('team_id');
    setTeamId(id);
  }, []);

  useEffect(() => {
    const fetchBackendUrl = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const data = await res.json();
        if (!data.BACKEND_URL) throw new Error("Missing BACKEND_URL");
        setBackendUrl(data.BACKEND_URL);
      } catch (error) {
        toast.error('Could not load backend configuration.');
        router.push('/login');
      }
    };

    fetchBackendUrl();
  }, [router]);

  const handleRemoveMember = async (memberId: number) => {
    try {
      if (!teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `${backendUrl}/api/teams/${teamId}/remove_member/`,
        {
          data: { member_id: memberId },
          headers,
        }
      );

      setMembers(prevMembers =>
        prevMembers.filter(member => member.id !== memberId)
      );

      toast.success("Member removed successfully");

    } catch (error) {
      toast.error("Failed to remove member");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!backendUrl || !teamId) return;
    
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        
        const [
          teamRes, 
          membersRes, 
          tournamentsRes, 
          registeredRes,
          tournamentTeamsRes,
          squadsRes,
          squadMembersRes
        ] = await Promise.all([
          axios.get(`${backendUrl}/api/teams/${teamId}/`, { headers }),
          axios.get(`${backendUrl}/api/teams/${teamId}/members/`, { headers }),
          axios.get(`${backendUrl}/api/tournaments/available/`, { headers }),
          axios.get(`${backendUrl}/api/tournaments/registered/`, { 
            headers,
            params: { team_id: teamId }
          }),
          axios.get(`${backendUrl}/api/tournament-teams/`, {
            headers,
            params: { team: teamId }
          }),
          axios.get(`${backendUrl}/api/squads/`, {
            headers,
            params: { 'participant__team': teamId }
          }),
          axios.get(`${backendUrl}/api/squad-members/`, {
            headers,
            params: { 'squad__participant__team': teamId }
          })
        ]);
        
        setTeam(teamRes.data);
        setMembers(membersRes.data);
        setAvailableTournaments(tournamentsRes.data);
        setRegisteredTournaments(registeredRes.data);
        setTournamentTeams(tournamentTeamsRes.data.results);
        setSquads(squadsRes.data);
        setSquadMembers(squadMembersRes.data.results);
        
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/login');
        } else {
          toast.error('Failed to load team data');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [backendUrl, teamId, router]);

  const getSquadLimits = (mode: Tournament['mode']) => {
    switch (mode) {
      case '16v16': return { min: 2, max: 4 };
      case '32v32': return { min: 6, max: 8 };
      case '64v64': return { min: 8, max: 12 };
      default: return { min: 0, max: 0 };
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchSquadMembers = async (squadId: any) => {
    try {
      if (!teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${backendUrl}/api/squad-members/?squad=${squadId}`, { headers });
      setSelectedSquadMembers(response.data);
      setViewMembersModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch squad members", error);
    }
  };

  const handleRegisterForTournament = async (tournamentId: number) => {
    try {
      if (!backendUrl || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setRegisteringTournament(tournamentId);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(
        `${backendUrl}/api/tournaments/${tournamentId}/register/`,
        { team_id: teamId },
        { headers }
      );
      
      const [availableRes, registeredRes, tournamentTeamsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/tournaments/available/`, { headers }),
        axios.get(`${backendUrl}/api/tournaments/registered/`, { 
          headers,
          params: { team_id: teamId }
        }),
        axios.get(`${backendUrl}/api/tournament-teams/`, {
          headers,
          params: { team: teamId }
        })
      ]);
      
      setAvailableTournaments(availableRes.data);
      setRegisteredTournaments(registeredRes.data);
      setTournamentTeams(tournamentTeamsRes.data.results);
      
      toast.success('Successfully registered for tournament!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Failed to register for tournament');
      } else {
        toast.error('Failed to register for tournament');
        console.error(err);
      }
    } finally {
      setRegisteringTournament(null);
    }
  };

  const handleUnregisterFromTournament = async (registrationId: number) => {
    try {
      if (!backendUrl || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${backendUrl}/api/tournament-participants/${registrationId}/`, { headers });
      
      const [availableRes, registeredRes, tournamentTeamsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/tournaments/available/`, { headers }),
        axios.get(`${backendUrl}/api/tournaments/registered/`, { 
          headers,
          params: { team_id: teamId }
        }),
        axios.get(`${backendUrl}/api/tournament-teams/`, {
          headers,
          params: { team: teamId }
        })
      ]);
      
      setAvailableTournaments(availableRes.data);
      setRegisteredTournaments(registeredRes.data);
      setTournamentTeams(tournamentTeamsRes.data.results);
      
      toast.success('Successfully unregistered from tournament');
    } catch (err) {
      toast.error('Failed to unregister from tournament');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      if (!backendUrl || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      await axios.post(
        `${backendUrl}/api/teams/${teamId}/members/`,
        { email: newMemberEmail, role: newMemberRole },
        { headers }
      );
      
      const membersResponse = await axios.get(`${backendUrl}/api/teams/${teamId}/members/`, { headers });
      setMembers(membersResponse.data);
      
      setAddMemberModalOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('MEMBER');
      toast.success('Member added successfully');
    } catch (err) {
      toast.error('Failed to add member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSquad = async () => {
    try {
      if (!backendUrl || !newSquadParticipant || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      setSquadCreationError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(
        `${backendUrl}/api/squads/`,
        { 
          participant: newSquadParticipant,
          squad_type: newSquadType 
        },
        { headers }
      );
      
      const [squadsRes, squadMembersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/squads/`, {
          headers,
          params: { 'participant__team': teamId }
        }),
        axios.get(`${backendUrl}/api/squad-members/`, {
          headers,
          params: { 'squad__participant__team': teamId }
        })
      ]);
      
      setSquads(squadsRes.data.results);
      setSquadMembers(squadMembersRes.data.results);
      
      setCreateSquadModalOpen(false);
      setNewSquadType(SQUAD_TYPES[0]);
      setNewSquadParticipant('');
      toast.success('Squad created successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'Failed to create squad';
        setSquadCreationError(errorMsg);
        toast.error(errorMsg);
      } else {
        toast.error('Failed to create squad');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSquad = async (squadId: number) => {
    try {
      if (!backendUrl || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${backendUrl}/api/squads/${squadId}/`, { headers });
      
      const [squadsRes, squadMembersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/squads/`, {
          headers,
          params: { 'tournament_team__team': teamId }
        }),
        axios.get(`${backendUrl}/api/squad-members/`, {
          headers,
          params: { 'squad__tournament_team__team': teamId }
        })
      ]);
      
      setSquads(squadsRes.data.results);
      setSquadMembers(squadMembersRes.data.results);
      
      toast.success('Squad deleted successfully');
    } catch (err) {
      toast.error('Failed to delete squad');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSquadMember = async () => {
    try {
      if (!backendUrl || !selectedSquad || !newSquadMemberPlayer || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      console.log("Adding player", newSquadMemberPlayer);
      await axios.post(
        `${backendUrl}/api/squad-members/`,
        { 
          squad: selectedSquad, 
          player: newSquadMemberPlayer, 
          role: newSquadMemberRole 
        },
        { headers }
      );
      
      const squadMembersResponse = await axios.get(`${backendUrl}/api/squad-members/`, {
        headers,
        params: { 'squad__tournament_team__team': teamId }
      });
      setSquadMembers(squadMembersResponse.data.results);
      
      setAddSquadMemberModalOpen(false);
      setSelectedSquad(null);
      setNewSquadMemberPlayer('');
      setNewSquadMemberRole('NONE');
      toast.success('Squad member added successfully');
    } catch (err) {
      toast.error('Failed to add squad member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSquadMember = async (squadMemberId: number) => {
    try {
      if (!backendUrl || !teamId) {
        toast.error("Team ID not available");
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${backendUrl}/api/squad-members/${squadMemberId}/`, { headers });
      
      const squadMembersResponse = await axios.get(`${backendUrl}/api/squad-members/`, {
        headers,
        params: { 'squad__participant__team': teamId }
      });
      setSquadMembers(squadMembersResponse.data.results);
      
      toast.success('Squad member removed successfully');
    } catch (err) {
      toast.error('Failed to remove squad member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTournamentCard = (tournament: Tournament, registration?: TournamentRegistration) => {
    const isRegistered = !!registration;
    const isOngoing = dayjs(tournament.start_date).isBefore(dayjs()) && !tournament.is_completed;
    const isUpcoming = dayjs(tournament.start_date).isAfter(dayjs());
    const squadLimits = getSquadLimits(tournament.mode);
    const tournamentSquads = squads?.filter(s => s.tournament_id == tournament.id);
    const canCreateMoreSquads = tournamentSquads?.length < squadLimits.max;

    return (
      <div className="bg-[#0a1d2e] rounded-lg shadow-md flex flex-col h-full p-4 font-bahnschrift">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-white font-bank">{tournament.title}</h2>
          <span className={`
            px-2 py-0.5 text-xs rounded-full font-medium ml-[5px] mt-[3px]
            ${tournament.is_completed
              ? 'bg-gray-300 text-gray-700'
              : isOngoing
                ? 'bg-purple-200 text-purple-800'
                : 'bg-blue-200 text-blue-800'}
          `}>
            {tournament.is_completed ? 'Completed' : isOngoing ? 'Ongoing' : 'Upcoming'}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-1">
          {tournament.game} • {tournament.mode} • {tournament.level}
        </p>

        <p className="text-sm text-gray-400 mb-2">
          Starts: {dayjs(tournament.start_date).format('MMMM D, YYYY h:mm A')}
        </p>

        <div className="flex items-center mb-2">
          <p className="text-sm mr-2 text-gray-500">
            Slots: {tournament.registered_players}/{tournament.max_players}
          </p>
          <div className="flex-grow">
            <div className="h-2 bg-gray-300 rounded overflow-hidden">
              <div
                className={`h-full ${tournament.registered_players >= tournament.max_players ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (tournament.registered_players / tournament.max_players) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {isRegistered && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              <strong>Squads:</strong> {tournamentSquads?.length}/{squadLimits.max}
            </p>
            <p className="text-xs text-gray-500 mt-[2px]">
              (Min: {squadLimits.min}, Max: {squadLimits.max})
            </p>
          </div>
        )}

        <div className="flex justify-between mt-auto pt-4">
          {isRegistered ? (
            isUpcoming && (
              <div className="flex gap-2">
                {canCreateMoreSquads && (
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    onClick={() => {
                      setNewSquadParticipant(registration.id);
                      setCreateSquadModalOpen(true);
                    }}
                  >
                    Create Squad
                  </button>
                )}
                <button
                  className="border border-red-500 text-red-500 px-3 py-1 rounded text-sm hover:bg-red-100"
                  onClick={() => registration && handleUnregisterFromTournament(registration.id)}
                >
                  Unregister
                </button>
              </div>
            )
          ) : (
            <button
              className={`w-full text-sm text-white px-3 py-1 rounded ${
                tournament.registered_players >= tournament.max_players || registeringTournament === tournament.id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={() => handleRegisterForTournament(tournament.id)}
              disabled={
                tournament.registered_players >= tournament.max_players ||
                registeringTournament === tournament.id
              }
            >
              {registeringTournament === tournament.id ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />
              ) : tournament.registered_players >= tournament.max_players ? (
                'Tournament Full'
              ) : (
                'Register Team'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSquadCard = (squad: Squad) => {
    const squadPlayers = squadMembers?.filter(sm => sm.squad.id === squad.id);
    return (
      <div className="bg-[#0a1d2e] text-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{squad.squad_type} Squad</h3>
          <button
            onClick={() => handleDeleteSquad(squad.id)}
            disabled={loading}
            className="text-red-500 border border-red-500 px-3 py-1 text-sm rounded hover:bg-red-500 hover:text-white disabled:opacity-50"
          >
            Delete
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-3">
          Tournament: {squad.tournament_name}
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setSelectedSquad(squad.id);
              setAddSquadMemberModalOpen(true);
            }}
            disabled={loading}
            className="border border-blue-500 text-blue-500 text-sm px-3 py-1 rounded w-full hover:bg-blue-500 hover:text-white disabled:opacity-50"
          >
            Add Member
          </button>

          <button
            onClick={() => fetchSquadMembers(squad.id)}
            disabled={loading}
            className="border border-gray-400 text-gray-300 text-sm px-3 py-1 rounded w-full hover:bg-gray-600 disabled:opacity-50"
          >
            View Members
          </button>
        </div>

        <div className="space-y-2">
          {squadPlayers?.map((squadMember) => (
            <div
              key={squadMember.id}
              className="flex justify-between items-center bg-[#0f2c4a] px-3 py-2 rounded"
            >
              <div>
                <p className="text-sm font-medium">{squadMember.player.username}</p>
                <p className="text-xs text-gray-400">
                  {squadMember.role !== 'NONE'
                    ? squadMember.role.charAt(0) + squadMember.role.slice(1).toLowerCase()
                    : 'Member'}
                </p>
              </div>
              <button
                onClick={() => handleRemoveSquadMember(squadMember.id)}
                disabled={loading}
                className="text-red-400 border border-red-400 px-2 py-1 text-xs rounded hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && !team) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-4">
        <h5 className="text-xl">Team not found</h5>
      </div>
    );
  }

  const handleGoToBattlefield = () => {
    router.push('/battlefield');
  };

  return (
    <main className='h-screen'>
      <header className="flex justify-between items-center h-[62px] bg-[#182d3e] pl-[24px] pr-[24px]">
        <div className="flex items-center">
          <div onClick={() => router.push('/')} className="cursor-pointer">
            <img src="/footer_logo.png" alt="Logo" className="w-[90px] h-[33px] mt-[14px] mb-[14px]" />
          </div>

          <h1 className='text-white ml-8 text-xl font-bahnschrift text-bold'>{team.name} Management</h1>
        </div>

        <div className="flex items-center">
          <div className="flex items-center space-x-2 border border-[#377cca] p-2 rounded-md bg-gradient-to-r from-[#12436c] to-[#0a3152] h-10">
            <img src="/helmet.png" alt="User Icon" className="w-6 h-6 rounded-md border border-[#377cca]" />
            <select
              className="bg-transparent text-white w-[150px]"
              onChange={(e) => {
                if (e.target.value === 'field') handleGoToBattlefield();
              }}
            >
              <option>Team Lead</option>
              <option value="field">Go to battlefield</option>
            </select>
          </div>
        </div>
      </header>
      
      <div className='bg-gradient-to-r from-[#061526] to-[#0b1f30]/70 h-full'>
        <div className='p-4 font-bank bg-gradient-to-r from-[#08182a] to-[#0a3152] h-full'>
          <div className="flex justify-between items-center mb-4">
            <div className="border border-blue-500 text-blue-500 px-2 py-0.5 rounded-full text-xs font-medium">
              {team.tier}
            </div>
            <div className='flex gap-2 text-white'>
              <p>Join code : </p>
              <h2>{team.join_code}</h2>
            </div>
          </div>
          
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 0 ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab(0)}
            >
              Members
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 1 ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab(1)}
            >
              Available Tournaments
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 2 ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab(2)}
            >
              Registered Tournaments
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 3 ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab(3)}
            >
              Squads
            </button>
          </div>
          
          <div className="border-b border-gray-700 mb-3"></div>
          
          {activeTab === 0 && (
            <div className="p-6 bg-gradient-to-r from-[#09233c] to-[#0a1d2e] text-white font-bahnschrift">
              <div className="flex justify-between">
                <h2 className='font-bank text-white font-bank'>TEAM MEMBERS</h2>
                <button 
                  className='border-2 border-[#155282] px-5 py-2 mr-2 rounded text-white hover:bg-[#155282]'
                  onClick={() => setAddMemberModalOpen(true)}
                  disabled={loading}
                >
                  Add New Member
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-[#09233c] to-[#0a1d2e] p-4 rounded">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-gradient-to-r from-[#0e3b61] to-transparent mt-2 p-3 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#155282] text-white flex items-center justify-center text-lg font-semibold">
                        {member.player.username.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-white font-medium">{member.player.username}</p>
                        <p className="text-gray-400 text-sm">
                          {member.player.email}
                          {member.player.is_online && (
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block ml-2"></span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full 
                          ${
                            member.role === 'CAPTAIN'
                              ? 'bg-blue-600 text-white'
                              : member.role === 'CO_LEAD'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 1 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableTournaments.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400">
                    No tournaments available for registration at this time.
                  </div>
                ) : (
                  availableTournaments.map((tournament) => (
                    <div key={tournament.id}>
                      {renderTournamentCard(tournament)}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 2 && (
            <div>
              {registeredTournaments.length === 0 ? (
                <div className="p-3 text-center">
                  <p className="text-gray-400">
                    Your team is not registered for any tournaments yet.
                  </p>
                  <button 
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setActiveTab(1)}
                  >
                    Browse Available Tournaments
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {registeredTournaments?.map((registration) => (
                    <div key={registration.id}>
                      {renderTournamentCard(registration.tournament, registration)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 3 && (
            <div>
              <div className="p-3 mb-3">
                {tournamentTeams?.length === 0 ? (
                  <p className="text-center text-gray-400">
                    Your team is not registered for any tournaments yet. Register for a tournament to create squads.
                  </p>
                ) : squads?.length === 0 ? (
                  <p className="text-center text-gray-400">
                    No squads created yet. Create your first squad to organize your team for tournaments.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {squads?.map((squad) => (
                      <div key={squad.id}>
                        {renderSquadCard(squad)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Add Member Modal */}
          {addMemberModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#0a1d2e] rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Add Team Member</h3>
                </div>
                <div className="p-4">
                  <div className="min-w-[400px] pt-2">
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Player Email</label>
                      <input
                        type="email"
                        className="w-full bg-[#0f2c4a] border border-gray-700 rounded px-3 py-2 text-white"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Role</label>
                      <select
                        className="w-full bg-[#0f2c4a] border border-gray-700 rounded px-3 py-2 text-white"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as 'MEMBER' | 'CO_LEAD' | 'CAPTAIN')}
                        disabled={loading}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="CO_LEAD">Co-Lead</option>
                        <option value="CAPTAIN">Captain</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                  <button
                    className="mr-2 px-4 py-2 text-gray-300 hover:text-white"
                    onClick={() => setAddMemberModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleAddMember}
                    disabled={!newMemberEmail || loading}
                  >
                    {loading ? (
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                    ) : 'Add Member'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Members Modal */}
          {viewMembersModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#0a1d2e] rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Squad Members</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                  {selectedSquadMembers.length === 0 ? (
                    <p className="text-gray-400">No members in this squad.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSquadMembers.map((member) => (
                        <div key={member.id} className="p-3 bg-[#0f2c4a] rounded">
                          <p className="font-medium text-white">{member.player_name}</p>
                          <p className="text-sm text-gray-400">Email: {member.player_email} | Role: {member.role}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setViewMembersModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Create Squad Modal */}
          {createSquadModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#0a1d2e] rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Create New Squad</h3>
                </div>
                <div className="p-4">
                  <div className="min-w-[400px] pt-2">
                    {squadCreationError && (
                      <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
                        {squadCreationError}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Tournament Registration</label>
                      <select
                        className="w-full bg-[#0f2c4a] border border-gray-700 rounded px-3 py-2 text-white"
                        value={newSquadParticipant}
                        onChange={(e) => setNewSquadParticipant(Number(e.target.value))}
                        disabled={loading}
                      >
                        {registeredTournaments?.map((registration) => {
                          const tournament = registration.tournament;
                          const squadLimits = getSquadLimits(tournament.mode);
                          const currentSquads = squads?.filter(
                            s => s.participant.id === registration.id
                          ).length;
                          
                          return (
                            <option 
                              key={registration.id} 
                              value={registration.id}
                              disabled={currentSquads >= squadLimits.max}
                            >
                              {tournament.title} ({currentSquads}/{squadLimits.max} squads)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Squad Type</label>
                      <select
                        className="w-full bg-[#0f2c4a] border border-gray-700 rounded px-3 py-2 text-white"
                        value={newSquadType}
                        onChange={(e) => setNewSquadType(e.target.value)}
                        disabled={loading}
                      >
                        {SQUAD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                  <button
                    className="mr-2 px-4 py-2 text-gray-300 hover:text-white"
                    onClick={() => setCreateSquadModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleCreateSquad}
                    disabled={!newSquadParticipant || loading}
                  >
                    {loading ? (
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                    ) : 'Create Squad'}
                  </button>
                </div>
              </div>
            </div>
          )}
                    
          {/* Add Squad Member Modal */}
          {addSquadMemberModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#0a1d2e] rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Add Squad Member</h3>
                </div>
                <div className="p-4">
                  <div className="min-w-[400px] pt-2">
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Player</label>
                      <select
                        className="w-full bg-[#0f2c4a] border border-gray-700 rounded px-3 py-2 text-white"
                        value={newSquadMemberPlayer}
                        onChange={(e) => setNewSquadMemberPlayer(Number(e.target.value))}
                        disabled={loading}
                      >
                        {members.map((member) => (
                          <option key={member.player.id} value={member.player.id}>
                            {member.player.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Role</label>
                      <select
                        className="w-full bg-[#0f2c4a] border border-gray-700 rounded px-3 py-2 text-white"
                        value={newSquadMemberRole}
                        onChange={(e) => setNewSquadMemberRole(e.target.value as 'CAPTAIN' | 'LEADER' | 'NONE')}
                        disabled={loading}
                      >
                        <option value="NONE">Member</option>
                        <option value="LEADER">Squad Leader</option>
                        <option value="CAPTAIN">Team Captain</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                  <button
                    className="mr-2 px-4 py-2 text-gray-300 hover:text-white"
                    onClick={() => setAddSquadMemberModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleAddSquadMember}
                    disabled={!newSquadMemberPlayer || !selectedSquad || loading}
                  >
                    {loading ? (
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                    ) : 'Add Member'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default TeamManagementPage;