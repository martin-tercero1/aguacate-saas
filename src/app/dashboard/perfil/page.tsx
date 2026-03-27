'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/contexts/auth-context'
import { AlertCircle, CheckCircle2, User, MapPin } from 'lucide-react'
import { ProfileImageUpload } from '@/components/profile-image-upload'

interface Profile {
  id: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  farmName: string | null
  location: string | null
  hectares: number | null
  createdAt: string
  updatedAt: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
    farmName: '',
    location: '',
    hectares: ''
  })

  // Handle avatar upload success - update local state immediately
  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    setProfile(prev => prev ? { ...prev, avatarUrl } : null)
    setFormData(prev => ({ ...prev, avatarUrl }))
    setMessage({ type: 'success', text: 'Foto de perfil actualizada' })
    setTimeout(() => setMessage(null), 3000)
  }

  // Handle avatar delete success
  const handleAvatarDeleteSuccess = () => {
    setProfile(prev => prev ? { ...prev, avatarUrl: null } : null)
    setFormData(prev => ({ ...prev, avatarUrl: '' }))
    setMessage({ type: 'success', text: 'Foto de perfil eliminada' })
    setTimeout(() => setMessage(null), 3000)
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchProfile()
  }, [user, router])

  async function fetchProfile() {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      // 404 or null body = new user with no profile yet — not an error
      if (!response.ok && response.status !== 404) throw new Error('Error al cargar perfil')
      const data = response.status === 404 ? null : await response.json()
      setProfile(data || null)
      if (data) {
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
          farmName: data.farmName || '',
          location: data.location || '',
          hectares: data.hectares ? data.hectares.toString() : ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Error al cargar el perfil' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const url = profile ? '/api/profile' : '/api/profile'
      const method = profile ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hectares: formData.hectares ? parseFloat(formData.hectares) : null
        })
      })

      if (!response.ok) throw new Error('Error al guardar perfil')
      const data = await response.json()
      setProfile(data)
      setMessage({ type: 'success', text: 'Perfil guardado exitosamente' })
      setShowModal(false)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'Error al guardar el perfil' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary mx-auto" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 lg:p-8">
      <div className="mb-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground">Administra tu información personal y detalles de la finca</p>
      </div>

      {message && (
        <div className={`mb-6 flex items-center gap-3 rounded-lg px-4 py-3 max-w-4xl ${
          message.type === 'success'
            ? 'bg-green-50 text-green-900 border border-green-200'
            : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <div className="max-w-4xl space-y-6">
        {/* Profile Image Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Foto de Perfil
            </CardTitle>
            <CardDescription>Tu imagen de perfil es privada y solo visible para ti</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProfileImageUpload
              currentAvatarUrl={profile?.avatarUrl}
              onUploadSuccess={handleAvatarUploadSuccess}
              onDeleteSuccess={handleAvatarDeleteSuccess}
            />
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Detalles básicos de tu cuenta</CardDescription>
            </div>
            <Button onClick={() => setShowModal(true)} variant="outline">
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="mt-1 font-medium">{user?.email || 'No disponible'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                <p className="mt-1 font-medium">{profile?.fullName || 'No configurado'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Teléfono</Label>
                <p className="mt-1 font-medium">{profile?.phone || 'No configurado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farm Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de la Finca
              </CardTitle>
              <CardDescription>Detalles sobre tu finca de aguacate</CardDescription>
            </div>
            <Button onClick={() => setShowModal(true)} variant="outline">
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Nombre de Finca</Label>
                <p className="mt-1 font-medium">{profile?.farmName || 'No configurado'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ubicación</Label>
                <p className="mt-1 font-medium">{profile?.location || 'No configurado'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">Tamaño (hectáreas)</Label>
                <p className="mt-1 font-medium">{profile?.hectares ? `${profile.hectares} ha` : 'No configurado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Editar Perfil"
        description="Actualiza tu información personal y detalles de la finca"
      >
        <div className="space-y-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="finca">Finca</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Tu nombre completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+505 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="finca" className="space-y-4">
              <div>
                <Label htmlFor="farmName">Nombre de la Finca</Label>
                <Input
                  id="farmName"
                  placeholder="Ej: Finca La Verde"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ciudad o región"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hectares">Tamaño (hectáreas)</Label>
                <Input
                  id="hectares"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 5.5"
                  value={formData.hectares}
                  onChange={(e) => setFormData({ ...formData, hectares: e.target.value })}
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
