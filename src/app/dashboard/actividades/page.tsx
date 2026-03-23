'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Plus, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface Activity {
  id: string
  tipo: string
  parcela: string
  descripcion: string | null
  fecha: string
  estado: string
}

const tipoLabels: Record<string, string> = {
  siembra: 'Siembra',
  abono: 'Abono',
  fumigacion: 'Fumigacion',
  poda: 'Poda',
  riego: 'Riego',
  limpieza: 'Limpieza',
  cosecha: 'Cosecha',
  mantenimiento: 'Mantenimiento',
  otros: 'Otros'
}

const tipoColors: Record<string, string> = {
  siembra: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  abono: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  fumigacion: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  poda: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  riego: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  limpieza: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  cosecha: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  mantenimiento: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  otros: 'bg-muted text-muted-foreground'
}

const estadoConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  pendiente: {
    label: 'Pendiente',
    icon: Circle,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
  },
  en_proceso: {
    label: 'En Proceso',
    icon: Loader2,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
  }
}

export default function ActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>('todos')
  const [formData, setFormData] = useState({
    tipo: '',
    parcela: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente'
  })

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          tipo: '',
          parcela: '',
          descripcion: '',
          fecha: new Date().toISOString().split('T')[0],
          estado: 'pendiente'
        })
        setShowForm(false)
        fetchActivities()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al registrar actividad')
      }
    } catch (error) {
      alert('Error al registrar actividad')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (activityId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activityId, estado: newStatus })
      })

      if (response.ok) {
        fetchActivities()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filter === 'todos') return true
    return activity.estado === filter
  })

  // Calculate statistics
  const pendingCount = activities.filter((a) => a.estado === 'pendiente').length
  const inProgressCount = activities.filter((a) => a.estado === 'en_proceso').length
  const completedCount = activities.filter((a) => a.estado === 'completado').length

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
          Actividades
        </h1>
        <p className="mt-1 text-muted-foreground">
          Planifica y da seguimiento a las tareas de tu finca
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Circle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tareas por iniciar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Proceso
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tareas en ejecucion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tareas finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('todos')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'pendiente' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pendiente')}
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'en_proceso' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('en_proceso')}
          >
            En Proceso
          </Button>
          <Button
            variant={filter === 'completado' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completado')}
          >
            Completadas
          </Button>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'default'}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nueva Actividad'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mx-auto mb-8 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Nueva Actividad
            </CardTitle>
            <CardDescription>
              Planifica una nueva tarea para tu finca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Actividad</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, tipo: value || '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="siembra">Siembra</SelectItem>
                    <SelectItem value="abono">Abono</SelectItem>
                    <SelectItem value="fumigacion">Fumigacion</SelectItem>
                    <SelectItem value="poda">Poda</SelectItem>
                    <SelectItem value="riego">Riego</SelectItem>
                    <SelectItem value="limpieza">Limpieza</SelectItem>
                    <SelectItem value="cosecha">Cosecha</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="descripcion">Descripcion (opcional)</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      descripcion: e.target.value
                    }))
                  }
                  placeholder="Detalles adicionales"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha Programada</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Crear Actividad'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {filter === 'todos'
                ? 'No hay actividades registradas. Comienza creando tu primera actividad.'
                : `No hay actividades con estado "${estadoConfig[filter]?.label || filter}".`}
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => {
            const statusConfig = estadoConfig[activity.estado] || estadoConfig.pendiente
            const StatusIcon = statusConfig.icon

            return (
              <Card key={activity.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={
                            tipoColors[activity.tipo] || tipoColors.otros
                          }
                        >
                          {tipoLabels[activity.tipo] || activity.tipo}
                        </Badge>
                        <Badge variant="outline">{activity.parcela}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(activity.fecha).toLocaleDateString('es-NI')}
                        </span>
                      </div>
                      {activity.descripcion && (
                        <p className="text-sm text-muted-foreground">
                          {activity.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={activity.estado}
                        onValueChange={(value) =>
                          handleStatusChange(activity.id, value)
                        }
                      >
                        <SelectTrigger className={`w-[140px] ${statusConfig.color}`}>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">
                            <div className="flex items-center gap-2">
                              <Circle className="h-4 w-4" />
                              Pendiente
                            </div>
                          </SelectItem>
                          <SelectItem value="en_proceso">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4" />
                              En Proceso
                            </div>
                          </SelectItem>
                          <SelectItem value="completado">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Completado
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
