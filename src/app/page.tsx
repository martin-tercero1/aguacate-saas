'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🥑 Aguacate SaaS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistema de gestión para fincas aguacateras. Controla tus finanzas, 
            cultivos y ventas en un solo lugar.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Control de Finanzas</h3>
              <p className="text-gray-600">
                Registra gastos e ingresos fácilmente. Visualiza tus ganancias en tiempo real.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold mb-2">Seguimiento de Cultivos</h3>
              <p className="text-gray-600">
                Controla actividades culturales, fechas de siembra y estado de tus parcelas.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Gestión de Ventas</h3>
              <p className="text-gray-600">
                Administra cosechas, inventario y ventas para maximizar tus ingresos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
