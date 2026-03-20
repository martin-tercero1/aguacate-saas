import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { SupabaseService } from '@/lib/supabase/services'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseService = new SupabaseService()
    const dashboardData = await supabaseService.getDashboardData(user.id)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error al obtener dashboard:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
