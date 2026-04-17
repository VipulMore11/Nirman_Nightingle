/**
 * API Configuration
 * Central place to manage backend API endpoints
 */

// Change this to match your backend URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: `${API_BASE_URL}/auth/signup/`,
  LOGIN: `${API_BASE_URL}/auth/login/`,
  LOGOUT: `${API_BASE_URL}/auth/logout/`,
  PROFILE: `${API_BASE_URL}/auth/profile/`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/update_profile/`,
  
  // KYC
  SUBMIT_KYC: `${API_BASE_URL}/auth/submit_kyc/`,
  VERIFY_KYC: `${API_BASE_URL}/auth/verify_kyc/`,
  KYC_STATUS: `${API_BASE_URL}/auth/kyc_status/`,
  
  // Marketplace & Blockchain
  MARKETPLACE: `${API_BASE_URL}/auth/marketplace`,
  CREATE_ASSET: `${API_BASE_URL}/auth/create_asset_with_documents/`,
  PENDING_ASSETS: `${API_BASE_URL}/auth/admin/assets/pending/`,
  APPROVE_ASSET: (assetId: string | number) => `${API_BASE_URL}/auth/admin/assets/${assetId}/approve/`,
  REJECT_ASSET: (assetId: string | number) => `${API_BASE_URL}/auth/admin/assets/${assetId}/reject/`,
  RESUBMIT_ASSET: (assetId: string | number) => `${API_BASE_URL}/auth/admin/assets/${assetId}/resubmit/`,
  GET_PENDING_SIGNATURE: (assetId: string | number) => `${API_BASE_URL}/auth/get_pending_signature/${assetId}/`,
  SUBMIT_ASA_TRANSACTION: `${API_BASE_URL}/auth/submit_asa_transaction/`,
  GET_MY_ASSETS: `${API_BASE_URL}/auth/marketplace/my-assets/`,
  GET_ASSETS: `${API_BASE_URL}/auth/marketplace/assets/`,
  OPT_IN: `${API_BASE_URL}/auth/opt_in/`,
  BUY_ASSET: `${API_BASE_URL}/auth/buy_asset/`,
  CONFIRM_BUY: `${API_BASE_URL}/auth/marketplace/confirm-buy/`,
};
