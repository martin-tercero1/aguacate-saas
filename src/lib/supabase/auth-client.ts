import { createClient } from './client'

export interface SignUpProfileData {
  name?: string
  phone?: string
  farmName?: string
  location?: string
  hectares?: number
}

export async function signUp(email: string, password: string, profileData?: SignUpProfileData) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: profileData?.name || '',
        phone: profileData?.phone || '',
        farmName: profileData?.farmName || '',
        location: profileData?.location || '',
        hectares: profileData?.hectares || null,
      }
    }
  })

  if (error) {
    throw error
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function getSession() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}
