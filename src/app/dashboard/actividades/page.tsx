'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { CalendarView } from '@/components/ui/calendar-view'
import { ClipboardList, Plus, Clock, CheckCircle2, Circle, Loader2, List, CalendarDays, Pencil, Trash2 } from 'lucide-react'

interface Activity {
  id: string
  tipo: string
  parcela: string
  descripcion: string | null
  fecha: string
  estado: string
}

const tipoOptions = [
  { value: 'siembra', label: 'Siembra' },
  { value: 'abono', label: 'Abono' },
  { value: 'fumigacion', label: 'Fumigacion' },
  { value: 'poda', label: 'Poda' },
  { value: 'riego', label: 'Riego' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'cosecha', label: 'Cosecha' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'otros', label: 'Otros' }
]

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

const estadoOptions = [
  { value: 'pendiente', label: 'Pendiente', icon: Circle, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'en_proceso', label: 'En Proceso', icon: Loader2, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'completado', label: 'Completado', icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200' }
]

export default function ActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>('todos')
  const [activeView, setActiveView] = useState('lista')
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

  const resetForm = () => {
    setFormData({
      tipo: '',
      parcela: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente'
    })
    setEditingActivity(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = '/api/activities'
      const method = editingActivity ? 'PUT' : 'POST'
      const body = editingActivity 
        ? { id: editingActivity.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        resetForm()
        setShowModal(false)
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/activities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id })
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setDeleteTarget(null)
        fetchActivities()
      } else {
        alert('Error al eliminar actividad')
      }
    } catch (error) {
      alert('Error al eliminar actividad')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      tipo: activity.tipo,
      parcela: activity.parcela,
      descripcion: activity.descripcion || '',
      fecha: activity.fecha.split('T')[0],
      estado: activity.estado
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Helper function to get labels
  const getTipoLabel = (value: string) => {
    return tipoOptions.find(opt => opt.value === value)?.label || value
  }

  const getEstadoConfig = (value: string) => {
    return estadoOptions.find(opt => opt.value === value) || estadoOptions[0]
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

  // Convert to calendar events
  const calendarEvents = filteredActivities.map((activity) => ({
    id: activity.id,
    date: activity.fecha,
    title: getTipoLabel(activity.tipo),
    subtitle: activity.parcela,
    color: tipoColors[activity.tipo] || tipoColors.otros
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

      {/* Actions, Filter & View Toggle */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
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

            <Button onClick={() => { resetForm(); setShowModal(true) }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Actividad
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
        description={editingActivity ? 'Modifica los datos de la actividad' : 'Planifica una nueva tarea para tu finca'}
        icon={<ClipboardList className="h-5 w-5" />}
      >
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
                <SelectValue placeholder="Selecciona tipo">
                  {formData.tipo && getTipoLabel(formData.tipo)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tipoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
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

          {editingActivity && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, estado: value || 'pendiente' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado">
                    {getEstadoConfig(formData.estado).label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : editingActivity ? 'Guardar Cambios' : 'Crear Actividad'}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteTarget(null)
        }}
        title="Confirmar Eliminacion"
        description="¿Estas seguro de eliminar esta actividad?"
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta accion no se puede deshacer. Se eliminara permanentemente la actividad.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteTarget(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Content Views */}
      {activeView === 'lista' ? (
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {filter === 'todos'
                  ? 'No hay actividades registradas. Comienza creando tu primera actividad.'
                  : `No hay actividades con estado "${getEstadoConfig(filter).label}".`}
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((activity) => {
              const statusConfig = getEstadoConfig(activity.estado)
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
                            {getTipoLabel(activity.tipo)}
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
                          onValueChange={(value) => {
                            if (value) handleStatusChange(activity.id, value)
                          }}
                        >
                          <SelectTrigger className={`w-[140px] ${statusConfig.color}`}>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <span>{statusConfig.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {estadoOptions.map((opt) => {
                              const Icon = opt.icon
                              return (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {opt.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditActivity(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteTarget({ id: activity.id, name: getTipoLabel(activity.tipo) })
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      ) : (
        <CalendarView 
          events={calendarEvents}
          onDateClick={(date) => {
            setFormData(prev => ({
              ...prev,
              fecha: date.toISOString().split('T')[0]
            }))
            setShowModal(true)
          }}
        />
      )}
    </div>
  )
}
