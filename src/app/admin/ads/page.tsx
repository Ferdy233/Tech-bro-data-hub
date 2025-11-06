'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  MousePointer,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  Save,
  X,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Ad {
  _id?: string
  id?: string
  title: string
  description: string
  image: string
  link?: string
  type: 'banner' | 'sidebar' | 'popup' | 'inline'
  position: string
  isActive: boolean
  startDate?: string
  endDate?: string
  clicks: number
  impressions: number
  advertiserName: string
  advertiserEmail: string
  advertiserPhone?: string
  budget?: number
  costPerClick?: number
  costPerImpression?: number
  createdAt: string
  updatedAt: string
}

const adTypes = [
  { value: 'banner', label: 'Banner' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'popup', label: 'Popup' },
  { value: 'inline', label: 'Inline' }
]

const positions = [
  { value: 'header', label: 'Header' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'footer', label: 'Footer' },
  { value: 'content-top', label: 'Content Top' },
  { value: 'content-bottom', label: 'Content Bottom' },
  { value: 'floating', label: 'Floating' }
]

export default function AdminAdsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [deletingAd, setDeletingAd] = useState<string | null>(null)

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'You need admin privileges to access this page.',
        duration: 5000
      })
      window.location.href = '/dashboard'
    }
  }, [isAdmin, addToast])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ads')
      const data = await response.json()

      if (data.success) {
        setAds(data.data)
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Load Ads',
          message: 'Could not load ads. Please try again.',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to load ads. Please check your connection.',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchAds()
    }
  }, [isAdmin])

  const handleDeleteAd = async (adId: string) => {
    if (!adId) {
      addToast({
        type: 'error',
        title: 'Invalid Ad',
        message: 'Ad ID is missing. Cannot delete ad.',
        duration: 5000
      })
      return
    }

    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return
    }

    setDeletingAd(adId)
    try {
      const response = await fetch(`/api/ads/${adId}?adminEmail=${user?.email}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setAds(ads.filter(ad => (ad._id || ad.id) !== adId))
        addToast({
          type: 'success',
          title: 'Ad Deleted',
          message: 'Ad has been deleted successfully!',
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
      console.error('Error deleting ad:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to delete ad. Please try again.',
        duration: 5000
      })
    } finally {
      setDeletingAd(null)
    }
  }

  const handleUpdateAd = async (updatedAd: Ad) => {
    try {
      const adId = updatedAd._id || updatedAd.id
      if (!adId) {
        addToast({
          type: 'error',
          title: 'Invalid Ad',
          message: 'Ad ID is missing. Cannot update ad.',
          duration: 5000
        })
        return
      }

      const response = await fetch(`/api/ads/${adId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedAd, adminEmail: user?.email })
      })
      const data = await response.json()

      if (data.success) {
        setAds(ads.map(ad => (ad._id || ad.id) === (updatedAd._id || updatedAd.id) ? data.data : ad))
        setShowEditModal(false)
        setEditingAd(null)
        addToast({
          type: 'success',
          title: 'Ad Updated',
          message: 'Ad has been updated successfully!',
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
      console.error('Error updating ad:', error)
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to update ad. Please try again.',
        duration: 5000
      })
    }
  }

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.advertiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && ad.isActive) ||
                         (statusFilter === 'inactive' && !ad.isActive)
    const matchesType = typeFilter === 'all' || ad.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalAds = ads.length
  const activeAds = ads.filter(ad => ad.isActive).length
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0)
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ad Management</h1>
            <p className="text-gray-600">Manage advertisements displayed on the platform</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/imports"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              Import Management
            </Link>
            <Link
              href="/admin/users"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ads</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Ads</p>
                <p className="text-2xl font-semibold text-gray-900">{activeAds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MousePointer className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-semibold text-gray-900">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Impressions</p>
                <p className="text-2xl font-semibold text-gray-900">{totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="banner">Banner</option>
                <option value="sidebar">Sidebar</option>
                <option value="popup">Popup</option>
                <option value="inline">Inline</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Ad
            </button>
          </div>
        </div>

        {/* Ads Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ads...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advertiser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAds.map((ad) => (
                    <tr key={ad._id || ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <Image
                              src={ad.image}
                              alt={ad.title}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                            <div className="text-sm text-gray-500">{ad.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ad.advertiserName}</div>
                        <div className="text-sm text-gray-500">{ad.advertiserEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ad.clicks.toLocaleString()} clicks
                        </div>
                        <div className="text-sm text-gray-500">
                          {ad.impressions.toLocaleString()} impressions
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingAd(ad)
                              setShowEditModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad._id || ad.id)}
                            disabled={deletingAd === (ad._id || ad.id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingAd === (ad._id || ad.id) ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Ad Modal */}
      {showAddModal && (
        <AddEditAdModal
          onClose={() => setShowAddModal(false)}
          onSave={async (newAd) => {
            try {
              const response = await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAd, adminEmail: user?.email })
              })
              const data = await response.json()

              if (data.success) {
                setAds([data.data, ...ads])
                setShowAddModal(false)
                addToast({
                  type: 'success',
                  title: 'Ad Created',
                  message: 'Ad has been created successfully!',
                  duration: 4000
                })
              } else {
                addToast({
                  type: 'error',
                  title: 'Creation Failed',
                  message: data.error,
                  duration: 5000
                })
              }
            } catch (error) {
              console.error('Error creating ad:', error)
              addToast({
                type: 'error',
                title: 'Network Error',
                message: 'Failed to create ad. Please try again.',
                duration: 5000
              })
            }
          }}
        />
      )}

      {/* Edit Ad Modal */}
      {showEditModal && editingAd && (
        <AddEditAdModal
          ad={editingAd}
          onClose={() => {
            setShowEditModal(false)
            setEditingAd(null)
          }}
          onSave={handleUpdateAd}
        />
      )}
    </div>
  )
}

