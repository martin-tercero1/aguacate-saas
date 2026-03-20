'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/components/expense-form'
import { IncomeForm } from '@/components/income-form'
import { ExpenseList } from '@/components/expense-list'
import { IncomeList } from '@/components/income-list'
import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardData {
  totalExpenses: number
  totalIncomes: number
  totalProfit: number
  currentMonthExpenses: number
  currentMonthIncomes: number
  currentMonthProfit: number
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleExpenseSuccess = () => {
    setShowExpenseForm(false)
    fetchDashboardData()
  }

  const handleIncomeSuccess = () => {
    setShowIncomeForm(false)
    fetchDashboardData()
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-foreground">🥑 Aguacate SaaS</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Hola, {user.user_metadata?.name || user.email}</span>
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="text-sm"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-2">Resumen de tus finanzas</p>
        </div>

        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Gastos Totales</h3>
                <div className="text-2xl">💰</div>
              </div>
              <div className="text-3xl font-bold text-destructive">
                C$ {dashboardData.totalExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Este mes: C$ {dashboardData.currentMonthExpenses.toFixed(2)}
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Ingresos Totales</h3>
                <div className="text-2xl">📈</div>
              </div>
              <div className="text-3xl font-bold text-primary">
                C$ {dashboardData.totalIncomes.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Este mes: C$ {dashboardData.currentMonthIncomes.toFixed(2)}
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Ganancia Neta</h3>
                <div className="text-2xl">🎯</div>
              </div>
              <div className={`text-3xl font-bold ${dashboardData.totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                C$ {dashboardData.totalProfit.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Este mes: C$ {dashboardData.currentMonthProfit.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Acciones Rápidas</h3>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={() => setShowExpenseForm(!showExpenseForm)}
              >
                {showExpenseForm ? 'Cancelar' : '+ Registrar Gasto'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowIncomeForm(!showIncomeForm)}
              >
                {showIncomeForm ? 'Cancelar' : '+ Registrar Ingreso'}
              </Button>
              <Button variant="outline" className="w-full">
                + Ver Todos los Gastos
              </Button>
              <Button variant="outline" className="w-full">
                + Ver Todos los Ingresos
              </Button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumen Mensual</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm font-medium">Gastos</span>
                <span className="text-sm font-bold text-destructive">
                  C$ {dashboardData?.currentMonthExpenses.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm font-medium">Ingresos</span>
                <span className="text-sm font-bold text-primary">
                  C$ {dashboardData?.currentMonthIncomes.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded">
                <span className="text-sm font-medium">Ganancia</span>
                <span className={`text-sm font-bold ${(dashboardData?.currentMonthProfit ?? 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  C$ {dashboardData?.currentMonthProfit.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showExpenseForm && (
          <div className="mb-8 flex justify-center">
            <ExpenseForm onSuccess={handleExpenseSuccess} />
          </div>
        )}

        {showIncomeForm && (
          <div className="mb-8 flex justify-center">
            <IncomeForm onSuccess={handleIncomeSuccess} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseList />
          <IncomeList />
        </div>
      </div>
    </div>
  )
}
