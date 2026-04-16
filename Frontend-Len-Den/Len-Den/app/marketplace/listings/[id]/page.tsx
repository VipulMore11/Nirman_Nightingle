'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/formatters';
import {InvestmentModal} from '@/components/marketplace/InvestmentModal';
import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import type { Asset } from '@/lib/services/blockchainService';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch all assets and find the one with matching ID
        const response = await fetch(API_ENDPOINTS.GET_ASSETS);

        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }

        const data = await response.json();
        const foundAsset = data.assets.find((a: Asset) => a.id.toString() === params.id);

        if (!foundAsset) {
          setError('Asset not found');
          return;
        }

        // Validate asset has required fields for blockchain transactions
        if (!foundAsset.asa_id) {
          setError('Asset configuration incomplete - missing ASA ID');
          return;
        }

        if (!foundAsset.owner?.wallet_address) {
          setError('Asset configuration incomplete - missing owner wallet');
          return;
        }

        setAsset(foundAsset);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load asset';
        setError(errorMessage);
        console.error('Error fetching asset:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAsset();
    }
  }, [params.id]);

  const handleInvest = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setInvestmentAmount('');
    router.push('/marketplace/listings');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">{error || 'Asset not found'}</p>
          <Button className="mt-6" onClick={() => router.push('/marketplace/listings')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const unitsToInvest = investmentAmount
    ? Math.floor(Number(investmentAmount) / asset.unit_price)
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
                  Asset
                </p>
                <h1 className="text-4xl font-bold mb-2">{asset.title}</h1>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <MapPin className="w-4 h-4" />
                  Verified Asset
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">Total Supply</p>
                  <p className="text-2xl font-bold">{Math.floor(asset.total_supply || asset.available_supply).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Price / Unit</p>
                  <p className="text-2xl font-bold">{formatCurrency(asset.unit_price)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Available</p>
                  <p className="text-2xl font-bold">{Math.floor(asset.available_supply).toLocaleString()} units</p>
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
                  <p className="text-muted-foreground text-sm mb-1">Status</p>
                  <p className="text-2xl font-bold text-green-500">Active</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Verified</p>
                  <p className="text-2xl font-bold text-blue-500">✓</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold mb-3">About This Asset</h2>
            <p className="text-muted-foreground leading-relaxed">{asset.description}</p>
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
                    min={asset.unit_price}
                    step={asset.unit_price}
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
                      {formatCurrency(unitsToInvest * asset.unit_price)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-accent hover:bg-accent/90"
                disabled={!investmentAmount || unitsToInvest === 0}
                onClick={handleInvest}
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
                <span>Total Investment</span>
                <span className="font-medium">
                  {formatCurrency(unitsToInvest * asset.unit_price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price Per Unit</span>
                <span className="font-medium">{formatCurrency(asset.unit_price)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold">Min. Investment</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(asset.unit_price)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        asset={asset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}