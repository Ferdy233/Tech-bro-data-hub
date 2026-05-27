'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Loader2, Package, AlertCircle, ArrowRight } from 'lucide-react'

interface OrderStatus {
  status: string
  message: string
  data: Record<string, unknown> | null
}

export default function TrackOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
      </div>
    }>
      <TrackOrdersContent />
    </Suspense>
  )
}

function TrackOrdersContent() {
  const searchParams = useSearchParams()
  const [reference, setReference] = useState('')
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSearch = useCallback(async (ref?: string) => {
    const searchRef = ref || reference
    if (!searchRef.trim()) {
      setErrorMessage('Please enter an order reference.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setOrderStatus(null)

    try {
      const params = new URLSearchParams({ reference: searchRef.trim() })
      const response = await fetch(`/api/track-orders?${params.toString()}`)
      const result = await response.json().catch(() => null)

      if (response.ok && result?.success) {
        setOrderStatus(result.data)
      } else {
        setErrorMessage(result?.error || 'Failed to retrieve order status.')
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }, [reference])

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReference(ref)
      handleSearch(ref)
    }
  }, [searchParams, handleSearch])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
      case 'processing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'failed':
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 md:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 mb-4">
            <Search className="h-3 w-3 text-amber-400" />
            <span className="text-slate-300 text-xs font-medium">Order Tracking</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Track Your Order
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your order reference to check delivery status.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-6 mb-6">
          <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider">
            ORDER REFERENCE
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value)
                setErrorMessage('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 17323233259547876"
              className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Result */}
        {!hasSearched && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">
              Your order status will appear here.
            </p>
          </div>
        )}

        {hasSearched && !orderStatus && !errorMessage && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">No order found for this reference.</p>
          </div>
        )}

        {orderStatus && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 overflow-hidden">
            {/* Status Header */}
            <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Reference</p>
                <p className="text-white font-mono text-sm font-medium">{reference}</p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(orderStatus.status)}`}
              >
                {orderStatus.status || 'Unknown'}
              </span>
            </div>

            {/* Status Body */}
            <div className="px-6 py-5">
              {orderStatus.message && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs mb-1">Message</p>
                  <p className="text-white text-sm">{orderStatus.message}</p>
                </div>
              )}

              {orderStatus.data && Object.keys(orderStatus.data).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(orderStatus.data).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0">
                      <span className="text-slate-400 text-xs capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
