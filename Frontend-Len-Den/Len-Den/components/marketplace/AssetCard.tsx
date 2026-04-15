'use client'

import Link from 'next/link'
import { ArrowUpRight, TrendingUp, ShoppingCart, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters'

export interface AssetCardProps {
  id: string
  name: string
  category: string
  price: number
  priceChange: number
  minInvestment: number
  totalValue: number
  shares: number
  roi: number
  image?: string
}

export function AssetCard({ id, name, category, price, priceChange, minInvestment, totalValue, roi, image }: AssetCardProps) {
  const isPositive = priceChange >= 0

  return (
    <Link href={`/marketplace/listings/${id}`}>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-accent/50 transition-all hover:shadow-lg cursor-pointer h-full flex flex-col">
        {/* Image Section */}
        {image ? (
          <div className="w-full h-32 bg-secondary overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-accent/30" />
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
              <h3 className="text-sm font-semibold text-foreground mt-1">{name}</h3>
            </div>
          </div>

          {/* Price and Change */}
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-lg font-bold text-foreground">{formatCurrency(price)}</span>
              <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                <ArrowUpRight className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} />
                {formatPercentage(Math.abs(priceChange))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total Value: {formatCurrency(totalValue)}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ROI</p>
              <p className={`text-sm font-semibold ${roi >= 0 ? 'text-accent' : 'text-destructive'}`}>{formatPercentage(roi)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Min Investment</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(minInvestment)}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/trading`}>
              <button className="w-full bg-accent text-accent-foreground py-2 rounded font-medium text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Buy
              </button>
            </Link>
            <Link href={`/trading`}>
              <button className="w-full bg-destructive text-white py-2 rounded font-medium text-sm hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Sell
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  )
}
