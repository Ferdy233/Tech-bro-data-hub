import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const BUNDLES_FILE = join(root, 'data', 'bundles.json')
const PENDING_ORDERS_FILE = join(root, 'data', 'pending-orders.json')
const SETTINGS_ID = 'bundles'

function resolveMongoUri(uri) {
  if (!uri.startsWith('mongodb+srv://')) return uri

  const withoutProtocol = uri.slice('mongodb+srv://'.length)
  const at = withoutProtocol.indexOf('@')
  if (at === -1) return uri

  const credentials = withoutProtocol.slice(0, at)
  const rest = withoutProtocol.slice(at + 1)
  const slash = rest.indexOf('/')
  const host = slash === -1 ? rest : rest.slice(0, slash)
  const path = slash === -1 ? '' : rest.slice(slash)

  const parts = host.split('.')
  if (parts.length < 3) return uri

  const clusterName = parts[0]
  const suffix = parts.slice(1).join('.')
  const hosts = [0, 1, 2]
    .map((i) => `${clusterName}-shard-00-0${i}.${suffix}:27017`)
    .join(',')

  const dbPath = path || '/'
  const joiner = dbPath.includes('?') ? '&' : '?'
  return `mongodb://${credentials}@${hosts}${dbPath}${joiner}ssl=true&authSource=admin`
}

function loadEnvFile(filename) {
  const envPath = join(root, filename)
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function readJsonFile(path) {
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

async function migrateBundles(db) {
  const fileBundles = readJsonFile(BUNDLES_FILE)
  if (!fileBundles || typeof fileBundles !== 'object') {
    console.log('No data/bundles.json found — skipping bundle import.')
    return { imported: 0, total: 0 }
  }

  const collection = db.collection('settings')
  const existing = await collection.findOne({ _id: SETTINGS_ID })
  const merged = { ...(existing?.prices ?? {}), ...fileBundles }

  await collection.updateOne(
    { _id: SETTINGS_ID },
    { $set: { prices: merged } },
    { upsert: true },
  )

  console.log(`Bundles: merged ${Object.keys(fileBundles).length} prices into MongoDB (${Object.keys(merged).length} total).`)
  return { imported: Object.keys(fileBundles).length, total: Object.keys(merged).length }
}

async function migratePendingOrders(db) {
  const fileOrders = readJsonFile(PENDING_ORDERS_FILE)
  if (!Array.isArray(fileOrders) || fileOrders.length === 0) {
    console.log('No data/pending-orders.json found — skipping pending order import.')
    return { imported: 0, skipped: 0 }
  }

  const collection = db.collection('pending_orders')
  await collection.createIndex({ id: 1 }, { unique: true })

  let imported = 0
  let skipped = 0

  for (const order of fileOrders) {
    if (!order?.id) {
      skipped++
      continue
    }

    const result = await collection.updateOne(
      { id: order.id },
      { $setOnInsert: order },
      { upsert: true },
    )

    if (result.upsertedCount === 1) {
      imported++
    } else {
      skipped++
    }
  }

  console.log(`Pending orders: imported ${imported}, skipped ${skipped} (already in DB or invalid).`)
  return { imported, skipped }
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to .env.local and try again.')
    process.exit(1)
  }

  const client = new MongoClient(resolveMongoUri(uri))

  try {
    await client.connect()
    const db = client.db()

    console.log(`Connected to MongoDB database: ${db.databaseName}`)
    console.log('Starting one-time JSON → MongoDB migration...\n')

    await migrateBundles(db)
    await migratePendingOrders(db)

    console.log('\nMigration complete.')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
