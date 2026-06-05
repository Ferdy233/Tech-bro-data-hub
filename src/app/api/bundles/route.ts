import { NextResponse } from 'next/server'
import { readBundles } from '@/lib/bundles'

export async function GET() {
  const bundles = await readBundles()
  return NextResponse.json({ bundles })
}
