/**
 * Profile Service
 * Handles profile-related API calls
 */

import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import { getAuthHeader } from './authService';
import { User } from './authService';

export interface ProfileData extends User {
  phone_no?: string;
  wallet_address?: string;
  age?: number;
  dob?: string;
}

/**
 * Fetch user profile from API
 */
export const getProfile = async (): Promise<ProfileData> => {
  try {
    const response = await fetch(API_ENDPOINTS.PROFILE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch profile');
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<ProfileData>): Promise<ProfileData> => {
  try {
    const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
  }
};
