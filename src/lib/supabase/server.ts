import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'

// Create a server-side Supabase client
export const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          try {
            // This will only work in App Router
            // In Pages Router this will throw an error that we catch
            const { cookies } = require('next/headers')
            const cookiesObj = await cookies()
            return cookiesObj.get(name)?.value
          } catch (error) {
            // When in Pages Router context or when cookies() fails
            console.warn('Warning: Unable to access cookies. Returning undefined.')
            return undefined
          }
        },
        async set(name, value, options) {
          try {
            // This will only work in App Router
            const { cookies } = require('next/headers')
            const cookiesObj = await cookies()
            cookiesObj.set(name, value, options)
          } catch (error) {
            // No-op when in Pages Router
            console.warn('Warning: Unable to set cookie in this context.')
          }
        },
        async remove(name, options) {
          try {
            // This will only work in App Router
            const { cookies } = require('next/headers')
            const cookiesObj = await cookies()
            cookiesObj.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // No-op when in Pages Router
            console.warn('Warning: Unable to remove cookie in this context.')
          }
        },
      },
    }
  )
}