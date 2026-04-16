'use client';

import { useState, useEffect, useCallback } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

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

  return { walletAddress, connecting, error, connect, disconnect };
}
