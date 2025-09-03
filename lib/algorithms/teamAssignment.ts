import type { Database } from '../database.types'

type Player = {
  id: string
  username: string
  tier: string
  position: string
  team_id: string
  team_name: string
  role: string
}

type AssignedPlayer = Player & {
  squad_assignment: string
  assigned_position: string
}

type TeamAssignment = {
  team_id: string
  team_name: string
  players: AssignedPlayer[]
}

export class TeamAssignmentAlgorithm {
  private readonly squads = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL']
  private readonly positions = ['INFANTRY', 'ARMOR', 'HELI', 'JET', 'SUPPORT']
  private readonly tierWeights = {
    'DIAMOND': 5,
    'PLATINUM': 4,
    'GOLD': 3,
    'SILVER': 2,
    'BRONZE': 1
  }

  /**
   * Auto-assign players to squads and positions with balanced distribution
   */
  autoAssignTeams(players: Player[]): TeamAssignment[] {
    // Group players by team
    const teamGroups = this.groupPlayersByTeam(players)
    
    const assignments: TeamAssignment[] = []

    for (const [teamId, teamPlayers] of teamGroups.entries()) {
      const teamName = teamPlayers[0]?.team_name || 'Unknown Team'
      const assignedPlayers = this.assignPlayersToSquadsAndPositions(teamPlayers)
      
      assignments.push({
        team_id: teamId,
        team_name: teamName,
        players: assignedPlayers
      })
    }

    return assignments
  }

  /**
   * Balance teams by tier distribution
   */
  balanceTeamsByTier(teams: TeamAssignment[]): TeamAssignment[] {
    // Calculate tier distribution for each team
    const teamStats = teams.map(team => ({
      ...team,
      tierScore: this.calculateTierScore(team.players),
      playerCount: team.players.length
    }))

    // Sort teams by tier score (lowest first for balancing)
    teamStats.sort((a, b) => a.tierScore - b.tierScore)

    // TODO: Implement player redistribution logic if needed
    // For now, return original assignments
    return teams
  }

