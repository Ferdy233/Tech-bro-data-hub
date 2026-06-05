'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react'

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency?: string
        ref?: string
        metadata?: Record<string, unknown>
        onClose: () => void
        callback: (response: { reference: string }) => void
      }) => { openIframe: () => void }
    }
  }
}

type NetworkReference = 'mtn' | 'telecel' | 'atishare'

interface NetworkPackage {
  id: string
  capacityInGb: number
  label: string
  cost: number
  validity: string
  tag?: string
}

interface NetworkData {
  code: NetworkReference
  name: string
  description: string
  logo: string
  accentColor: string
  packages: NetworkPackage[]
}

const defaultNetworks: NetworkData[] = [
  {
    code: 'mtn',
    name: 'MTN',
    description: 'Fast and reliable network',
    logo: '/mtn.jpg',
    accentColor: 'amber',
    packages: [
      { id: 'mtn-1', capacityInGb: 1, label: '1GB', cost: 5, validity: 'No Expiry' },
      { id: 'mtn-2', capacityInGb: 2, label: '2GB', cost: 10, validity: 'No Expiry', tag: 'STANDARD' },
      { id: 'mtn-3', capacityInGb: 3, label: '3GB', cost: 15, validity: 'No Expiry' },
      { id: 'mtn-4', capacityInGb: 4, label: '4GB', cost: 20, validity: 'No Expiry' },
      { id: 'mtn-5', capacityInGb: 5, label: '5GB', cost: 25, validity: 'No Expiry', tag: 'POPULAR' },
      { id: 'mtn-6', capacityInGb: 6, label: '6GB', cost: 30, validity: 'No Expiry' },
      { id: 'mtn-7', capacityInGb: 8, label: '8GB', cost: 40, validity: 'No Expiry' },
      { id: 'mtn-8', capacityInGb: 10, label: '10GB', cost: 47, validity: 'No Expiry', tag: 'POWER' },
      { id: 'mtn-9', capacityInGb: 15, label: '15GB', cost: 65, validity: 'No Expiry', tag: 'ELITE' },
      { id: 'mtn-10', capacityInGb: 20, label: '20GB', cost: 85, validity: 'No Expiry' },
      { id: 'mtn-11', capacityInGb: 25, label: '25GB', cost: 105, validity: 'No Expiry' },
      { id: 'mtn-12', capacityInGb: 30, label: '30GB', cost: 130, validity: 'No Expiry' },
      { id: 'mtn-13', capacityInGb: 40, label: '40GB', cost: 170, validity: 'No Expiry' },
      { id: 'mtn-14', capacityInGb: 50, label: '50GB', cost: 205, validity: 'No Expiry' },
    ],
  },
  {
    code: 'telecel',
    name: 'Telecel',
    description: 'Quality nationwide coverage',
    logo: '/telecel.png',
    accentColor: 'red',
    packages: [
      { id: 'tel-1', capacityInGb: 10, label: '10GB', cost: 45, validity: 'No Expiry' },
      { id: 'tel-2', capacityInGb: 15, label: '15GB', cost: 70, validity: 'No Expiry' },
      { id: 'tel-3', capacityInGb: 20, label: '20GB', cost: 85, validity: 'No Expiry', tag: 'POPULAR' },
      { id: 'tel-4', capacityInGb: 25, label: '25GB', cost: 110, validity: 'No Expiry' },
      { id: 'tel-5', capacityInGb: 30, label: '30GB', cost: 130, validity: 'No Expiry' },
      { id: 'tel-6', capacityInGb: 40, label: '40GB', cost: 165, validity: 'No Expiry' },
      { id: 'tel-7', capacityInGb: 50, label: '50GB', cost: 200, validity: 'No Expiry' },
      { id: 'tel-8', capacityInGb: 100, label: '100GB', cost: 380, validity: 'No Expiry', tag: 'MEGA' },
    ],
  },
  {
    code: 'atishare',
    name: 'AirtelTigo',
    description: 'Affordable data solutions',
    logo: '/at.png',
    accentColor: 'blue',
    packages: [
      { id: 'ats-1', capacityInGb: 1, label: '1GB', cost: 4.90, validity: 'No Expiry' },
      { id: 'ats-2', capacityInGb: 2, label: '2GB', cost: 9.90, validity: 'No Expiry' },
      { id: 'ats-3', capacityInGb: 3, label: '3GB', cost: 14, validity: 'No Expiry' },
      { id: 'ats-4', capacityInGb: 4, label: '4GB', cost: 19, validity: 'No Expiry' },
      { id: 'ats-5', capacityInGb: 5, label: '5GB', cost: 24, validity: 'No Expiry', tag: 'POPULAR' },
      { id: 'ats-6', capacityInGb: 6, label: '6GB', cost: 28, validity: 'No Expiry' },
      { id: 'ats-7', capacityInGb: 7, label: '7GB', cost: 32, validity: 'No Expiry' },
      { id: 'ats-8', capacityInGb: 8, label: '8GB', cost: 35, validity: 'No Expiry' },
      { id: 'ats-9', capacityInGb: 10, label: '10GB', cost: 44, validity: 'No Expiry' },
      { id: 'ats-10', capacityInGb: 12, label: '12GB', cost: 52, validity: 'No Expiry' },
      { id: 'ats-11', capacityInGb: 15, label: '15GB', cost: 64, validity: 'No Expiry' },
      { id: 'ats-12', capacityInGb: 20, label: '20GB', cost: 83, validity: 'No Expiry' },
      { id: 'ats-13', capacityInGb: 25, label: '25GB', cost: 108, validity: 'No Expiry' },
      { id: 'ats-14', capacityInGb: 30, label: '30GB', cost: 130, validity: 'No Expiry' },
    ],
  },
]

