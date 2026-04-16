'use client'

import { Header, Sidebar, TransactionItem } from '@/components/common'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { currentUser } from '@/lib/data/mockUsers'
import { mockTransactions } from '@/lib/data/mockTransactions'
import { mockAssets } from '@/lib/data/mockAssets'
import { formatCurrency } from '@/lib/utils/formatters'
import { ArrowUpRight, ArrowDownLeft, IndianRupee, CheckCircle, Search, Filter } from 'lucide-react'
import { useState } from 'react'

export default function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'dividend'>('all')

  const userTransactions = mockTransactions
    .filter((t) => t.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = filter === 'all' ? userTransactions : userTransactions.filter(t => t.type === filter)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">Monitor and manage your investment activities</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex bg-muted rounded-lg p-1">
                   {(['all', 'buy', 'sell', 'dividend'] as const).map((type) => (
                     <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                          filter === type ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                     >
                       {type}
                     </button>
                   ))}
                 </div>
              </div>
            </div>

            {/* Transaction Stats Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Volume', value: userTransactions.reduce((acc, t) => acc + t.totalAmount, 0), icon: ArrowUpRight, color: 'blue' },
                { label: 'Dividends Received', value: userTransactions.filter(t => t.type === 'dividend').reduce((acc, t) => acc + t.totalAmount, 0), icon: IndianRupee, color: 'green' },
                { label: 'Total Bought', value: userTransactions.filter(t => t.type === 'buy').reduce((acc, t) => acc + t.totalAmount, 0), icon: ArrowDownLeft, color: 'accent' },
                { label: 'Success Rate', value: '100%', icon: CheckCircle, color: 'green', isPercent: true },
              ].map((stat, i) => (
                <Card key={i} className="p-5 border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color === 'accent' ? 'text-accent' : stat.color === 'green' ? 'text-green-500' : 'text-blue-500'}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.isPercent ? stat.value : formatCurrency(stat.value as number)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* List Header */}
            <div className="flex items-center gap-4">
               <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by asset name..." className="pl-10 h-11 bg-card border-border" />
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" className="gap-2 h-11 border-border"><Filter className="w-4 h-4" /> Filters</Button>
               </div>
            </div>

            <div className="space-y-4">
              <Card className="border-border bg-card shadow-lg p-2 overflow-hidden">
                <div className="hidden lg:grid grid-cols-12 px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border bg-muted/30">
                  <div className="col-span-5">Activity / Asset</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Units</div>
                  <div className="col-span-3 text-right">Amount / Date</div>
                </div>
                <div className="divide-y divide-border">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction, idx) => {
                      const asset = mockAssets.find(a => a.id === transaction.assetId)
                        return (
                          <TransactionItem
                            key={idx}
                            type={transaction.type as any}
                            assetName={asset?.name || 'Unknown'}
                            amount={transaction.totalAmount}
                            shares={transaction.units}
                            date={new Date(transaction.date).toLocaleDateString()}
                            status={transaction.status as any}
                          />
                        )
                    })
                  ) : (
                    <div className="p-16 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                         <Search className="w-8 h-8 text-muted-foreground opacity-20" />
                      </div>
                      <p className="text-muted-foreground font-medium">No transactions found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters or search terms</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
