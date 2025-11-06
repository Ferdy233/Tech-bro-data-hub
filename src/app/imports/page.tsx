'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { 
  Package, 
  Search, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Eye,
  Plus,
  Minus,
  CreditCard,
  Star
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

interface CartItem {
  item: ImportItem
  quantity: number
  isPreorder: boolean
}

const mockImportItems: ImportItem[] = [
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
  },
  {
    id: '3',
    name: 'MacBook Pro M3',
    description: 'Professional laptop with M3 chip for creators and developers',
    category: 'Electronics',
    brand: 'Apple',
    price: 12000,
    originalPrice: 13000,
    image: 'https://via.placeholder.com/300x300/cccccc/666666?text=MacBook+Pro+M3',
    stock: 8,
    minOrder: 1,
    maxOrder: 2,
    shippingCost: 200,
    deliveryDays: 14,
    isAvailable: true,
    isPreorder: false,
    rating: 4.9,
    reviews: 56,
    features: ['M3 Chip', 'Retina Display', '18-hour Battery', 'Thunderbolt 4']
  },
  {
    id: '4',
    name: 'Sony PlayStation 5',
    description: 'Next-gen gaming console with 4K gaming and ray tracing',
    category: 'Gaming',
    brand: 'Sony',
    price: 4500,
    originalPrice: 4800,
    image: 'https://via.placeholder.com/300x300/cccccc/666666?text=PlayStation+5',
    stock: 0,
    minOrder: 1,
    maxOrder: 1,
    shippingCost: 100,
    deliveryDays: 21,
    isAvailable: false,
    isPreorder: true,
    preorderETA: '2024-04-01',
    rating: 4.6,
    reviews: 234,
    features: ['4K Gaming', 'Ray Tracing', 'SSD Storage', 'DualSense Controller']
  },
  {
    id: '5',
    name: 'AirPods Pro (2nd Gen)',
    description: 'Premium wireless earbuds with active noise cancellation',
    category: 'Audio',
    brand: 'Apple',
    price: 850,
    originalPrice: 900,
    image: 'https://via.placeholder.com/300x300/cccccc/666666?text=AirPods+Pro',
    stock: 25,
    minOrder: 1,
    maxOrder: 10,
    shippingCost: 50,
    deliveryDays: 5,
    isAvailable: true,
    isPreorder: false,
    rating: 4.5,
    reviews: 312,
    features: ['Active Noise Cancellation', 'Spatial Audio', 'Wireless Charging', 'H2 Chip']
  }
]

