'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Bell,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ImportItem {
  _id?: string
  id?: string
  name: string
  description: string
  category: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  stock: number
  minOrder: number
  maxOrder: number
  shippingCost: number
  deliveryDays: number
  isAvailable: boolean
  isPreorder: boolean
  preorderETA?: string
  rating: number
  reviews: number
  features: string[]
}

interface ImportOrder {
  id: string
  reference: string
  type: 'import' | 'preorder'
  items: any[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  description: string
  createdAt: string
  updatedAt: string
  shippingAddress: any
  trackingNumber?: string
  deliveryDate?: string
  notes?: string
  customerEmail: string
}

const mockItems: ImportItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'Latest iPhone with titanium design and advanced camera system',
    category: 'Electronics',
    brand: 'Apple',
    price: 8500,
    originalPrice: 9000,
    image: 'https://via.placeholder.com/300x300/cccccc/666666?text=iPhone+15+Pro+Max',
    stock: 15,
    minOrder: 1,
    maxOrder: 5,
    shippingCost: 150,
    deliveryDays: 7,
    isAvailable: true,
    isPreorder: false,
    rating: 4.8,
    reviews: 127,
    features: ['A17 Pro Chip', 'Titanium Design', '48MP Camera', 'USB-C']
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and advanced AI features',
    category: 'Electronics',
    brand: 'Samsung',
    price: 7200,
    originalPrice: 7800,
    image: 'https://via.placeholder.com/300x300/cccccc/666666?text=Samsung+Galaxy+S24',
    stock: 0,
    minOrder: 1,
    maxOrder: 3,
    shippingCost: 120,
    deliveryDays: 10,
    isAvailable: false,
    isPreorder: true,
    preorderETA: '2024-03-15',
    rating: 4.7,
    reviews: 89,
    features: ['S Pen', '200MP Camera', 'AI Features', 'Titanium Frame']
  }
]

const mockOrders: ImportOrder[] = [
  {
    id: '1',
    reference: 'IMP_1704123456_abc123',
    type: 'import',
    items: [
      {
        id: '1',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        price: 8500,
        shippingCost: 150,
        quantity: 2,
        total: 17300,
        isPreorder: false
      }
    ],
    totalAmount: 17300,
    status: 'confirmed',
    description: 'Import order',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St, Accra, Ghana',
      phone: '+233241234567'
    },
    notes: 'Handle with care',
    customerEmail: 'john@example.com'
  },
  {
    id: '2',
    reference: 'IMP_1704123457_def456',
    type: 'preorder',
    items: [
      {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        price: 7200,
        shippingCost: 120,
        quantity: 1,
        total: 7320,
        isPreorder: true
      }
    ],
    totalAmount: 7320,
    status: 'pending',
    description: 'Import preorder',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    shippingAddress: {
      name: 'Jane Smith',
      address: '456 Oak Ave, Kumasi, Ghana',
      phone: '+233271234567'
    },
    customerEmail: 'jane@example.com'
  }
]

