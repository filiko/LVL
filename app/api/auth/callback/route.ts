import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'
import { authUtils } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/battlefield'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    try {
      // Exchange code for session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        throw sessionError
      }

      if (session?.user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const profileData = authUtils.extractProfileFromOAuthUser(session.user)
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData])

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Continue anyway - user can update profile later
          }
        } else {
          // Update last activity
          await supabase
            .from('profiles')
            .update({ 
              last_activity: new Date().toISOString(),
              is_online: true 
            })
            .eq('id', session.user.id)
        }

        // Successful authentication - redirect to intended page
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      
      // Redirect to login with error
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'Authentication failed')
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code provided or other error - redirect to login
  const errorUrl = new URL('/login', request.url)
  errorUrl.searchParams.set('error', 'Invalid authentication code')
  return NextResponse.redirect(errorUrl)
}

// Handle POST requests (for form-based auth flows)
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    const body = await request.json()
    const { provider } = body

    if (!provider || !['discord', 'google'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${request.nextUrl.origin}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: `OAuth sign-in failed: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}