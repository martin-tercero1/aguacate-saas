import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { SupabaseService } from '@/lib/supabase/services'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    const categories = await supabaseService.getCategories(user.id, type || undefined)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const { name, type, color } = await req.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nombre y tipo son requeridos' },
        { status: 400 }
      )
    }

    const category = await supabaseService.createCategory(user.id, { name, type, color })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const { id, name, color } = await req.json()

    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })

    const category = await supabaseService.updateCategory(user.id, id, { name, color })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseService = new SupabaseService()
    const { id } = await req.json()

    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })

    await supabaseService.deleteCategory(user.id, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
