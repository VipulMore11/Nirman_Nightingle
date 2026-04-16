'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { BuyOrderForm } from '@/components/trading/BuyOrderForm'
import { SellOrderForm } from '@/components/trading/SellOrderForm'
import { mockAssets } from '@/lib/data/mockAssets'
import { ShoppingCart, TrendingDown } from 'lucide-react'

export default function TradingPage() {
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Trade Assets</h1>
                <p className="text-muted-foreground mt-2">Buy and sell fractional shares in real estate, commodities, and more</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Asset Selection */}
                <div className="md:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Select Asset</h3>
                    <div className="space-y-2">
                      {mockAssets.slice(0, 8).map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`w-full text-left p-3 rounded-lg transition border ${
                            selectedAsset.id === asset.id
                              ? 'bg-accent/10 border-accent text-accent'
                              : 'border-border bg-white text-foreground hover:border-accent hover:bg-accent/5'
                          }`}
                        >
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm mt-1">₹{(asset.pricePerUnit ?? 0).toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trading Forms */}
                <div className="md:col-span-2">
                  <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <div className="mb-6 pb-6 border-b border-border">
                      <h2 className="text-2xl font-bold text-foreground">{selectedAsset.name}</h2>
                      <div className="mt-4 flex items-baseline gap-4">
                        <div>
                          <p className="text-muted-foreground text-sm">Current Price</p>
                          <p className="text-3xl font-bold text-foreground">₹{(selectedAsset.pricePerUnit ?? 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Expected Annual ROI</p>
                          <p className={`text-lg font-semibold ${(selectedAsset.expectedAnnualROI ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(selectedAsset.expectedAnnualROI ?? 0) >= 0 ? '+' : ''}{(selectedAsset.expectedAnnualROI ?? 0).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Units Available</p>
                          <p className="text-lg font-semibold text-foreground">{(selectedAsset.unitsAvailable ?? 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="buy" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="buy" className="flex gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Buy
                        </TabsTrigger>
                        <TabsTrigger value="sell" className="flex gap-2">
                          <TrendingDown className="w-4 h-4" />
                          Sell
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="buy">
                        <BuyOrderForm
                          assetId={selectedAsset.id}
                          assetName={selectedAsset.name}
                          currentPrice={selectedAsset.pricePerUnit ?? 0}
                          availableBalance={50000}
                        />
                      </TabsContent>

                      <TabsContent value="sell">
                        <SellOrderForm
                          assetId={selectedAsset.id}
                          assetName={selectedAsset.name}
                          currentPrice={selectedAsset.pricePerUnit ?? 0}
                          ownedQuantity={10.5}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
