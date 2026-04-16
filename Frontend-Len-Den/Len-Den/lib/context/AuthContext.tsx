'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '@/lib/utils/authService'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  role: 'user' | 'admin'
  profile_pic?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, first_name: string, last_name: string, username: string, sex: string, profile_pic?: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = authService.getStoredAuth()
    if (storedAuth) {
      setUser(storedAuth.user)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await authService.login(email, password)
      authService.storeAuth(response)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    username: string,
    sex: string,
    profile_pic?: string
  ) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await authService.signup(email, password, first_name, last_name, username, sex, profile_pic)
      authService.storeAuth(response)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      const refreshToken = authService.getRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      isLoading,
      error,
      login,
      signup,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
