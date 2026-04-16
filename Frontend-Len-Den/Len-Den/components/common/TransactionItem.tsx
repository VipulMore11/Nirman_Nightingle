'use client'

import { formatCurrency } from '@/lib/utils/formatters'
import { ArrowUpRight, ArrowDownLeft, IndianRupee } from 'lucide-react'

interface TransactionItemProps {
  type: 'buy' | 'sell' | 'dividend' | 'withdrawal'
  assetName: string
  amount: number
  shares?: number
  date: string
  status?: 'completed' | 'pending' | 'failed'
}

export function TransactionItem({ type, assetName, amount, shares, date, status = 'completed' }: TransactionItemProps) {
  const iconMap = {
    buy: ArrowDownLeft,
    sell: ArrowUpRight,
    dividend: IndianRupee,
    withdrawal: ArrowUpRight,
  }

  const bgColorMap = {
    buy: 'bg-accent/10 border-accent/20',
    sell: 'bg-emerald-500/10 border-emerald-500/20',
    dividend: 'bg-green-500/10 border-green-500/20',
    withdrawal: 'bg-yellow-500/10 border-yellow-500/20',
  }

  const textColorMap = {
    buy: 'text-accent',
    sell: 'text-emerald-500',
    dividend: 'text-green-500',
    withdrawal: 'text-yellow-600',
  }

  const labelMap = {
    buy: 'Bought Units',
    sell: 'Sold Units',
    dividend: 'Dividend Payout',
    withdrawal: 'Funds Withdrawal',
  }

  const Icon = iconMap[type]

  return (
    <div className="grid grid-cols-12 items-center px-6 py-5 hover:bg-muted/30 transition-colors group">
      {/* Activity - Col 5 */}
      <div className="col-span-12 lg:col-span-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${bgColorMap[type]}`}>
          <Icon className={`w-5 h-5 ${textColorMap[type]}`} />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{labelMap[type]}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <p className="text-xs text-muted-foreground font-medium">{assetName}</p>
          </div>
        </div>
      </div>

      {/* Status - Col 2 */}
      <div className="col-span-6 lg:col-span-2 flex justify-center mt-3 lg:mt-0">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
          status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
          'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {status}
        </span>
      </div>

      {/* Units - Col 2 */}
      <div className="col-span-6 lg:col-span-2 text-center mt-3 lg:mt-0">
         <p className="text-sm font-bold text-foreground">{shares ? `${shares.toLocaleString()} units` : '—'}</p>
      </div>

      {/* Amount/Date - Col 3 */}
      <div className="col-span-12 lg:col-span-3 text-right mt-3 lg:mt-0">
        <p className={`text-base font-black ${type === 'sell' || type === 'dividend' ? 'text-green-500' : 'text-foreground'}`}>
           {type === 'sell' || type === 'dividend' ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{date}</p>
      </div>
    </div>
  )
}
