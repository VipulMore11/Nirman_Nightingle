'use client'

import { Header, Sidebar, TransactionItem } from '@/components/common'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/context/AuthContext'
import { mockTransactions } from '@/lib/data/mockTransactions'
import { mockAssets } from '@/lib/data/mockAssets'
import { useState } from 'react'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'dividend'>('all')

  const userTransactions = mockTransactions
    .filter((t) => t.userId === `user-${user?.id}`)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = filter === 'all' ? userTransactions : userTransactions.filter(t => t.type === filter)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Transaction History</h1>

            {/* Filters */}
            <Card className="p-4 mb-6 border-border bg-card">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'buy', 'sell', 'dividend'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === type
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {type === 'all' ? 'All Transactions' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </Card>

            {/* Transactions List */}
            <Card className="border-border bg-card divide-y divide-border">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, idx) => {
                  const asset = mockAssets.find(a => a.id === transaction.assetId)
                  return (
                    <TransactionItem
                      key={idx}
                      type={transaction.type}
                      assetName={asset?.name || 'Unknown'}
                      amount={transaction.amount}
                      shares={transaction.quantity}
                      date={new Date(transaction.date).toLocaleDateString()}
                      status={transaction.status}
                    />
                  )
                })
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
