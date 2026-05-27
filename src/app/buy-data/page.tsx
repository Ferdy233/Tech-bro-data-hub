'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Smartphone,
  CheckCircle,
  Zap,
  Loader2,
  AlertCircle,
  ChevronDown,
  Check,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react'

type NetworkReference = 'mtn' | 'telecel' | 'atishare'

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
  dropdownLabel: string
  packages: NetworkPackage[]
}

const networks: NetworkData[] = [
  {
    code: 'mtn',
    name: 'MTN',
    dropdownLabel: 'MTN',
    packages: [
      { id: 'mtn-1', capacityInGb: 1, label: '1 GB', cost: 5, validity: '30 days' },
      { id: 'mtn-2', capacityInGb: 2, label: '2 GB', cost: 10, validity: '30 days' },
      { id: 'mtn-3', capacityInGb: 3, label: '3 GB', cost: 15, validity: '30 days' },
      { id: 'mtn-4', capacityInGb: 4, label: '4 GB', cost: 20, validity: '30 days' },
      { id: 'mtn-5', capacityInGb: 5, label: '5 GB', cost: 25, validity: '30 days' },
      { id: 'mtn-6', capacityInGb: 6, label: '6 GB', cost: 30, validity: '30 days' },
      { id: 'mtn-7', capacityInGb: 8, label: '8 GB', cost: 40, validity: '30 days' },
      { id: 'mtn-8', capacityInGb: 10, label: '10 GB', cost: 47, validity: '30 days' },
      { id: 'mtn-9', capacityInGb: 15, label: '15 GB', cost: 65, validity: '30 days' },
      { id: 'mtn-10', capacityInGb: 20, label: '20 GB', cost: 85, validity: '30 days' },
      { id: 'mtn-11', capacityInGb: 25, label: '25 GB', cost: 105, validity: '30 days' },
      { id: 'mtn-12', capacityInGb: 30, label: '30 GB', cost: 130, validity: '30 days' },
      { id: 'mtn-13', capacityInGb: 40, label: '40 GB', cost: 170, validity: '30 days' },
      { id: 'mtn-14', capacityInGb: 50, label: '50 GB', cost: 205, validity: '30 days' },
    ],
  },
  {
    code: 'telecel',
    name: 'TELECEL',
    dropdownLabel: 'TELECEL',
    packages: [
      { id: 'tel-1', capacityInGb: 10, label: '10 GB', cost: 45, validity: '30 days' },
      { id: 'tel-2', capacityInGb: 15, label: '15 GB', cost: 70, validity: '30 days' },
      { id: 'tel-3', capacityInGb: 20, label: '20 GB', cost: 85, validity: '30 days' },
      { id: 'tel-4', capacityInGb: 25, label: '25 GB', cost: 110, validity: '30 days' },
      { id: 'tel-5', capacityInGb: 30, label: '30 GB', cost: 130, validity: '30 days' },
      { id: 'tel-6', capacityInGb: 40, label: '40 GB', cost: 165, validity: '30 days' },
      { id: 'tel-7', capacityInGb: 50, label: '50 GB', cost: 200, validity: '30 days' },
      { id: 'tel-8', capacityInGb: 100, label: '100 GB', cost: 380, validity: '30 days' },
    ],
  },
  {
    code: 'atishare',
    name: 'ATISHARE',
    dropdownLabel: 'AT PREMIUM BUNDLES',
    packages: [
      { id: 'ats-1', capacityInGb: 1, label: '1 GB', cost: 4.90, validity: '30 days' },
      { id: 'ats-2', capacityInGb: 2, label: '2 GB', cost: 9.90, validity: '30 days' },
      { id: 'ats-3', capacityInGb: 3, label: '3 GB', cost: 14, validity: '30 days' },
      { id: 'ats-4', capacityInGb: 4, label: '4 GB', cost: 19, validity: '30 days' },
      { id: 'ats-5', capacityInGb: 5, label: '5 GB', cost: 24, validity: '30 days' },
      { id: 'ats-6', capacityInGb: 6, label: '6 GB', cost: 28, validity: '30 days' },
      { id: 'ats-7', capacityInGb: 7, label: '7 GB', cost: 32, validity: '30 days' },
      { id: 'ats-8', capacityInGb: 8, label: '8 GB', cost: 35, validity: '30 days' },
      { id: 'ats-9', capacityInGb: 10, label: '10 GB', cost: 44, validity: '30 days' },
      { id: 'ats-10', capacityInGb: 12, label: '12 GB', cost: 52, validity: '30 days' },
      { id: 'ats-11', capacityInGb: 15, label: '15 GB', cost: 64, validity: '30 days' },
      { id: 'ats-12', capacityInGb: 20, label: '20 GB', cost: 83, validity: '30 days' },
      { id: 'ats-13', capacityInGb: 25, label: '25 GB', cost: 108, validity: '30 days' },
      { id: 'ats-14', capacityInGb: 30, label: '30 GB', cost: 130, validity: '30 days' },
    ],
  },
]

const networkStyles: Record<NetworkReference, { card: string; text: string; button: string; buttonText: string; ring: string }> = {
  mtn: {
    card: 'bg-amber-400',
    text: 'text-slate-900',
    button: 'bg-slate-900/20 hover:bg-slate-900/30',
    buttonText: 'text-slate-900',
    ring: 'ring-amber-400/50',
  },
  telecel: {
    card: 'bg-red-600',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30',
    buttonText: 'text-white',
    ring: 'ring-red-500/50',
  },
  atishare: {
    card: 'bg-blue-600',
    text: 'text-white',
    button: 'bg-white/20 hover:bg-white/30',
    buttonText: 'text-white',
    ring: 'ring-blue-500/50',
  },
}

