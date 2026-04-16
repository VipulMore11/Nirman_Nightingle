/**
 * Authentication Service
 * Handles all authentication API calls to backend
 */

import { API_ENDPOINTS } from '@/lib/constants/apiConfig';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'user' | 'admin';
  profile_pic?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
};

/**
 * Sign up with email, password, and name
 */
export const signup = async (
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  username: string,
  sex: string,
  profile_pic?: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name,
        username,
        sex,
        profile_pic,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data: AuthResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Signup failed');
  }
};

/**
 * Logout - blacklist the refresh token
 */
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await fetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear storage regardless of API response
    clearStorage();
  }
};

/**
 * Store auth tokens and user data in localStorage
 */
export const storeAuth = (auth: AuthResponse): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refresh);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(auth.user));
};

/**
 * Retrieve stored auth from localStorage
 */
export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === 'undefined') return null;

  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);

  if (!accessToken || !refreshToken || !userStr) {
    return null;
  }

  try {
    return {
      accessToken,
      refreshToken,
      user: JSON.parse(userStr),
    };
  } catch {
    return null;
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Get stored user
 */
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get stored user role
 */
export const getStoredRole = (): 'user' | 'admin' | null => {
  const user = getStoredUser();
  return user?.role || null;
};

/**
 * Clear all auth data from localStorage
 */
export const clearStorage = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Check if token is valid (basic check - doesn't verify expiration)
 */
export const isTokenValid = (): boolean => {
  return !!getAccessToken();
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization?: string } => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
