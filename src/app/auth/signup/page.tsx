'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signUp } from '@/lib/supabase/auth-client'
import type { SignUpProfileData } from '@/lib/supabase/auth-client'

// Password strength indicator component
function PasswordStrengthIndicator({ password }: { password: string }) {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++

  const getStrengthColor = (s: number) => {
    if (s <= 1) return 'bg-destructive'
    if (s <= 2) return 'bg-yellow-500'
    if (s === 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (s: number) => {
    if (s === 0) return 'Muy débil'
    if (s <= 1) return 'Débil'
    if (s <= 2) return 'Aceptable'
    if (s === 3) return 'Buena'
    return 'Muy fuerte'
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              index < strength ? getStrengthColor(strength) : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs text-muted-foreground">
          Fortaleza: <span className="font-medium">{getStrengthText(strength)}</span>
        </p>
      )}
    </div>
  )
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    farmName: '',
    location: '',
    hectares: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState<'account' | 'profile'>('account')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep = (step: 'account' | 'profile'): boolean => {
    if (step === 'account') {
      if (!formData.name.trim()) {
        setError('El nombre es requerido')
        return false
      }
      if (!formData.email.trim()) {
        setError('El email es requerido')
        return false
      }
      if (!formData.password) {
        setError('La contraseña es requerida')
        return false
      }
      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return false
      }
    } else if (step === 'profile') {
      if (!formData.farmName.trim()) {
        setError('El nombre de la finca es requerido')
        return false
      }
      if (!formData.location.trim()) {
        setError('La ubicación es requerida')
        return false
      }
    }
    return true
  }

  const handleStepChange = (step: 'account' | 'profile') => {
    if (validateStep(activeStep)) {
      setError('')
      setActiveStep(step)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep('profile')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const profileData: SignUpProfileData = {
        name: formData.name,
        phone: formData.phone,
        farmName: formData.farmName,
        location: formData.location,
        hectares: formData.hectares ? parseFloat(formData.hectares) : undefined,
      }

      await signUp(formData.email, formData.password, profileData)
      router.push('/auth/signin?message=Registro exitoso. Por favor, inicia sesión.')
    } catch (error: any) {
      setError(error.message || 'Error al registrarse. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3 p-2 rounded-lg bg-primary/10">
            <span className="text-3xl">🥑</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Aguacate SaaS</h1>
          <p className="text-muted-foreground mt-2">
            {activeStep === 'account' ? 'Crea tu cuenta' : 'Información de tu finca'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          <div
            className={`flex-1 h-1 rounded-full transition-colors ${
              activeStep === 'account' ? 'bg-primary' : 'bg-primary/30'
            }`}
          />
          <div
            className={`flex-1 h-1 rounded-full transition-colors ${
              activeStep === 'profile' ? 'bg-primary' : 'bg-primary/30'
            }`}
          />
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Step */}
            {activeStep === 'account' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                    Nombre Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                    required
                  />
                  {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                    Teléfono <span className="text-muted-foreground font-normal">(Opcional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                  />
                </div>
              </>
            )}

            {/* Profile Step */}
            {activeStep === 'profile' && (
              <>
                <div>
                  <label htmlFor="farmName" className="block text-sm font-semibold text-foreground mb-2">
                    Nombre de la Finca
                  </label>
                  <input
                    id="farmName"
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    placeholder="Ej: Finca Los Aguacates"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-foreground mb-2">
                    Ubicación
                  </label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ciudad, Provincia"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="hectares" className="block text-sm font-semibold text-foreground mb-2">
                    Hectáreas <span className="text-muted-foreground font-normal">(Opcional)</span>
                  </label>
                  <input
                    id="hectares"
                    type="number"
                    name="hectares"
                    value={formData.hectares}
                    onChange={handleInputChange}
                    placeholder="Número de hectáreas"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {activeStep === 'profile' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStepChange('account')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Atrás
                </Button>
              )}
              {activeStep === 'account' && (
                <Button
                  type="button"
                  onClick={() => handleStepChange('profile')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Siguiente
                </Button>
              )}
              {activeStep === 'profile' && (
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/signin" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Al registrarte aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  )
}

