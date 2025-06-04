import { User } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileCardProps {
  user: User
  showStats?: boolean
}

export const ProfileCard = ({ user, showStats = false }: ProfileCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-4">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.username}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-lg text-gray-500">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <Link 
            href={`/profile/${user.username}`}
            className="font-medium hover:text-blue-600"
          >
            {user.username}
          </Link>
          {showStats && (
            <div className="text-sm text-gray-500">
              <span>0 matches</span>
              <span className="mx-2">•</span>
              <span>0% win rate</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 