// Add/Edit Ad Modal Component
function AddEditAdModal({ 
  ad, 
  onClose, 
  onSave 
}: { 
  ad?: Ad
  onClose: () => void
  onSave: (ad: Ad) => void
}) {
  const [formData, setFormData] = useState<Partial<Ad>>({
    title: ad?.title || '',
    description: ad?.description || '',
    image: ad?.image || '',
    link: ad?.link || '',
    type: ad?.type || 'banner',
    position: ad?.position || 'header',
    isActive: ad?.isActive ?? true,
    startDate: ad?.startDate || '',
    endDate: ad?.endDate || '',
    advertiserName: ad?.advertiserName || '',
    advertiserEmail: ad?.advertiserEmail || '',
    advertiserPhone: ad?.advertiserPhone || '',
    budget: ad?.budget || 0,
    costPerClick: ad?.costPerClick || 0,
    costPerImpression: ad?.costPerImpression || 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.image || !formData.advertiserName || !formData.advertiserEmail) {
      alert('Please fill in all required fields')
      return
    }

    onSave(formData as Ad)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {ad ? 'Edit Ad' : 'Add New Ad'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ad title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {adTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {positions.map(position => (
                    <option key={position.value} value={position.value}>{position.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter destination URL"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ad description"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advertiser Name *
                </label>
                <input
                  type="text"
                  value={formData.advertiserName}
                  onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter advertiser name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advertiser Email *
                </label>
                <input
                  type="email"
                  value={formData.advertiserEmail}
                  onChange={(e) => setFormData({ ...formData, advertiserEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter advertiser email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advertiser Phone
                </label>
                <input
                  type="tel"
                  value={formData.advertiserPhone}
                  onChange={(e) => setFormData({ ...formData, advertiserPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter advertiser phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (GHS)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter budget"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {ad ? 'Update Ad' : 'Create Ad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
