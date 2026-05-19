'use client'

import { useState } from 'react'
import {
  Database,
  Smartphone,
  CreditCard,
  CheckCircle,
  Zap,
  Shield,
  Wifi,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'

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

// Placeholder data until the external data-buying API is wired up.
const networks: NetworkData[] = [
  {
    code: 'MTN',
    name: 'MTN',
    logo: '/mtn.jpg',
    packages: [
      { id: 'mtn-1', volume: 1000, volumeGB: '1 GB', cost: 6, validity: '30 days', description: '' },
      { id: 'mtn-2', volume: 2000, volumeGB: '2 GB', cost: 11, validity: '30 days', description: '' },
      { id: 'mtn-3', volume: 5000, volumeGB: '5 GB', cost: 25, validity: '30 days', description: '' },
      { id: 'mtn-4', volume: 10000, volumeGB: '10 GB', cost: 48, validity: '30 days', description: '' },
    ],
  },
  {
    code: 'TELECEL',
    name: 'Telecel',
    logo: '/telecel.png',
    packages: [
      { id: 'tel-1', volume: 1000, volumeGB: '1 GB', cost: 5, validity: '30 days', description: '' },
      { id: 'tel-2', volume: 2000, volumeGB: '2 GB', cost: 10, validity: '30 days', description: '' },
      { id: 'tel-3', volume: 5000, volumeGB: '5 GB', cost: 24, validity: '30 days', description: '' },
    ],
  },
  {
    code: 'AT',
    name: 'AirtelTigo',
    logo: '/at.png',
    packages: [
      { id: 'at-1', volume: 1000, volumeGB: '1 GB', cost: 5, validity: '30 days', description: '' },
      { id: 'at-2', volume: 2000, volumeGB: '2 GB', cost: 9, validity: '30 days', description: '' },
      { id: 'at-3', volume: 5000, volumeGB: '5 GB', cost: 22, validity: '30 days', description: '' },
    ],
  },
]

export default function BuyDataPage() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0].code)
  const [selectedPlan, setSelectedPlan] = useState<NetworkPackage | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '')
    const ghanaPhoneRegex = /^(0[2-9]\d{8}|233[2-9]\d{8})$/
    return ghanaPhoneRegex.test(cleanPhone)
  }

  const handlePurchase = async () => {
    if (!selectedPlan || !phoneNumber) {
      setErrorMessage('Please select a plan and enter a phone number')
      setPurchaseStatus('error')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Please enter a valid Ghana phone number (e.g., 0551234567 or 233551234567)')
      setPurchaseStatus('error')
      return
    }

    setIsLoading(true)
    setPurchaseStatus('idle')
    setErrorMessage('')

    // TODO: integrate the external data-buying API here.
    // Expected request shape:
    //   { phone: string, volumeInMB: number, networkType: string }
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setPurchaseStatus('success')
      setPhoneNumber('')
      setSelectedPlan(null)
    } catch {
      setErrorMessage('Purchase failed. Please try again.')
      setPurchaseStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedNetworkData = networks.find((n) => n.code === selectedNetwork)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buy Data Bundles</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Purchase data bundles for MTN, Telecel, and AirtelTigo networks
          </p>
        </div>

        {/* Network Selection */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Wifi className="h-6 w-6 mr-3 text-blue-600" />
            Select Network
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {networks.map((network) => (
              <div
                key={network.code}
                onClick={() => {
                  setSelectedNetwork(network.code)
                  setSelectedPlan(null)
                }}
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
        </div>


        {/* Data Plans */}
        {selectedNetworkData && (
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Database className="h-6 w-6 mr-3 text-green-600" />
              {selectedNetworkData.name} Data Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          </div>
        )}

        {/* Purchase Form */}
        {selectedPlan && (
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-purple-600" />
              Complete Purchase
            </h2>

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
                    <p className="text-gray-600">
                      {selectedNetworkData?.name} • {selectedPlan.validity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">₵{selectedPlan.cost}</p>
                </div>
              </div>
            </div>

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
            <p className="text-gray-600">All payments are processed securely</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Major Networks</h3>
            <p className="text-gray-600">MTN, Telecel, and AirtelTigo bundles in one place</p>
          </div>
        </div>
      </div>
    </div>
  )
}
