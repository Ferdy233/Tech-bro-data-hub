import { getDb } from '@/lib/mongodb'

export interface PendingOrder {
  id: string
  networkReference: string
  orderReference: string
  recipientPhone: string
  capacityInGb: number
  paystackReference: string
  requiredBalance: number
  currentBalance: number
  createdAt: string
  customerEmail?: string
}

const COLLECTION = 'pending_orders'

export async function getPendingOrders(): Promise<PendingOrder[]> {
  const db = await getDb()
  return db
    .collection<PendingOrder>(COLLECTION)
    .find()
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getPendingOrderById(id: string): Promise<PendingOrder | null> {
  const db = await getDb()
  return db.collection<PendingOrder>(COLLECTION).findOne({ id })
}

export async function addPendingOrder(
  order: Omit<PendingOrder, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<PendingOrder> {
  const db = await getDb()
  const doc: PendingOrder = {
    id: order.id ?? `pending-${Date.now()}`,
    createdAt: order.createdAt ?? new Date().toISOString(),
    networkReference: order.networkReference,
    orderReference: order.orderReference,
    recipientPhone: order.recipientPhone,
    capacityInGb: order.capacityInGb,
    paystackReference: order.paystackReference,
    requiredBalance: order.requiredBalance,
    currentBalance: order.currentBalance,
    customerEmail: order.customerEmail,
  }

  await db.collection<PendingOrder>(COLLECTION).insertOne(doc)
  return doc
}

export async function removePendingOrder(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<PendingOrder>(COLLECTION).deleteOne({ id })
  return result.deletedCount === 1
}
