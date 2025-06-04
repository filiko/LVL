import { Match } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'

interface MatchCardProps {
  match: Match
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const { team1, team2, score, status, startTime } = match

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="font-semibold">{team1.name}</div>
            <div className="text-2xl font-bold">{score?.team1 ?? '-'}</div>
          </div>
          <div className="text-gray-500">vs</div>
          <div className="text-center">
            <div className="font-semibold">{team2.name}</div>
            <div className="text-2xl font-bold">{score?.team2 ?? '-'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {formatDate(startTime)} at {formatTime(startTime)}
          </div>
          <div className={`font-medium ${
            status === 'live' ? 'text-red-600' :
            status === 'completed' ? 'text-green-600' :
            'text-gray-600'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>
    </div>
  )
} 