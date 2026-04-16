'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingDown, IndianRupee, Zap } from 'lucide-react'

interface SellOrderFormProps {
  assetId: string
  assetName: string
  currentPrice: number
  ownedQuantity: number
  onSuccess?: () => void
}

export function SellOrderForm({
  assetId,
  assetName,
  currentPrice,
  ownedQuantity,
  onSuccess
}: SellOrderFormProps) {
  const [quantity, setQuantity] = useState<number>(Math.min(1, ownedQuantity))
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const totalProceeds = orderType === 'market' ? quantity * currentPrice : quantity * limitPrice
  const estimatedFee = totalProceeds * 0.01
  const netProceeds = totalProceeds - estimatedFee

  const handleSubmit = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowConfirmation(true)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Sell {assetName}</h3>

        <div className="space-y-4">
          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Order Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('market')}
                className={`py-2 px-4 rounded-lg border-2 transition font-medium ${
                  orderType === 'market'
                    ? 'border-destructive bg-destructive text-white'
                    : 'border-border bg-white text-foreground hover:border-destructive'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Market Order
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`py-2 px-4 rounded-lg border-2 transition font-medium ${
                  orderType === 'limit'
                    ? 'border-destructive bg-destructive text-white'
                    : 'border-border bg-white text-foreground hover:border-destructive'
                }`}
              >
                <TrendingDown className="w-4 h-4 inline mr-2" />
                Limit Order
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Quantity to Sell</label>
            <input
              type="number"
              min="0.01"
              max={ownedQuantity}
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(Math.min(ownedQuantity, parseFloat(e.target.value) || 0))}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent bg-input"
              placeholder="Enter quantity"
            />
            <p className="text-xs text-muted-foreground mt-2">Available: {ownedQuantity.toFixed(2)} shares</p>
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
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent bg-input disabled:opacity-50"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Proceeds</span>
              <span className="font-medium text-foreground">₹{totalProceeds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trading Fee (1%)</span>
               <span className="font-medium text-destructive">-₹{estimatedFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Net Proceeds</span>
              <span className="font-bold text-green-600 text-lg">₹{netProceeds.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={quantity <= 0 || loading}
            className="w-full py-3 px-4 bg-destructive text-white rounded-lg font-semibold hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Place Sell Order
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
                <TrendingDown className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Sale Executed Successfully</h3>
              <p className="text-muted-foreground mb-6">
                You've sold {quantity.toFixed(2)} shares of {assetName}
              </p>
              <div className="bg-secondary rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{quantity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                   <span className="font-medium">₹{(orderType === 'market' ? currentPrice : limitPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span>Net Proceeds:</span>
                    <span className="text-green-600">₹{netProceeds.toFixed(2)}</span>
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
