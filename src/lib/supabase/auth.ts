import { createClient as createClientBrowser } from '@/lib/supabase/client'
import { createClient as createClientServer } from '@/lib/supabase/server'
import { User } from '@/lib/types'
import { redirect } from 'next/navigation'

export type AuthUser = User & {
  email: string;
}

export async function signUp(email: string, password: string, userData: Partial<User>) {
  const supabase = createClientBrowser()
  
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
  const supabase = createClientBrowser()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClientBrowser()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const supabase = createClientBrowser()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  return { data, error }
}

export async function updatePassword(password: string) {
  const supabase = createClientBrowser()
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
    redirect('/auth/signin')
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