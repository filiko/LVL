export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export interface Team {
  id: string
  name: string
  logo?: string
  players: User[]
  game: 'battlefield' | 'nhl'
}

export interface Tournament {
  id: string
  name: string
  game: 'battlefield' | 'nhl'
  startDate: string
  endDate: string
  status: 'upcoming' | 'ongoing' | 'completed'
  teams: Team[]
}

export interface Match {
  id: string
  tournamentId: string
  team1: Team
  team2: Team
  score?: {
    team1: number
    team2: number
  }
  status: 'scheduled' | 'live' | 'completed'
  startTime: string
} 