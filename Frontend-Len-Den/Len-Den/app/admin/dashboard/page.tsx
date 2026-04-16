'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockAssets } from '@/lib/data/mockAssets';
import { mockUsers } from '@/lib/data/mockUsers';
import { mockPendingListings } from '@/lib/data/mockPendingListings';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { BarChart3, CheckCircle, Clock, Users, ListChecks, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const pendingCount = mockPendingListings.filter((p) => p.status === 'pending-review').length;
  const verifiedUsers = mockUsers.filter((u) => u.kycStatus === 'verified').length;
  const totalAUM = mockAssets.reduce((sum, a) => sum + a.totalValue, 0);

  const metrics = [
    {
      label: 'Total Assets Listed',
      value: formatNumber(mockAssets.length),
      icon: ListChecks,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Assets Under Management',
      value: formatCurrency(totalAUM),
      icon: BarChart3,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Verified Users',
      value: formatNumber(verifiedUsers),
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Pending Review',
      value: formatNumber(pendingCount),
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Active Investors',
      value: formatNumber(mockUsers.length),
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform management and oversight</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6 border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold">Pending Verifications</h3>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-500 mb-4">{pendingCount}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Asset listings awaiting review and approval.
          </p>
          <Link href="/admin/verification">
            <Button className="w-full bg-accent hover:bg-accent/90">Review Now</Button>
          </Link>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold">User Compliance</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-500 mb-4">
            {((verifiedUsers / mockUsers.length) * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {verifiedUsers} of {mockUsers.length} users KYC verified.
          </p>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full">
              View Users
            </Button>
          </Link>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold">All Listings</h3>
            <ListChecks className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500 mb-4">{mockAssets.length}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Active and verified asset listings on platform.
          </p>
          <Link href="/admin/listings">
            <Button variant="outline" className="w-full">
              Manage Listings
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Pending Listings */}
      <Card className="border-border bg-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Pending Listings</h2>
          <Link href="/admin/verification">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-border">
          {mockPendingListings.slice(0, 5).map((listing) => (
            <div key={listing.id} className="p-6 hover:bg-card/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{listing.assetName}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>Submitted by: {listing.submittedBy}</div>
                    <div>
                      Docs: {listing.documentsUploaded}/{listing.documentsRequired}
                    </div>
                    <div>Status: <span className="capitalize font-medium text-foreground">{listing.status}</span></div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/admin/verification?listing=${listing.id}`}>
                    <Button size="sm" className="bg-accent hover:bg-accent/90">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Health */}
      <Card className="border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Platform Health</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Operational</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-muted-foreground">API Response Time</span>
            <span className="text-sm font-medium">142ms</span>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-muted-foreground">Blockchain Network</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-muted-foreground">Database Connection</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
