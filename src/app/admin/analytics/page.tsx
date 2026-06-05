'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BalanceCheckResult {
  balance: number
  isLow: boolean
  threshold: number
  alertSent: boolean
}

export default function AdminAnalyticsPage() {
  const [balances, setBalances] = useState<any | null>(null)
  const [balanceCheckResult, setBalanceCheckResult] = useState<BalanceCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/admin/balance')
      .then((r) => r.json())
      .then((data) => setBalances(data))
      .catch(() => setBalances(null))
  }, [])

  const handleCheckBalance = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/admin/check-balance')
      const data = await response.json()
      setBalanceCheckResult(data)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Balance check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const currentBalance = balances?.gigstore?.ok ? parseFloat(balances.gigstore.balance || '0') : 0
  const isLow = balanceCheckResult?.isLow ?? false

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Analytics</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Performance overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Track growth, revenue, and engagement metrics for your data sales in one place.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`rounded-[1.75rem] border bg-slate-950 p-6 ${isLow ? 'border-red-800' : 'border-slate-800'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Agent Wallet</p>
              <p className="mt-4 text-3xl font-semibold text-white">
                {balances?.gigstore?.ok ? formatCurrency(currentBalance) : '—'}
              </p>
              <p className="mt-3 text-sm text-slate-400">Current balance from GhInstantGigs.</p>
            </div>
            {isLow && <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-500" />}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Paystack Balance</p>
          <p className="mt-4 text-3xl font-semibold text-white">
            {balances?.paystack?.ok && balances.paystack.data?.data?.[0]?.balance !== undefined
              ? formatCurrency(balances.paystack.data.data[0].balance)
              : '—'}
          </p>
          <p className="mt-3 text-sm text-slate-400">Available funds in Paystack account.</p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Status</p>
          <p className={`mt-4 text-3xl font-semibold ${isLow ? 'text-red-400' : 'text-white'}`}>
            {isLow ? 'Alert' : 'Active'}
          </p>
          <p className="mt-3 text-sm text-slate-400">
            {isLow ? 'Low balance detected. Top up your wallet.' : 'All systems operating normally.'}
          </p>
        </div>
      </div>

      {balanceCheckResult && (
        <div className={`rounded-[1.75rem] border p-6 ${balanceCheckResult.isLow ? 'border-red-800 bg-red-950' : 'border-emerald-800 bg-emerald-950'}`}>
          <div className="flex items-start gap-4">
            {balanceCheckResult.isLow ? (
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
            ) : (
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-500" />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${balanceCheckResult.isLow ? 'text-red-200' : 'text-emerald-200'}`}>
                {balanceCheckResult.isLow ? 'Low Balance Alert' : 'Balance Healthy'}
              </h3>
              <p className={`mt-2 text-sm ${balanceCheckResult.isLow ? 'text-red-300' : 'text-emerald-300'}`}>
                {balanceCheckResult.isLow
                  ? `Your API wallet is below ₵${balanceCheckResult.threshold}. Top up from your Paystack balance to continue serving customers. ${balanceCheckResult.alertSent ? 'Alert email sent.' : ''}`
                  : `Your API wallet balance is sufficient (₵${balanceCheckResult.balance.toFixed(2)}). Threshold: ₵${balanceCheckResult.threshold}.`}
              </p>
              {lastChecked && (
                <p className={`mt-2 text-xs ${balanceCheckResult.isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Wallet Check</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Manual balance verification</h2>
            <p className="mt-2 text-sm text-slate-400">
              Check your API wallet balance and trigger alerts if low. This helps prevent failed customer orders.
            </p>
          </div>
          <button
            onClick={handleCheckBalance}
            disabled={isChecking}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Balance'}
          </button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">How it works</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Alert System</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-400">
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
            <span><strong className="text-white">Automatic Checks:</strong> When a customer attempts to purchase, your balance is checked automatically.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400 flex-shrink-0" />
            <span><strong className="text-white">Manual Verification:</strong> Use the "Check Balance" button above to manually verify your wallet at any time.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-lime-400 flex-shrink-0" />
            <span><strong className="text-white">Email Alerts:</strong> If balance is low or insufficient for an order, an email is sent to your admin address.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-rose-400 flex-shrink-0" />
            <span><strong className="text-white">Quick Action:</strong> Top up from Paystack, then process the pending customer order manually if needed.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
