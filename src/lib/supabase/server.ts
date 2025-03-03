import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          try {
            // @ts-ignore - We know this is a Promise in Next.js 14+, but we need to access it synchronously
            return cookies().get?.(name)?.value
          } catch (error) {
            console.error('Error getting cookie:', error)
            return undefined
          }
        },
        set(name, value, options) {
          try {
            // @ts-ignore - We know this is a Promise in Next.js 14+, but we need to access it synchronously
            cookies().set?.(name, value, options)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name, options) {
          try {
            // @ts-ignore - We know this is a Promise in Next.js 14+, but we need to access it synchronously
            cookies().set?.(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}