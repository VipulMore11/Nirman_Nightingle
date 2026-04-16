'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/formatters';
import { Search, TrendingUp, Shield, Loader2, AlertCircle } from 'lucide-react';
import { getAssets, Asset } from '@/lib/services/blockchainService';

export default function MarketplaceListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'real-estate', label: 'Real Estate' },
    { id: 'gold', label: 'Gold' },
    { id: 'art', label: 'Art' },
    { id: 'startup', label: 'Startups' },
    { id: 'commodities', label: 'Commodities' },
  ];

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAssets(1, 12, searchTerm);
        setAssets(data.assets);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
        setError(errorMessage);
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [searchTerm]);

  let filtered = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (sortBy === 'roi') {
    // Sorting by ROI would go here if available in asset data
  } else if (sortBy === 'risk') {
    // Risk sorting would go here if available in asset data
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Marketplace</h1>
        <p className="text-muted-foreground">Explore and invest in premium global assets</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load assets</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

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
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
            disabled={loading}
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
            disabled={loading}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-accent text-accent-foreground'
                : 'bg-card border border-border hover:border-accent'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      {/* Assets Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((asset) => (
              <Link key={asset.id} href={`/marketplace/listings/${asset.id}`}>
                <Card className="h-full border-border bg-card hover:border-accent transition-colors overflow-hidden group cursor-pointer">
                {/* Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center z-10">
                    <div className="text-4xl font-bold text-slate-400 opacity-50">
                      📊
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {asset.description}
                    </p>
                  </div>

                  <div className="space-y-2 py-3 border-t border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price per unit</span>
                      <span className="font-medium">{formatCurrency(asset.unit_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Units available</span>
                      <span className="font-medium">{Math.floor(asset.available_supply).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min investment</span>
                      <span className="font-medium">
                        {formatCurrency(asset.unit_price)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-muted-foreground text-xs">Verified</p>
                        <p className="font-semibold text-blue-500">✓</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-muted-foreground text-xs">Status</p>
                        <p className="font-semibold text-green-500 text-xs">Active</p>
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
        </>
      )}
    </div>
  );
}