export default function AdminImportsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'items' | 'orders' | 'notifications'>('items')
  const [items, setItems] = useState<ImportItem[]>(mockItems)
  const [orders, setOrders] = useState<ImportOrder[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [editingItem, setEditingItem] = useState<ImportItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Fetch items from database
  const fetchItems = async () => {
    try {
      const response = await fetch('/api/imports/items')
      const data = await response.json()

      if (data.success) {
        setItems(data.data)
      } else {
        console.error('Failed to fetch items:', data.error)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchItems()
    }
  }, [isAdmin])
  
  // Debug logging
  console.log('Admin Panel Debug:', {
    user: user?.email,
    role: user?.role,
    isAdmin: isAdmin
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access admin panel</p>
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length
  }

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.totalAmount, 0)
  }

  const handleEditItem = (item: ImportItem) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!itemId) {
      addToast({
        type: 'error',
        title: 'Invalid Item',
        message: 'Item ID is missing. Cannot delete item.',
        duration: 5000
      })
      return
    }

    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    setDeletingItem(itemId)
    
    try {
      const response = await fetch(`/api/imports/items/${itemId}?adminEmail=${user?.email}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Remove item from local state
        setItems(items.filter(item => (item._id || item.id) !== itemId))
        
        // Show success message
        addToast({
          type: 'success',
          title: 'Item Deleted',
          message: 'Item has been deleted successfully!',
          duration: 4000
        })
      } else {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: data.error,
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to delete item. Please try again.',
        duration: 5000
      })
    } finally {
      setDeletingItem(null)
    }
  }

  const handleUpdateItem = async (updatedItem: ImportItem) => {
    try {
      const itemId = updatedItem._id || updatedItem.id
      if (!itemId) {
        addToast({
          type: 'error',
          title: 'Invalid Item',
          message: 'Item ID is missing. Cannot update item.',
          duration: 5000
        })
        return
      }

      const response = await fetch(`/api/imports/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedItem,
          adminEmail: user?.email
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update item in local state
        setItems(items.map(item => (item._id || item.id) === (updatedItem._id || updatedItem.id) ? data.data : item))
        
        setShowEditModal(false)
        setEditingItem(null)
        
        addToast({
          type: 'success',
          title: 'Item Updated',
          message: 'Item has been updated successfully!',
          duration: 4000
        })
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: data.error,
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error updating item:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to update item. Please try again.',
        duration: 5000
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Management</h1>
            <p className="text-gray-600 mt-2">Manage import items and customer orders</p>
          </div>
          <Link
            href="/admin/users"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Link>
          <Link
            href="/admin/ads"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Manage Ads
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{getPendingOrdersCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(getTotalRevenue())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('items')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Items ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Orders ({orders.length})
                {getPendingOrdersCount() > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {getPendingOrdersCount()}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Items Tab */}
            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Categories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Audio">Audio</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={item._id || item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                            item.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Preorder'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item._id || item.id)}
                            disabled={deletingItem === (item._id || item.id)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-medium">{formatPrice(item.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Stock:</span>
                          <span className="font-medium">{item.stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Orders:</span>
                          <span className="font-medium">{item.reviews}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.reference}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.type === 'preorder' ? 'Preorder' : 'Import'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.shippingAddress.name}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items[0]?.name}
                              {order.items.length > 1 && ` +${order.items.length - 1} more`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderDetails(true)
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Reference</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.reference}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.shippingAddress.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerEmail}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.brand}</p>
                            {item.isPreorder && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                                Preorder
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.address}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                      Update Status
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                      Add Tracking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Edit Item</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingItem(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="h-6 w-6" />
                  </button>
                </div>

                <EditItemForm 
                  item={editingItem} 
                  onSave={handleUpdateItem}
                  onCancel={() => {
                    setShowEditModal(false)
                    setEditingItem(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Edit Item Form Component
function EditItemForm({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item: ImportItem
  onSave: (item: ImportItem) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    category: item.category,
    brand: item.brand,
    price: item.price,
    originalPrice: item.originalPrice || '',
    image: item.image,
    stock: item.stock,
    minOrder: item.minOrder,
    maxOrder: item.maxOrder,
    shippingCost: item.shippingCost,
    deliveryDays: item.deliveryDays,
    isAvailable: item.isAvailable,
    isPreorder: item.isPreorder,
    preorderETA: item.preorderETA || '',
    features: item.features.join(', ')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedItem = {
      ...item,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      price: formData.price,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image,
      stock: formData.stock,
      minOrder: formData.minOrder,
      maxOrder: formData.maxOrder,
      shippingCost: formData.shippingCost,
      deliveryDays: formData.deliveryDays,
      isAvailable: formData.isAvailable,
      isPreorder: formData.isPreorder,
      preorderETA: formData.preorderETA || undefined,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
    }
    
    onSave(updatedItem)
  }

  const categories = ['Electronics', 'Gaming', 'Audio', 'Accessories', 'Clothing', 'Home & Garden']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (GHS)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (GHS)</label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost (GHS)</label>
          <input
            type="number"
            value={formData.shippingCost}
            onChange={(e) => setFormData({...formData, shippingCost: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Days</label>
          <input
            type="number"
            value={formData.deliveryDays}
            onChange={(e) => setFormData({...formData, deliveryDays: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
        <input
          type="text"
          value={formData.features}
          onChange={(e) => setFormData({...formData, features: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Feature 1, Feature 2, Feature 3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
            Available for immediate purchase
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPreorder"
            checked={formData.isPreorder}
            onChange={(e) => setFormData({...formData, isPreorder: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPreorder" className="ml-2 text-sm text-gray-700">
            Available for preorder
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preorder ETA</label>
          <input
            type="date"
            value={formData.preorderETA}
            onChange={(e) => setFormData({...formData, preorderETA: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
