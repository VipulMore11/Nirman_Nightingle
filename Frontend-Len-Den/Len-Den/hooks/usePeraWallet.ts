'use client';

import { useState, useEffect, useCallback } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Singleton so multiple mounts share the same SDK instance
let peraWallet: PeraWalletConnect | null = null;

function getPeraWallet(): PeraWalletConnect {
  if (!peraWallet) {
    peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
  }
  return peraWallet;
}

export function usePeraWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-connect if session exists from a previous visit
  useEffect(() => {
    const wallet = getPeraWallet();
    wallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length) {
          setWalletAddress(accounts[0]);
        }
      })
      .catch(() => {
        // No existing session — silently ignore
      });

    wallet.connector?.on('disconnect', () => {
      setWalletAddress(null);
    });
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      const wallet = getPeraWallet();
      const accounts = await wallet.connect();
      if (accounts.length) {
        setWalletAddress(accounts[0]);
      }
    } catch (err: unknown) {
      // User closed the modal — not an error worth surfacing
      if (err instanceof Error && err.message?.includes('closed')) {
        // silent
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const wallet = getPeraWallet();
      await wallet.disconnect();
    } catch {
      // ignore
    }
    setWalletAddress(null);
  }, []);

  /**
   * Sign a single transaction
   * @param txnBytes - Uint8Array of unsigned transaction (raw bytes, not Base64)
   * @returns Uint8Array of signed transaction bytes
   */
  const signTransaction = useCallback(
    async (txnBytes: Uint8Array | string): Promise<Uint8Array> => {
      setError(null);
      setSigning(true);
      try {
        if (!walletAddress) {
          throw new Error('Wallet not connected. Please connect wallet first.');
        }

        console.log('[DEBUG] signTransaction called with type:', typeof txnBytes);
        
        // Step 1: Convert to Uint8Array if needed
        let txnUint8: Uint8Array;
        if (typeof txnBytes === 'string') {
          console.log('[DEBUG] Received Base64 string, decoding...');
          txnUint8 = new Uint8Array(Buffer.from(txnBytes, 'base64'));
        } else {
          console.log('[DEBUG] Received Uint8Array directly');
          txnUint8 = txnBytes;
        }

        console.log('[DEBUG] Transaction bytes length:', txnUint8.length);
        
        // Step 2: Decode to transaction object
        const decodedTxn = algosdk.decodeUnsignedTransaction(txnUint8);
        console.log('[DEBUG] ✅ Transaction decoded successfully, type:', decodedTxn.type);

        // Step 3: Format for Pera wallet SDK
        // The SDK expects: [[{ txn: decodedTransaction, signers: [address] }]]
        const txnGroups: any = [[
          {
            txn: decodedTxn,
            signers: [walletAddress]
          }
        ]];

        const wallet = getPeraWallet();
        console.log('[DEBUG] Sending to Pera wallet with correct format: [[{ txn, signers }]]');
        console.log('[DEBUG] Signer address:', walletAddress);
        
        // Step 4: Call wallet.signTransaction with proper structure
        const signedTxns = await wallet.signTransaction(txnGroups);

        console.log('[DEBUG] ✅ Pera wallet signing successful');
        console.log('[DEBUG] Response type:', typeof signedTxns);
        console.log('[DEBUG] Is array:', Array.isArray(signedTxns));
        if (Array.isArray(signedTxns)) {
          console.log('[DEBUG] Response length:', signedTxns.length);
          console.log('[DEBUG] First element type:', typeof signedTxns[0]);
          console.log('[DEBUG] First element is array:', Array.isArray(signedTxns[0]));
          console.log('[DEBUG] First element is Uint8Array:', signedTxns[0] instanceof Uint8Array);
        }
        
        // Step 5: Extract the signed transaction bytes
        // Response could be: [Uint8Array] or [[Uint8Array]]
        let signedTxn: Uint8Array;
        
        if (Array.isArray(signedTxns) && signedTxns.length > 0) {
          const firstElement = signedTxns[0];
          
          // Case 1: Direct Uint8Array in array [Uint8Array, ...]
          if (firstElement instanceof Uint8Array) {
            signedTxn = firstElement;
            console.log('[DEBUG] ✅ Extracted Uint8Array directly from response[0]');
          }
          // Case 2: Nested array [[Uint8Array, ...], ...]
          else if (Array.isArray(firstElement) && firstElement.length > 0) {
            const result = firstElement[0];
            if (result instanceof Uint8Array) {
              signedTxn = result;
              console.log('[DEBUG] ✅ Extracted Uint8Array from response[0][0]');
            } else {
              throw new Error(`Unexpected format in nested array: ${typeof result}`);
            }
          } else {
            throw new Error(`Unexpected first element type: ${typeof firstElement}`);
          }
        } else {
          throw new Error(`Invalid response structure: ${JSON.stringify(signedTxns)}`);
        }

        console.log('[DEBUG] ✅ Extracted signed transaction, length:', signedTxn.length);
        return signedTxn;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to sign transaction';
        console.error('[ERROR] signTransaction failed:', errorMsg);
        if (!errorMsg.includes('closed')) {
          setError(errorMsg);
        }
        throw err;
      } finally {
        setSigning(false);
      }
    },
    [walletAddress]
  );

  /**
   * Sign a group of transactions (atomic transaction)
   * @param txnsBase64 - Array of base64-encoded unsigned transactions
   * @returns Array of base64-encoded signed transactions
   */
  const signGroupTransactions = useCallback(
    async (txnsBase64: string[]): Promise<string[]> => {
      setError(null);
      setSigning(true);
      try {
        if (!walletAddress) {
          throw new Error('Wallet not connected. Please connect wallet first.');
        }

        // Step 1: Decode all transactions
        const decodedTxns = txnsBase64.map((txnB64) => {
          const txnBuffer = Buffer.from(txnB64, 'base64');
          return algosdk.decodeUnsignedTransaction(txnBuffer);
        });

        console.log('[DEBUG] signGroupTransactions - decoded', decodedTxns.length, 'transactions');

        // Step 2: Format for Pera wallet SDK - use correct structure
        // The SDK expects: [[{ txn: decodedTransaction1, signers: [address] }, { txn: decodedTransaction2, signers: [address] }, ...]]
        const txnGroups: any = [
          decodedTxns.map((txn) => ({
            txn,
            signers: [walletAddress]
          }))
        ];

        const wallet = getPeraWallet();
        console.log('[DEBUG] signGroupTransactions - Sending to Pera with format: [[{ txn, signers }]]');
        
        // Step 3: Call wallet.signTransaction with proper structure
        const signedTxns = await wallet.signTransaction(txnGroups);

        console.log('[DEBUG] ✅ Pera group signing successful');
        console.log('[DEBUG] Response type:', typeof signedTxns);
        
        // Step 4: Extract signed transactions from response
        // Response should be an array of transaction groups [[Uint8Array, Uint8Array, ...]]
        if (!Array.isArray(signedTxns) || !Array.isArray(signedTxns[0])) {
          throw new Error('Unexpected response structure from Pera wallet');
        }

        const signedGroup = signedTxns[0];
        if (signedGroup.length !== decodedTxns.length) {
          throw new Error(
            `Expected ${decodedTxns.length} signed transactions, got ${signedGroup.length}`
          );
        }

        // Step 5: Convert back to base64
        const result = signedGroup.map((signedTxn: any) => {
          if (signedTxn instanceof Uint8Array) {
            return Buffer.from(signedTxn).toString('base64');
          } else {
            throw new Error(`Unexpected signed transaction format: ${typeof signedTxn}`);
          }
        });

        console.log('[DEBUG] ✅ Converted', result.length, 'signed transactions to base64');
        return result;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to sign transactions';
        if (!errorMsg.includes('closed')) {
          setError(errorMsg);
        }
        throw err;
      } finally {
        setSigning(false);
      }
    },
    []
  );

  return {
    walletAddress,
    connecting,
    signing,
    error,
    connect,
    disconnect,
    signTransaction,
    signGroupTransactions,
  };
}
