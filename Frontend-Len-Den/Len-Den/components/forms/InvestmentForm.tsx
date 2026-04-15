'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

interface InvestmentFormProps {
  minInvestment: number
  maxInvestment: number
  price: number
  onSubmit?: (amount: number, shares: number) => void
}

export function InvestmentForm({ minInvestment, maxInvestment, price, onSubmit }: InvestmentFormProps) {
  const [shares, setShares] = useState(1)
  const investmentAmount = shares * price

  const canIncrease = investmentAmount + price <= maxInvestment
  const canDecrease = shares > 1

  const handleIncrease = () => {
    if (canIncrease) setShares(s => s + 1)
  }

  const handleDecrease = () => {
    if (canDecrease) setShares(s => s - 1)
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(investmentAmount, shares)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Number of Shares</label>
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
          <button
            onClick={handleDecrease}
            disabled={!canDecrease}
            className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 text-center bg-transparent font-semibold text-lg border-0 outline-none"
          />
          <button
            onClick={handleIncrease}
            disabled={!canIncrease}
            className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Price per Share</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(price)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Investment</p>
          <p className="text-lg font-semibold text-accent">{formatCurrency(investmentAmount)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Minimum: {formatCurrency(minInvestment)} • Maximum: {formatCurrency(maxInvestment)}
        </p>
        {investmentAmount < minInvestment && (
          <p className="text-xs text-destructive">Minimum investment not met</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={investmentAmount < minInvestment || investmentAmount > maxInvestment}
        className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Proceed to Payment
      </button>
    </div>
  )
}
