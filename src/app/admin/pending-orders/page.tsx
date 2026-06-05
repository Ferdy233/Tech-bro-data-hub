'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Trash2, CheckCircle, Loader } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PendingOrder {
  id: string
  networkReference: string
  orderReference: string
  recipientPhone: string
  capacityInGb: number
  paystackReference: string
  requiredBalance: number
  currentBalance: number
  createdAt: string
  customerEmail?: string
}

export default function AdminPendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingOrders()
  }, [])

  const fetchPendingOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/pending-orders')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError('Failed to fetch pending orders')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcess = async (orderId: string) => {
    try {
      setProcessingId(orderId)
      const response = await fetch(`/api/admin/pending-orders/${orderId}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        // Remove from pending list
        setOrders(orders.filter((o) => o.id !== orderId))
        setError(null)
      } else {
        setError(data.error || 'Failed to process order')
      }
    } catch (err) {
      setError('Failed to process order')
      console.error(err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this pending order?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pending-orders/${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOrders(orders.filter((o) => o.id !== orderId))
        setError(null)
      } else {
        setError('Failed to delete order')
      }
    } catch (err) {
      setError('Failed to delete order')
      console.error(err)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Pending Orders</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Awaiting wallet top-up</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Orders that couldn&apos;t process due to insufficient API wallet balance. Top up your wallet, then click &quot;Process&quot; to complete each order.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-[1.75rem] border border-red-800 bg-red-950 p-6">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-12 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-amber-400" />
          <p className="mt-4 text-slate-400">Loading pending orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-700" />
          <h2 className="mt-4 text-xl font-semibold text-white">No pending orders</h2>
          <p className="mt-2 text-slate-400">All customer orders have been processed successfully.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Package className="mt-1 h-5 w-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{order.orderReference}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Network: <span className="text-white uppercase">{order.networkReference}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Phone: <span className="text-white">{order.recipientPhone}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Data: <span className="text-white">{order.capacityInGb}GB</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Required</p>
                      <p className="mt-1 font-semibold text-white">
                        {formatCurrency(order.requiredBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Current Balance</p>
                      <p className="mt-1 font-semibold text-white">
                        {formatCurrency(order.currentBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-red-500">Shortfall</p>
                      <p className="mt-1 font-semibold text-red-400">
                        {formatCurrency(order.requiredBalance - order.currentBalance)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 sm:flex-col">
                  <button
                    onClick={() => handleProcess(order.id)}
                    disabled={processingId === order.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {processingId === order.id ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Process
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(order.id)}
                    disabled={processingId === order.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-700 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">How to process</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Workflow</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-400">
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">1.</span>
            <span>Review the order details above (required amount and current shortfall).</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">2.</span>
            <span>Go to Analytics and top up your API wallet with at least the shortfall amount.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">3.</span>
            <span>Return here and click the &quot;Process&quot; button to complete the customer&apos;s purchase.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">4.</span>
            <span>The order will be removed from this list once successfully processed.</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
