'use client'

import { useState, useEffect } from 'react'
import { 
  Database, 
  Smartphone, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Wifi, 
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

interface NetworkPackage {
  id: string
  volume: number
  volumeGB: string
  cost: number
  validity: string
  description: string
}

interface NetworkData {
  code: string
  name: string
  logo: string
  packages: NetworkPackage[]
}

interface PackagesData {
  networks: NetworkData[]
  totalPackages: number
  timestamp: string
}

export default function BuyDataPage() {
  const { user } = useAuth()
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<NetworkPackage | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [packagesData, setPackagesData] = useState<PackagesData | null>(null)
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [packagesError, setPackagesError] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true)
      setPackagesError('')
      const response = await fetch('/api/data/packages')
      const data = await response.json()

      if (data.success) {
        setPackagesData(data.data)
        // Auto-select first network if available
        if (data.data.networks.length > 0) {
          setSelectedNetwork(data.data.networks[0].code)
        }
      } else {
        setPackagesError(data.error || 'Failed to load packages')
      }
    } catch (err) {
      setPackagesError('Network error while loading packages')
    } finally {
      setLoadingPackages(false)
    }
  }

  const validatePhoneNumber = (phone: string) => {
    // Ghana phone number validation
    const cleanPhone = phone.replace(/\s+/g, '')
    const ghanaPhoneRegex = /^(0[2-9]\d{8}|233[2-9]\d{8})$/
    return ghanaPhoneRegex.test(cleanPhone)
  }

  const handlePurchase = async () => {
    if (!selectedPlan || !phoneNumber || !user?.email) {
      setErrorMessage('Please select a plan, enter phone number, and ensure you are logged in')
      setPurchaseStatus('error')
      return
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Please enter a valid Ghana phone number (e.g., 0551234567 or 233551234567)')
      setPurchaseStatus('error')
      return
    }

    setIsLoading(true)
    setPurchaseStatus('idle')
    setErrorMessage('')

    try {
      const network = packagesData?.networks.find(n => n.code === selectedNetwork)
      const requestData = {
        phone: phoneNumber,
        volumeInMB: selectedPlan.volume,
        networkType: network?.code.toLowerCase() || selectedNetwork.toLowerCase(),
        userEmail: user.email
      }

      console.log('Sending data purchase request:', requestData)
      const response = await fetch('/api/data/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (data.success) {
        setPurchaseStatus('success')
        setPhoneNumber('')
        setSelectedPlan(null)
        // Refresh packages to get updated pricing
        fetchPackages()
      } else {
        setErrorMessage(data.error || 'Purchase failed. Please try again.')
        setPurchaseStatus('error')
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.')
      setPurchaseStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to purchase data bundles</p>
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

  const selectedNetworkData = packagesData?.networks.find(n => n.code === selectedNetwork)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buy Data Bundles</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Purchase data bundles for MTN, Telecel, and AirtelTigo networks with real-time pricing
          </p>
        </div>

        {/* Network Selection */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Wifi className="h-6 w-6 mr-3 text-blue-600" />
            Select Network
          </h2>
          
          {loadingPackages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading networks and packages...</span>
            </div>
          ) : packagesError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{packagesError}</p>
              <button
                onClick={fetchPackages}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packagesData?.networks.map((network) => (
                <div
                  key={network.code}
                  onClick={() => setSelectedNetwork(network.code)}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedNetwork === network.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <Image
                        src={network.logo}
                        alt={`${network.name} logo`}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{network.name}</h3>
                      <p className="text-gray-600">{network.packages.length} packages available</p>
                    </div>
                  </div>
                  {selectedNetwork === network.code && (
                    <div className="flex items-center text-blue-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Plans */}
        {selectedNetwork && selectedNetworkData && (
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Database className="h-6 w-6 mr-3 text-green-600" />
                {selectedNetworkData.name} Data Plans
              </h2>
              <button
                onClick={fetchPackages}
                disabled={loadingPackages}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingPackages ? 'animate-spin' : ''}`} />
                Refresh Pricing
              </button>
            </div>

            {selectedNetworkData.packages.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600">No packages available for {selectedNetworkData.name}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {selectedNetworkData.packages.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.volumeGB}</h3>
                      <p className="text-2xl font-bold text-blue-600 mb-2">₵{plan.cost}</p>
                      <p className="text-sm text-gray-500 mb-3">{plan.validity}</p>
                      {selectedPlan?.id === plan.id && (
                        <div className="flex items-center justify-center text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Purchase Form */}
        {selectedPlan && (
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-purple-600" />
              Complete Purchase
            </h2>

            {/* Selected Plan Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Plan</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedNetworkData && (
                    <Image
                      src={selectedNetworkData.logo}
                      alt={`${selectedNetworkData.name} logo`}
                      width={40}
                      height={40}
                      className="rounded mr-4"
                    />
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedPlan.volumeGB}</h4>
                    <p className="text-gray-600">{selectedNetworkData?.name} • {selectedPlan.validity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">₵{selectedPlan.cost}</p>
                </div>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0551234567 or 233551234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the phone number to receive the data bundle
              </p>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={isLoading || !phoneNumber}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Purchase...
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5 mr-2" />
                  Purchase {selectedPlan.volumeGB} for ₵{selectedPlan.cost}
                </>
              )}
            </button>

            {/* Status Messages */}
            {purchaseStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">
                    Purchase successful! Your data bundle is being processed.
                  </p>
                </div>
              </div>
            )}

            {purchaseStatus === 'error' && errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800 font-medium">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Delivery</h3>
            <p className="text-gray-600">Data bundles are delivered instantly to your phone number</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-gray-600">All payments are processed securely through Paystack</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Pricing</h3>
            <p className="text-gray-600">Get the latest prices directly from network providers</p>
          </div>
        </div>
      </div>
    </div>
  )
}