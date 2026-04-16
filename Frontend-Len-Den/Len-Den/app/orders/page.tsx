'use client'

import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useState } from 'react'

const openOrders = [
  {
    id: '1',
    asset: 'Manhattan Office Tower',
    type: 'buy',
    quantity: 5.5,
    limitPrice: 2450,
    currentPrice: 2500,
    status: 'pending',
    createdAt: '2024-04-15T10:30:00Z',
    expiresAt: '2024-04-22T23:59:59Z'
  },
  {
    id: '2',
    asset: 'Dubai Real Estate Fund',
    type: 'sell',
    quantity: 10,
    limitPrice: 850,
    currentPrice: 820,
    status: 'pending',
    createdAt: '2024-04-14T14:20:00Z',
    expiresAt: '2024-04-21T23:59:59Z'
  },
  {
    id: '3',
    asset: 'Premium Gold Bullion',
    type: 'buy',
    quantity: 4.25,
    limitPrice: 2050,
    currentPrice: 2040,
    status: 'partially_filled',
    createdAt: '2024-04-13T09:15:00Z',
    filledQuantity: 1.25,
    expiresAt: '2024-04-20T23:59:59Z'
  }
]

const executedOrders = [
  {
    id: '4',
    asset: 'Silicon Valley Startup Fund',
    type: 'buy',
    quantity: 5,
    executionPrice: 1500,
    totalCost: 7500,
    fee: 75,
    executedAt: '2024-04-10T16:45:00Z',
    status: 'filled'
  },
  {
    id: '5',
    asset: 'London Real Estate',
    type: 'sell',
    quantity: 4.5,
    executionPrice: 3200,
    totalProceeds: 14400,
    fee: 144,
    executedAt: '2024-04-08T11:20:00Z',
    status: 'filled'
  },
  {
    id: '6',
    asset: 'Art Collection Investment',
    type: 'buy',
    quantity: 8,
    executionPrice: 1800,
    totalCost: 14400,
    fee: 144,
    executedAt: '2024-04-05T13:30:00Z',
    status: 'filled'
  }
]

export default function OpenOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [cancelledOrders, setCancelledOrders] = useState<Set<string>>(new Set())

  const handleCancelOrder = (orderId: string) => {
    setCancelledOrders(new Set([...cancelledOrders, orderId]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partially_filled': return 'bg-blue-100 text-blue-800'
      case 'filled': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
                <p className="text-muted-foreground mt-2">Track your pending and executed trades</p>
              </div>

              {/* Open Orders */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">Open Orders</h2>
                <div className="space-y-3">
                  {openOrders.filter(o => !cancelledOrders.has(o.id)).map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-lg p-4 hover:border-accent transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-foreground">{order.asset}</h3>
                            <Badge className={`${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                            {order.status === 'partially_filled' && (
                              <span className="text-sm text-muted-foreground">
                                {order.filledQuantity} / {order.quantity} filled
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className={`font-semibold ${order.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                {order.type.toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-semibold text-foreground">{order.quantity}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Limit Price</p>
                              <p className="font-semibold text-foreground">₹{order.limitPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Price</p>
                              <p className="font-semibold text-foreground">₹{order.currentPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Expires In</p>
                              <p className="font-semibold text-foreground">7 days</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="ml-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                          title="Cancel order"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {openOrders.every(o => cancelledOrders.has(o.id)) && (
                    <div className="bg-secondary rounded-lg p-8 text-center text-muted-foreground">
                      No open orders
                    </div>
                  )}
                </div>
              </div>

              {/* Executed Orders */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Executed Orders</h2>
                <div className="space-y-3">
                  {executedOrders.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-foreground">{order.asset}</h3>
                          <Badge className="bg-green-100 text-green-800">Executed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.executedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className={`font-semibold ${order.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                            {order.type.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-semibold text-foreground">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-semibold text-foreground">₹{order.executionPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fee</p>
                          <p className="font-semibold text-foreground">₹{order.fee.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">
                            {order.type === 'buy' ? 'Total Cost' : 'Net Proceeds'}
                          </p>
                          <p className={`text-lg font-bold ${
                            order.type === 'buy' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            ₹{((order.type === 'buy' ? order.totalCost : order.totalProceeds) ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
