'use client'

import { useState } from 'react'
import { mockAssets } from '@/lib/data/mockAssets'
import { formatCurrency, formatPercent } from '@/lib/utils/formatters'

interface AuditLog {
  id: string
  action: string
  user: string
  asset: string
  timestamp: string
  details: string
}

export default function AuditLogComponent() {
  const [filterType, setFilterType] = useState<string>('all')

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      action: 'LISTING_APPROVED',
      user: 'admin@asset.com',
      asset: 'Manhattan Commercial Tower',
      timestamp: '2024-12-15 14:32',
      details: 'Asset approved for trading',
    },
    {
      id: '2',
      action: 'USER_VERIFIED',
      user: 'john.doe@email.com',
      asset: 'N/A',
      timestamp: '2024-12-15 13:15',
      details: 'KYC verification completed',
    },
    {
      id: '3',
      action: 'LISTING_SUBMITTED',
      user: 'jane.smith@email.com',
      asset: 'Modern Art Collection',
      timestamp: '2024-12-15 12:00',
      details: 'New asset listing submitted',
    },
    {
      id: '4',
      action: 'TRANSACTION_COMPLETED',
      user: 'mike.wilson@email.com',
      asset: 'Premium Gold Ingots',
      timestamp: '2024-12-15 11:45',
      details: '500 shares purchased for $125,000',
    },
    {
      id: '5',
      action: 'DIVIDEND_PAID',
      user: 'system',
      asset: 'Manhattan Commercial Tower',
      timestamp: '2024-12-15 10:00',
      details: 'Dividend distribution completed',
    },
    {
      id: '6',
      action: 'USER_FLAGGED',
      user: 'compliance@asset.com',
      asset: 'N/A',
      timestamp: '2024-12-14 16:30',
      details: 'Suspicious activity detected',
    },
  ]

  const actionColors: Record<string, { bg: string; text: string; label: string }> = {
    LISTING_APPROVED: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Approved' },
    USER_VERIFIED: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Verified' },
    LISTING_SUBMITTED: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Submitted' },
    TRANSACTION_COMPLETED: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Completed' },
    DIVIDEND_PAID: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Dividend' },
    USER_FLAGGED: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Flagged' },
  }

  const filtered =
    filterType === 'all' ? auditLogs : auditLogs.filter(log => log.action === filterType)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
        <p className="text-muted-foreground mt-1">Complete activity history and compliance records</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Filter by Action</label>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Actions</option>
          {Object.keys(actionColors).map(action => (
            <option key={action} value={action}>
              {actionColors[action].label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">User</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Asset</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const config = actionColors[log.action] || actionColors.LISTING_SUBMITTED
                return (
                  <tr key={log.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">{log.user}</td>
                    <td className="px-4 py-3 text-foreground">{log.asset}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.details}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
