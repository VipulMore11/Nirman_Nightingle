'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { currentUser, mockUsers } from '@/lib/data/mockUsers';
import { mockAssets } from '@/lib/data/mockAssets';
import { mockTransactions } from '@/lib/data/mockTransactions';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Plus, IndianRupee } from 'lucide-react';
import { GuidedTour } from '@/components/common';
import Link from 'next/link';

export default function DashboardPage() {
  const user = currentUser;
  const userAssets = user.portfolio
    .map((holding) => {
      const asset = mockAssets.find((a) => a.id === holding.assetId);
      const currentValue = holding.unitsOwned * holding.unitPrice;
      const gain = ((holding.unitPrice - (holding.unitPrice * 0.95)) / (holding.unitPrice * 0.95)) * 100;
      return { asset, holding, currentValue, gain };
    })
    .filter((a) => a.asset);

  const totalPortfolioValue = userAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalGain = totalPortfolioValue - user.totalInvested;
  const gainPercentage = (totalGain / user.totalInvested) * 100;

  const recentTransactions = mockTransactions
    .filter((t) => t.userId === user.id)
    .slice(0, 5)
    .reverse();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 relative">
      <GuidedTour />
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Here's your portfolio overview</p>
        </div>
        <Link href="/marketplace/listings" id="add-asset-btn">
          <Button className="bg-accent hover:bg-accent/90 gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card id="portfolio-value" className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(user.totalInvested)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </Card>

        <Card id="unrealized-gains" className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Unrealized Gains</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalGain)}</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">ROI</p>
              <p className="text-2xl font-bold text-green-500">+{formatPercent(gainPercentage)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <Card id="your-holdings" className="lg:col-span-2 border-border bg-card">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Holdings</h2>
            <div className="flex gap-8 text-xs font-medium text-muted-foreground mr-4">
              <span className="w-20 text-right">P&L</span>
              <span className="w-24 text-right">Total P&L</span>
              <span className="w-24 text-right">Value</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {userAssets.map(({ asset, holding, currentValue }) => {
              const buyValue = holding.unitsOwned * holding.unitPrice * 0.95; // Simulating lower entry price
              const pl = currentValue - buyValue;
              const plPercentage = (pl / buyValue) * 100;
              
              // Calculate dividends for this specific asset
              const assetDividends = mockTransactions
                .filter(t => t.userId === user.id && t.assetId === holding.assetId && t.type === 'dividend')
                .reduce((sum, t) => sum + t.totalAmount, 0);
              const totalPL = pl + assetDividends;

              return (
                <div key={holding.assetId} className="p-6 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{asset?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {holding.unitsOwned.toLocaleString()} units
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="w-20 text-right">
                        <p className={`text-sm font-medium ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                        </p>
                        <p className={`text-[10px] ${pl >= 0 ? 'text-green-500/80' : 'text-red-500/80'}`}>
                          {pl >= 0 ? '+' : ''}{plPercentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="w-24 text-right">
                        <p className={`text-sm font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Incl. Dividends</p>
                      </div>

                      <div className="w-24 text-right">
                        <p className="font-bold text-foreground">{formatCurrency(currentValue)}</p>
                        <p className="text-[10px] text-muted-foreground">Market Value</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-6 bg-card/50 border-t border-border">
            <Link href="/portfolio">
              <Button variant="outline" className="w-full">
                View Full Portfolio
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {recentTransactions.map((txn) => {
              const asset = mockAssets.find((a) => a.id === txn.assetId);
              const isIncome = txn.type === 'dividend';
              return (
                <div key={txn.id} className="p-4 hover:bg-card/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{asset?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {txn.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          isIncome ? 'text-green-500' : 'text-foreground'
                        }`}
                      >
                        {isIncome ? '+' : ''}{formatCurrency(txn.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
