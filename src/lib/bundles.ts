import { getDb } from '@/lib/mongodb'

const DEFAULT_BUNDLES: Record<string, number> = {
  'mtn-1': 5,
  'mtn-2': 10,
  'mtn-3': 15,
  'mtn-4': 20,
  'mtn-5': 25,
  'mtn-6': 30,
  'mtn-7': 40,
  'mtn-8': 47,
  'mtn-9': 65,
  'mtn-10': 85,
  'mtn-11': 105,
  'mtn-12': 130,
  'mtn-13': 170,
  'mtn-14': 205,
  'tel-1': 45,
  'tel-2': 70,
  'tel-3': 85,
  'tel-4': 110,
  'tel-5': 130,
  'tel-6': 165,
  'tel-7': 200,
  'tel-8': 380,
  'ats-1': 4.9,
  'ats-2': 9.9,
  'ats-3': 14,
  'ats-4': 19,
  'ats-5': 24,
  'ats-6': 28,
  'ats-7': 32,
  'ats-8': 35,
  'ats-9': 44,
  'ats-10': 52,
  'ats-11': 64,
  'ats-12': 83,
  'ats-13': 108,
  'ats-14': 130,
}

const SETTINGS_ID = 'bundles'

interface BundleSettings {
  _id: string
  prices: Record<string, number>
}

export async function readBundles(): Promise<Record<string, number>> {
  const db = await getDb()
  const collection = db.collection<BundleSettings>('settings')
  const doc = await collection.findOne({ _id: SETTINGS_ID })

  if (doc?.prices && Object.keys(doc.prices).length > 0) {
    return doc.prices
  }

  await collection.updateOne(
    { _id: SETTINGS_ID },
    { $set: { prices: DEFAULT_BUNDLES } },
    { upsert: true },
  )

  return DEFAULT_BUNDLES
}

export async function writeBundles(data: Record<string, number>): Promise<void> {
  const db = await getDb()
  await db.collection<BundleSettings>('settings').updateOne(
    { _id: SETTINGS_ID },
    { $set: { prices: data } },
    { upsert: true },
  )
}

export async function getBundlePrice(bundleId: string): Promise<number | null> {
  const bundles = await readBundles()
  const price = bundles[bundleId]
  return typeof price === 'number' ? price : null
}
