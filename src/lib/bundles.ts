import fs from 'fs/promises'
import path from 'path'

const bundlesPath = path.join(process.cwd(), 'data', 'bundles.json')

export async function readBundles(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(bundlesPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function getBundlePrice(bundleId: string): Promise<number | null> {
  const bundles = await readBundles()
  const price = bundles[bundleId]
  return typeof price === 'number' ? price : null
}
