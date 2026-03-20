'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Income {
  id: string
  source: string
  description: string | null
  amount: number
  date: string
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

export function IncomeList() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/incomes')
      if (response.ok) {
        const data = await response.json()
        setIncomes(data)
      }
    } catch (error) {
      console.error('Error fetching incomes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimos Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando ingresos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Últimos Ingresos</CardTitle>
          <CardDescription>Tus ingresos más recientes</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchIncomes}>
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {incomes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay ingresos registrados. Comienza agregando tu primer ingreso.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.slice(0, 10).map((income) => (
                <TableRow key={income.id}>
                  <TableCell>
                    {new Date(income.date).toLocaleDateString('es-NI')}
                  </TableCell>
                  <TableCell>
                    <Badge className={sourceColors[income.source] || sourceColors.otros}>
                      {sourceLabels[income.source] || income.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {income.description || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    C$ {income.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {incomes.length > 10 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Ver todos los ingresos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
