'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Record<string, number> | null>(null)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/bundles')
      .then((r) => r.json())
      .then((data) => {
        setBundles(data?.bundles || null)
      })
      .catch(() => setBundles(null))
  }, [])

  if (!bundles) {
    return <div className="p-6">Loading bundle prices...</div>
  }

  const handleChange = (id: string, value: string) => {
    setEditing((s) => ({ ...s, [id]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    const payload: Record<string, number> = {}
    for (const [k, v] of Object.entries(editing)) {
      const n = Number(v)
      if (!Number.isNaN(n)) payload[k] = n
    }
    if (Object.keys(payload).length === 0) {
      setMessage('No valid changes to save')
      setLoading(false)
      return
    }

    const res = await fetch('/api/admin/bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      setBundles(data.bundles)
      setEditing({})
      setMessage('Saved successfully')
    } else {
      setMessage('Failed to save')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Bundles</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Manage bundle prices</h1>
        <p className="mt-2 text-sm text-slate-400">Edit prices and save to update what customers see.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(bundles).map(([id, price]) => (
            <div key={id} className="flex items-center gap-3 justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div>
                <p className="text-sm font-medium text-white">{id}</p>
                <p className="text-xs text-slate-400">{formatCurrency(price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="w-28 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white border border-slate-700"
                  value={editing[id] ?? ''}
                  onChange={(e) => handleChange(id, e.target.value)}
                  placeholder={String(price)}
                />
                <span className="text-slate-400 text-xs">GHS</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          {message && <p className="text-sm text-slate-300">{message}</p>}
        </div>
      </div>
    </div>
  )
}
