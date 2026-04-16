'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAssets } from '@/lib/data/mockAssets';
import { currentUser } from '@/lib/data/mockUsers';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface SecondaryListing {
  id: string;
  assetId: string;
  seller: string;
  units: number;
  pricePerUnit: number;
  type: 'buy' | 'sell';
  postedDate: string;
  status: 'open' | 'filled';
}

const mockSecondaryListings: SecondaryListing[] = [
  {
    id: 'sec-001',
    assetId: 'asset-001',
    seller: 'Amit Patel',
    units: 500,
    pricePerUnit: 510,
    type: 'sell',
    postedDate: '2024-04-13',
    status: 'open',
  },
  {
    id: 'sec-002',
    assetId: 'asset-003',
    seller: 'Jane Doe',
    units: 1200,
    pricePerUnit: 98,
    type: 'sell',
    postedDate: '2024-04-12',
    status: 'open',
  },
  {
    id: 'sec-003',
    assetId: 'asset-005',
    seller: 'John Smith',
    units: 50,
    pricePerUnit: 1950,
    type: 'sell',
    postedDate: '2024-04-11',
    status: 'open',
  },
  {
    id: 'sec-004',
    assetId: 'asset-007',
    seller: 'Maria Garcia',
    units: 750,
    pricePerUnit: 795,
    type: 'sell',
    postedDate: '2024-04-10',
    status: 'open',
  },
];

export default function SecondaryMarketplacePage() {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredListings = mockSecondaryListings.filter((listing) => {
    const asset = mockAssets.find((a) => a.id === listing.assetId);
    const matchesSearch =
      asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchTerm.toLowerCase());
    return listing.status === 'open' && matchesSearch;
  });

  const userHoldings = currentUser.portfolio.map((holding) => {
    const asset = mockAssets.find((a) => a.id === holding.assetId);
    return { asset, holding };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Secondary Marketplace</h1>
        <p className="text-muted-foreground">
          Buy and sell fractional asset units with other investors
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab('buy')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            tab === 'buy'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" />
            Buy Orders
          </div>
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            tab === 'sell'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Sell My Assets
          </div>
        </button>
      </div>

      {tab === 'buy' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by asset name or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Buy Orders */}
          {filteredListings.length > 0 ? (
            <div className="space-y-3">
              {filteredListings.map((listing) => {
                const asset = mockAssets.find((a) => a.id === listing.assetId);
                const discount = (
                  ((asset?.pricePerUnit || 0) - listing.pricePerUnit) /
                  (asset?.pricePerUnit || 1)
                ) * 100;

                return (
                  <Card
                    key={listing.id}
                    className="p-5 border-border bg-card hover:border-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{asset?.name}</h3>
                          {discount > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              -{discount.toFixed(1)}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Seller: {listing.seller} • Posted{' '}
                          {formatDate(listing.postedDate)}
                        </p>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Units</p>
                            <p className="font-semibold">
                              {listing.units.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Price/Unit</p>
                            <p className="font-semibold">
                              {formatCurrency(listing.pricePerUnit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Std Price</p>
                            <p className="font-semibold text-muted-foreground">
                              {formatCurrency(asset?.pricePerUnit || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Total</p>
                            <p className="font-bold text-lg">
                              {formatCurrency(listing.units * listing.pricePerUnit)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button className="bg-accent hover:bg-accent/90 gap-2 flex-shrink-0">
                        <TrendingUp className="w-4 h-4" />
                        Buy
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border-border bg-card/50">
              <p className="text-muted-foreground mb-4">No listings found</p>
              <p className="text-sm text-muted-foreground">
                Check back later or try a different search
              </p>
            </Card>
          )}
        </div>
      )}

      {tab === 'sell' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              Select an asset from your portfolio to create a sell order.
            </p>
          </div>

          {userHoldings.filter((h) => h.asset).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userHoldings.map(({ asset, holding }) => (
                <Card
                  key={holding.assetId}
                  className="p-6 border-border bg-card hover:border-accent transition-colors"
                >
                  <h3 className="font-semibold mb-2">{asset?.name}</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Units Owned</span>
                      <span className="font-medium">
                        {holding.unitsOwned.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price per Unit</span>
                      <span className="font-medium">
                        {formatCurrency(holding.unitPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                      <span>Total Value</span>
                      <span>
                        {formatCurrency(holding.unitsOwned * holding.unitPrice)}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-accent hover:bg-accent/90 gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Create Sell Order
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-border bg-card/50">
              <p className="text-muted-foreground">You don't own any assets yet</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
