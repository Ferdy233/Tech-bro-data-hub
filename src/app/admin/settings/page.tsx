import Link from 'next/link'
import { ArrowLeft, Settings, ShieldCheck } from 'lucide-react'

const settingsCards = [
  {
    title: 'Store controls',
    description: 'Configure bundle availability and manage payment channels for seamless sales.',
    details: ['Bundle packages', 'Payment routing', 'Sales hours'],
  },
  {
    title: 'Security',
    description: 'Protect admin access and keep order processing secure for your team.',
    details: ['Admin access', 'Data backups', 'Fraud alerts'],
  },
  {
    title: 'Notifications',
    description: 'Set delivery alerts, order updates, and payment notifications for every sale.',
    details: ['SMS alerts', 'Email summaries', 'Support flags'],
  },
]

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Settings</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Admin configuration</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Manage the core settings that control how your dashboard works and how customers receive bundles.
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

      <div className="grid gap-6 lg:grid-cols-3">
        {settingsCards.map((card) => (
          <div key={card.title} className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-800 p-3 text-amber-300">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{card.description}</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {card.details.map((detail) => (
                <li key={detail} className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Control panel</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Owner review checklist</h2>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
            Recommended
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            'Confirm bundle pricing settings',
            'Verify notifications are enabled',
            'Review support contacts',
            'Audit payment and delivery logs',
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-4 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
