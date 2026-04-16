'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Search, Eye, EyeOff, Trash2, Star } from 'lucide-react';

export default function AdminListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  let filtered = mockAssets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortBy === 'aum') {
    filtered.sort((a, b) => b.totalValue - a.totalValue);
  } else if (sortBy === 'recent') {
    filtered.sort((a, b) => b.totalUnits - a.totalUnits);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manage Listings</h1>
        <p className="text-muted-foreground">View and manage all platform asset listings</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
        >
          <option value="recent">Recently Added</option>
          <option value="aum">Highest AUM</option>
        </select>
        <Button className="bg-accent hover:bg-accent/90">Create New Listing</Button>
      </div>

      {/* Listings Table */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Asset Name</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-right p-4 font-semibold">Total Value</th>
                <th className="text-center p-4 font-semibold">Units Available</th>
                <th className="text-center p-4 font-semibold">Expected ROI</th>
                <th className="text-center p-4 font-semibold">Status</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-card/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.location}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize">
                      {asset.category}
                    </Badge>
                  </td>
                  <td className="text-right p-4 font-semibold">
                    {formatCurrency(asset.totalValue)}
                  </td>
                  <td className="text-center p-4">
                    {asset.unitsAvailable.toLocaleString()}/{asset.totalUnits.toLocaleString()}
                  </td>
                  <td className="text-center p-4">
                    <span className="text-green-500 font-medium">
                      +{formatPercent(asset.expectedAnnualROI)}
                    </span>
                  </td>
                  <td className="text-center p-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/marketplace/listings/${asset.id}`}>
                        <Button size="sm" variant="outline" className="gap-2 bg-accent text-white hover:bg-accent/90 border-none h-8 px-4">
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min(10, filtered.length)} of {filtered.length} listings
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="outline" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
