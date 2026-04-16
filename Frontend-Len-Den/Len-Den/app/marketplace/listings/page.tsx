'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Search, Filter, TrendingUp, Shield, Plus, Users, MessageSquare, LayoutGrid, Building2, Coins, Palette, Rocket, Zap } from 'lucide-react';

const CATEGORY_PHOTOS: Record<string, string[]> = {
  'real-estate': ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'],
  'gold':        ['https://images.unsplash.com/photo-1610375461369-d613b564f4c0?w=800&q=80'],
  'art':         ['https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800&q=80'],
  'startup':     ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'],
  'commodities': ['https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80'],
};

export default function MarketplaceListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewType, setViewType] = useState<'browse' | 'my-assets'>('browse');

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'real-estate', label: 'Real Estate' },
    { id: 'gold', label: 'Gold' },
    { id: 'art', label: 'Art' },
    { id: 'startup', label: 'Startups' },
    { id: 'commodities', label: 'Commodities' },
  ];

  // Simulating user's listed assets
  const myAssets = mockAssets.slice(0, 2).map(a => ({ ...a, role: 'seller' }));

  let filtered = (viewType === 'browse' ? mockAssets : myAssets).filter((asset) => {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Investment Marketplace</h1>
          <p className="text-muted-foreground">Explore and invest in premium global assets</p>
        </div>
        <Link href="/marketplace/list-asset">
          <Button className="gap-2 bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4" />
            Add Your Asset
          </Button>
        </Link>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setViewType('browse')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            viewType === 'browse' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Browse Assets
        </button>
        <button
          onClick={() => setViewType('my-assets')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            viewType === 'my-assets' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          My Listed Assets
        </button>
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
        {filtered.map((asset) => {
          const isSeller = viewType === 'my-assets';
          const href = isSeller ? `/marketplace/manage/${asset.id}` : `/marketplace/listings/${asset.id}`;
          
          return (
            <Link key={asset.id} href={href}>
              <Card className={`h-full border-border bg-card hover:border-accent transition-all cursor-pointer overflow-hidden p-0 py-0 gap-0 group relative ${isSeller ? 'border-accent/40 bg-accent/5' : ''}`}>
                {isSeller && (
                  <div className="absolute top-3 right-3 z-20">
                    <span className="px-2 py-1 rounded bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      My Asset
                    </span>
                  </div>
                )}
                {/* Image Flush to Top */}
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={CATEGORY_PHOTOS[asset.category]?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'} 
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-medium">Click to view offering</p>
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
                    {isSeller && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-medium text-accent">{formatCurrency(asset.totalValue)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-tighter">ROI</p>
                        <p className="font-bold text-green-500">
                          {formatPercent(asset.expectedAnnualROI)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-tighter">Risk</p>
                        <p className="font-bold text-blue-500">{asset.riskScore}/10</p>
                      </div>
                    </div>
                  </div>

                  <Button className={`w-full text-sm gap-2 ${isSeller ? 'bg-foreground text-background hover:bg-foreground/90' : 'bg-accent hover:bg-accent/90'}`}>
                    {isSeller ? (
                      <>
                        <Filter className="w-4 h-4" />
                        Manage Asset
                      </>
                    ) : (
                      'View Details'
                    )}
                  </Button>
                </div>
              </Card>
            </Link>
          );
        })}
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
