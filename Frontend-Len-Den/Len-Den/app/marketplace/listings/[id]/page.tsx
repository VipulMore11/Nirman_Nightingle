'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  Calendar,
  MapPin,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  const asset = mockAssets.find((a) => a.id === params.id);

  if (!asset) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Asset not found</p>
        </div>
      </div>
    );
  }

  const unitsToInvest = investmentAmount
    ? Math.floor(Number(investmentAmount) / asset.pricePerUnit)
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="p-8 border-border bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-80 uppercase tracking-wider mb-2">
                  {asset.category}
                </p>
                <h1 className="text-4xl font-bold mb-2">{asset.name}</h1>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <MapPin className="w-4 h-4" />
                  {asset.location}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(asset.totalValue)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Price / Unit</p>
                  <p className="text-2xl font-bold">{formatCurrency(asset.pricePerUnit)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Minimum</p>
                  <p className="text-2xl font-bold">{formatCurrency(asset.pricePerUnit)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Expected ROI</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatPercent(asset.expectedAnnualROI)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Risk Score</p>
                  <p className="text-2xl font-bold text-blue-500">{asset.riskScore}/10</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Dividend Frequency</p>
                  <p className="text-lg font-bold capitalize">
                    {asset.dividendFrequency}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Units Available</p>
                  <p className="text-lg font-bold">
                    {asset.unitsAvailable.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold mb-3">About This Asset</h2>
            <p className="text-muted-foreground leading-relaxed">{asset.description_long}</p>
          </Card>

          {/* Legal Documents */}
          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold mb-4">Legal Documents</h2>
            <div className="space-y-2">
              {asset.legalDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-card/50 transition-colors border border-border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{doc.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Factors */}
          <Card className="p-6 border-border bg-card border-orange-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Risk Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  This investment carries market risk. Asset values may fluctuate. Past performance is not indicative of future results. Please review all legal documents before investing.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Investment Form Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 border-border bg-card sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Invest Now</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Investment Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min={asset.pricePerUnit}
                    step={asset.pricePerUnit}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
              </div>

              {investmentAmount && (
                <div className="p-3 rounded-lg bg-card/50 border border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units:</span>
                    <span className="font-medium">{unitsToInvest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-semibold">
                      {formatCurrency(unitsToInvest * asset.pricePerUnit)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-accent hover:bg-accent/90"
                disabled={!investmentAmount || unitsToInvest === 0}
                onClick={() => setShowInvestmentForm(true)}
              >
                Continue to Checkout
              </Button>

              <Button variant="outline" className="w-full" disabled>
                Add to Watchlist
              </Button>
            </div>

            {/* Investment Summary */}
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Annual Dividend</span>
                <span className="font-medium">
                  {formatCurrency(
                    (unitsToInvest * asset.pricePerUnit * asset.expectedAnnualROI) / 100
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Next Payout</span>
                <span className="font-medium">{asset.nextDividendDate}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold">Est. Monthly Dividend</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    (unitsToInvest * asset.pricePerUnit * asset.expectedAnnualROI) /
                      100 /
                      12
                  )}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
