import { MongoClient, type Db } from 'mongodb'
import { resolveMongoUri } from '@/lib/mongodb-uri'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const rawUri = process.env.MONGODB_URI
  if (!rawUri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  const uri = resolveMongoUri(rawUri)

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect()
    }
    return global._mongoClientPromise
  }

  return new MongoClient(uri).connect()
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db()
}
