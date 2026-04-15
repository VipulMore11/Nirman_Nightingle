'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Download, Share2 } from 'lucide-react'
import { mockAssets } from '@/lib/data/mockAssets'
import { formatCurrency, formatPercent } from '@/lib/utils/formatters'

interface DividendRecord {
  date: string
  amount: number
  assetName: string
  sharesOwned: number
}

export default function DividendHistoryComponent() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  // Generate mock dividend history
  const dividendHistory: DividendRecord[] = [
    { date: '2024-12-15', amount: 2850, assetName: 'Manhattan Commercial Tower', sharesOwned: 150 },
    { date: '2024-12-10', amount: 1200, assetName: 'Premium Gold Ingots', sharesOwned: 300 },
    { date: '2024-12-05', amount: 450, assetName: 'Startup Equity Pool', sharesOwned: 500 },
    { date: '2024-11-28', amount: 3100, assetName: 'Manhattan Commercial Tower', sharesOwned: 150 },
    { date: '2024-11-20', amount: 950, assetName: 'Modern Art Collection', sharesOwned: 75 },
    { date: '2024-11-15', amount: 1400, assetName: 'Premium Gold Ingots', sharesOwned: 300 },
    { date: '2024-10-30', amount: 2900, assetName: 'Manhattan Commercial Tower', sharesOwned: 150 },
  ]

  const filteredHistory = selectedAsset
    ? dividendHistory.filter(d => d.assetName === selectedAsset)
    : dividendHistory

  const totalDividends = filteredHistory.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dividend History</h2>
          <p className="text-muted-foreground mt-1">Track all dividend payments received</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Dividends</p>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalDividends)}</p>
          <p className="text-xs text-accent mt-2">Last 30 days</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg. Payment</p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(Math.round(totalDividends / filteredHistory.length))}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{filteredHistory.length} transactions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Annualized Rate</p>
          <p className="text-3xl font-bold text-accent">4.8%</p>
          <p className="text-xs text-muted-foreground mt-2">On your portfolio</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground">Filter by Asset</label>
          <select
            value={selectedAsset || ''}
            onChange={e => setSelectedAsset(e.target.value || null)}
            className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Assets</option>
            {mockAssets.map(asset => (
              <option key={asset.id} value={asset.name}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No dividend payments found</p>
          ) : (
            filteredHistory.map((record, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{record.assetName}</p>
                  <p className="text-xs text-muted-foreground">{record.date} • {record.sharesOwned} shares</p>
                </div>
                <p className="text-sm font-bold text-accent">{formatCurrency(record.amount)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
