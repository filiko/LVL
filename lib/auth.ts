import { createClient, createServerSupabaseClient } from './supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from './database.types'

// Client-side auth helpers
export const authClient = {
  // Sign in with OAuth provider (Discord, Google)
  async signInWithOAuth(provider: 'discord' | 'google') {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      throw new Error(`OAuth sign-in failed: ${error.message}`)
    }
    
    return data
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  },

  // Get current session
  async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`)
    }
    
    return session
  },

  // Get current user
  async getUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    
    return user
  },

  // Create or update user profile
  async upsertProfile(profileData: ProfileInsert | ProfileUpdate) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to upsert profile: ${error.message}`)
    }
    
    return data as Profile
  },

  // Get user profile
  async getProfile(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      throw new Error(`Failed to get profile: ${error.message}`)
    }
    
    return data as Profile
  },

  // Update user profile
  async updateProfile(userId: string, updates: ProfileUpdate) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }
    
    return data as Profile
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = createClient()
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Server-side auth helpers
export const authServer = {
  // Get session on server
  async getSession() {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`)
    }
    
    return session
  },

  // Get user on server
  async getUser() {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    
    return user
  },

  // Get user profile on server
  async getProfile(userId: string) {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      throw new Error(`Failed to get profile: ${error.message}`)
    }
    
    return data as Profile
  },

  // Check if user is admin
  async isAdmin(userId: string) {
    try {
      const profile = await this.getProfile(userId)
      return profile.is_admin
    } catch {
      return false
    }
  },

  // Check if user is team lead
  async isTeamLead(userId: string) {
    try {
      const profile = await this.getProfile(userId)
      return profile.is_team_lead || profile.is_admin
    } catch {
      return false
    }
  }
}

// Utility functions
export const authUtils = {
  // Generate username from email
  generateUsername(email: string): string {
    const base = email.split('@')[0]
    const random = Math.floor(Math.random() * 1000)
    return `${base}${random}`
  },

  // Extract profile data from OAuth user
  extractProfileFromOAuthUser(user: any): ProfileInsert {
    const profile: ProfileInsert = {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || 
                user.user_metadata?.full_name || 
                this.generateUsername(user.email || ''),
      avatar_url: user.user_metadata?.avatar_url || null,
      discord_id: user.app_metadata?.provider === 'discord' 
        ? user.user_metadata?.provider_id 
        : null,
    }

    return profile
  },

  // Check if user needs onboarding
  needsOnboarding(profile: Profile): boolean {
    return !profile.tier || !profile.region || !profile.country_code
  },

  // Validate team join code format
  isValidJoinCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code)
  }
}

// Auth state management for React components
export const useAuthState = () => {
  if (typeof window === 'undefined') {
    throw new Error('useAuthState can only be used on the client side')
  }

  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authClient.getSession().then(session => {
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        authClient.getProfile(session.user.id).then(profile => {
          setProfile(profile)
        }).catch(console.error)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authClient.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          try {
            const profile = await authClient.getProfile(session.user.id)
            setProfile(profile)
          } catch (error) {
            console.error('Failed to fetch profile:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    session,
    user,
    profile,
    loading,
    signIn: authClient.signInWithOAuth,
    signOut: authClient.signOut,
    updateProfile: authClient.updateProfile,
  }
}

// Add useState import at top
import { useState, useEffect } from 'react'