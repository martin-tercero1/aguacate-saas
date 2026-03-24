import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { SupabaseService } from '@/lib/supabase/services'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const profile = await supabaseService.getProfile(user.id)
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const { fullName, phone, avatarUrl, farmName, location, hectares } = await req.json()

    const profile = await supabaseService.createProfile(user.id, {
      fullName,
      phone,
      avatarUrl,
      farmName,
      location,
      hectares: hectares ? parseFloat(hectares) : undefined
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const { fullName, phone, avatarUrl, farmName, location, hectares } = await req.json()

    const profile = await supabaseService.updateProfile(user.id, {
      fullName,
      phone,
      avatarUrl,
      farmName,
      location,
      hectares: hectares ? parseFloat(hectares) : undefined
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
