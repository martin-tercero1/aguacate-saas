'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Leaf, 
  ClipboardList,
  ArrowRight,
  Calendar,
  Package,
  Circle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalExpenses: number
  totalIncomes: number
  totalProfit: number
  currentMonthExpenses: number
  currentMonthIncomes: number
  currentMonthProfit: number
}

interface Harvest {
  id: string
  parcela: string
  cantidad: number
  calidad: string | null
  variedad: string | null
  fechaCosecha: string
  precioUnitario: number
}

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

const variedadLabels: Record<string, string> = {
  benik: 'Benik',
  simpsons: 'Simpsons',
  choquete: 'Choquete'
}

const estadoConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  pendiente: { label: 'Pendiente', icon: Circle, color: 'text-yellow-600' },
  en_proceso: { label: 'En Proceso', icon: Clock, color: 'text-blue-600' },
  completado: { label: 'Completado', icon: CheckCircle2, color: 'text-green-600' }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      const [dashboardRes, harvestsRes, activitiesRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/harvests'),
        fetch('/api/activities')
      ])

      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setDashboardData(data)
      }
      if (harvestsRes.ok) {
        const data = await harvestsRes.json()
        setHarvests(data)
      }
      if (activitiesRes.ok) {
        const data = await activitiesRes.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Get recent harvests (last 5)
  const recentHarvests = harvests.slice(0, 5)

  // Get upcoming/recent activities - prioritize future dates and pending status
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.fecha)
    const dateB = new Date(b.fecha)
    const isFutureA = dateA >= today
    const isFutureB = dateB >= today
    
    // Prioritize future activities
    if (isFutureA && !isFutureB) return -1
    if (!isFutureA && isFutureB) return 1
    
    // Among future, prioritize pending > en_proceso > completado
    if (isFutureA && isFutureB) {
      const statusOrder: Record<string, number> = { pendiente: 0, en_proceso: 1, completado: 2 }
      const statusDiff = (statusOrder[a.estado] || 0) - (statusOrder[b.estado] || 0)
      if (statusDiff !== 0) return statusDiff
      // Same status, sort by date ascending (nearest first)
      return dateA.getTime() - dateB.getTime()
    }
    
    // Past activities: most recent first
    return dateB.getTime() - dateA.getTime()
  })
  
  const upcomingActivities = sortedActivities.slice(0, 5)

  // Calculate activity stats
  const pendingCount = activities.filter((a) => a.estado === 'pendiente').length
  const inProgressCount = activities.filter((a) => a.estado === 'en_proceso').length

  // Calculate harvest stats for this month
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  
  const thisMonthHarvests = harvests.filter(h => new Date(h.fechaCosecha) >= currentMonth)
  const thisMonthUnits = thisMonthHarvests.reduce((sum, h) => sum + h.cantidad, 0)

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
          Bienvenido, {user?.user_metadata?.name || 'Usuario'}. Aqui esta el resumen de tu finca.
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance del Mes
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${(dashboardData?.currentMonthProfit ?? 0) >= 0 ? 'text-primary' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (dashboardData?.currentMonthProfit ?? 0) >= 0
                  ? 'text-primary'
                  : 'text-destructive'
              }`}
            >
              C$ {(dashboardData?.currentMonthProfit ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ingresos - Gastos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cosechado este Mes
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {thisMonthUnits.toLocaleString()} uds
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {thisMonthHarvests.length} cosechas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas Pendientes
            </CardTitle>
            <Circle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {inProgressCount} en proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (dashboardData?.totalProfit ?? 0) >= 0
                  ? 'text-primary'
                  : 'text-destructive'
              }`}
            >
              C$ {(dashboardData?.totalProfit ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Historico total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/finanzas">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Finanzas</p>
                  <p className="text-xs text-muted-foreground">Gastos e ingresos</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/cosechas">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Cosechas</p>
                  <p className="text-xs text-muted-foreground">Registro de produccion</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/actividades">
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Actividades</p>
                  <p className="text-xs text-muted-foreground">Tareas y planificacion</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Proximas Actividades
            </CardTitle>
            <Link href="/dashboard/actividades">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingActivities.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No hay actividades programadas</p>
                <Link href="/dashboard/actividades">
                  <Button variant="link" size="sm" className="mt-2">
                    Crear actividad
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.map((activity) => {
                  const activityDate = new Date(activity.fecha)
                  const isFuture = activityDate >= today
                  const isToday = activityDate.toDateString() === today.toDateString()
                  const StatusIcon = estadoConfig[activity.estado]?.icon || Circle
                  
                  return (
                    <div
                      key={activity.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        isToday ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon 
                          className={`h-4 w-4 ${estadoConfig[activity.estado]?.color || 'text-muted-foreground'}`} 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={tipoColors[activity.tipo] || tipoColors.otros}>
                              {tipoLabels[activity.tipo] || activity.tipo}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {activity.parcela}
                            </span>
                          </div>
                          {activity.descripcion && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                              {activity.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                          {isToday ? 'Hoy' : activityDate.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isFuture ? (isToday ? '' : 'Proxima') : 'Pasada'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Harvests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="h-5 w-5 text-primary" />
              Ultimas Cosechas
            </CardTitle>
            <Link href="/dashboard/cosechas">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentHarvests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Leaf className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No hay cosechas registradas</p>
                <Link href="/dashboard/cosechas">
                  <Button variant="link" size="sm" className="mt-2">
                    Registrar cosecha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHarvests.map((harvest) => (
                  <div
                    key={harvest.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{harvest.parcela}</span>
                          {harvest.variedad && (
                            <span className="text-xs text-muted-foreground">
                              ({variedadLabels[harvest.variedad] || harvest.variedad})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {harvest.cantidad.toLocaleString()} unidades @ C$ {harvest.precioUnitario.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">
                        C$ {(harvest.cantidad * harvest.precioUnitario).toLocaleString('es-NI')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(harvest.fechaCosecha).toLocaleDateString('es-NI', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              Resumen Financiero
            </CardTitle>
            <Link href="/dashboard/finanzas">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Ver detalles <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-muted-foreground">Gastos del Mes</span>
                </div>
                <p className="mt-2 text-xl font-bold text-destructive">
                  C$ {(dashboardData?.currentMonthExpenses ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Ingresos del Mes</span>
                </div>
                <p className="mt-2 text-xl font-bold text-primary">
                  C$ {(dashboardData?.currentMonthIncomes ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-muted-foreground">Total Gastos</span>
                </div>
                <p className="mt-2 text-xl font-bold text-destructive">
                  C$ {(dashboardData?.totalExpenses ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Total Ingresos</span>
                </div>
                <p className="mt-2 text-xl font-bold text-primary">
                  C$ {(dashboardData?.totalIncomes ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
