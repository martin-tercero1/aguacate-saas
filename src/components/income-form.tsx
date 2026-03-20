'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface IncomeFormProps {
  onSuccess?: () => void
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    source: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const sources = [
    { value: 'venta_cosechas', label: 'Venta de Cosechas' },
    { value: 'venta_aguacates', label: 'Venta de Aguacates' },
    { value: 'otros_productos', label: 'Otros Productos' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'subsidios', label: 'Subsidios' },
    { value: 'otros', label: 'Otros' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          source: '',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        })
        onSuccess?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al registrar ingreso')
      }
    } catch (error) {
      alert('Error al registrar ingreso')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registrar Ingreso</CardTitle>
        <CardDescription>Agrega un nuevo ingreso a tu finca</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Fuente</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value || '' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una fuente" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar Ingreso'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
