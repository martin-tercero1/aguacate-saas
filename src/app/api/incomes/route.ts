import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Error al obtener ingresos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { source, description, amount, date } = await req.json()

    if (!source || !amount || !date) {
      return NextResponse.json(
        { error: 'Fuente, monto y fecha son requeridos' },
        { status: 400 }
      )
    }

    const income = await prisma.income.create({
      data: {
        userId: user.id,
        source,
        description,
        amount: parseFloat(amount),
        date: new Date(date)
      }
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error al crear ingreso:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
