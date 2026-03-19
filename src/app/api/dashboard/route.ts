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

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const [totalExpenses, totalIncomes, currentMonthExpenses, currentMonthIncomes] = await Promise.all([
      prisma.expense.aggregate({
        where: { userId: user.id },
        _sum: { amount: true }
      }),
      prisma.income.aggregate({
        where: { userId: user.id },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { 
          userId: user.id,
          date: { gte: currentMonth }
        },
        _sum: { amount: true }
      }),
      prisma.income.aggregate({
        where: { 
          userId: user.id,
          date: { gte: currentMonth }
        },
        _sum: { amount: true }
      })
    ])

    const totalExpensesAmount = totalExpenses._sum.amount || 0
    const totalIncomesAmount = totalIncomes._sum.amount || 0
    const currentMonthExpensesAmount = currentMonthExpenses._sum.amount || 0
    const currentMonthIncomesAmount = currentMonthIncomes._sum.amount || 0

    const totalProfit = totalIncomesAmount - totalExpensesAmount
    const currentMonthProfit = currentMonthIncomesAmount - currentMonthExpensesAmount

    return NextResponse.json({
      totalExpenses: totalExpensesAmount,
      totalIncomes: totalIncomesAmount,
      totalProfit,
      currentMonthExpenses: currentMonthExpensesAmount,
      currentMonthIncomes: currentMonthIncomesAmount,
      currentMonthProfit
    })
  } catch (error) {
    console.error('Error al obtener dashboard:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
