import { createClient } from './server'

export interface SignUpProfileData {
  name?: string
  phone?: string
  farmName?: string
  location?: string
  hectares?: number
}

export async function signUp(email: string, password: string, profileData?: SignUpProfileData) {
  const supabase = await createClient()
  
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

  // If signup successful and user was created, attempt to create profile record
  if (data.user?.id) {
    try {
      // Create or upsert profile with the provided information
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          fullName: profileData?.name || '',
          phone: profileData?.phone || '',
          farmName: profileData?.farmName || '',
          location: profileData?.location || '',
          hectares: profileData?.hectares || null,
          updatedAt: new Date().toISOString(),
        }, { 
          onConflict: 'id' 
        })

      if (profileError) {
        console.warn('Warning: Profile creation failed but auth signup succeeded:', profileError)
        // Don't throw - auth signup succeeded, this is secondary
      }
    } catch (profileCreateError) {
      console.warn('Warning: Profile creation error:', profileCreateError)
      // Don't throw - auth signup succeeded, this is secondary
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function getSession() {
  const supabase = await createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}
