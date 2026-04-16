'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters'

export interface PortfolioCardProps {
  assetId: string
  assetName: string
  category: string
  shares: number
  price: number
  value: number
  change: number
  dailyChange: number
}

export function PortfolioCard({ assetId, assetName, category, shares, price, value, change, dailyChange }: PortfolioCardProps) {
  const isPositive = change >= 0
  const isDailyPositive = dailyChange >= 0

  return (
    <Link href={`/marketplace/listings/${assetId}`}>
      <div className="group rounded-lg border border-border bg-card hover:border-accent/50 transition-all hover:shadow-md cursor-pointer p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">{category}</p>
            <h3 className="text-sm font-semibold text-foreground mt-1">{assetName}</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{formatCurrency(value)}</p>
            <div className={`flex items-center justify-end gap-1 text-xs font-medium mt-1 ${isPositive ? 'text-accent' : 'text-destructive'}`}>
              <ArrowUpRight className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} />
              {formatPercentage(Math.abs(change))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Shares</p>
            <p className="text-sm font-semibold text-foreground">{shares}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(price)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Today</p>
            <p className={`text-sm font-semibold ${isDailyPositive ? 'text-accent' : 'text-destructive'}`}>{formatPercentage(dailyChange)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
