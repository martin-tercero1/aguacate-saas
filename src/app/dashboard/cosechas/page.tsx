'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Leaf, Plus, Package, DollarSign, TrendingUp } from 'lucide-react'

interface Harvest {
  id: string
  parcela: string
  cantidad: number
  calidad: string | null
  fechaCosecha: string
  precioUnitario: number
}

const calidadLabels: Record<string, string> = {
  alta: 'Primera',
  media: 'Segunda',
  baja: 'Tercera'
}

const calidadColors: Record<string, string> = {
  alta: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  baja: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

export default function CosechasPage() {
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    parcela: '',
    cantidad: '',
    calidad: '',
    fechaCosecha: new Date().toISOString().split('T')[0],
    precioUnitario: ''
  })

  const fetchHarvests = async () => {
    try {
      const response = await fetch('/api/harvests')
      if (response.ok) {
        const data = await response.json()
        setHarvests(data)
      }
    } catch (error) {
      console.error('Error fetching harvests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHarvests()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          parcela: '',
          cantidad: '',
          calidad: '',
          fechaCosecha: new Date().toISOString().split('T')[0],
          precioUnitario: ''
        })
        setShowForm(false)
        fetchHarvests()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al registrar cosecha')
      }
    } catch (error) {
      alert('Error al registrar cosecha')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate statistics
  const totalKg = harvests.reduce((sum, h) => sum + h.cantidad, 0)
  const totalValue = harvests.reduce((sum, h) => sum + (h.cantidad * h.precioUnitario), 0)
  const averagePrice = harvests.length > 0 
    ? harvests.reduce((sum, h) => sum + h.precioUnitario, 0) / harvests.length 
    : 0

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
          Cosechas
        </h1>
        <p className="mt-1 text-muted-foreground">
          Registra y analiza las cosechas de tu finca
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cosechado
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalKg.toFixed(2)} kg
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {harvests.length} cosechas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              C$ {totalValue.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Basado en precios unitarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precio Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              C$ {averagePrice.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Por kilogramo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'default'}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nueva Cosecha'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mx-auto mb-8 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Registrar Cosecha
            </CardTitle>
            <CardDescription>
              Agrega una nueva cosecha a tu registro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parcela">Parcela</Label>
                <Input
                  id="parcela"
                  value={formData.parcela}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parcela: e.target.value }))
                  }
                  placeholder="Ej: Parcela Norte"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad (kg)</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cantidad: e.target.value }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioUnitario">Precio/kg (C$)</Label>
                  <Input
                    id="precioUnitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precioUnitario}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        precioUnitario: e.target.value
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calidad">Calidad</Label>
                <Select
                  value={formData.calidad}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, calidad: value || '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Primera (Alta)</SelectItem>
                    <SelectItem value="media">Segunda (Media)</SelectItem>
                    <SelectItem value="baja">Tercera (Baja)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaCosecha">Fecha de Cosecha</Label>
                <Input
                  id="fechaCosecha"
                  type="date"
                  value={formData.fechaCosecha}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fechaCosecha: e.target.value
                    }))
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar Cosecha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Historial de Cosechas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {harvests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No hay cosechas registradas. Comienza agregando tu primera cosecha.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Calidad</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio/kg</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {harvests.map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell className="font-medium">
                        {new Date(harvest.fechaCosecha).toLocaleDateString('es-NI')}
                      </TableCell>
                      <TableCell>{harvest.parcela}</TableCell>
                      <TableCell>
                        {harvest.calidad ? (
                          <Badge
                            className={
                              calidadColors[harvest.calidad] ||
                              'bg-muted text-muted-foreground'
                            }
                          >
                            {calidadLabels[harvest.calidad] || harvest.calidad}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {harvest.cantidad.toFixed(2)} kg
                      </TableCell>
                      <TableCell className="text-right">
                        C$ {harvest.precioUnitario.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        C$ {(harvest.cantidad * harvest.precioUnitario).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
