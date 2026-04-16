/**
 * Pera Wallet Service
 * Handles signing transactions with Pera Wallet
 */

import { PeraWalletConnect } from '@perawallet/connect';

let peraWallet: PeraWalletConnect | null = null;

function getPeraWallet(): PeraWalletConnect {
  if (!peraWallet) {
    peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
  }
  return peraWallet;
}

/**
 * Sign a single transaction with Pera Wallet
 */
export const signTransaction = async (txn: any): Promise<Uint8Array> => {
  try {
    const wallet = getPeraWallet();
    const signedTxns = await wallet.signTransaction([txn]);
    return signedTxns[0];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign transaction');
  }
};

/**
 * Sign multiple transactions with Pera Wallet
 */
export const signTransactions = async (txns: any[]): Promise<Uint8Array[]> => {
  try {
    const wallet = getPeraWallet();
    const signedTxns = await wallet.signTransaction(txns);
    return signedTxns;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign transactions');
  }
};

/**
 * Send signed transactions to Algorand network via Pera
 */
export const sendSignedTransactions = async (signedTxns: Uint8Array[]): Promise<string> => {
  try {
    const wallet = getPeraWallet();
    const txId = await wallet.sendRawTransaction(signedTxns);
    return txId;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send transactions');
  }
};
