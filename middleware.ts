import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './lib/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Define protected routes
  const protectedRoutes = [
    '/admin',
    '/battlefield/teams/create',
    '/battlefield/tournaments/create',
    '/battlefield/draft',
    '/profile',
    '/settings'
  ]

  // Define admin-only routes
  const adminRoutes = [
    '/admin'
  ]

  // Define team-lead-only routes
  const teamLeadRoutes = [
    '/battlefield/teams/create',
    '/battlefield/tournaments/create'
  ]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  const isTeamLeadRoute = teamLeadRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !session) {
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check role-based access
  if (session && (isAdminRoute || isTeamLeadRoute)) {
    try {
      // Get user profile to check permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_team_lead')
        .eq('id', session.user.id)
        .single()

      // Admin route access control
      if (isAdminRoute && !profile?.is_admin) {
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }

      // Team lead route access control
      if (isTeamLeadRoute && !profile?.is_team_lead && !profile?.is_admin) {
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error checking user permissions:', error)
      // If we can't verify permissions, redirect to login
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === '/login' || pathname === '/signup')) {
    const redirectTo = url.searchParams.get('redirect') || '/battlefield'
    url.pathname = redirectTo
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}