'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Search, Filter, TrendingUp, Shield } from 'lucide-react';

export default function MarketplaceListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'real-estate', label: 'Real Estate' },
    { id: 'gold', label: 'Gold' },
    { id: 'art', label: 'Art' },
    { id: 'startup', label: 'Startups' },
    { id: 'commodities', label: 'Commodities' },
  ];

  let filtered = mockAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'roi') {
    filtered.sort((a, b) => b.expectedAnnualROI - a.expectedAnnualROI);
  } else if (sortBy === 'risk') {
    filtered.sort((a, b) => a.riskScore - b.riskScore);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Marketplace</h1>
        <p className="text-muted-foreground">Explore and invest in premium global assets</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="roi">Highest ROI</option>
            <option value="risk">Lowest Risk</option>
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-accent text-accent-foreground'
                : 'bg-card border border-border hover:border-accent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((asset) => (
          <Link key={asset.id} href={`/marketplace/listings/${asset.id}`}>
            <Card className="h-full border-border bg-card hover:border-accent transition-colors cursor-pointer overflow-hidden group">
              {/* Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <div className="text-4xl font-bold text-slate-400 opacity-50">
                    {asset.category === 'real-estate' && '🏢'}
                    {asset.category === 'gold' && '💰'}
                    {asset.category === 'art' && '🎨'}
                    {asset.category === 'startup' && '🚀'}
                    {asset.category === 'commodities' && '⚡'}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {asset.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{asset.location}</p>
                </div>

                <div className="space-y-2 py-3 border-t border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per unit</span>
                    <span className="font-medium">{formatCurrency(asset.pricePerUnit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units available</span>
                    <span className="font-medium">{asset.unitsAvailable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min investment</span>
                    <span className="font-medium">
                      {formatCurrency(asset.pricePerUnit)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-muted-foreground text-xs">ROI</p>
                      <p className="font-semibold text-green-500">
                        {formatPercent(asset.expectedAnnualROI)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-muted-foreground text-xs">Risk</p>
                      <p className="font-semibold text-blue-500">{asset.riskScore}/10</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-sm">
                  View Details
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No assets found matching your criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
