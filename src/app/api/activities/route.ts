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
    const activities = await supabaseService.getActivities(user.id)

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error al obtener actividades:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseService = new SupabaseService()
    const { tipo, parcela, descripcion, fecha, estado } = await req.json()

    if (!tipo || !parcela || !fecha) {
      return NextResponse.json(
        { error: 'Tipo, parcela y fecha son requeridos' },
        { status: 400 }
      )
    }

    const activity = await supabaseService.createActivity(user.id, {
      tipo,
      parcela,
      descripcion,
      fecha,
      estado: estado || 'pendiente'
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error al crear actividad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseService = new SupabaseService()
    const { id, estado } = await req.json()

    if (!id || !estado) {
      return NextResponse.json(
        { error: 'ID y estado son requeridos' },
        { status: 400 }
      )
    }

    const activity = await supabaseService.updateActivityStatus(user.id, id, estado)

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error al actualizar actividad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
