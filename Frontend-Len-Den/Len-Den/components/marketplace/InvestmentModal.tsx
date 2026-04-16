'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wallet,
  Shield,
  ArrowRight,
  X,
} from 'lucide-react';
import { Asset } from '@/lib/services/blockchainService';
import { getKYCStatus } from '@/lib/services/kycService';
import { getStoredUser, getStoredRole } from '@/lib/utils/authService';
import { usePeraWallet } from '@/hooks/usePeraWallet';
import { formatCurrency } from '@/lib/utils/formatters';
import Link from 'next/link';

interface InvestmentModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type InvestmentStep = 'details' | 'wallet' | 'kyc-check' | 'kyc-pending' | 'kyc-rejected' | 'amount' | 'confirm' | 'processing' | 'success' | 'error';

export function InvestmentModal({ asset, isOpen, onClose, onSuccess }: InvestmentModalProps) {
  const [step, setStep] = useState<InvestmentStep>('details');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTxnHash, setSuccessTxnHash] = useState('');
  
  const { walletAddress, connecting, connect, disconnect } = usePeraWallet();
  const user = getStoredUser();
  const role = getStoredRole();

  if (!asset || !isOpen) return null;

  const totalCost = parseFloat(quantity) * asset.unit_price;
  const maxUnits = Math.floor(asset.available_supply);

  const handleClose = () => {
    setStep('details');
    setQuantity('1');
    setError('');
    setSuccessTxnHash('');
    onClose();
  };

  const checkKYCStatus = async () => {
    try {
      if (!user) {
        setError('User not authenticated');
        setStep('error');
        return;
      }

      // Fetch actual KYC status from backend API
      const kycStatus = await getKYCStatus();
      
      if (kycStatus.status === 'verified') {
        // KYC is verified, proceed to wallet check
        if (walletAddress) {
          setStep('amount');
        } else {
          setStep('wallet');
        }
      } else if (kycStatus.status === 'pending') {
        // KYC was submitted but awaiting verification
        setError('Your KYC is under review. Please check back later.');
        setStep('kyc-pending');
      } else if (kycStatus.status === 'rejected') {
        // KYC was rejected, show reason
        setError(`Your KYC was rejected${kycStatus.rejection_reason ? ': ' + kycStatus.rejection_reason : ''}. Please resubmit.`);
        setStep('kyc-rejected');
      } else {
        // KYC not started or not found
        setError('KYC verification required. Please complete your KYC.');
        setStep('kyc-rejected');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check KYC status';
      setError(errorMessage);
      setStep('error');
    }
  };

  const handleInvest = async () => {
    try {
      if (!walletAddress) {
        setError('Wallet not connected');
        return;
      }

      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Validate asset data
      if (!asset?.asa_id) {
        setError('Asset ID missing - please reload the page');
        setStep('error');
        return;
      }

      if (!asset?.owner?.wallet_address) {
        setError('Asset owner wallet missing - please reload the page');
        setStep('error');
        return;
      }

      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      if (quantityNum > asset.available_supply) {
        setError(`Maximum available: ${asset.available_supply} units`);
        return;
      }

      setLoading(true);
      setStep('processing');

      // Import blockchain service here to avoid issues
      const { getOptInTransaction, getBuyAssetTransaction, submitSignedTransactions } = 
        await import('@/lib/services/blockchainService');
      const { signTransactions, sendSignedTransactions } = 
        await import('@/lib/services/peraWalletService');

      // Step 1: Opt-in (if needed)
      try {
        const optInTxn = await getOptInTransaction(walletAddress, asset.asa_id);
        const signedOptIn = await signTransactions([optInTxn.txn]);
        await submitSignedTransactions('opt_in', signedOptIn);
      } catch (optInError) {
        // Opt-in might fail if already opted in, continue with buy
        console.warn('Opt-in error (may already be opted in):', optInError);
      }

      // Step 2: Buy asset
      const buyTxn = await getBuyAssetTransaction(
        walletAddress,
        asset.owner.wallet_address,
        asset.asa_id,
        quantityNum,
        totalCost
      );

      // Decode base64 transactions
      const txnsToSign = buyTxn.txns.map((txn: string) => {
        const bytes = Buffer.from(txn, 'base64');
        return new Uint8Array(bytes);
      });

      const signedTxns = await signTransactions(txnsToSign);
      
      // Submit to backend
      const result = await submitSignedTransactions(buyTxn.txn_id, signedTxns);
      
      setSuccessTxnHash(result.blockchain_tx_id || 'success');
      setStep('success');
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Investment failed';
      setError(errorMessage);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'success' ? '🎉 Investment Successful!' : 'Invest in Asset'}
          </DialogTitle>
          {step !== 'success' && step !== 'error' && (
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {step === 'details' && 'Review asset details'}
              {step === 'wallet' && 'Connect your wallet'}
              {step === 'kyc-check' && 'Checking KYC status'}
              {step === 'amount' && 'Enter investment amount'}
              {step === 'confirm' && 'Confirm your investment'}
              {step === 'processing' && 'Processing blockchain transaction'}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Asset Details Step */}
        {step === 'details' && (
          <div className="space-y-4">
            <Card className="p-4 border-border bg-card/50">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground">{asset.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Price per unit</p>
                    <p className="font-semibold">{formatCurrency(asset.unit_price)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-semibold">{asset.available_supply.toLocaleString()} units</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button onClick={checkKYCStatus} className="w-full bg-accent hover:bg-accent/90">
              Continue to Investment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* KYC Check Step */}
        {step === 'kyc-check' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <p className="text-sm">Checking KYC status...</p>
            </div>
          </div>
        )}

        {/* Wallet Connection Step */}
        {step === 'wallet' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">Connect your Pera Wallet to proceed</p>
            </div>

            <Button
              onClick={connect}
              disabled={connecting}
              className="w-full gap-2"
              variant="default"
            >
              <Wallet className="h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect Pera Wallet'}
            </Button>

            <Button onClick={() => setStep('amount')} variant="outline" className="w-full">
              Skip (Use Existing Connection)
            </Button>
          </div>
        )}

        {/* Amount Input Step */}
        {step === 'amount' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of units</label>
              <Input
                type="number"
                min="1"
                max={maxUnits}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Max available: {maxUnits.toLocaleString()} units
              </p>
            </div>

            <Card className="p-3 border-border bg-card/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit price:</span>
                  <span>{formatCurrency(asset.unit_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total cost:</span>
                  <span className="text-accent">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button onClick={() => setStep('details')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="p-4 border-border bg-card/50 space-y-3">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Asset Verified</p>
                  <p className="text-xs text-muted-foreground">{asset.title}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Wallet Connected</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </p>
                </div>
              </div>
            </Card>

            <div className="text-center space-y-1 p-3 bg-accent/10 rounded-lg">
              <p className="text-2xl font-bold text-accent">{formatCurrency(totalCost)}</p>
              <p className="text-sm text-muted-foreground">
                for {quantity} unit{parseFloat(quantity) > 1 ? 's' : ''} of {asset.title}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('amount')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleInvest}
                disabled={loading}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Investment'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 p-6">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <div className="text-center space-y-2">
                <p className="font-semibold">Processing Investment</p>
                <p className="text-sm text-muted-foreground">
                  Please sign the transaction in your wallet...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 p-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  You successfully invested in {asset.title}!
                </p>
                {successTxnHash && (
                  <p className="text-xs font-mono text-muted-foreground bg-card/50 p-2 rounded break-all">
                    Tx: {successTxnHash}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
              View Portfolio
            </Button>
          </div>
        )}

        {/* KYC Pending Step */}
        {step === 'kyc-pending' && (
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">KYC Under Review</h3>
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('details')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={checkKYCStatus} className="flex-1">
                Check Again
              </Button>
            </div>
          </div>
        )}

        {/* KYC Rejected Step */}
        {step === 'kyc-rejected' && (
          <div className="space-y-4">
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">KYC Required</h3>
                <p className="text-sm text-red-800 mb-3">{error}</p>
                <Link href="/profile" className="text-sm font-medium text-red-700 hover:text-red-900 underline">
                  Complete KYC in Profile →
                </Link>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('details')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={checkKYCStatus} className="flex-1">
                Check Again
              </Button>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                {error.includes('KYC') ? (
                  <>
                    <p className="text-sm font-medium text-destructive">KYC Verification Required</p>
                    <p className="text-xs text-destructive/80">{error}</p>
                    <Link href="/profile" className="text-xs text-accent hover:underline mt-1 block">
                      Complete KYC verification →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-destructive">Investment Failed</p>
                    <p className="text-xs text-destructive/80">{error}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('details')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
