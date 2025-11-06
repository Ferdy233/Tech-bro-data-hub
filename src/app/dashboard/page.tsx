'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import AdDisplay from '@/components/AdDisplay'
import { 
  User, 
  TrendingUp, 
  TrendingDown,
  History,
  Settings,
  Shield,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Filter,
  Search,
  Wallet,
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface Transaction {
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed'
  type: 'credit' | 'debit'
  description: string
  createdAt: string
  paystackData?: any
}


export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [isClearing, setIsClearing] = useState(false)
  const [hasVerifiedPayment, setHasVerifiedPayment] = useState(false)

  useEffect(() => {
    if (user && user.email) {
      console.log('User loaded, fetching wallet data:', user.email)
      fetchUserData()
      // Check if user is returning from payment
      checkPaymentStatus()
    } else {
      console.log('User not loaded yet or no email')
    }
  }, [user])

  useEffect(() => {
    // Check for payment parameters in URL when component mounts
    const urlParams = new URLSearchParams(window.location.search)
    const reference = urlParams.get('reference')
    const trxref = urlParams.get('trxref')
    
    console.log('Checking payment parameters:', { reference, trxref, paymentStatus, hasVerifiedPayment })
    
    if ((reference || trxref) && !hasVerifiedPayment && paymentStatus === 'idle') {
      console.log('Payment reference found, verifying payment...')
      setHasVerifiedPayment(true)
      verifyPayment(reference || trxref)
    }
  }, [hasVerifiedPayment, paymentStatus])

  const fetchUserData = async (force = false) => {
    try {
      console.log('Fetching user wallet data...', force ? '(FORCED)' : '')
      console.log('User email:', user?.email)
      
      if (!user?.email) {
        console.log('No user email available, skipping wallet data fetch')
        setIsLoading(false)
        return
      }
      
      if (force) {
        setIsLoading(true)
      }
      
      // Fetch wallet balance and transactions
      const response = await fetch(`/api/wallet/balance?email=${encodeURIComponent(user.email)}`)
      console.log('Wallet balance API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Wallet balance API data:', data)
        
        if (data.success) {
          console.log('Updating wallet balance:', data.data.balance)
          console.log('Updating transactions:', data.data.transactions?.length || 0)
          console.log('Transaction details:', data.data.transactions)
          
          setWalletBalance(data.data.balance)
          
          // Ensure transactions is an array and handle it properly
          const transactionArray = Array.isArray(data.data.transactions) ? data.data.transactions : []
          setTransactions(transactionArray)
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch wallet data:', response.status, errorData)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setIsLoading(false)
    }
  }

  const clearWallet = async () => {
    if (!user?.email) return

    setIsClearing(true)
    try {
      const response = await fetch('/api/wallet/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()
      if (data.success) {
        console.log('Wallet cleared successfully')
        setWalletBalance(0)
        setTransactions([])
        setPaymentStatus('idle')
        setPaymentMessage('')
        setHasVerifiedPayment(false)
      } else {
        console.error('Failed to clear wallet:', data.error)
      }
    } catch (error) {
      console.error('Error clearing wallet:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const reference = urlParams.get('reference')
    const trxref = urlParams.get('trxref')
    
    if (reference || trxref) {
      verifyPayment(reference || trxref)
    }
  }

  const verifyPayment = async (reference: string) => {
    if (!reference || paymentStatus === 'verifying') {
      console.log('Skipping verification - already in progress or no reference')
      return
    }

    console.log('Starting payment verification for reference:', reference)
    setPaymentStatus('verifying')
    setPaymentMessage('Verifying your payment...')

    try {
      console.log('Calling payment verification API...')
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      })

      console.log('Payment verification response:', response.status)
      const data = await response.json()
      console.log('Payment verification data:', data)

      if (data.success && data.data.status === 'success') {
        console.log('Payment verification successful!')
        setPaymentStatus('success')
        setPaymentMessage(`Payment successful! Added ₵${data.data.amount} to your wallet.`)
        
        // Update state immediately with the response data
        console.log('Updating state with payment response data:', data.data)
        setWalletBalance(data.data.newBalance || 0)
        
        // Also refresh from database to get the latest transactions with retry logic
        console.log('Refreshing wallet data after successful payment...')
        
        // Capture user email from payment response or user context
        const userEmail = data.data.userEmail || user?.email
        if (!userEmail) {
          console.error('No user email available for transaction retry')
          return
        }
        
        const retryFetchTransactions = async (retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            console.log(`Transaction fetch attempt ${i + 1}/${retries}`)
            await new Promise(resolve => setTimeout(resolve, delay))
            await fetchUserData(true)
            
            // Check if we got transactions using captured email
            const response = await fetch(`/api/wallet/balance?email=${encodeURIComponent(userEmail)}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data.transactions && data.data.transactions.length > 0) {
                console.log(`Transactions found on attempt ${i + 1}`)
                setTransactions(data.data.transactions)
                return
              }
            }
            
            // If no transactions found, wait longer for next attempt
            delay *= 1.5
          }
          console.log('All retry attempts completed')
        }
        
        retryFetchTransactions()
        
        // Clear URL parameters immediately
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setPaymentStatus('idle')
          setPaymentMessage('')
        }, 5000)
      } else {
        console.log('Payment verification failed:', data.error)
        setPaymentStatus('failed')
        setPaymentMessage(data.error || 'Payment verification failed')
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      setPaymentStatus('failed')
      setPaymentMessage('Payment verification failed. Please try again.')
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentAmount || parseFloat(paymentAmount) < 1) {
      alert('Please enter a valid amount (minimum 1 GHS)')
      return
    }

    console.log('Starting payment process for amount:', paymentAmount)
    setIsProcessingPayment(true)

    try {
      // Generate a unique reference
      const reference = `TB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('Generated payment reference:', reference)

      // Initialize payment
      console.log('Calling payment initialization API...')
      const initResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          email: user?.email,
          reference,
          currency: 'GHS',
          metadata: {
            source: 'dashboard_wallet',
            userId: user?._id
          }
        }),
      })

      console.log('Payment initialization response:', initResponse.status)
      const initData = await initResponse.json()
      console.log('Payment initialization data:', initData)

      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initialize payment')
      }

      console.log('Redirecting to Paystack URL:', initData.data.authorization_url)
      // Close modal and redirect to Paystack payment page
      setShowPaymentModal(false)
      setPaymentAmount('')
      window.location.href = initData.data.authorization_url

    } catch (error) {
      console.error('Payment error:', error)
      alert(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 -mt-20 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 -mt-20 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600">
                  Manage your account, track your balance, and view your transactions
                </p>
              </div>
              <button
                onClick={clearWallet}
                disabled={isClearing}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? 'Clearing...' : 'Clear All Data'}
              </button>
            </div>
          </div>

          {/* Payment Status Notification */}
          {paymentStatus !== 'idle' && (
            <div className={`mb-6 p-4 rounded-xl border-l-4 ${
              paymentStatus === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : paymentStatus === 'failed'
                ? 'bg-red-50 border-red-400 text-red-800'
                : 'bg-blue-50 border-blue-400 text-blue-800'
            }`}>
              <div className="flex items-center">
                {paymentStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                ) : paymentStatus === 'failed' ? (
                  <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                ) : (
                  <Loader2 className="h-5 w-5 mr-3 flex-shrink-0 animate-spin" />
                )}
                <div>
                  <p className="font-semibold">
                    {paymentStatus === 'success' ? 'Payment Successful!' : 
                     paymentStatus === 'failed' ? 'Payment Failed' : 
                     'Verifying Payment...'}
                  </p>
                  <p className="text-sm">{paymentMessage}</p>
                </div>
                {paymentStatus !== 'verifying' && (
                  <button
                    onClick={() => {
                      setPaymentStatus('idle')
                      setPaymentMessage('')
                    }}
                    className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Wallet Balance */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                    title="Add Funds"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-medium text-emerald-100 mb-1">Wallet Balance</h3>
              <p className="text-3xl font-bold text-white">{formatCurrency(walletBalance)}</p>
              <p className="text-xs text-emerald-100 mt-1">Available funds</p>
            </div>

            {/* Total Transactions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 w-fit mb-4">
                <History className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Transactions</h3>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            {/* Credits */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Credits</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            {/* Debits */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-3 w-fit mb-4">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Debits</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Account Management */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Account Management</h2>
                    
                    <div className="space-y-4">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Account Settings
                      </button>
                      
                      
                      <button className="w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-300 transition-colors flex items-center justify-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Exchange Currency
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Info</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">{user?.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium text-gray-900">{user?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                            {user?.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ads Section */}
                  <div className="mt-6">
                    <AdDisplay position="sidebar" type="sidebar" />
                  </div>
                </div>

            {/* Transaction History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Search className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Filter className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {transactions
                    .filter((transaction, index, self) => 
                      index === self.findIndex(t => t.reference === transaction.reference)
                    )
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((transaction) => (
                    <div key={transaction.reference} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    View All Transactions
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add Funds</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      min="1"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                      placeholder="Enter amount to add"
                      disabled={isProcessingPayment}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Minimum amount: ₵1.00
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-400 transition-colors"
                      disabled={isProcessingPayment}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment || !paymentAmount}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Pay Now
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Supported Payment Methods</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-2 mb-1">
                        <CreditCard className="h-4 w-4 text-blue-600 mx-auto" />
                      </div>
                      <p className="text-xs text-gray-600">Cards</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 rounded-lg p-2 mb-1">
                        <Wallet className="h-4 w-4 text-green-600 mx-auto" />
                      </div>
                      <p className="text-xs text-gray-600">Mobile Money</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-lg p-2 mb-1">
                        <CreditCard className="h-4 w-4 text-purple-600 mx-auto" />
                      </div>
                      <p className="text-xs text-gray-600">Bank Transfer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AuthGuard>
    )
  }
