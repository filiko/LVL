import Link from 'next/link'

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Level.gg
          </Link>
          <div className="flex gap-6">
            <Link href="/games" className="hover:text-gray-600">
              Games
            </Link>
            <Link href="/battlefield" className="hover:text-gray-600">
              Battlefield
            </Link>
            <Link href="/nhl" className="hover:text-gray-600">
              NHL
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
} 