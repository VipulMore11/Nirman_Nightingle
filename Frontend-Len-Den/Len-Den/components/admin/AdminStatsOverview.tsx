'use client'

import { TrendingUp, Users, FileCheck, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

interface AdminStats {
  totalAssets: number
  totalUsers: number
  pendingVerifications: number
  activeListings: number
  platformValue: number
  monthlyVolume: number
}

const mockStats: AdminStats = {
  totalAssets: 42,
  totalUsers: 1250,
  pendingVerifications: 8,
  activeListings: 156,
  platformValue: 2850000000,
  monthlyVolume: 125000000,
}

export default function AdminStatsOverview() {
  const statCards = [
    {
      icon: FileCheck,
      label: 'Total Assets',
      value: mockStats.totalAssets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: mockStats.totalUsers,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: AlertCircle,
      label: 'Pending Review',
      value: mockStats.pendingVerifications,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Active Listings',
      value: mockStats.activeListings,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Platform Overview</h2>
        <p className="text-muted-foreground mt-1">Real-time metrics and system health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className={`${card.bgColor} border border-border rounded-lg p-6`}>
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-foreground">{card.value.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Total Platform Value</h3>
          <p className="text-4xl font-bold text-accent mb-2">{formatCurrency(mockStats.platformValue)}</p>
          <p className="text-sm text-muted-foreground">+12.5% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trading Volume</h3>
          <p className="text-4xl font-bold text-accent mb-2">{formatCurrency(mockStats.monthlyVolume)}</p>
          <p className="text-sm text-muted-foreground">+8.3% from last month</p>
        </div>
      </div>
    </div>
  )
}
