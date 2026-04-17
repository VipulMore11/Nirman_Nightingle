'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAuthHeader } from '@/lib/utils/authService';
import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface PendingAsset {
  id: number;
  title: string;
  owner: string;
  owner_email: string;
  owner_kyc_status: string;
  description: string;
  unit_price: number;
  total_supply: number;
  available_supply: number;
  created_at: string;
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<PendingAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<PendingAsset | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchPendingAssets();
  }, []);

  const fetchPendingAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.PENDING_ASSETS}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending assets');
      }

      const data = await response.json();
      setAssets(data.assets || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load assets';
      setError(errorMsg);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (assetId: number) => {
    try {
      setIsActionLoading(true);
      setActionError('');

      const response = await fetch(`${API_ENDPOINTS.APPROVE_ASSET(assetId)}`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve asset');
      }

      setAssets(assets.filter(a => a.id !== assetId));
      setSelectedAsset(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve asset';
      setActionError(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAsset || !rejectionReason.trim()) {
      setActionError('Please provide a rejection reason');
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError('');

      const response = await fetch(`${API_ENDPOINTS.REJECT_ASSET(selectedAsset.id)}`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject asset');
      }

      setAssets(assets.filter(a => a.id !== selectedAsset.id));
      setSelectedAsset(null);
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject asset';
      setActionError(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Asset Verification Queue</h1>
        <p className="text-muted-foreground mt-1">Review and approve pending asset listings</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <Input
          placeholder="Search by asset name or seller..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-muted-foreground">
          {filteredAssets.length} pending asset{filteredAssets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      {error && !loading && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading assets</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchPendingAssets} className="mt-3">
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && filteredAssets.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No pending assets</h3>
          <p className="text-muted-foreground mt-1">All assets have been reviewed!</p>
        </Card>
      )}

      {!loading && !error && filteredAssets.length > 0 && (
        <div className="space-y-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{asset.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Seller</p>
                        <p className="text-sm font-semibold truncate">{asset.owner}</p>
                        <p className="text-xs text-muted-foreground">{asset.owner_email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">KYC Status</p>
                        <div className="flex items-center gap-1 mt-1">
                          {asset.owner_kyc_status === 'verified' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-semibold text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-semibold text-yellow-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unit Price</p>
                        <p className="text-sm font-semibold">${asset.unit_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Supply</p>
                        <p className="text-sm font-semibold">{Math.floor(asset.total_supply)} units</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="text-sm font-semibold">{new Date(asset.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      className="bg-green-600 hover:bg-green-700 gap-2"
                      onClick={() => handleApprove(asset.id)}
                      disabled={isActionLoading || asset.owner_kyc_status !== 'verified'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Approve</span>
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowRejectDialog(true);
                      }}
                      disabled={isActionLoading}
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Reject</span>
                    </Button>
                  </div>
                </div>

                {asset.owner_kyc_status !== 'verified' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ Cannot approve: Seller's KYC is not verified
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Asset</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this asset listing
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{actionError}</p>
            </div>
          )}

          <textarea
            placeholder="e.g., Missing required documents, Insufficient property details..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={isActionLoading || !rejectionReason.trim()}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
