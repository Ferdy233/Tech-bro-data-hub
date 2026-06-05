import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const bundlesPath = path.join(process.cwd(), 'data', 'bundles.json')

async function readBundles() {
  try {
    const raw = await fs.readFile(bundlesPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeBundles(data: Record<string, number>) {
  await fs.writeFile(bundlesPath, JSON.stringify(data, null, 2), 'utf-8')
}

function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  return cookie.split(';').some((c) => c.trim().startsWith('admin-auth=1'))
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const bundles = await readBundles()
  return NextResponse.json({ bundles })
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const existing = await readBundles()
  const updated = { ...existing }

  for (const [key, value] of Object.entries(body)) {
    const num = Number(value)
    if (!Number.isNaN(num)) updated[key] = num
  }

  await writeBundles(updated)

  return NextResponse.json({ success: true, bundles: updated })
}
