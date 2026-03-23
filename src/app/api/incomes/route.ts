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
    const incomes = await supabaseService.getIncomes(user.id)

    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Error al obtener ingresos:', error)
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
    const { source, description, amount, date } = await req.json()

    if (!source || !amount || !date) {
      return NextResponse.json(
        { error: 'Fuente, monto y fecha son requeridos' },
        { status: 400 }
      )
    }

    const income = await supabaseService.createIncome(user.id, {
      source,
      description,
      amount: parseFloat(amount),
      date
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error al crear ingreso:', error)
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
    const { id, source, description, amount, date } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const income = await supabaseService.updateIncome(user.id, id, {
      source,
      description,
      amount: amount ? parseFloat(amount) : undefined,
      date
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error al actualizar ingreso:', error)
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

    await supabaseService.deleteIncome(user.id, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar ingreso:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
