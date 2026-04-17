/**
 * Blockchain Service
 * Handles all blockchain-related API calls for investments
 */

import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import { getAuthHeader } from '@/lib/utils/authService';

export interface Asset {
  id: number;
  asa_id: number | null;
  title: string;
  description: string;
  property_images: Array<{ name: string; url: string; file_type: string }>;
  legal_documents: Record<string, string>;
  certificates: Array<{ name: string; url: string; file_type: string }>;
  thumbnail_url?: string | null;
  unit_price: number;
  total_supply: number;
  available_supply: number;
  owner: {
    id: number;
    email: string;
    first_name: string;
    wallet_address: string;
  };
  owner_email?: string;
  creator_wallet: string;
  created_at: string;
  listed_at: string | null;
  listing_status?: string;
  is_verified?: boolean;
}

export interface GetAssetsResponse {
  total: number;
  page: number;
  per_page: number;
  assets: Asset[];
}

export interface OptInResponse {
  txn: any;
}

export interface BuyAssetResponse {
  txn_id: string;
  txns: string[]; // Base64 encoded transactions
}

/**
 * Get list of active assets available for investment
 */
export const getAssets = async (page = 1, perPage = 12, search = ''): Promise<GetAssetsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_ENDPOINTS.MARKETPLACE}/assets/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch assets');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch assets');
  }
};

/**
 * Get a single asset by ID
 */
export const getAssetById = async (assetId: string | number): Promise<Asset> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.MARKETPLACE}/assets/${assetId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch asset');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch asset');
  }
};

/**
 * Get opt-in transaction for an asset
 */
export const getOptInTransaction = async (
  wallet: string,
  assetId: number
): Promise<OptInResponse> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.OPT_IN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        wallet,
        asset_id: assetId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get opt-in transaction');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get opt-in transaction');
  }
};

/**
 * Get buy asset transaction(s)
 */
export const getBuyAssetTransaction = async (
  buyer: string,
  seller: string,
  assetId: number,
  units: number,
  price: number
): Promise<BuyAssetResponse> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.BUY_ASSET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        buyer,
        seller,
        asset_id: assetId,
        units: Math.floor(units),
        price: Math.round(price * 100), // Convert to cents as integer
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get buy transaction');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get buy transaction');
  }
};

/**
 * Submit signed transactions to backend
 */
export const submitSignedTransactions = async (
  txnId: string,
  signedTxns: Uint8Array[]
): Promise<any> => {
  try {
    // Convert Uint8Array to base64
    const base64Txns = signedTxns.map((txn) => Buffer.from(txn).toString('base64'));

    const response = await fetch(`${API_ENDPOINTS.CONFIRM_BUY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        txn_id: txnId,
        signed_txns: base64Txns,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit transactions');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to submit transactions');
  }
};