  /**
   * Validate team composition for competitive balance
   */
  validateTeamComposition(team: TeamAssignment): {
    valid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []

    const positionCounts = this.countPositions(team.players)
    const squadCounts = this.countSquads(team.players)

    // Check minimum infantry
    const minInfantry = Math.max(4, Math.floor(team.players.length * 0.4))
    if (positionCounts.INFANTRY < minInfantry) {
      issues.push(`Team needs at least ${minInfantry} infantry players`)
      suggestions.push('Reassign some specialized roles to infantry')
    }

    // Check specialized role limits
    const maxSpecialized = Math.max(1, Math.floor(team.players.length / 8))
    
    if (positionCounts.ARMOR > maxSpecialized * 2) {
      issues.push('Too many armor players')
      suggestions.push('Limit armor players to maintain balance')
    }

    if (positionCounts.HELI > maxSpecialized) {
      issues.push('Too many helicopter pilots')
      suggestions.push('Limit helicopter pilots to one per squad')
    }

    if (positionCounts.JET > maxSpecialized) {
      issues.push('Too many jet pilots')
      suggestions.push('Limit jet pilots to maintain air superiority balance')
    }

    // Check squad balance
    const avgPlayersPerSquad = team.players.length / this.squads.length
    const maxSquadSize = Math.ceil(avgPlayersPerSquad * 1.5)
    
    for (const [squad, count] of Object.entries(squadCounts)) {
      if (count > maxSquadSize) {
        issues.push(`Squad ${squad} is oversized (${count} players)`)
        suggestions.push(`Redistribute players from ${squad} to other squads`)
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    }
  }

  /**
   * Generate optimal squad compositions for specific game modes
   */
  generateSquadCompositions(mode: '16v16' | '32v32' | '64v64'): {
    recommended_squads: number
    squad_size: number
    position_distribution: Record<string, number>
  } {
    const configurations = {
      '16v16': {
        recommended_squads: 2,
        squad_size: 8,
        position_distribution: {
          INFANTRY: 5,
          ARMOR: 1,
          HELI: 1,
          JET: 1,
          SUPPORT: 0
        }
      },
      '32v32': {
        recommended_squads: 4,
        squad_size: 8,
        position_distribution: {
          INFANTRY: 20,
          ARMOR: 6,
          HELI: 3,
          JET: 2,
          SUPPORT: 1
        }
      },
      '64v64': {
        recommended_squads: 8,
        squad_size: 8,
        position_distribution: {
          INFANTRY: 40,
          ARMOR: 12,
          HELI: 6,
          JET: 4,
          SUPPORT: 2
        }
      }
    }

    return configurations[mode]
  }

  private groupPlayersByTeam(players: Player[]): Map<string, Player[]> {
    const teams = new Map<string, Player[]>()
    
    for (const player of players) {
      if (!teams.has(player.team_id)) {
        teams.set(player.team_id, [])
      }
      teams.get(player.team_id)!.push(player)
    }

    return teams
  }

  private assignPlayersToSquadsAndPositions(players: Player[]): AssignedPlayer[] {
    // Sort players by tier and leadership role for priority assignment
    const sortedPlayers = [...players].sort((a, b) => {
      // Captains get priority
      if (a.role === 'CAPTAIN' && b.role !== 'CAPTAIN') return -1
      if (b.role === 'CAPTAIN' && a.role !== 'CAPTAIN') return 1
      
      // Then by tier
      const aTier = this.tierWeights[a.tier as keyof typeof this.tierWeights] || 1
      const bTier = this.tierWeights[b.tier as keyof typeof this.tierWeights] || 1
      return bTier - aTier
    })

    const assignedPlayers: AssignedPlayer[] = []
    const squadCounts = new Map<string, number>()
    const positionCounts = new Map<string, number>()

    // Initialize counts
    this.squads.forEach(squad => squadCounts.set(squad, 0))
    this.positions.forEach(position => positionCounts.set(position, 0))

    for (const player of sortedPlayers) {
      // Determine best squad (least filled)
      const bestSquad = this.findBestSquad(squadCounts)
      
      // Determine best position based on preference and team needs
      const bestPosition = this.findBestPosition(
        player.position, 
        positionCounts, 
        sortedPlayers.length
      )

      assignedPlayers.push({
        ...player,
        squad_assignment: bestSquad,
        assigned_position: bestPosition
      })

      // Update counts
      squadCounts.set(bestSquad, squadCounts.get(bestSquad)! + 1)
      positionCounts.set(bestPosition, positionCounts.get(bestPosition)! + 1)
    }

    return assignedPlayers
  }

  private findBestSquad(squadCounts: Map<string, number>): string {
    let bestSquad = this.squads[0]
    let minCount = squadCounts.get(bestSquad)!

    for (const squad of this.squads) {
      const count = squadCounts.get(squad)!
      if (count < minCount) {
        minCount = count
        bestSquad = squad
      }
    }

    return bestSquad
  }

  private findBestPosition(
    preferredPosition: string, 
    positionCounts: Map<string, number>,
    totalPlayers: number
  ): string {
    // Calculate limits for each position
    const maxSpecialized = Math.max(1, Math.floor(totalPlayers / 8))
    const positionLimits = {
      INFANTRY: totalPlayers, // No limit on infantry
      ARMOR: maxSpecialized * 2,
      HELI: maxSpecialized,
      JET: maxSpecialized,
      SUPPORT: Math.max(1, Math.floor(totalPlayers / 16))
    }

    // Check if preferred position is available
    const currentCount = positionCounts.get(preferredPosition) || 0
    const limit = positionLimits[preferredPosition as keyof typeof positionLimits] || 1

    if (currentCount < limit) {
      return preferredPosition
    }

    // Fall back to infantry if preferred position is full
    return 'INFANTRY'
  }

  private calculateTierScore(players: AssignedPlayer[]): number {
    return players.reduce((sum, player) => {
      return sum + (this.tierWeights[player.tier as keyof typeof this.tierWeights] || 1)
    }, 0)
  }

  private countPositions(players: AssignedPlayer[]): Record<string, number> {
    const counts: Record<string, number> = {}
    this.positions.forEach(position => counts[position] = 0)

    players.forEach(player => {
      counts[player.assigned_position] = (counts[player.assigned_position] || 0) + 1
    })

    return counts
  }

  private countSquads(players: AssignedPlayer[]): Record<string, number> {
    const counts: Record<string, number> = {}
    this.squads.forEach(squad => counts[squad] = 0)

    players.forEach(player => {
      if (player.squad_assignment) {
        counts[player.squad_assignment] = (counts[player.squad_assignment] || 0) + 1
      }
    })

    return counts
  }
}

// Export singleton instance
export const teamAssignmentAlgorithm = new TeamAssignmentAlgorithm()