import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Client-side Supabase client (for browser)
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side Supabase client (for server components)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Legacy client component client (for compatibility)
export const createClientComponentSupabaseClient = () => {
  return createClientComponentClient<Database>()
}

// Legacy server component client (for compatibility)
export const createServerComponentSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Default export for convenience
export default createClient