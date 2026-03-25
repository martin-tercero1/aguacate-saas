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
  
  // Sign up with Supabase Auth
  // The database trigger (handle_new_user) automatically creates the profile row
  // Profile data is stored in user metadata and can be synced to profile later
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

  // If signup successful and user was created, update profile with additional data
  // The trigger creates a basic profile row; we update it with the full data
  if (data.user?.id && profileData) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          fullName: profileData.name || '',
          phone: profileData.phone || '',
          farmName: profileData.farmName || '',
          location: profileData.location || '',
          hectares: profileData.hectares || null,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', data.user.id)

      if (profileError) {
        // Log but don't fail - profile can be updated later
        console.warn('Profile update after signup:', profileError.message)
      }
    } catch (err) {
      // Non-critical - user can update profile later
      console.warn('Profile update error:', err)
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
