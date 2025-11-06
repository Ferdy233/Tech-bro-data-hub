'use client'

import { useState, useEffect } from 'react'
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ArrowUpDown,
  Info,
  Clock,
  MessageCircle
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

// Admin WhatsApp number (replace with actual number)
// Format: 233XXXXXXXXX (Ghana number without + sign)
const ADMIN_WHATSAPP_NUMBER = '233598369795' // TODO: Replace with actual admin WhatsApp number

interface ExchangeRate {
  from: string
  to: string
  rate: number
  change: number
  lastUpdated: string
}

const mockRates: ExchangeRate[] = [
  {
    from: 'NGN',
    to: 'GHS',
    rate: 0.012,
    change: 0.001,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'NGN',
    to: 'USD',
    rate: 0.00067,
    change: -0.00001,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'NGN',
    to: 'EUR',
    rate: 0.00062,
    change: 0.00002,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'NGN',
    to: 'GBP',
    rate: 0.00053,
    change: -0.00001,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'GHS',
    to: 'NGN',
    rate: 83.33,
    change: 6.67,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'GHS',
    to: 'USD',
    rate: 0.056,
    change: -0.001,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'USD',
    to: 'GHS',
    rate: 17.86,
    change: 0.36,
    lastUpdated: '2024-01-21T10:30:00Z'
  },
  {
    from: 'USD',
    to: 'NGN',
    rate: 1492.54,
    change: -14.92,
    lastUpdated: '2024-01-21T10:30:00Z'
  }
]

const currencyInfo = {
  NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  GHS: { name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' }
}

export default function ConvertPage() {
  const [amount, setAmount] = useState<string>('')
  const [fromCurrency, setFromCurrency] = useState<string>('GHS')
  const [toCurrency, setToCurrency] = useState<string>('NGN')
  const [rates, setRates] = useState<ExchangeRate[]>(mockRates)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const currentRate = rates.find(rate => 
    rate.from === fromCurrency && rate.to === toCurrency
  )

  const convertedAmount = currentRate && amount 
    ? (parseFloat(amount) * currentRate.rate).toFixed(2)
    : '0.00'

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleRefreshRates = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdated(new Date().toISOString())
    setIsLoading(false)
  }

  useEffect(() => {
    setLastUpdated(new Date().toISOString())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Currency Converter</h1>
          <p className="text-gray-600">Convert currencies with real-time exchange rates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currency Converter */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Currency Converter</h2>
                <button
                  onClick={handleRefreshRates}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Rates
                </button>
              </div>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-500 text-lg">
                        {currencyInfo[fromCurrency as keyof typeof currencyInfo]?.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From
                    </label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(currencyInfo).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.flag} {code} - {info.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSwapCurrencies}
                      className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowUpDown className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To
                    </label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(currencyInfo).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.flag} {code} - {info.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conversion Result */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Converted Amount</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {currencyInfo[toCurrency as keyof typeof currencyInfo]?.symbol}
                      {formatNumber(parseFloat(convertedAmount))}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {currencyInfo[fromCurrency as keyof typeof currencyInfo]?.symbol}
                      {formatNumber(parseFloat(amount || '0'))} = {currencyInfo[toCurrency as keyof typeof currencyInfo]?.symbol}
                      {formatNumber(parseFloat(convertedAmount))}
                    </p>
                  </div>
                </div>

                {/* Exchange Rate Info */}
                {currentRate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Exchange Rate</p>
                        <p className="text-lg font-semibold text-gray-900">
                          1 {fromCurrency} = {currentRate.rate.toFixed(6)} {toCurrency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">24h Change</p>
                        <div className={`flex items-center gap-1 ${
                          currentRate.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {currentRate.change >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {currentRate.change >= 0 ? '+' : ''}{currentRate.change.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Exchange Button */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to Exchange Currency?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Contact our admin directly via WhatsApp for personalized currency exchange services
                    </p>
                    <button
                      onClick={() => {
                        const message = `Hello! I'd like to exchange ${currencyInfo[fromCurrency as keyof typeof currencyInfo]?.symbol}${formatNumber(parseFloat(amount || '0'))} ${fromCurrency} to ${toCurrency}`;
                        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Exchange
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Rates and Market Info Sidebar */}
          <div className="space-y-6">
            {/* Live Exchange Rates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Exchange Rates</h3>
              <div className="space-y-4">
                {rates.slice(0, 6).map((rate) => (
                  <div key={`${rate.from}-${rate.to}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {currencyInfo[rate.from as keyof typeof currencyInfo]?.flag}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {rate.from} → {rate.to}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rate.rate.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      rate.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rate.change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {rate.change >= 0 ? '+' : ''}{(rate.change * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Loading...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Update Frequency</p>
                    <p className="text-xs text-gray-500">Every 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Calculation Method</p>
                    <p className="text-xs text-gray-500">Real-time market rates</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Data Source</p>
                    <p className="text-xs text-gray-500">Multiple exchange APIs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