function generateOrderReference() {
  return `${Date.now()}${Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, '0')}`
}

export default function BuyDataPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkReference>(networks[0].code)
  const [selectedPlan, setSelectedPlan] = useState<NetworkPackage | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastOrderRef, setLastOrderRef] = useState('')
  const [copied, setCopied] = useState(false)

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '')
    return /^(0[2-9]\d{8}|233[2-9]\d{8})$/.test(cleanPhone)
  }

  const handleGetBundle = (plan: NetworkPackage) => {
    setSelectedPlan(plan)
    setShowPurchaseModal(true)
    setPurchaseStatus('idle')
    setErrorMessage('')
  }

  const handlePurchase = async () => {
    if (!selectedPlan || !phoneNumber) {
      setErrorMessage('Please enter a phone number')
      setPurchaseStatus('error')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Please enter a valid Ghana phone number (e.g., 0551234567)')
      setPurchaseStatus('error')
      return
    }

    setIsLoading(true)
    setPurchaseStatus('idle')
    setErrorMessage('')

    try {
      const ref = generateOrderReference()
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          networkReference: selectedNetwork,
          orderReference: ref,
          recipientPhone: phoneNumber.replace(/\s+/g, ''),
          capacityInGb: selectedPlan.capacityInGb,
        }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success) {
        setPurchaseStatus('success')
        setLastOrderRef(data.orderReference || ref)
        setPhoneNumber('')
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

  const closeModal = () => {
    setShowPurchaseModal(false)
    setSelectedPlan(null)
    setPurchaseStatus('idle')
    setErrorMessage('')
    setPhoneNumber('')
  }

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedNetworkData = networks.find((n) => n.code === selectedNetwork)!
  const styles = networkStyles[selectedNetwork]

  const networkDotColor: Record<NetworkReference, string> = {
    mtn: 'bg-amber-400',
    telecel: 'bg-red-500',
    atishare: 'bg-blue-500',
  }

  return (
    <div className="min-h-screen bg-slate-900 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Bundle packages
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Choose your preferred network to see tailored data bundle options.
          </p>
        </div>

        {/* Network Selector */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
          <label className="block text-xs font-bold text-slate-300 tracking-widest mb-3">
            NETWORK
          </label>
          <div className="relative w-64" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between bg-slate-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer hover:bg-slate-600 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${networkDotColor[selectedNetwork]}`} />
                {selectedNetworkData.dropdownLabel}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-slate-700 rounded-lg border border-slate-600 shadow-xl overflow-hidden z-10">
                {networks.map((network) => {
                  const isActive = selectedNetwork === network.code
                  return (
                    <button
                      key={network.code}
                      onClick={() => {
                        setSelectedNetwork(network.code)
                        setDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-600 text-white'
                          : 'text-slate-300 hover:bg-slate-600/60 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${networkDotColor[network.code]}`} />
                        {network.dropdownLabel}
                      </span>
                      {isActive && <Check className="h-4 w-4 text-amber-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedNetworkData.packages.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.card} rounded-xl p-5 flex flex-col justify-between ring-2 ${styles.ring}`}
            >
              <div>
                <p className={`text-xs font-bold tracking-widest ${styles.text} opacity-70 mb-3`}>
                  {selectedNetworkData.name}
                </p>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className={`text-xs ${styles.text} opacity-60`}>Size</p>
                    <p className={`text-2xl font-bold ${styles.text}`}>{plan.label}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${styles.text} opacity-60`}>Price</p>
                    <p className={`text-2xl font-bold ${styles.text}`}>₵{plan.cost}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleGetBundle(plan)}
                className={`w-full py-2.5 rounded-lg font-bold text-xs tracking-widest transition-all duration-200 ${styles.button} ${styles.buttonText}`}
              >
                GET THIS BUNDLE
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-md border border-slate-700 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Complete Purchase</h2>
            <p className="text-slate-400 text-sm mb-6">
              {selectedNetworkData.name} — {selectedPlan.label} for ₵{selectedPlan.cost}
            </p>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-300 mb-2 tracking-widest">
                RECIPIENT PHONE NUMBER
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    setErrorMessage('')
                    setPurchaseStatus('idle')
                  }}
                  placeholder="0551234567"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isLoading || !phoneNumber}
              className="w-full bg-amber-400 text-slate-900 py-3 rounded-lg font-bold text-sm hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Buy Now — ₵{selectedPlan.cost}
                </>
              )}
            </button>

            {purchaseStatus === 'success' && lastOrderRef && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/40 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-300 font-bold text-sm">Success!</p>
                    <p className="text-green-200 text-xs">Your data bundle is being delivered.</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Order Reference</p>
                  <div className="flex items-center gap-2">
                    <code className="text-amber-400 text-sm font-mono flex-1 break-all">{lastOrderRef}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lastOrderRef)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors flex-shrink-0"
                      title="Copy reference"
                    >
                      {copied
                        ? <Check className="h-3.5 w-3.5 text-green-400" />
                        : <Copy className="h-3.5 w-3.5 text-slate-300" />}
                    </button>
                  </div>
                </div>

                <Link
                  href={`/track-orders?ref=${lastOrderRef}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold tracking-wider transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  TRACK THIS ORDER
                </Link>
              </div>
            )}

            {purchaseStatus === 'error' && errorMessage && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
