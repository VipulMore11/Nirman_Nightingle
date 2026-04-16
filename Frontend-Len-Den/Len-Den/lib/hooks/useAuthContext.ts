/**
 * useAuth Hook
 * Custom hook for accessing authentication context and methods
 */

import { useAuth as useAuthContext } from '@/lib/context/AuthContext'

export function useAuth() {
  return useAuthContext()
}

export default useAuth
