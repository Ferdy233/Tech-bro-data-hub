'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Loader2, Package, AlertCircle } from 'lucide-react'

interface OrderStatus {
  status: string
  message: string
  data: Record<string, unknown> | null
}

export default function TrackOrdersPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-amber-400 font-bold text-sm tracking-widest mb-2">
            TRACK YOUR ORDER
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Check Order Status
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your order reference number to check your transaction status.
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-6">
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-widest">
              ORDER REFERENCE
            </label>
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value)
                  setErrorMessage('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. 17323233259547876"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors duration-300"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 max-w-md">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="inline-flex items-center px-7 py-2.5 rounded-full bg-amber-400 text-slate-900 font-bold text-xs tracking-widest hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                CHECKING...
              </>
            ) : (
              'CHECK STATUS'
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
            <h2 className="text-white font-bold text-sm">Order Status</h2>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !reference.trim()}
              className="px-4 py-1.5 rounded-md bg-slate-700 text-slate-300 text-xs font-semibold tracking-wider hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              SEARCH
            </button>
          </div>

          <div className="px-5 py-4">
            {!hasSearched && (
              <p className="text-slate-500 text-sm">
                Enter an order reference above, then tap{' '}
                <span className="text-slate-300 font-medium">Check status</span>.
              </p>
            )}

            {hasSearched && !orderStatus && !errorMessage && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No order found for this reference.</p>
              </div>
            )}

            {orderStatus && (
              <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Reference</p>
                    <p className="text-white font-semibold text-sm font-mono">{reference}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(orderStatus.status)}`}
                  >
                    {orderStatus.status || 'Unknown'}
                  </span>
                </div>

                {orderStatus.message && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-xs mb-1">Message</p>
                    <p className="text-slate-200 text-sm">{orderStatus.message}</p>
                  </div>
                )}

                {orderStatus.data && Object.keys(orderStatus.data).length > 0 && (
                  <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
                    {Object.entries(orderStatus.data).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
