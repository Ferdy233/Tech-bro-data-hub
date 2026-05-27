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

type NetworkReference = 'mtn' | 'telecel' | 'atishare' | 'atbigtime'

interface NetworkPackage {
  id: string
  capacityInGb: number
  label: string
  cost: number
  validity: string
}

interface NetworkData {
  code: NetworkReference
  name: string
  logo: string
  packages: NetworkPackage[]
}

const networks: NetworkData[] = [
  {
    code: 'mtn',
    name: 'MTN',
    logo: '/mtn.jpg',
    packages: [
      { id: 'mtn-1', capacityInGb: 1, label: '1 GB', cost: 6, validity: '30 days' },
      { id: 'mtn-2', capacityInGb: 2, label: '2 GB', cost: 11, validity: '30 days' },
      { id: 'mtn-3', capacityInGb: 5, label: '5 GB', cost: 25, validity: '30 days' },
      { id: 'mtn-4', capacityInGb: 10, label: '10 GB', cost: 48, validity: '30 days' },
    ],
  },
  {
    code: 'telecel',
    name: 'Telecel',
    logo: '/telecel.png',
    packages: [
      { id: 'tel-1', capacityInGb: 1, label: '1 GB', cost: 5, validity: '30 days' },
      { id: 'tel-2', capacityInGb: 2, label: '2 GB', cost: 10, validity: '30 days' },
      { id: 'tel-3', capacityInGb: 5, label: '5 GB', cost: 24, validity: '30 days' },
    ],
  },
  {
    code: 'atishare',
    name: 'AirtelTigo iShare',
    logo: '/at.png',
    packages: [
      { id: 'ats-1', capacityInGb: 1, label: '1 GB', cost: 5, validity: '30 days' },
      { id: 'ats-2', capacityInGb: 2, label: '2 GB', cost: 9, validity: '30 days' },
      { id: 'ats-3', capacityInGb: 5, label: '5 GB', cost: 22, validity: '30 days' },
    ],
  },
  {
    code: 'atbigtime',
    name: 'AirtelTigo BigTime',
    logo: '/at.png',
    packages: [
      { id: 'atb-1', capacityInGb: 1, label: '1 GB', cost: 5, validity: '30 days' },
      { id: 'atb-2', capacityInGb: 2, label: '2 GB', cost: 9, validity: '30 days' },
      { id: 'atb-3', capacityInGb: 5, label: '5 GB', cost: 22, validity: '30 days' },
    ],
  },
]

function generateOrderReference() {
  return `${Date.now()}${Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, '0')}`
}

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

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          networkReference: selectedNetwork,
          orderReference: generateOrderReference(),
          recipientPhone: phoneNumber.replace(/\s+/g, ''),
          capacityInGb: selectedPlan.capacityInGb,
        }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success) {
        setPurchaseStatus('success')
        setPhoneNumber('')
        setSelectedPlan(null)
      } else {
        setErrorMessage(data?.error || 'Purchase failed. Please try again.')
        setPurchaseStatus('error')
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
      setPurchaseStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedNetworkData = networks.find((n) => n.code === selectedNetwork)
  
  // Color mapping for networks
  const getNetworkColor = (code: NetworkReference) => {
    const colors: Record<NetworkReference, { bg: string; button: string; border: string }> = {
      mtn: { bg: 'bg-amber-400', button: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-500' },
      telecel: { bg: 'bg-red-600', button: 'bg-red-700 hover:bg-red-800', border: 'border-red-600' },
      atishare: { bg: 'bg-blue-600', button: 'bg-blue-700 hover:bg-blue-800', border: 'border-blue-600' },
      atbigtime: { bg: 'bg-blue-600', button: 'bg-blue-700 hover:bg-blue-800', border: 'border-blue-600' },
    }
    return colors[code]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Bundle packages</h1>
          <p className="text-slate-400 text-lg">
            Choose your preferred network to see tailored data bundle options.
          </p>
        </div>

        {/* Network Dropdown Selection */}
        <div className="mb-12">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border-2 border-amber-400">
            <h2 className="text-sm font-bold text-slate-300 tracking-widest mb-6">NETWORK</h2>

            <select
              value={selectedNetwork}
              onChange={(e) => {
                setSelectedNetwork(e.target.value as NetworkReference)
                setSelectedPlan(null)
              }}
              className="w-full sm:w-64 px-6 py-3 bg-slate-900 text-white border-2 border-slate-700 rounded-lg focus:outline-none focus:border-amber-400 appearance-none cursor-pointer font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem',
              }}
            >
              {networks.map((network) => (
                <option key={network.code} value={network.code}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Bundles */}
        {selectedNetworkData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selectedNetworkData.packages.map((plan) => {
                const colors = getNetworkColor(selectedNetworkData.code)
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl p-6 ${colors.bg} text-black shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer`}
                  >
                    <div className="mb-4">
                      <h3 className="text-xs font-bold tracking-widest opacity-80">{selectedNetworkData.name}</h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs opacity-80 mb-1">Size</p>
                      <h2 className="text-2xl font-bold mb-3">{plan.label}</h2>
                      <p className="text-xs opacity-80 mb-1">Price</p>
                      <p className="text-2xl font-bold">₵{plan.cost}</p>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-2 rounded-full font-bold text-xs tracking-widest transition-all duration-300 ${
                        selectedPlan?.id === plan.id
                          ? `${colors.button} text-white`
                          : 'bg-black/20 text-black hover:bg-black/30'
                      }`}
                    >
                      {selectedPlan?.id === plan.id ? 'SELECTED ✓' : 'GET THIS BUNDLE'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Purchase Form */}
        {selectedPlan && selectedNetworkData && (
          <div className="mt-12 bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Complete Purchase</h2>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0551234567 or 233551234567"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <p className="text-sm text-slate-400 mt-2">
                Enter the phone number to receive the data bundle
              </p>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isLoading || !phoneNumber}
              className="w-full bg-amber-400 text-slate-900 py-4 rounded-full font-bold text-lg hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Purchase...
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5 mr-2" />
                  Purchase {selectedPlan.label} for ₵{selectedPlan.cost}
                </>
              )}
            </button>

            {purchaseStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-green-300 font-medium">
                    Purchase successful! Your data bundle is being processed.
                  </p>
                </div>
              </div>
            )}

            {purchaseStatus === 'error' && errorMessage && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-300 font-medium">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
