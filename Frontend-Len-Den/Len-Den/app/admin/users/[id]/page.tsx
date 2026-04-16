'use client';

import { notFound, useRouter } from 'next/navigation';
import { use } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/lib/data/mockUsers';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatDate } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Globe,
  Calendar,
  TrendingUp,
  Wallet,
  BarChart3,
  Package,
} from 'lucide-react';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const user = mockUsers.find((u) => u.id === id);
  if (!user) notFound();

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 text-sm px-3 py-1">
            <CheckCircle className="w-4 h-4" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 gap-1 text-sm px-3 py-1">
            <Clock className="w-4 h-4" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1 text-sm px-3 py-1">
            <XCircle className="w-4 h-4" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const portfolioWithDetails = user.portfolio.map((holding) => {
    const asset = mockAssets.find((a) => a.id === holding.assetId);
    return { ...holding, asset };
  });

  const totalPortfolioValue = user.portfolio.reduce(
    (sum, h) => sum + h.unitsOwned * h.unitPrice,
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-border"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {getKycBadge(user.kycStatus)}
            </div>
            <p className="text-muted-foreground text-sm mb-3">User ID: {user.id}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-4 h-4 shrink-0" />
                <span>{user.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined {formatDate(user.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-muted-foreground text-xs">Total Invested</p>
          </div>
          <p className="text-2xl font-bold">
            ${(user.totalInvested / 1_000_000).toFixed(2)}M
          </p>
        </Card>

        <Card className="p-5 border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-muted-foreground text-xs">Total Gains</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            +${(user.totalGains / 1000).toFixed(0)}K
          </p>
        </Card>

        <Card className="p-5 border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-muted-foreground text-xs">Portfolio Value</p>
          </div>
          <p className="text-2xl font-bold">
            ${(totalPortfolioValue / 1_000_000).toFixed(2)}M
          </p>
        </Card>

        <Card className="p-5 border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-muted-foreground text-xs">Assets Held</p>
          </div>
          <p className="text-2xl font-bold">{user.portfolio.length}</p>
        </Card>
      </div>

      {/* Portfolio Holdings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Portfolio Holdings</h2>
        <Card className="border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">Asset</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-right p-4 font-semibold">Units Owned</th>
                  <th className="text-right p-4 font-semibold">Unit Price</th>
                  <th className="text-right p-4 font-semibold">Total Value</th>
                  <th className="text-right p-4 font-semibold">Expected ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {portfolioWithDetails.map((holding) => (
                  <tr key={holding.assetId} className="hover:bg-card/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {holding.asset?.name ?? holding.assetId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {holding.asset?.location ?? '—'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize text-xs">
                        {holding.asset?.category ?? '—'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {holding.unitsOwned.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      ${holding.unitPrice.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-semibold">
                      ${(holding.unitsOwned * holding.unitPrice).toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-green-600 font-medium">
                      {holding.asset?.expectedAnnualROI !== undefined
                        ? `+${holding.asset.expectedAnnualROI}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* KYC Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">KYC Information</h2>
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Verification Status</p>
              {getKycBadge(user.kycStatus)}
            </div>
            {user.kycStatus === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve KYC
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject KYC
                </Button>
              </div>
            )}
            {user.kycStatus === 'verified' && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                KYC fully verified — no action required
              </p>
            )}
            {user.kycStatus === 'rejected' && (
              <Button size="sm" variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                Re-review Application
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
