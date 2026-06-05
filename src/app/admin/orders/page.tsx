import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

export default function AdminOrdersPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Orders</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Order management</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            See the most recent order activity and review the status of every bundle sale.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Status</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Order system</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Order data will be fetched from your backend API. Configure your order tracking endpoint to display live orders, statuses, and customer details here.
          </p>
          <div className="mt-6 space-y-3">
            {['Connect order API', 'Set up webhooks', 'Configure statuses'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                <Package className="h-4 w-4 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Help</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Getting started</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span>Orders are managed through your backend order tracking system.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-sky-400 flex-shrink-0" />
              <span>Real-time order data will appear once your API is connected.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-lime-400 flex-shrink-0" />
              <span>Track payment status and delivery updates for each order.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
