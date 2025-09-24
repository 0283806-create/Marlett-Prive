'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { resendConfirmationEmail } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock, Mail, Eye, EyeOff, RefreshCw, CheckCircle } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailNotConfirmed(false)
    setResendSuccess(false)
    setLoading(true)

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setEmailNotConfirmed(true)
          setError('Tu email no ha sido confirmado. Por favor revisa tu bandeja de entrada.')
        } else {
          setError(error.message || 'Error al iniciar sesión')
        }
      } else if (data?.user) {
        // Success - user will be redirected automatically by auth context
        console.log('Login successful')
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    
    try {
      const { error } = await resendConfirmationEmail(email)
      if (error) {
        setError('Error al reenviar el email de confirmación')
      } else {
        setResendSuccess(true)
        setError('')
      }
    } catch (err) {
      setError('Error inesperado al reenviar el email')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-48 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl mx-auto border border-white/20 mb-4">
            <img
              src="/Mdorado.svg"
              alt="Dorado Logo"
              className="w-44 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-stone-300">Acceso exclusivo para administradores</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-stone-300">
              Ingresa tus credenciales para acceder al panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              {emailNotConfirmed && (
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-200 text-sm font-medium">Email no confirmado</span>
                  </div>
                  <p className="text-amber-200 text-sm mb-3">
                    Necesitas confirmar tu email antes de poder acceder. Revisa tu bandeja de entrada y spam.
                  </p>
                  <Button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading || resendSuccess}
                    className="w-full bg-amber-500/20 border border-amber-300/30 text-amber-200 hover:bg-amber-500/30 transition-all duration-300"
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Reenviando...
                      </>
                    ) : resendSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Email reenviado
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reenviar email de confirmación
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-200">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dorado.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-stone-400 focus:border-white/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-200">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-stone-400 focus:border-white/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Iniciando sesión...' : 'Acceder al Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-stone-400 text-sm">
            ¿Problemas para acceder? Contacta al administrador del sistema
          </p>
        </div>
      </div>
    </div>
  )
}
