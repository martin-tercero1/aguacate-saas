'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { CalendarView } from '@/components/ui/calendar-view'
import { DollarSign, TrendingUp, TrendingDown, Plus, ArrowUpDown, List, CalendarDays } from 'lucide-react'

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

const categoryOptions = [
  { value: 'insumos', label: 'Insumos' },
  { value: 'mano_de_obra', label: 'Mano de Obra' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'fertilizantes', label: 'Fertilizantes' },
  { value: 'pesticidas', label: 'Pesticidas' },
  { value: 'agua', label: 'Agua' },
  { value: 'otros', label: 'Otros' }
]

const sourceOptions = [
  { value: 'venta_cosechas', label: 'Venta de Cosechas' },
  { value: 'venta_aguacates', label: 'Venta de Aguacates' },
  { value: 'otros_productos', label: 'Otros Productos' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'subsidios', label: 'Subsidios' },
  { value: 'otros', label: 'Otros' }
]

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
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [activeTab, setActiveTab] = useState('gastos')
  const [activeView, setActiveView] = useState('lista')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [incomeForm, setIncomeForm] = useState({
    source: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

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

  const resetExpenseForm = () => {
    setExpenseForm({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const resetIncomeForm = () => {
    setIncomeForm({
      source: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      })

      if (response.ok) {
        resetExpenseForm()
        setShowExpenseModal(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al registrar gasto')
      }
    } catch (error) {
      alert('Error al registrar gasto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeForm)
      })

      if (response.ok) {
        resetIncomeForm()
        setShowIncomeModal(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al registrar ingreso')
      }
    } catch (error) {
      alert('Error al registrar ingreso')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper functions to get labels
  const getCategoryLabel = (value: string) => {
    return categoryOptions.find(opt => opt.value === value)?.label || value
  }

  const getSourceLabel = (value: string) => {
    return sourceOptions.find(opt => opt.value === value)?.label || value
  }

  // Convert to calendar events
  const expenseEvents = expenses.map((expense) => ({
    id: expense.id,
    date: expense.date,
    title: `- C$ ${expense.amount.toFixed(0)}`,
    subtitle: getCategoryLabel(expense.category),
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }))

  const incomeEvents = incomes.map((income) => ({
    id: income.id,
    date: income.date,
    title: `+ C$ ${income.amount.toFixed(0)}`,
    subtitle: getSourceLabel(income.source),
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }))

  const allEvents = activeTab === 'gastos' ? expenseEvents : incomeEvents

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
                C$ {dashboardData.totalExpenses.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Este mes: C$ {dashboardData.currentMonthExpenses.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
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
                C$ {dashboardData.totalIncomes.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Este mes: C$ {dashboardData.currentMonthIncomes.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
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
                C$ {dashboardData.totalProfit.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Este mes: C$ {dashboardData.currentMonthProfit.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs and Actions */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          </Tabs>

          <div className="flex items-center gap-2">
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList>
                <TabsTrigger value="lista" className="gap-2">
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="calendario" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Calendario
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === 'gastos' ? (
              <Button
                onClick={() => setShowExpenseModal(true)}
                variant="destructive"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Gasto
              </Button>
            ) : (
              <Button
                onClick={() => setShowIncomeModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Ingreso
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          resetExpenseForm()
        }}
        title="Registrar Gasto"
        description="Agrega un nuevo gasto a tu finca"
        icon={<TrendingDown className="h-5 w-5" />}
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={expenseForm.category}
              onValueChange={(value) =>
                setExpenseForm((prev) => ({ ...prev, category: value || '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoria">
                  {expenseForm.category && getCategoryLabel(expenseForm.category)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Input
              id="description"
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Ej: Compra de fertilizantes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto (C$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={expenseForm.date}
              onChange={(e) =>
                setExpenseForm((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <Button type="submit" variant="destructive" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar Gasto'}
          </Button>
        </form>
      </Modal>

      {/* Income Modal */}
      <Modal
        isOpen={showIncomeModal}
        onClose={() => {
          setShowIncomeModal(false)
          resetIncomeForm()
        }}
        title="Registrar Ingreso"
        description="Agrega un nuevo ingreso a tu finca"
        icon={<TrendingUp className="h-5 w-5" />}
      >
        <form onSubmit={handleIncomeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Fuente</Label>
            <Select
              value={incomeForm.source}
              onValueChange={(value) =>
                setIncomeForm((prev) => ({ ...prev, source: value || '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una fuente">
                  {incomeForm.source && getSourceLabel(incomeForm.source)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Input
              id="description"
              value={incomeForm.description}
              onChange={(e) =>
                setIncomeForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Ej: Venta de cosecha de aguacates"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto (C$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={incomeForm.amount}
              onChange={(e) =>
                setIncomeForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={incomeForm.date}
              onChange={(e) =>
                setIncomeForm((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar Ingreso'}
          </Button>
        </form>
      </Modal>

      {/* Content Views */}
      {activeView === 'lista' ? (
        <>
          {/* Gastos Tab Content */}
          {activeTab === 'gastos' && (
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
                                {getCategoryLabel(expense.category)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                              {expense.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">
                              C$ {expense.amount.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingresos Tab Content */}
          {activeTab === 'ingresos' && (
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
                    No hay ingresos registrados. Comienza agregando tu primer ingreso.
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
                                {getSourceLabel(income.source)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                              {income.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                              C$ {income.amount.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <CalendarView 
          events={allEvents}
          onDateClick={(date) => {
            const dateStr = date.toISOString().split('T')[0]
            if (activeTab === 'gastos') {
              setExpenseForm(prev => ({ ...prev, date: dateStr }))
              setShowExpenseModal(true)
            } else {
              setIncomeForm(prev => ({ ...prev, date: dateStr }))
              setShowIncomeModal(true)
            }
          }}
        />
      )}
    </div>
  )
}
