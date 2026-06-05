import { NextResponse } from 'next/server'

async function fetchGigstoreBalance() {
  // Use GHINSTANTGIGS credentials to fetch wallet balance
  const baseUrl = process.env.GHINSTANTGIGS_BASE_URL
  const apiKey = process.env.GHINSTANTGIGS_API_KEY
  if (!baseUrl) return { ok: false, error: 'GHINSTANTGIGS_BASE_URL not configured' }
  if (!apiKey) return { ok: false, error: 'GHINSTANTGIGS_API_KEY not configured' }

  const url = `${baseUrl.replace(/\/$/, '')}/v1/checkWalletBalance`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, error: `API returned ${res.status} - ${text}` }
    }
    const payload = await res.json()
    // Expected payload: { status: 'success', message: '...', data: { walletBalance: '2.10' } }
    const balance = payload?.data?.walletBalance ?? null
    return { ok: true, balance, raw: payload }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

async function fetchPaystackBalance() {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return { ok: false, error: 'PAYSTACK_SECRET_KEY not configured' }
  try {
    const res = await fetch('https://api.paystack.co/balance', {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) return { ok: false, error: `Paystack returned ${res.status}` }
    const data = await res.json()
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  if (!cookie.split(';').some((c) => c.trim().startsWith('admin-auth=1'))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [gig, paystack] = await Promise.all([fetchGigstoreBalance(), fetchPaystackBalance()])

  return NextResponse.json({ gigstore: gig, paystack })
}
