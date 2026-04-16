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
  GET_ASSETS: `${API_BASE_URL}/auth/marketplace/assets/`,
  OPT_IN: `${API_BASE_URL}/auth/opt_in/`,
  BUY_ASSET: `${API_BASE_URL}/auth/buy_asset/`,
  CONFIRM_BUY: `${API_BASE_URL}/auth/marketplace/confirm-buy/`,
};
