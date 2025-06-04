import { Team, User } from '@/types'
import Image from 'next/image'

interface RosterDisplayProps {
  team: Team
}

export const RosterDisplay = ({ team }: RosterDisplayProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Team Roster</h3>
      <div className="space-y-3">
        {team.players.map((player: User) => (
          <div key={player.id} className="flex items-center space-x-3">
            {player.avatar ? (
              <Image
                src={player.avatar}
                alt={player.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  {player.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="font-medium">{player.username}</div>
              <div className="text-sm text-gray-500">Player</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 