'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut, RefreshCw, CheckCircle, XCircle, Clock, Eye,
  AlertCircle, TrendingUp, DollarSign, FileImage, ExternalLink
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import { formatBs, formatDate, minutesUntilExpiry } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import type { Order, PaymentReceived, DailyStats } from '@/types'

const ADMIN_KEY = 'payvalidator-bdv-2026-secreto-admin-123456789'
const STORAGE_KEY = 'bdv_admin_auth'

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-white/40 text-xs uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-white font-black text-2xl">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  )
}

// ─── RECEIPT PREVIEW MODAL ────────────────────────────────────────────────────
function ReceiptModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
          <XCircle size={18} />
        </button>
        {url.endsWith('.pdf') ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center">
            <FileImage size={48} className="text-white/30 mx-auto mb-3" />
            <p className="text-white/60 mb-4">Comprobante en formato PDF</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
              <ExternalLink size={16} /> Abrir PDF
            </a>
          </div>
        ) : (
          <img src={url} alt="Comprobante" className="w-full rounded-xl shadow-2xl" />
        )}
      </div>
    </div>
  )
}

// ─── PENDING ORDER ROW ────────────────────────────────────────────────────────
function PendingOrderRow({ order }: { order: Order }) {
  const mins = minutesUntilExpiry(order.expires_at)
  const urgent = mins < 10

  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-bold text-white text-sm">{order.reference}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-white/50 text-xs truncate">{order.customer_name}</p>
        <p className="text-white/30 text-xs">{formatDate(order.created_at)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-bold">Bs. {formatBs(order.amount)}</p>
        <p className={`text-xs mt-1 flex items-center gap-1 justify-end ${urgent ? 'text-red-400' : 'text-white/40'}`}>
          <Clock size={11} />
          {mins > 0 ? `${mins} min` : 'Expirada'}
        </p>
      </div>
    </div>
  )
}

// ─── PAYMENT REVIEW CARD ──────────────────────────────────────────────────────
function PaymentReviewCard({
  payment,
  onConfirm,
  onReject,
}: {
  payment: PaymentReceived
  onConfirm: (id: string, orderId: string | null) => void
  onReject: (id: string) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)

  const getSignedUrl = async () => {
    if (!payment.receipt_path) return
    const supabase = getSupabaseClient()
    const { data } = await supabase.storage.from('receipts').createSignedUrl(payment.receipt_path, 300)
    if (data?.signedUrl) setPreviewUrl(data.signedUrl)
  }

  const handleConfirm = async () => {
    setConfirmLoading(true)
    onConfirm(payment.id, payment.matched_order_id)
  }

  const handleReject = async () => {
    setRejectLoading(true)
    onReject(payment.id)
  }

  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-white text-sm">{payment.reference ?? '—'}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[payment.status]}`}>
              {STATUS_LABELS[payment.status]}
            </span>
          </div>
          <p className="text-white/40 text-xs">{formatDate(payment.created_at)}</p>
        </div>
        {payment.receipt_path && (
          <button
            onClick={getSignedUrl}
            className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 hover:text-white text-xs transition-all"
          >
            <Eye size={13} />
            Ver
          </button>
        )}
      </div>

      {payment.orders && (
        <div className="bg-white/3 rounded-lg px-3 py-2 mb-3 text-xs">
          <p className="text-white/40 mb-1">Orden relacionada</p>
          <p className="text-white/80 font-medium">{payment.orders.customer_name}</p>
          <p className="text-white font-bold">Bs. {formatBs(payment.orders.amount)}</p>
        </div>
      )}

      {payment.status === 'review' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleConfirm}
            disabled={confirmLoading || rejectLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-300 hover:text-green-200 text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-40"
          >
            <CheckCircle size={15} />
            {confirmLoading ? 'Confirmando...' : 'Confirmar'}
          </button>
          <button
            onClick={handleReject}
            disabled={confirmLoading || rejectLoading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-40"
          >
            <XCircle size={15} />
            {rejectLoading ? 'Rechazando...' : 'Rechazar'}
          </button>
        </div>
      )}

      {previewUrl && <ReceiptModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  )
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<PaymentReceived[]>([])
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Auth guard
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== ADMIN_KEY) { router.replace('/login'); return }
    setAuthed(true)
  }, [])

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    setError('')
    try {
      const supabase = getSupabaseClient()
      const today = new Date().toISOString().split('T')[0]

      const [ordersRes, paymentsRes, statsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .in('status', ['pending', 'review'])
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('payments_received')
          .select('*, orders(*)')
          .eq('status', 'review')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.rpc('get_daily_stats', { p_date: today }),
      ])

      if (ordersRes.error) throw ordersRes.error
      if (paymentsRes.error) throw paymentsRes.error

      setOrders((ordersRes.data ?? []) as Order[])
      setPayments((paymentsRes.data ?? []) as PaymentReceived[])

      if (statsRes.data?.[0]) {
        const s = statsRes.data[0]
        setStats({
          total_orders: Number(s.total_orders),
          confirmed: Number(s.confirmed),
          in_review: Number(s.in_review),
          total_income: Number(s.total_income),
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [authed, fetchData])

  // Realtime subscription
  useEffect(() => {
    if (!authed) return
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments_received' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [authed, fetchData])

  const handleConfirm = async (paymentId: string, orderId: string | null) => {
    try {
      const supabase = getSupabaseClient()
      await supabase.rpc('confirm_order_manual', {
        p_order_id: orderId,
        p_payment_id: paymentId,
        p_confirmed_by: 'admin',
      })
      fetchData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al confirmar'
      setError(message)
    }
  }

  const handleReject = async (paymentId: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase.rpc('reject_payment', {
        p_payment_id: paymentId,
        p_reason: 'Rechazado por administrador',
        p_rejected_by: 'admin',
      })
      fetchData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al rechazar'
      setError(message)
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    router.push('/login')
  }

  if (!authed || loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <RefreshCw size={32} className="text-white/20 animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-gray-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">BDV</span>
            </div>
            <div>
              <span className="text-white font-bold">PayValidator</span>
              <span className="text-white/30 text-xs ml-2">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white text-xs px-3 py-2 rounded-lg transition-all"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button onClick={logout} className="flex items-center gap-2 text-white/40 hover:text-red-400 text-xs transition-colors">
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Órdenes hoy" value={stats?.total_orders ?? '—'} icon={Clock} color="bg-blue-600" />
          <StatCard label="Confirmados" value={stats?.confirmed ?? '—'} icon={CheckCircle} color="bg-green-600" />
          <StatCard label="En revisión" value={stats?.in_review ?? '—'} icon={TrendingUp} color="bg-yellow-600" />
          <StatCard
            label="Ingresos hoy"
            value={stats ? `Bs. ${formatBs(stats.total_income)}` : '—'}
            icon={DollarSign}
            color="bg-red-600"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Pending Orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold">
                Órdenes activas
                {orders.length > 0 && (
                  <span className="ml-2 text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{orders.length}</span>
                )}
              </h2>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-white/25 text-sm">
                  No hay órdenes pendientes
                </div>
              ) : (
                orders.map((o) => <PendingOrderRow key={o.id} order={o} />)
              )}
            </div>
          </div>

          {/* Manual Review */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold">
                Revisión manual
                {payments.length > 0 && (
                  <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">{payments.length}</span>
                )}
              </h2>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {payments.length === 0 ? (
                <div className="text-center py-12 text-white/25 text-sm">
                  No hay comprobantes en revisión
                </div>
              ) : (
                payments.map((p) => (
                  <PaymentReviewCard
                    key={p.id}
                    payment={p}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
