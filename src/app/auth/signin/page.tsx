'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/supabase/auth-client'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const msg = searchParams.get('message')
    if (msg) {
      setMessage(msg)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Por favor ingresa tu email')
      setIsLoading(false)
      return
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña')
      setIsLoading(false)
      return
    }

    try {
      await signIn(email, password)
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.')
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
          <p className="text-muted-foreground mt-2">Ingresa a tu cuenta</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 backdrop-blur-sm">
          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800 text-green-700 dark:text-green-200 text-sm animate-in fade-in">
              <div className="flex items-start gap-3">
                <span className="text-lg">✓</span>
                <span>{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Contraseña
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground transition-colors pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <span className="text-lg">👁️</span>
                  ) : (
                    <span className="text-lg">👁️‍🗨️</span>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 font-semibold py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Remember Me - Optional Enhancement */}
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input bg-background cursor-pointer"
                defaultChecked
              />
              <span>Recuerda este dispositivo</span>
            </label>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Esta página es segura y encriptada. Tus datos están protegidos.
        </p>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="inline-block mb-3 p-2 rounded-lg bg-primary/10">
            <span className="text-3xl">🥑</span>
          </div>
          <p className="text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
