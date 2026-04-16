/**
 * KYC Service
 * Handles all KYC-related API calls to backend
 */

import { API_ENDPOINTS } from '@/lib/constants/apiConfig';

export interface KYCStatus {
  status: 'verified' | 'pending' | 'rejected' | 'not_started';
  submitted_at?: string;
  verified_at?: string;
  rejection_reason?: string;
}

export interface KYCStatusResponse {
  status: string;
  message: string;
  data?: {
    kyc_status: string;
    submitted_at?: string;
    verified_at?: string;
    rejection_reason?: string;
  };
}

/**
 * Get user's current KYC status from backend
 */
export const getKYCStatus = async (): Promise<KYCStatus> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(API_ENDPOINTS.KYC_STATUS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch KYC status');
    }

    const data = await response.json();
    
    // Map backend response to our format
    // Backend returns status directly in the response: verified, pending, rejected
    const status = (data.status || 'not_started') as any;
    
    return {
      status,
      submitted_at: data.documents_submitted_at,
      verified_at: data.verified_at,
      rejection_reason: data.rejection_reason,
    };
  } catch (err) {
    console.error('Error fetching KYC status:', err);
    throw err;
  }
};
