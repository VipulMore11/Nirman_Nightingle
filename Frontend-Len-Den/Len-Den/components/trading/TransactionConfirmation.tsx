'use client'

import { useEffect, useState } from 'react'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface TransactionConfirmationProps {
  isOpen: boolean
  transactionId: string
  blockchainTxId?: string
  assetTitle: string
  quantity: number
  price: number
  totalAmount: number
  onClose: () => void
  onSuccess?: () => void
}

type TransactionStatus = 'pending' | 'confirmed' | 'failed'

interface TransactionResponse {
  id: string
  status: TransactionStatus
  error_message?: string
  error_code?: string
  confirmed_at?: string
}

/**
 * TransactionConfirmation Component
 * 
 * Displays transaction status with blockchain polling
 * Shows pending state, success, or error with appropriate actions
 * 
 * Features:
 * - Polls backend for transaction confirmation (10 second timeout)
 * - Shows error codes with helpful messages
 * - Quick link to KYC if error is kyc_incomplete
 * - Displays transaction details
 */
export function TransactionConfirmation({
  isOpen,
  transactionId,
  blockchainTxId,
  assetTitle,
  quantity,
  price,
  totalAmount,
  onClose,
  onSuccess,
}: TransactionConfirmationProps) {
  const [status, setStatus] = useState<TransactionStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const MAX_POLLS = 10 // 10 seconds with 1 second interval

  useEffect(() => {
    if (!isOpen || !transactionId || status !== 'pending') {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch transaction status')
        }

        const data: TransactionResponse = await response.json()

        if (data.status === 'confirmed') {
          setStatus('confirmed')
          setIsPolling(false)
          clearInterval(pollInterval)
          if (onSuccess) {
            setTimeout(onSuccess, 1000) // Call after a brief delay to show success
          }
        } else if (data.status === 'failed') {
          setStatus('failed')
          setError(data.error_message || 'Transaction failed')
          setErrorCode(data.error_code || null)
          setIsPolling(false)
          clearInterval(pollInterval)
        }

        setPollCount((prev) => prev + 1)
      } catch (err) {
        console.error('Polling error:', err)
        // Continue polling on error
      }

      // Stop polling after MAX_POLLS attempts
      setPollCount((prev) => {
        if (prev + 1 >= MAX_POLLS) {
          setIsPolling(false)
          clearInterval(pollInterval)
          // After timeout, show pending state message
          setError('Transaction confirmation timeout. Please check your wallet or try again.')
          return prev + 1
        }
        return prev + 1
      })
    }, 1000) // Poll every 1 second

    return () => clearInterval(pollInterval)
  }, [isOpen, transactionId, status, onSuccess])

  const handleKYCClick = () => {
    onClose()
    // Redirect to KYC completion
    window.location.href = '/auth/onboarding?step=kyc'
  }

  const handleRetry = () => {
    setStatus('pending')
    setPollCount(0)
    setError(null)
    setErrorCode(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Status</DialogTitle>
          <DialogDescription>Processing your transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Asset</span>
              <span className="font-medium">{assetTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quantity</span>
              <span className="font-medium">{quantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Price per Unit</span>
              <span className="font-medium">₹{price.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center">
            {status === 'pending' && (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <div className="text-center">
                  <p className="text-sm font-medium">Confirming Transaction</p>
                  <p className="text-xs text-muted-foreground">
                    {isPolling ? `${pollCount}/${MAX_POLLS} checks...` : 'Waiting for confirmation...'}
                  </p>
                </div>
              </div>
            )}

            {status === 'confirmed' && (
              <div className="flex flex-col items-center space-y-3">
                <Check className="h-8 w-8 text-green-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">Transaction Confirmed!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {blockchainTxId && `TX: ${blockchainTxId.substring(0, 10)}...`}
                  </p>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="flex flex-col items-center space-y-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-red-700">Transaction Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Messages with Actions */}
          {status === 'failed' && errorCode === 'kyc_incomplete' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <p className="mb-3">Your KYC verification is incomplete.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={handleKYCClick}
                >
                  Complete KYC Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status === 'failed' && errorCode !== 'kyc_incomplete' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {status === 'pending' && (
              <Button variant="outline" disabled>
                Processing...
              </Button>
            )}

            {status === 'confirmed' && (
              <>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onClose}>View Portfolio</Button>
              </>
            )}

            {status === 'failed' && errorCode !== 'kyc_incomplete' && (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleRetry}>Retry</Button>
              </>
            )}

            {status === 'failed' && errorCode === 'kyc_incomplete' && (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TransactionConfirmation
