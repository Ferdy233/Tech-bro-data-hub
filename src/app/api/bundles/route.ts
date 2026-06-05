import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const bundlesPath = path.join(process.cwd(), 'data', 'bundles.json')

async function readBundles(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(bundlesPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function GET() {
  const bundles = await readBundles()
  return NextResponse.json({ bundles })
}