export default function ImportsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState<ImportItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ImportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedAvailability, setSelectedAvailability] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ImportItem | null>(null)
  const [showItemDetails, setShowItemDetails] = useState(false)

  const categories = ['All', 'Electronics', 'Gaming', 'Audio', 'Accessories']

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/imports/items')
      const data = await response.json()

      if (data.success) {
        setItems(data.data)
        setFilteredItems(data.data)
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Load Items',
          message: 'Could not load import items. Using sample data.',
          duration: 5000
        })
        // Fallback to mock data
        setItems(mockImportItems)
        setFilteredItems(mockImportItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not load import items. Using sample data.',
        duration: 5000
      })
      // Fallback to mock data
      setItems(mockImportItems)
      setFilteredItems(mockImportItems)
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])
  const availabilityOptions = ['All', 'Available', 'Preorder']

  const filterItems = useCallback(() => {
    let filtered = items

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (selectedAvailability === 'Available') {
      filtered = filtered.filter(item => item.isAvailable)
    } else if (selectedAvailability === 'Preorder') {
      filtered = filtered.filter(item => item.isPreorder)
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }, [selectedCategory, selectedAvailability, searchTerm, items])

  useEffect(() => {
    filterItems()
  }, [filterItems])

  const addToCart = (item: ImportItem, quantity: number, isPreorder: boolean) => {
    const existingItem = cart.find(cartItem => 
      (cartItem.item._id || cartItem.item.id) === (item._id || item.id) && cartItem.isPreorder === isPreorder
    )

    if (existingItem) {
      setCart(cart.map(cartItem =>
        (cartItem.item._id || cartItem.item.id) === (item._id || item.id) && cartItem.isPreorder === isPreorder
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ))
    } else {
      setCart([...cart, { item, quantity, isPreorder }])
    }

    setShowItemDetails(false)
    setSelectedItem(null)

    // Show success toast
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${quantity}x ${item.name} ${isPreorder ? 'preorder' : ''} added to cart`,
      duration: 3000
    })
  }

  const removeFromCart = (itemId: string, isPreorder: boolean) => {
    setCart(cart.filter(cartItem => 
      !((cartItem.item._id || cartItem.item.id) === itemId && cartItem.isPreorder === isPreorder)
    ))
  }

  const updateCartQuantity = (itemId: string, isPreorder: boolean, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId, isPreorder)
      return
    }

    setCart(cart.map(cartItem =>
      (cartItem.item._id || cartItem.item.id) === itemId && cartItem.isPreorder === isPreorder
        ? { ...cartItem, quantity }
        : cartItem
    ))
  }

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const itemTotal = cartItem.item.price * cartItem.quantity
      const shippingTotal = cartItem.item.shippingCost * cartItem.quantity
      return total + itemTotal + shippingTotal
    }, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      // Get shipping address from user (you might want to add a form for this)
      const shippingAddress = {
        name: user?.name || '',
        address: 'User Address', // TODO: Add address form
        phone: user?.phone || ''
      }

      const response = await fetch('/api/imports/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user?.email,
          items: cart.map(cartItem => ({
            id: cartItem.item._id || cartItem.item.id,
            name: cartItem.item.name,
            brand: cartItem.item.brand,
            price: cartItem.item.price,
            shippingCost: cartItem.item.shippingCost,
            quantity: cartItem.quantity,
            isPreorder: cartItem.isPreorder
          })),
          shippingAddress,
          isPreorder: cart.some(item => item.isPreorder)
        })
      })

      const data = await response.json()

      if (data.success) {
        addToast({
          type: 'success',
          title: 'Order Placed Successfully!',
          message: `${data.message}! Order ID: ${data.data.orderId}`,
          duration: 6000
        })
        setCart([])
        setShowCart(false)
        // Optionally redirect to orders page or show success message
      } else {
        if (data.error === 'Insufficient wallet balance') {
          addToast({
            type: 'error',
            title: 'Insufficient Balance',
            message: `You need ${formatPrice(data.required)} but only have ${formatPrice(data.available)}. Please top up your wallet first.`,
            duration: 8000
          })
        } else {
          addToast({
            type: 'error',
            title: 'Order Failed',
            message: data.error,
            duration: 6000
          })
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to place order. Please check your connection and try again.',
        duration: 6000
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to browse import items</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Import Store</h1>
            <p className="text-gray-600 mt-2">Browse available items and place preorders for upcoming products</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availabilityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedAvailability('All')
                setSearchTerm('')
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading import items...</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredItems.map((item) => (
            <div key={item._id || item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Item Image */}
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {item.originalPrice && item.originalPrice > item.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                  </div>
                )}
                {item.isPreorder && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium">
                    Preorder
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">{item.brand}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    <span className="text-sm text-gray-400 ml-1">({item.reviews})</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="h-4 w-4 mr-1" />
                    <span>Shipping: {formatPrice(item.shippingCost)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {item.isAvailable 
                        ? `Delivers in ${item.deliveryDays} days`
                        : `ETA: ${item.preorderETA}`
                      }
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setShowItemDetails(true)
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  {item.isAvailable ? (
                    <button
                      onClick={() => addToCart(item, 1, false)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(item, 1, true)}
                      className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Preorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
        )}

        {/* Item Details Modal */}
        {showItemDetails && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h3>
                  <button
                    onClick={() => setShowItemDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      width={300}
                      height={300}
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="text-blue-600 font-medium">{selectedItem.brand}</span>
                      <p className="text-gray-600 mt-2">{selectedItem.description}</p>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(selectedItem.price)}
                      </span>
                      {selectedItem.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">
                          {formatPrice(selectedItem.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck className="h-4 w-4 mr-2" />
                        <span>Shipping: {formatPrice(selectedItem.shippingCost)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {selectedItem.isAvailable 
                            ? `Delivers in ${selectedItem.deliveryDays} days`
                            : `ETA: ${selectedItem.preorderETA}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        <span>
                          {selectedItem.isAvailable 
                            ? `${selectedItem.stock} in stock`
                            : 'Preorder item'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {selectedItem.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex space-x-3">
                      {selectedItem.isAvailable ? (
                        <button
                          onClick={() => addToCart(selectedItem, 1, false)}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add to Cart
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCart(selectedItem, 1, true)}
                          className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                        >
                          <Clock className="h-5 w-5 mr-2" />
                          Preorder Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
            <div className="bg-white w-full max-w-md h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Shopping Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="h-6 w-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((cartItem) => (
                        <div key={`${cartItem.item._id || cartItem.item.id}-${cartItem.isPreorder}`} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{cartItem.item.name}</h4>
                              <p className="text-sm text-gray-600">{cartItem.item.brand}</p>
                              {cartItem.isPreorder && (
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                                  Preorder
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(cartItem.item._id || cartItem.item.id, cartItem.isPreorder)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartQuantity(cartItem.item._id || cartItem.item.id, cartItem.isPreorder, cartItem.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(cartItem.item._id || cartItem.item.id, cartItem.isPreorder, cartItem.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatPrice(cartItem.item.price * cartItem.quantity)}
                              </p>
                              <p className="text-xs text-gray-500">
                                +{formatPrice(cartItem.item.shippingCost * cartItem.quantity)} shipping
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(getCartTotal())}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}