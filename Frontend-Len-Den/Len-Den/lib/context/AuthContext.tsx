'use client'

import React, { createContext, useContext, useState } from 'react'
import { currentUser, userPortfolio } from '@/lib/data/mockUsers'

interface AuthContextType {
  user: typeof currentUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  portfolio: typeof userPortfolio
  login: (email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<typeof currentUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = (email: string, password: string) => {
    // Mock login logic
    setUser(currentUser)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      portfolio: userPortfolio,
      login,
      logout,
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
