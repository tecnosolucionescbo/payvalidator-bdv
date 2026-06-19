'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react'

const ADMIN_KEY = 'payvalidator-bdv-2026-secreto-admin-123456789'
const STORAGE_KEY = 'bdv_admin_auth'

export default function LoginPage() {
  const router = useRouter()
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === ADMIN_KEY) {
      router.replace('/dashboard')
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (key === ADMIN_KEY) {
        localStorage.setItem(STORAGE_KEY, ADMIN_KEY)
        router.push('/dashboard')
      } else {
        setError('Clave incorrecta. Verifica e intenta nuevamente.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-white font-black text-2xl">Panel de Administración</h1>
          <p className="text-white/40 text-sm mt-1">PayValidator BDV</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white/5 border border-white/8 rounded-xl p-5">
            <label className="block text-white/50 text-xs mb-2 uppercase tracking-wide">
              Clave de administrador
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
                autoFocus
                placeholder="••••••••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-colors font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !key}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95"
          >
            {loading ? 'Verificando...' : 'Ingresar al panel'}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-6">
          Acceso restringido · Solo administradores
        </p>
      </div>
    </main>
  )
}
