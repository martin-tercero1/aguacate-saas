'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/components/expense-form'
import { IncomeForm } from '@/components/income-form'
import { ExpenseList } from '@/components/expense-list'
import { IncomeList } from '@/components/income-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Target, Plus } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalExpenses: number
  totalIncomes: number
  totalProfit: number
  currentMonthExpenses: number
  currentMonthIncomes: number
  currentMonthProfit: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)

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

  if (dataLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-muted-foreground">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Panel Principal
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido, {user?.user_metadata?.name || 'Usuario'}. Aqui esta el
          resumen de tu finca.
        </p>
      </div>

      {/* Stats Cards */}
      {dashboardData && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gastos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                C$ {dashboardData.totalExpenses.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Este mes: C$ {dashboardData.currentMonthExpenses.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos Totales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                C$ {dashboardData.totalIncomes.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Este mes: C$ {dashboardData.currentMonthIncomes.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ganancia Neta
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  dashboardData.totalProfit >= 0
                    ? 'text-primary'
                    : 'text-destructive'
                }`}
              >
                C$ {dashboardData.totalProfit.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Este mes: C$ {dashboardData.currentMonthProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-2"
              variant={showExpenseForm ? 'secondary' : 'destructive'}
              onClick={() => {
                setShowExpenseForm(!showExpenseForm)
                setShowIncomeForm(false)
              }}
            >
              <Plus className="h-4 w-4" />
              {showExpenseForm ? 'Cancelar' : 'Registrar Gasto'}
            </Button>
            <Button
              className="w-full justify-start gap-2"
              variant={showIncomeForm ? 'secondary' : 'outline'}
              onClick={() => {
                setShowIncomeForm(!showIncomeForm)
                setShowExpenseForm(false)
              }}
            >
              <Plus className="h-4 w-4" />
              {showIncomeForm ? 'Cancelar' : 'Registrar Ingreso'}
            </Button>
            <Link href="/dashboard/finanzas" className="block">
              <Button variant="outline" className="w-full justify-start">
                Ver todas las finanzas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen Mensual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">Gastos</span>
              <span className="text-sm font-bold text-destructive">
                C$ {dashboardData?.currentMonthExpenses.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">Ingresos</span>
              <span className="text-sm font-bold text-primary">
                C$ {dashboardData?.currentMonthIncomes.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
              <span className="text-sm font-medium">Ganancia</span>
              <span
                className={`text-sm font-bold ${
                  (dashboardData?.currentMonthProfit ?? 0) >= 0
                    ? 'text-primary'
                    : 'text-destructive'
                }`}
              >
                C$ {dashboardData?.currentMonthProfit.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
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

      {/* Recent Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseList />
        <IncomeList />
      </div>
    </div>
  )
}
