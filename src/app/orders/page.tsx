'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  Wifi, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  reference: string
  type: 'data' | 'import'
  dataXpressRef?: string
  phone?: string
  volume?: number
  network?: string
  amount: number
  status: 'pending' | 'success' | 'failed' | 'completed'
  description: string
  createdAt: string
  updatedAt: string
  // Import order fields
  importType?: string
  quantity?: number
  destination?: string
  trackingNumber?: string
}

interface OrdersData {
  orders: Order[]
  pagination: {
    currentPage: number
    totalPages: number
    totalOrders: number
    limit: number
  }
  filters: {
    status?: string
    network?: string
    type?: string
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [networkFilter, setNetworkFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user?.email) {
      fetchOrders()
    }
  }, [user?.email, statusFilter, networkFilter, typeFilter, currentPage])

  const fetchOrders = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        email: user.email,
        page: currentPage.toString(),
        limit: '20'
      })

      if (statusFilter) params.append('status', statusFilter)
      if (networkFilter) params.append('network', networkFilter)
      if (typeFilter) params.append('type', typeFilter)

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      setError('Network error while fetching orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (reference: string) => {
    if (!user?.email) return

    try {
      const response = await fetch(`/api/orders/${reference}?email=${user.email}`)
      const data = await response.json()

      if (data.success) {
        setSelectedOrder(data.data)
        setShowDetails(true)
      } else {
        setError(data.error || 'Failed to fetch order details')
      }
    } catch (err) {
      setError('Network error while fetching order details')
    }
  }

  const syncDataOrders = async () => {
    if (!user?.email) return

    try {
      setSyncing(true)
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email })
      })

      const data = await response.json()

      if (data.success) {
        console.log('Orders synced:', data.data)
        // Refresh orders after sync
        await fetchOrders()
      } else {
        setError(data.error || 'Failed to sync orders')
      }
    } catch (err) {
      setError('Network error while syncing orders')
    } finally {
      setSyncing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNetworkLogo = (network: string) => {
    switch (network?.toLowerCase()) {
      case 'mtn': return '/mtn.jpg'
      case 'telecel': return '/telecel.png'
      case 'airteltigo': return '/at.png'
      default: return '/globe.svg'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}GB`
    }
    return `${volume}MB`
  }

  // Filter orders by search term
  const filteredOrders = orders?.orders.filter(order =>
    order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm) ||
    order.network.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your orders</p>
          <Link
            href="/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Track and manage your data bundle and import orders</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={syncDataOrders}
              disabled={syncing || loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync Data Orders
            </button>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh All Orders
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="data">Data Bundles</option>
              <option value="import">Imports</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Network Filter */}
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Networks</option>
              <option value="mtn">MTN</option>
              <option value="telecel">Telecel</option>
              <option value="airteltigo">AirtelTigo</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setStatusFilter('')
                setNetworkFilter('')
                setTypeFilter('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || networkFilter 
                  ? 'No orders match your current filters' 
                  : 'You haven\'t placed any orders yet'
                }
              </p>
              {!searchTerm && !statusFilter && !networkFilter && (
                <Link
                  href="/buy-data"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Buy Data Bundle
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-2">Reference</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-2">Details</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Contact/Destination</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-mono text-sm text-gray-900">
                          {order.reference}
                        </div>
                        {order.dataXpressRef && (
                          <div className="text-xs text-gray-500">
                            DX: {order.dataXpressRef}
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="text-xs text-gray-500">
                            Track: {order.trackingNumber}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.type === 'data' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.type === 'data' ? 'Data' : 'Import'}
                        </span>
                      </div>
                      
                      <div className="col-span-2">
                        {order.type === 'data' ? (
                          <div className="flex items-center">
                            {order.network && (
                              <img
                                src={getNetworkLogo(order.network)}
                                alt={order.network}
                                className="w-6 h-6 rounded mr-2"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.network}
                              </div>
                              {order.volume && (
                                <div className="text-xs text-gray-500">
                                  {formatVolume(order.volume)}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.importType || 'Import Order'}
                            </div>
                            {order.quantity && (
                              <div className="text-xs text-gray-500">
                                Qty: {order.quantity}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-1">
                        <span className="text-sm font-medium text-gray-900">
                          ₵{order.amount}
                        </span>
                      </div>
                      
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">
                          {order.type === 'data' ? order.phone : order.destination || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      
                      <div className="col-span-1">
                        <button
                          onClick={() => fetchOrderDetails(order.reference)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {orders && orders.pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing {((orders.pagination.currentPage - 1) * orders.pagination.limit) + 1} to{' '}
                      {Math.min(orders.pagination.currentPage * orders.pagination.limit, orders.pagination.totalOrders)} of{' '}
                      {orders.pagination.totalOrders} orders
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {orders.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(orders.pagination.totalPages, prev + 1))}
                        disabled={currentPage === orders.pagination.totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference</label>
                  <p className="text-lg font-mono text-gray-900">{selectedOrder.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-2 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Type</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedOrder.type === 'data' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedOrder.type === 'data' ? 'Data Bundle' : 'Import Order'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-medium text-gray-900">₵{selectedOrder.amount}</p>
                </div>
              </div>

              {selectedOrder.type === 'data' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Network</label>
                    <div className="flex items-center mt-1">
                      {selectedOrder.network && (
                        <img
                          src={getNetworkLogo(selectedOrder.network)}
                          alt={selectedOrder.network}
                          className="w-8 h-8 rounded mr-3"
                        />
                      )}
                      <span className="text-lg font-medium text-gray-900">{selectedOrder.network}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Volume</label>
                    <p className="text-lg font-medium text-gray-900">{selectedOrder.volume ? formatVolume(selectedOrder.volume) : 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Import Type</label>
                    <p className="text-lg font-medium text-gray-900">{selectedOrder.importType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <p className="text-lg font-medium text-gray-900">{selectedOrder.quantity || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {selectedOrder.type === 'data' ? 'Phone Number' : 'Destination'}
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedOrder.type === 'data' ? selectedOrder.phone : selectedOrder.destination || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-2 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedOrder.updatedAt)}</p>
                </div>
              </div>

              {selectedOrder.dataXpressRef && (
                <div>
                  <label className="text-sm font-medium text-gray-500">DataXpress Reference</label>
                  <p className="text-sm font-mono text-gray-900">{selectedOrder.dataXpressRef}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900 mt-1">{selectedOrder.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
