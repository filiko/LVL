import { User } from '@/types'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-500">
                  {params.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{params.username}</h1>
              <p className="text-gray-600">Member since 2024</p>
            </div>
            <div className="ml-auto">
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Stats Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Total Matches</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Win Rate</div>
                <div className="text-2xl font-bold">0%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tournaments</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </div>

          {/* Active Teams */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Active Teams</h2>
            <div className="space-y-4">
              <p className="text-gray-500">No active teams</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <p className="text-gray-500">No recent activity</p>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Game Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Battlefield Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Battlefield</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Matches Played</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Win Rate</div>
                  <div className="text-xl font-bold">0%</div>
                </div>
              </div>
            </div>

            {/* NHL Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">NHL</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Matches Played</div>
                  <div className="text-xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Win Rate</div>
                  <div className="text-xl font-bold">0%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 