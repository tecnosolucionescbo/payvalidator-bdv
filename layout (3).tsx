'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Lock, CheckCircle, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bdv-gradient flex flex-col">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <span className="text-red-700 font-black text-sm">BDV</span>
          </div>
          <span className="text-white/80 font-medium text-sm tracking-wide">PayValidator</span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <Lock size={14} />
          Admin
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Logo circle */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-black/40">
            <span className="text-red-700 font-black text-2xl tracking-tight">BDV</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
            <Shield size={14} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
          PayValidator
          <span className="block text-red-200/70 text-3xl sm:text-4xl font-light mt-1">BDV</span>
        </h1>

        <p className="text-white/60 text-lg max-w-md mb-3">
          Sistema de Validación de Pagos
        </p>
        <p className="text-white/40 text-sm mb-12">
          Banco de Venezuela
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: CheckCircle, label: 'Verificación manual segura' },
            { icon: Clock, label: 'Respuesta en minutos' },
            { icon: Shield, label: 'Datos protegidos' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-4 py-2"
            >
              <Icon size={14} className="text-red-300" />
              <span className="text-white/70 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
          <Link
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-white text-red-700 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-2xl shadow-black/20 active:scale-95"
          >
            Realizar un pago
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl border border-white/15 hover:bg-white/15 transition-all duration-200 active:scale-95"
          >
            <Lock size={16} />
            Panel Admin
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 px-6">
        <p className="text-white/25 text-xs">
          © 2026 PayValidator BDV · Sistema de validación de pagos
        </p>
      </footer>
    </main>
  )
}
