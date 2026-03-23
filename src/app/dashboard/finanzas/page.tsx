'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from '@/components/expense-form'
import { IncomeForm } from '@/components/income-form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Plus, ArrowUpDown } from 'lucide-react'

interface Expense {
  id: string
  category: string
  description: string | null
  amount: number
  date: string
}

interface Income {
  id: string
  source: string
  description: string | null
  amount: number
  date: string
}

interface DashboardData {
  totalExpenses: number
  totalIncomes: number
  totalProfit: number
  currentMonthExpenses: number
  currentMonthIncomes: number
  currentMonthProfit: number
}

const categoryLabels: Record<string, string> = {
  insumos: 'Insumos',
  mano_de_obra: 'Mano de Obra',
  mantenimiento: 'Mantenimiento',
  transporte: 'Transporte',
  fertilizantes: 'Fertilizantes',
  pesticidas: 'Pesticidas',
  agua: 'Agua',
  otros: 'Otros'
}

const categoryColors: Record<string, string> = {
  insumos: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  mano_de_obra: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  transporte: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  fertilizantes: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  pesticidas: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  agua: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  otros: 'bg-muted text-muted-foreground'
}

const sourceLabels: Record<string, string> = {
  venta_cosechas: 'Venta de Cosechas',
  venta_aguacates: 'Venta de Aguacates',
  otros_productos: 'Otros Productos',
  servicios: 'Servicios',
  subsidios: 'Subsidios',
  otros: 'Otros'
}

const sourceColors: Record<string, string> = {
  venta_cosechas: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  venta_aguacates: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  otros_productos: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  servicios: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  subsidios: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  otros: 'bg-muted text-muted-foreground'
}

export default function FinanzasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [activeTab, setActiveTab] = useState('gastos')

  const fetchData = async () => {
    try {
      const [expensesRes, incomesRes, dashboardRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/incomes'),
        fetch('/api/dashboard')
      ])

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData)
      }
      if (incomesRes.ok) {
        const incomesData = await incomesRes.json()
        setIncomes(incomesData)
      }
      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleExpenseSuccess = () => {
    setShowExpenseForm(false)
    fetchData()
  }

  const handleIncomeSuccess = () => {
    setShowIncomeForm(false)
    fetchData()
  }

  if (loading) {
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
          Finanzas
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona los gastos e ingresos de tu finca
        </p>
      </div>

      {/* Stats Cards */}
      {dashboardData && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gastos
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
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
                Total Ingresos
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="gastos" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Gastos
            </TabsTrigger>
            <TabsTrigger value="ingresos" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Ingresos
            </TabsTrigger>
          </TabsList>

          {activeTab === 'gastos' ? (
            <Button
              onClick={() => {
                setShowExpenseForm(!showExpenseForm)
                setShowIncomeForm(false)
              }}
              variant={showExpenseForm ? 'secondary' : 'destructive'}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {showExpenseForm ? 'Cancelar' : 'Nuevo Gasto'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setShowIncomeForm(!showIncomeForm)
                setShowExpenseForm(false)
              }}
              variant={showIncomeForm ? 'secondary' : 'default'}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {showIncomeForm ? 'Cancelar' : 'Nuevo Ingreso'}
            </Button>
          )}
        </div>

        {/* Forms */}
        {showExpenseForm && (
          <div className="flex justify-center">
            <ExpenseForm onSuccess={handleExpenseSuccess} />
          </div>
        )}

        {showIncomeForm && (
          <div className="flex justify-center">
            <IncomeForm onSuccess={handleIncomeSuccess} />
          </div>
        )}

        {/* Gastos Tab */}
        <TabsContent value="gastos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Todos los Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No hay gastos registrados. Comienza agregando tu primer gasto.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">
                          <div className="flex items-center gap-1">
                            Fecha
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Descripcion
                        </TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {new Date(expense.date).toLocaleDateString('es-NI')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                categoryColors[expense.category] ||
                                categoryColors.otros
                              }
                            >
                              {categoryLabels[expense.category] ||
                                expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                            {expense.description || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            C$ {expense.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingresos Tab */}
        <TabsContent value="ingresos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Todos los Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No hay ingresos registrados. Comienza agregando tu primer
                  ingreso.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">
                          <div className="flex items-center gap-1">
                            Fecha
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Fuente</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Descripcion
                        </TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">
                            {new Date(income.date).toLocaleDateString('es-NI')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                sourceColors[income.source] || sourceColors.otros
                              }
                            >
                              {sourceLabels[income.source] || income.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                            {income.description || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            C$ {income.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
