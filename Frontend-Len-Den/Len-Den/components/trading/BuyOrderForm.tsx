'use client'

import { useState } from 'react'
import { ArrowRight, TrendingUp, IndianRupee, Zap } from 'lucide-react'

interface BuyOrderFormProps {
  assetId: string
  assetName: string
  currentPrice: number
  availableBalance: number
  onSuccess?: () => void
}

export function BuyOrderForm({
  assetId,
  assetName,
  currentPrice,
  availableBalance,
  onSuccess
}: BuyOrderFormProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const totalCost = orderType === 'market' ? quantity * currentPrice : quantity * limitPrice
  const isAffordable = totalCost <= availableBalance
  const estimatedFee = totalCost * 0.01

  const handleSubmit = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowConfirmation(true)
    }, 1000)
  }

  const maxQuantity = Math.floor(availableBalance / currentPrice)

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Buy {assetName}</h3>

        <div className="space-y-4">
          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Order Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('market')}
                className={`py-2 px-4 rounded-lg border-2 transition font-medium ${
                  orderType === 'market'
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-white text-foreground hover:border-accent'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Market Order
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`py-2 px-4 rounded-lg border-2 transition font-medium ${
                  orderType === 'limit'
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-white text-foreground hover:border-accent'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Limit Order
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-input"
              placeholder="Enter quantity"
            />
            <p className="text-xs text-muted-foreground mt-2">Max: {maxQuantity.toFixed(2)} shares</p>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {orderType === 'market' ? 'Current Price' : 'Limit Price'}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                value={orderType === 'market' ? currentPrice.toFixed(2) : limitPrice.toFixed(2)}
                onChange={(e) => orderType === 'limit' && setLimitPrice(parseFloat(e.target.value) || 0)}
                disabled={orderType === 'market'}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-input disabled:opacity-50"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">${(quantity * (orderType === 'market' ? currentPrice : limitPrice)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trading Fee (1%)</span>
              <span className="font-medium text-foreground">${estimatedFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total Cost</span>
              <span className="font-bold text-accent text-lg">${(totalCost + estimatedFee).toFixed(2)}</span>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`p-3 rounded-lg text-sm ${
            isAffordable ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {isAffordable ? (
              <span>Sufficient balance available</span>
            ) : (
              <span>Insufficient balance. Need ${(totalCost + estimatedFee - availableBalance).toFixed(2)} more</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isAffordable || loading}
            className="w-full py-3 px-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : (
              <>
                <ArrowRight className="w-4 h-4" />
                Place Buy Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Order Placed Successfully</h3>
              <p className="text-muted-foreground mb-6">
                You've purchased {quantity.toFixed(2)} shares of {assetName}
              </p>
              <div className="bg-secondary rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{quantity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">${(orderType === 'market' ? currentPrice : limitPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span>Total:</span>
                  <span className="text-accent">${(totalCost + estimatedFee).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  onSuccess?.()
                }}
                className="w-full py-3 px-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
