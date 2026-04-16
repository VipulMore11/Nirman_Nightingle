/**
 * useWalletSignature Hook
 * Integrates with Pera Wallet for signing transactions
 * 
 * Prerequisites:
 * - Install Pera Wallet SDK: npm install @perawallet/connect
 * - Initialize Pera provider in your app
 */

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface SignTransactionsParams {
  txns: Uint8Array[]
  signers?: string[]
}

interface UseWalletSignatureReturn {
  isLoading: boolean
  error: string | null
  signTransactions: (params: SignTransactionsParams) => Promise<Uint8Array[]>
  disconnectWallet: () => Promise<void>
  getWalletAddress: () => Promise<string | null>
}

/**
 * Custom hook for Pera Wallet transaction signing
 * 
 * Usage:
 * const { signTransactions, isLoading, error } = useWalletSignature()
 * 
 * // Sign a transaction
 * const signedTxns = await signTransactions({
 *   txns: encodedTransactions,
 *   signers: [walletAddress]
 * })
 */
export function useWalletSignature(): UseWalletSignatureReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const signTransactions = useCallback(
    async ({ txns, signers }: SignTransactionsParams): Promise<Uint8Array[]> => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if Pera Wallet is available globally
        if (typeof window === 'undefined' || !window.peraWallet) {
          throw new Error(
            'Pera Wallet is not installed. Please install the Pera Wallet extension.'
          )
        }

        const peraWallet = window.peraWallet

        // Check if user has connected wallet
        const accounts = await peraWallet.getConnectedAccounts()
        if (!accounts || accounts.length === 0) {
          throw new Error('No wallet connected. Please connect your Pera Wallet first.')
        }

        // Sign transactions
        const signedTxns = await peraWallet.signTransaction([
          {
            txn: txns[0], // First transaction (payment)
            signers: signers || [accounts[0]],
          },
          {
            txn: txns[1], // Second transaction (asset transfer)
            signers: signers || [accounts[0]],
          },
        ])

        setIsLoading(false)
        toast({
          title: 'Success',
          description: 'Transactions signed successfully',
        })

        return signedTxns
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign transactions'
        setError(errorMessage)
        setIsLoading(false)

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })

        throw err
      }
    },
    [toast]
  )

  const disconnectWallet = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.peraWallet) {
        await window.peraWallet.disconnect()
        setError(null)
        toast({
          title: 'Success',
          description: 'Wallet disconnected',
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [toast])

  const getWalletAddress = useCallback(async (): Promise<string | null> => {
    try {
      if (typeof window === 'undefined' || !window.peraWallet) {
        return null
      }

      const peraWallet = window.peraWallet
      const accounts = await peraWallet.getConnectedAccounts()

      return accounts && accounts.length > 0 ? accounts[0] : null
    } catch {
      return null
    }
  }, [])

  return {
    isLoading,
    error,
    signTransactions,
    disconnectWallet,
    getWalletAddress,
  }
}

/**
 * Extend Window interface to include peraWallet
 */
declare global {
  interface Window {
    peraWallet?: {
      signTransaction: (txns: any[]) => Promise<Uint8Array[]>
      disconnect: () => Promise<void>
      getConnectedAccounts: () => Promise<string[]>
      reconnectSession?: () => Promise<void>
    }
  }
}

export default useWalletSignature
