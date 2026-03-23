'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { CalendarView } from '@/components/ui/calendar-view'
import { Leaf, Plus, Package, DollarSign, TrendingUp, List, CalendarDays } from 'lucide-react'

interface Harvest {
  id: string
  parcela: string
  cantidad: number
  calidad: string | null
  variedad: string | null
  fechaCosecha: string
  precioUnitario: number
}

const calidadOptions = [
  { value: 'alta', label: 'Primera' },
  { value: 'media', label: 'Segunda' },
  { value: 'baja', label: 'Tercera' }
]

const variedadOptions = [
  { value: 'benik', label: 'Benik' },
  { value: 'simpsons', label: 'Simpsons' },
  { value: 'choquete', label: 'Choquete' }
]

const calidadColors: Record<string, string> = {
  alta: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  baja: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const variedadColors: Record<string, string> = {
  benik: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  simpsons: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  choquete: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

export default function CosechasPage() {
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeView, setActiveView] = useState('lista')
  const [formData, setFormData] = useState({
    parcela: '',
    cantidad: '',
    calidad: '',
    variedad: '',
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

  const resetForm = () => {
    setFormData({
      parcela: '',
      cantidad: '',
      calidad: '',
      variedad: '',
      fechaCosecha: new Date().toISOString().split('T')[0],
      precioUnitario: ''
    })
  }

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
        resetForm()
        setShowModal(false)
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

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Helper functions to get labels
  const getCalidadLabel = (value: string | null) => {
    if (!value) return null
    return calidadOptions.find(opt => opt.value === value)?.label || value
  }

  const getVariedadLabel = (value: string | null) => {
    if (!value) return null
    return variedadOptions.find(opt => opt.value === value)?.label || value
  }

  // Calculate statistics
  const totalUnidades = harvests.reduce((sum, h) => sum + h.cantidad, 0)
  const totalValue = harvests.reduce((sum, h) => sum + (h.cantidad * h.precioUnitario), 0)
  const averagePrice = harvests.length > 0 
    ? harvests.reduce((sum, h) => sum + h.precioUnitario, 0) / harvests.length 
    : 0

  // Convert harvests to calendar events
  const calendarEvents = harvests.map((harvest) => ({
    id: harvest.id,
    date: harvest.fechaCosecha,
    title: `${harvest.cantidad} uds - ${harvest.parcela}`,
    subtitle: getVariedadLabel(harvest.variedad) || undefined,
    color: harvest.variedad 
      ? variedadColors[harvest.variedad] 
      : 'bg-primary/20 text-primary'
  }))

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
              {totalUnidades.toLocaleString()} unidades
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
              C$ {totalValue.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
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
              Por unidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions and View Toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cosecha
        </Button>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Registrar Cosecha"
        description="Agrega una nueva cosecha a tu registro"
        icon={<Leaf className="h-5 w-5" />}
      >
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

          <div className="space-y-2">
            <Label htmlFor="variedad">Variedad (opcional)</Label>
            <Select
              value={formData.variedad}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, variedad: value || '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona variedad">
                  {formData.variedad && getVariedadLabel(formData.variedad)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {variedadOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad (unidades)</Label>
              <Input
                id="cantidad"
                type="number"
                step="1"
                min="0"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cantidad: e.target.value }))
                }
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioUnitario">Precio/unidad (C$)</Label>
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
                <SelectValue placeholder="Selecciona calidad">
                  {formData.calidad && getCalidadLabel(formData.calidad)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {calidadOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
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
      </Modal>

      {/* Content Views */}
      {activeView === 'lista' ? (
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
                      <TableHead>Variedad</TableHead>
                      <TableHead>Calidad</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio/ud</TableHead>
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
                          {harvest.variedad ? (
                            <Badge className={variedadColors[harvest.variedad] || 'bg-muted text-muted-foreground'}>
                              {getVariedadLabel(harvest.variedad)}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {harvest.calidad ? (
                            <Badge className={calidadColors[harvest.calidad] || 'bg-muted text-muted-foreground'}>
                              {getCalidadLabel(harvest.calidad)}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {harvest.cantidad.toLocaleString()} uds
                        </TableCell>
                        <TableCell className="text-right">
                          C$ {harvest.precioUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          C$ {(harvest.cantidad * harvest.precioUnitario).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <CalendarView 
          events={calendarEvents}
          onDateClick={(date) => {
            setFormData(prev => ({
              ...prev,
              fechaCosecha: date.toISOString().split('T')[0]
            }))
            setShowModal(true)
          }}
        />
      )}
    </div>
  )
}
