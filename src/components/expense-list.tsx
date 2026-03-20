'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Expense {
  id: string
  category: string
  description: string | null
  amount: number
  date: string
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

export function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimos Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando gastos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Últimos Gastos</CardTitle>
          <CardDescription>Tus gastos más recientes</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchExpenses}>
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay gastos registrados. Comienza agregando tu primer gasto.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 10).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString('es-NI')}
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[expense.category] || categoryColors.otros}>
                      {categoryLabels[expense.category] || expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {expense.description || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    C$ {expense.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {expenses.length > 10 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Ver todos los gastos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
