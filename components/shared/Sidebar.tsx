import Link from 'next/link'

interface SidebarProps {
  game: 'battlefield' | 'nhl'
}

export const Sidebar = ({ game }: SidebarProps) => {
  const links = {
    battlefield: [
      { href: '/battlefield', label: 'Overview' },
      { href: '/battlefield/tournaments', label: 'Tournaments' },
      { href: '/battlefield/teams', label: 'Teams' },
      { href: '/battlefield/matches', label: 'Matches' },
      { href: '/battlefield/leaderboards', label: 'Leaderboards' },
    ],
    nhl: [
      { href: '/nhl', label: 'Overview' },
      { href: '/nhl/tournaments', label: 'Tournaments' },
      { href: '/nhl/teams', label: 'Teams' },
      { href: '/nhl/matches', label: 'Matches' },
      { href: '/nhl/leaderboards', label: 'Leaderboards' },
    ],
  }

  return (
    <aside className="w-64 bg-gray-50 p-4">
      <nav className="space-y-2">
        {links[game].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2 hover:bg-gray-100 rounded"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
} 