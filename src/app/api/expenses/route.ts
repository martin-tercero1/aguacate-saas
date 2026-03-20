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
    const expenses = await supabaseService.getExpenses(user.id)

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error al obtener gastos:', error)
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
    const { category, description, amount, date } = await req.json()

    if (!category || !amount || !date) {
      return NextResponse.json(
        { error: 'Categoría, monto y fecha son requeridos' },
        { status: 400 }
      )
    }

    const expense = await supabaseService.createExpense(user.id, {
      category,
      description,
      amount: parseFloat(amount),
      date
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error al crear gasto:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
