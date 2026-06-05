'use client'

import Link from 'next/link'
import { BarChart3, Package, AlertCircle, Settings, Zap, Clock, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardMetrics {
  pendingOrders?: number
  systemStatus: 'healthy' | 'warning' | 'critical'
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({ systemStatus: 'healthy' })

  useEffect(() => {
    // Fetch pending orders count
    fetch('/api/admin/pending-orders')
      .then((r) => r.json())
      .then((data) => {
        setMetrics((prev) => ({
          ...prev,
          pendingOrders: data.orders?.length || 0,
        }))
      })
      .catch(() => {})
  }, [])

  return (
    <section className="space-y-12">
      {/* Header with Status */}
      <div>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400 font-semibold">Welcome back</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-3 text-slate-400 max-w-lg">Manage your store, track metrics, and process orders in real time.</p>
          </div>
          <div className={`rounded-lg border-2 px-4 py-3 text-center flex-shrink-0 ${
            metrics.systemStatus === 'healthy'
              ? 'border-emerald-800 bg-emerald-950'
              : metrics.systemStatus === 'warning'
              ? 'border-amber-800 bg-amber-950'
              : 'border-red-800 bg-red-950'
          }`}>
            <div className="flex items-center gap-2 whitespace-nowrap">
              {metrics.systemStatus === 'healthy' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
              {metrics.systemStatus === 'warning' && <AlertCircle className="h-5 w-5 text-amber-400" />}
              {metrics.systemStatus === 'critical' && <AlertCircle className="h-5 w-5 text-red-400" />}
              <span className={`text-sm font-bold uppercase tracking-wider ${
                metrics.systemStatus === 'healthy' ? 'text-emerald-300' : 
                metrics.systemStatus === 'warning' ? 'text-amber-300' : 'text-red-300'
              }`}>
                {metrics.systemStatus === 'healthy' ? 'Healthy' : metrics.systemStatus === 'warning' ? 'Warning' : 'Critical'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Alert Cards */}
      {metrics.pendingOrders ? (
        <div className="rounded-xl border-2 border-amber-800 bg-amber-950 p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Zap className="h-6 w-6 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-100 text-lg">Pending Orders</p>
                <p className="text-sm text-amber-300 mt-1">{metrics.pendingOrders} order{metrics.pendingOrders !== 1 ? 's' : ''} awaiting wallet top-up</p>
              </div>
            </div>
            <Link
              href="/admin/pending-orders"
              className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition flex-shrink-0"
            >
              View Orders
            </Link>
          </div>
        </div>
      ) : null}

      {/* Main Grid - 4 Column Layout with Better Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Analytics Card */}
        <Link
          href="/admin/analytics"
          className="group rounded-xl border-2 border-slate-700 bg-slate-800/40 p-8 transition hover:border-sky-600 hover:bg-slate-800/70 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 rounded-lg bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/30 transition">
              <BarChart3 className="h-7 w-7 text-sky-400" />
            </div>
            <span className="text-sm font-bold text-sky-400 uppercase">→</span>
          </div>
          <h3 className="font-bold text-white text-lg">Analytics</h3>
          <p className="mt-2 text-sm text-slate-400">View wallet balance & performance</p>
        </Link>

        {/* Bundle Prices Card */}
        <Link
          href="/admin/bundles"
          className="group rounded-xl border-2 border-slate-700 bg-slate-800/40 p-8 transition hover:border-emerald-600 hover:bg-slate-800/70 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition">
              <Package className="h-7 w-7 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-emerald-400 uppercase">→</span>
          </div>
          <h3 className="font-bold text-white text-lg">Bundle Prices</h3>
          <p className="mt-2 text-sm text-slate-400">Manage & update pricing</p>
        </Link>

        {/* Pending Orders Card */}
        <Link
          href="/admin/pending-orders"
          className="group rounded-xl border-2 border-slate-700 bg-slate-800/40 p-8 transition hover:border-amber-600 hover:bg-slate-800/70 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition">
              <Clock className="h-7 w-7 text-amber-400" />
            </div>
            <span className="text-sm font-bold text-amber-400 uppercase">→</span>
          </div>
          <h3 className="font-bold text-white text-lg">Pending Orders</h3>
          <p className="mt-2 text-sm text-slate-400">Process queued purchases</p>
        </Link>

        {/* Orders Card */}
        <Link
          href="/admin/orders"
          className="group rounded-xl border-2 border-slate-700 bg-slate-800/40 p-8 transition hover:border-purple-600 hover:bg-slate-800/70 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition">
              <CheckCircle className="h-7 w-7 text-purple-400" />
            </div>
            <span className="text-sm font-bold text-purple-400 uppercase">→</span>
          </div>
          <h3 className="font-bold text-white text-lg">All Orders</h3>
          <p className="mt-2 text-sm text-slate-400">Review order history</p>
        </Link>
      </div>

      {/* Info Section - Better Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 rounded-xl border-2 border-slate-700 bg-slate-800/40 p-8">
          <h2 className="font-bold text-white text-xl">Getting Started</h2>
          <div className="mt-8 space-y-6">
            <div className="flex gap-5">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-400">1</span>
              </div>
              <div>
                <p className="font-semibold text-white">Check your wallet balance</p>
                <p className="text-sm text-slate-400 mt-1">Go to Analytics to view your API wallet and Paystack balance</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-400">2</span>
              </div>
              <div>
                <p className="font-semibold text-white">Manage bundle pricing</p>
                <p className="text-sm text-slate-400 mt-1">Update prices to optimize your revenue in Bundle Prices</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-sky-400/20 flex items-center justify-center">
                <span className="text-sm font-bold text-sky-400">3</span>
              </div>
              <div>
                <p className="font-semibold text-white">Process pending orders</p>
                <p className="text-sm text-slate-400 mt-1">Top up wallet and process orders from Pending Orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-slate-700 bg-slate-800/40 p-8">
          <h2 className="font-bold text-white text-xl">Quick Tips</h2>
          <ul className="mt-8 space-y-4 text-sm text-slate-400">
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold flex-shrink-0">→</span>
              <span>Monitor wallet balance daily</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold flex-shrink-0">→</span>
              <span>Adjust pricing seasonally</span>
            </li>
            <li className="flex gap-3">
              <span className="text-sky-400 font-bold flex-shrink-0">→</span>
              <span>Process orders within 24h</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold flex-shrink-0">→</span>
              <span>Check settings regularly</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
