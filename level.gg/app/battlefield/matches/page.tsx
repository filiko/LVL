import { Match } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'

export default function MatchesPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Matches</h1>
      <div className="space-y-4">
        {/* Match cards will go here */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="font-semibold">Team 1</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="text-gray-500">vs</div>
              <div className="text-center">
                <div className="font-semibold">Team 2</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Tournament Name</div>
              <div className="font-medium">Scheduled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 