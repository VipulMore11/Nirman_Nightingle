'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { getAuthHeader } from '@/lib/utils/authService';
import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import { usePeraWallet } from '@/hooks/usePeraWallet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit2,
  Zap,
} from 'lucide-react';

interface Asset {
  id: number;
  title: string;
  description: string;
  status_display: string;
  is_verified: boolean;
  listing_status: string;
  unit_price: number;
  available_supply: number;
  asa_id: number | null;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface SigningState {
  assetId: number | null;
  isOpen: boolean;
  isLoading: boolean;
  isSigning: boolean;
  error: string | null;
  txnBytes: string | null;
  assetName: string | null;
  totalSupply: number | null;
}

export default function SellerAssetsPage() {
  const router = useRouter();
  const { signTransaction, signing, error: walletError, walletAddress, connect, connecting } = usePeraWallet();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [signingState, setSigningState] = useState<SigningState>({
    assetId: null,
    isOpen: false,
    isLoading: false,
    isSigning: false,
    error: null,
    txnBytes: null,
    assetName: null,
    totalSupply: null,
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.GET_MY_ASSETS, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
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

  const handleInitiateSign = async (assetId: number) => {
    setSigningState({
      assetId,
      isOpen: true,
      isLoading: true,
      isSigning: false,
      error: null,
      txnBytes: null,
      assetName: null,
      totalSupply: null,
    });

    try {
      // Get pending signature from backend
      const response = await fetch(
        API_ENDPOINTS.GET_PENDING_SIGNATURE(assetId),
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get transaction');
      }

      const data = await response.json();
      setSigningState((prev) => ({
        ...prev,
        isLoading: false,
        txnBytes: data.txn_bytes,
        assetName: data.asset_name,
        totalSupply: data.total_supply,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get transaction';
      setSigningState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
    }
  };

  const handleSignAndSubmit = async () => {
    if (!signingState.assetId || !signingState.txnBytes) {
      setSigningState((prev) => ({
        ...prev,
        error: 'Missing required transaction data',
      }));
      return;
    }

    setSigningState((prev) => ({
      ...prev,
      isSigning: true,
      error: null,
    }));

    try {
      // 🔥 CRITICAL FIX: Decode Base64 string to Uint8Array
      // The backend sends Base64, but Pera wallet expects raw bytes
      console.log('[DEBUG] txnBytes type:', typeof signingState.txnBytes);
      console.log('[DEBUG] txnBytes length:', signingState.txnBytes.length);
      
      const txnBytesRaw = new Uint8Array(
        atob(signingState.txnBytes)
          .split('')
          .map(c => c.charCodeAt(0))
      );

      console.log('[DEBUG] ✅ Decoded Base64 to Uint8Array');
      console.log('[DEBUG] Decoded bytes length:', txnBytesRaw.length);
      console.log('[DEBUG] First 20 bytes (hex):', Array.from(txnBytesRaw.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '));

      // Now sign with the raw bytes
      console.log('[DEBUG] Sending Uint8Array to Pera wallet...');
      const signedTxn = await signTransaction(txnBytesRaw);

      console.log('[DEBUG] ✅ Pera wallet signing successful');
      console.log('[DEBUG] Signed transaction type:', typeof signedTxn);
      console.log('[DEBUG] Signed transaction is Uint8Array:', signedTxn instanceof Uint8Array);
      console.log('[DEBUG] Signed transaction length:', signedTxn.length);

      // Convert signed Uint8Array back to Base64 for backend
      // Use a more robust method that handles large arrays
      let signedTxnBase64: string;
      if (typeof Buffer !== 'undefined') {
        // Node.js/browser with Buffer support
        signedTxnBase64 = Buffer.from(signedTxn).toString('base64');
      } else {
        // Fallback for browsers without Buffer
        // Split into chunks to avoid "Maximum call stack size exceeded"
        const chunkSize = 8192;
        let binaryString = '';
        for (let i = 0; i < signedTxn.length; i += chunkSize) {
          const chunk = signedTxn.slice(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, Array.from(chunk) as any);
        }
        signedTxnBase64 = btoa(binaryString);
      }

      console.log('[DEBUG] Converted signed txn to Base64, length:', signedTxnBase64.length);

      // Submit signed transaction to backend
      const payload = {
        asset_id: signingState.assetId,
        signed_txn: signedTxnBase64,
      };
      console.log('[DEBUG] Submitting payload to:', API_ENDPOINTS.SUBMIT_ASA_TRANSACTION);
      console.log('[DEBUG] Payload asset_id:', payload.asset_id);
      console.log('[DEBUG] Payload signed_txn length:', payload.signed_txn.length);
      
      const response = await fetch(API_ENDPOINTS.SUBMIT_ASA_TRANSACTION, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[DEBUG] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ERROR] Backend response error (status', response.status, '):', errorData);
        throw new Error(
          errorData.details || errorData.error || `Failed to submit transaction (${response.status})`
        );
      }

      const data = await response.json();
      console.log('[SUCCESS] Asset published successfully:', data);

      // Close dialog and refresh assets
      setSigningState({
        assetId: null,
        isOpen: false,
        isLoading: false,
        isSigning: false,
        error: null,
        txnBytes: null,
        assetName: null,
        totalSupply: null,
      });

      // Refresh assets list
      await fetchAssets();

      // Show success - could be improved with a toast
      alert(
        `🎉 Success! Your asset is now live on the blockchain.\nASA ID: ${data.asa_id}`
      );
    } catch (err) {
      console.error('[ERROR] ========== FULL ERROR DETAILS ==========');
      console.error('[ERROR] Error type:', typeof err);
      console.error('[ERROR] Error instanceof Error:', err instanceof Error);
      if (err instanceof Error) {
        console.error('[ERROR] Error message:', err.message);
        console.error('[ERROR] Error name:', err.name);
        console.error('[ERROR] Stack trace:', err.stack);
      } else {
        console.error('[ERROR] Error object:', err);
      }
      console.error('[ERROR] ==========================================');
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign transaction';
      setSigningState((prev) => ({
        ...prev,
        error: errorMsg,
        isSigning: false,
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Pending Review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAssetState = (asset: Asset): string => {
    if (asset.rejection_reason) return 'rejected';
    if (asset.is_verified) return 'active';
    if (asset.approved_at && !asset.is_verified) return 'pending_signature';
    return 'pending_review';
  };

  const filteredAssets = assets.filter((asset) =>
    asset.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Assets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your listed assets and track their status
          </p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90 gap-2"
          onClick={() => router.push('/marketplace/list-asset')}
        >
          <Plus className="w-4 h-4" />
          List New Asset
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search your assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
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
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && filteredAssets.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold">No assets listed yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            Start by creating your first asset listing
          </p>
          <Button
            className="bg-accent hover:bg-accent/90 mx-auto"
            onClick={() => router.push('/marketplace/list-asset')}
          >
            Create First Asset
          </Button>
        </Card>
      )}

      {!loading && !error && filteredAssets.length > 0 && (
        <div className="space-y-4">
          {filteredAssets.map((asset) => {
            const assetState = getAssetState(asset);

            return (
              <Card key={asset.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(asset.status_display)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{asset.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {asset.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Unit Price</p>
                        <p className="text-sm font-semibold">
                          ${asset.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="text-sm font-semibold">
                          {Math.floor(asset.available_supply)} units
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p
                          className={`text-sm font-semibold ${
                            asset.status_display === 'Active'
                              ? 'text-green-600'
                              : asset.status_display === 'Pending Review'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {asset.status_display}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm font-semibold">
                          {new Date(asset.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {asset.asa_id && (
                        <div>
                          <p className="text-xs text-muted-foreground">ASA ID</p>
                          <p className="text-sm font-semibold text-blue-600">
                            {asset.asa_id}
                          </p>
                        </div>
                      )}
                    </div>

                    {asset.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Rejection:</span>{' '}
                          {asset.rejection_reason}
                        </p>
                      </div>
                    )}

                    {asset.approved_at && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Approved on{' '}
                        {new Date(asset.approved_at).toLocaleDateString()}
                      </p>
                    )}

                    {assetState === 'pending_signature' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          👋 Admin approved your asset! Sign & publish to blockchain to go live.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    {assetState === 'pending_signature' && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                        onClick={() => handleInitiateSign(asset.id)}
                        disabled={signing || signingState.isSigning}
                      >
                        <Zap className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign & Publish</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/marketplace/listings/${asset.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredAssets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">{assets.length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {assets.filter((a) => a.status_display === 'Active').length}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {
                assets.filter((a) => a.status_display === 'Pending Review' || a.status_display === 'Pending Signature')
                  .length
              }
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {assets.filter((a) => a.status_display === 'Rejected').length}
            </p>
          </Card>
        </div>
      )}

      {/* Signing Modal */}
      <Dialog open={signingState.isOpen} onOpenChange={(open) => {
        if (!open && !signingState.isSigning) {
          setSigningState({
            assetId: null,
            isOpen: false,
            isLoading: false,
            isSigning: false,
            error: null,
            txnBytes: null,
            assetName: null,
            totalSupply: null,
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Asset to Blockchain</DialogTitle>
            <DialogDescription>
              Sign the transaction with your Pera wallet to publish {signingState.assetName} to the blockchain.
            </DialogDescription>
          </DialogHeader>

          {signingState.isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="ml-2">Preparing transaction...</span>
            </div>
          )}

          {/* Step 1: Connect Wallet if needed */}
          {!signingState.isLoading && !walletAddress && !signingState.isSigning && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  🔗 Connect Your Wallet
                </p>
                <p className="text-xs text-blue-800 mb-4">
                  You need to connect your Pera wallet to sign and publish this asset to the blockchain.
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={connect}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Pera Wallet'
                  )}
                </Button>
              </div>

              {walletError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{walletError}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Show transaction details if wallet is connected */}
          {!signingState.isLoading && signingState.txnBytes && walletAddress && !signingState.isSigning && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold mb-2">Transaction Details:</p>
                <div className="text-xs space-y-1 font-mono">
                  <p>Asset: <span className="text-blue-600">{signingState.assetName}</span></p>
                  <p>Total Supply: <span className="text-blue-600">{signingState.totalSupply} units</span></p>
                  <p className="text-yellow-600">⚠️ You will be asked to sign with your Pera wallet</p>
                </div>
              </div>

              {signingState.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{signingState.error}</p>
                </div>
              )}

              {walletError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{walletError}</p>
                </div>
              )}
            </div>
          )}

          {signingState.isSigning && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="ml-2">Signing & submitting...</span>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSigningState({
                  assetId: null,
                  isOpen: false,
                  isLoading: false,
                  isSigning: false,
                  error: null,
                  txnBytes: null,
                  assetName: null,
                  totalSupply: null,
                });
              }}
              disabled={signingState.isSigning || signingState.isLoading || connecting}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSignAndSubmit}
              disabled={
                !signingState.txnBytes ||
                signingState.isSigning ||
                signingState.isLoading ||
                !walletAddress
              }
            >
              {signingState.isSigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Sign & Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