// networks at runtime may be updated from server-stored prices

const accentColors: Record<string, { text: string; border: string; bg: string; badge: string }> = {
  amber: { text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-400', badge: 'bg-amber-400 text-slate-900' },
  red: { text: 'text-red-400', border: 'border-red-400', bg: 'bg-red-400', badge: 'bg-red-400 text-white' },
  blue: { text: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400', badge: 'bg-blue-400 text-white' },
}

function generateOrderReference() {
  return `${Date.now()}${Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, '0')}`
}

export default function BuyDataPage() {
  const [networks, setNetworks] = useState<NetworkData[]>(defaultNetworks)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkReference>(defaultNetworks[0].code)
  const [selectedPlan, setSelectedPlan] = useState<NetworkPackage | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastOrderRef, setLastOrderRef] = useState('')
  const [copied, setCopied] = useState(false)

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById('paystack-script')) return
    const script = document.createElement('script')
    script.id = 'paystack-script'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Load persisted bundle prices from server (admin-managed)
  useEffect(() => {
    let mounted = true
    fetch('/api/admin/bundles')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        if (data?.bundles) {
          const map = data.bundles
          const updated = defaultNetworks.map((n) => ({
            ...n,
            packages: n.packages.map((p) => ({ ...p, cost: map[p.id] ?? p.cost })),
          }))
          setNetworks(updated)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '')
    return /^(0[2-9]\d{8}|233[2-9]\d{8})$/.test(cleanPhone)
  }

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)
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

    if (!email || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address')
      setPurchaseStatus('error')
      return
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey) {
      setErrorMessage('Payment service is not configured.')
      setPurchaseStatus('error')
      return
    }

    if (!window.PaystackPop) {
      setErrorMessage('Payment system is loading. Please try again.')
      setPurchaseStatus('error')
      return
    }

    setErrorMessage('')
    setPurchaseStatus('idle')

    const orderRef = generateOrderReference()
    const amountInKobo = Math.round(selectedPlan.cost * 100)

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: email,
      amount: amountInKobo,
      currency: 'GHS',
      ref: orderRef,
      metadata: {
        networkReference: selectedNetwork,
        recipientPhone: phoneNumber.replace(/\s+/g, ''),
        capacityInGb: selectedPlan.capacityInGb,
        planLabel: selectedPlan.label,
      },
      onClose: () => {
        // User closed payment popup
      },
      callback: (response: { reference: string }) => {
        // Payment successful on Paystack — now verify and deliver bundle
        setIsLoading(true)
        setPurchaseStatus('idle')
        setErrorMessage('')

        fetch('/api/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            networkReference: selectedNetwork,
            orderReference: orderRef,
            recipientPhone: phoneNumber.replace(/\s+/g, ''),
            capacityInGb: selectedPlan.capacityInGb,
            paystackReference: response.reference,
          }),
        })
          .then((result) => result.json().catch(() => null).then((data) => ({ ok: result.ok, data })))
          .then(({ ok, data }) => {
            if (ok && data?.success) {
              setPurchaseStatus('success')
              setLastOrderRef(data.orderReference || orderRef)
              setPhoneNumber('')
              setEmail('')
            } else {
              setErrorMessage(data?.error || 'Purchase failed after payment. Please contact support.')
              setPurchaseStatus('error')
            }
          })
          .catch(() => {
            setErrorMessage('Network error after payment. Please contact support with your reference: ' + response.reference)
            setPurchaseStatus('error')
          })
          .finally(() => {
            setIsLoading(false)
          })
      },
    })

    handler.openIframe()
  }

  const closeModal = () => {
    setShowPurchaseModal(false)
    setSelectedPlan(null)
    setPurchaseStatus('idle')
    setErrorMessage('')
    setPhoneNumber('')
    setEmail('')
  }

  const selectedNetworkData = networks.find((n) => n.code === selectedNetwork)!
  const colors = accentColors[selectedNetworkData.accentColor]

  return (
    <div className="min-h-screen bg-slate-900 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Network Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {networks.map((network) => {
            const isActive = selectedNetwork === network.code
            return (
              <button
                key={network.code}
                onClick={() => setSelectedNetwork(network.code)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${
                  isActive
                    ? `border-amber-400 bg-slate-800`
                    : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center">
                    <Check className="h-3 w-3 text-slate-900" />
                  </div>
                )}
                <Image
                  src={network.logo}
                  alt={network.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full mx-auto mb-3 object-cover"
                />
                <p className="text-white font-bold text-sm">{network.name}</p>
                <p className="text-slate-400 text-xs mt-1">{network.description}</p>
              </button>
            )
          })}
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-white font-bold text-lg">
            {selectedNetworkData.name} Plans
          </h2>
        </div>

        {/* Packages Grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedNetworkData.packages.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleGetBundle(plan)}
              className="relative bg-slate-800 border border-slate-700/60 rounded-xl p-5 text-left hover:border-amber-400/60 transition-all duration-200 group cursor-pointer"
            >
              {plan.tag && (
                <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase">
                  {plan.tag}
                </span>
              )}
              {!plan.tag && (
                <span className="text-slate-600 text-[10px] font-medium tracking-wider uppercase">
                  {plan.label}
                </span>
              )}

              <p className={`text-2xl font-bold mt-1 mb-2 ${colors.text}`}>
                {plan.label}
              </p>

              <p className="text-white font-semibold text-sm">
                GHS {plan.cost.toFixed(2)}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {plan.validity}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-slate-800 rounded-2xl p-5 md:p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-xs font-bold text-slate-300 tracking-widest">
                  {selectedNetworkData.name.toUpperCase()} BUNDLE
                </h2>
                <p className="text-white font-bold text-lg mt-1">
                  {selectedPlan.label} &mdash; GHS {selectedPlan.cost.toFixed(2)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white text-xs font-bold tracking-wider border border-slate-600 rounded-md px-3 py-1.5 hover:border-slate-500 transition-colors"
              >
                CLOSE
              </button>
            </div>

            <div className="border-t border-slate-700 my-4" />

            <div className="flex items-start gap-3 mb-4">
              <div className={`h-10 w-10 rounded-full ${colors.badge} border-2 ${colors.border} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[10px] font-bold">{selectedPlan.label}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                This bundle will be applied to the number you provide below. Ensure the network matches the recipient SIM.
              </p>
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-300 mb-2 tracking-widest">
                RECIPIENT NUMBER
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setErrorMessage('')
                  setPurchaseStatus('idle')
                }}
                placeholder="e.g. 024 123 4567"
                className="w-full px-4 py-2.5 bg-slate-900/50 border-2 border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-2 tracking-widest">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrorMessage('')
                  setPurchaseStatus('idle')
                }}
                placeholder="e.g. you@example.com"
                className="w-full px-4 py-2.5 bg-slate-900/50 border-2 border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <button
              onClick={handlePurchase}
              disabled={isLoading || !phoneNumber || !email}
              className="w-full bg-amber-400 text-slate-900 py-3 rounded-lg font-bold text-sm tracking-wider hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                'CONTINUE TO PAYMENT'
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
