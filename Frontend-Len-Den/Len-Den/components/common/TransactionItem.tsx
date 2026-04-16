'use client'

import { formatCurrency } from '@/lib/utils/formatters'
import { ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react'

interface TransactionItemProps {
  type: 'buy' | 'sell' | 'dividend' | 'withdrawal'
  assetName: string
  amount: number
  shares?: number
  date: string
  status?: 'completed' | 'pending'
}

export function TransactionItem({ type, assetName, amount, shares, date, status = 'completed' }: TransactionItemProps) {
  const iconMap = {
    buy: ArrowDownLeft,
    sell: ArrowUpRight,
    dividend: DollarSign,
    withdrawal: ArrowUpRight,
  }

  const colorMap = {
    buy: 'text-accent bg-accent/10',
    sell: 'text-accent bg-accent/10',
    dividend: 'text-green-500 bg-green-500/10',
    withdrawal: 'text-yellow-600 bg-yellow-500/10',
  }

  const labelMap = {
    buy: 'Bought',
    sell: 'Sold',
    dividend: 'Dividend',
    withdrawal: 'Withdrawal',
  }

  const Icon = iconMap[type]

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorMap[type]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{labelMap[type]}</p>
          <p className="text-xs text-muted-foreground">{assetName}</p>
          {shares && (
            <p className="text-xs text-muted-foreground">{shares} shares</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">{formatCurrency(amount)}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
        {status === 'pending' && (
          <p className="text-xs font-medium text-yellow-600 mt-1">Pending</p>
        )}
      </div>
    </div>
  )
}
