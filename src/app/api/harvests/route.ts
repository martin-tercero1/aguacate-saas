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
    const harvests = await supabaseService.getHarvests(user.id)

    return NextResponse.json(harvests)
  } catch (error) {
    console.error('Error al obtener cosechas:', error)
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
    const { parcela, cantidad, calidad, variedad, fechaCosecha, precioUnitario } = await req.json()

    if (!parcela || !cantidad || !fechaCosecha || !precioUnitario) {
      return NextResponse.json(
        { error: 'Parcela, cantidad, fecha y precio son requeridos' },
        { status: 400 }
      )
    }

    const harvest = await supabaseService.createHarvest(user.id, {
      parcela,
      cantidad: parseFloat(cantidad),
      calidad,
      variedad,
      fechaCosecha,
      precioUnitario: parseFloat(precioUnitario)
    })

    return NextResponse.json(harvest)
  } catch (error) {
    console.error('Error al crear cosecha:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseService = new SupabaseService()
    const { id, parcela, cantidad, calidad, variedad, fechaCosecha, precioUnitario } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const harvest = await supabaseService.updateHarvest(user.id, id, {
      parcela,
      cantidad: cantidad ? parseFloat(cantidad) : undefined,
      calidad,
      variedad,
      fechaCosecha,
      precioUnitario: precioUnitario ? parseFloat(precioUnitario) : undefined
    })

    return NextResponse.json(harvest)
  } catch (error) {
    console.error('Error al actualizar cosecha:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseService = new SupabaseService()
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    await supabaseService.deleteHarvest(user.id, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar cosecha:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
