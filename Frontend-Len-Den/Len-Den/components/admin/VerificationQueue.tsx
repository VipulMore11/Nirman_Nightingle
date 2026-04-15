'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ExternalLink } from 'lucide-react'
import { mockPendingListings } from '@/lib/data/mockPendingListings'
import { formatCurrency } from '@/lib/utils/formatters'

interface VerificationItem {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  assetName: string
  assetType: string
  submittedDate: string
  amount: number
  location: string
  documents: number
}

export default function VerificationQueueComponent() {
  const [showRejected, setShowRejected] = useState(false)

  const verificationQueue: VerificationItem[] = mockPendingListings.map((listing, idx) => ({
    id: listing.id,
    status: idx % 4 === 0 ? 'rejected' : idx % 3 === 0 ? 'approved' : 'pending',
    assetName: listing.assetName,
    assetType: listing.assetType,
    submittedDate: listing.submittedDate,
    amount: listing.totalValue,
    location: listing.location,
    documents: Math.floor(Math.random() * 8) + 3,
  }))

  const pending = verificationQueue.filter(v => v.status === 'pending')
  const approved = verificationQueue.filter(v => v.status === 'approved')
  const rejected = verificationQueue.filter(v => v.status === 'rejected')

  const statusConfig = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Pending Review' },
    approved: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Approved' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
  }

  const renderQueue = (items: VerificationItem[], title: string) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No {title.toLowerCase()}</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const config = statusConfig[item.status]
            return (
              <Link
                key={item.id}
                href={`/admin/verification/${item.id}`}
                className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{item.assetName}</h4>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-xs font-medium text-foreground">{item.assetType}</span>
                        <span>Type</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-foreground">{item.location}</span>
                        <span>Location</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-foreground">{formatCurrency(item.amount)}</span>
                        <span>Valuation</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-foreground">{item.documents} files</span>
                        <span>Documents</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Submitted: {item.submittedDate}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verification Queue</h2>
          <p className="text-muted-foreground mt-1">Review and approve asset listings</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-500/10 border border-yellow-200/50 rounded-lg p-4">
          <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pending.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-200/50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{approved.length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-200/50 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{rejected.length}</p>
        </div>
      </div>

      {renderQueue(pending, 'Pending Review')}
      {renderQueue(approved, 'Recently Approved')}

      {rejected.length > 0 && (
        <div>
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors mb-4"
          >
            {showRejected ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showRejected ? 'Hide' : 'Show'} Rejected ({rejected.length})</span>
          </button>
          {showRejected && renderQueue(rejected, 'Rejected Listings')}
        </div>
      )}
    </div>
  )
}
