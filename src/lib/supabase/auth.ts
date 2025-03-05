import { createClient } from '@/lib/supabase/client'
import { createClient as createClientServer } from '@/lib/supabase/server'
import { User } from '@/lib/types'
import { redirect } from 'next/navigation'

export type AuthUser = User & {
  email: string;
}

export async function signUp(email: string, password: string, userData: Partial<User>) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        building_number: userData.buildingNumber,
        apartment_number: userData.apartmentNumber,
        phone_number: userData.phoneNumber,
        preferred_language: userData.preferredLanguage || 'french',
        is_verified_owner: false,
        role: 'user',
        is_admin: false,
      },
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  return { data, error }
}

export async function updatePassword(password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.updateUser({
    password,
  })
  
  return { data, error }
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClientServer()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  // Get additional user data from the database
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (error || !userData) {
    return null
  }
  
  return {
    ...userData,
    email: user.email || '',
  } as AuthUser
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    // Get the current locale from the URL or use French as default
    let locale = 'fr'
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const pathParts = path.split('/')
      if (pathParts.length > 1 && ['fr', 'en', 'ar'].includes(pathParts[1])) {
        locale = pathParts[1]
      }
    }
    
    redirect(`/${locale}/auth/signin`)
  }
  
  return user
}

export async function requireAdmin() {
  const user = await getUser()
  
  if (!user || !user.isAdmin) {
    redirect('/')
  }
  
  return user
}

export async function requireVerifiedOwner() {
  const user = await getUser()
  
  if (!user || !user.isVerifiedOwner) {
    redirect('/')
  }
  
  return user
}

export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getUser()
  
  if (!user || !user.permissions) {
    return false
  }
  
  return user.permissions.includes(permission as any)
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(redirectUrl: string) {
  const supabase = createClient()
  
  // For redirection tracking - useful for debugging
  console.log('Signing in with Google, redirect URL:', redirectUrl);
  
  // Get the URL without modifying it - Supabase needs the exact URL
  // The Google Cloud Console should be configured with wildcards for local development
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('Google sign in error:', error);
  }
  
  return { data, error }
}

/**
 * Check if the user has completed their profile
 * Required for social login to collect building/apartment info
 */
export async function checkProfileCompletion(userId: string) {
  const supabase = createClient()
  
  // Check if user has building/apartment info in the users table
  const { data, error } = await supabase
    .from('users')
    .select('building_number, apartment_number')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error checking profile completion:', error)
    return { isComplete: false, error }
  }
  
  // Profile is complete if both building and apartment numbers exist
  const isComplete = !!data?.building_number && !!data?.apartment_number
  
  return { isComplete, data, error: null }
}

/**
 * Update user profile after social login
 */
export async function updateUserProfile(userId: string, profileData: {
  name?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}) {
  const supabase = createClient()
  
  // Convert the profileData to snake_case for database
  const dbData = {
    name: profileData.name,
    building_number: profileData.buildingNumber,
    apartment_number: profileData.apartmentNumber,
    phone_number: profileData.phoneNumber,
    preferred_language: profileData.preferredLanguage,
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(dbData)
    .eq('id', userId)
  
  return { data, error }
} 