'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (response.ok) {
      window.localStorage.setItem('admin-auth', '1')
      router.replace('/admin')
      return
    }

    const result = await response.json()
    setError(result?.message || 'Invalid email or password')
  }

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 px-8 py-10 shadow-2xl shadow-black/30">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-400 text-slate-950">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Admin sign in</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Secure dashboard access</h1>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
            placeholder="admin@techbro.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
            placeholder="Enter your password"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Only authorized admins may access this dashboard. If you do not have credentials, contact the site owner.
      </p>
    </div>
  )
}
