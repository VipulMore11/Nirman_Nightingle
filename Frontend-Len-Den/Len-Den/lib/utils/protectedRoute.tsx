/**
 * Protected Route HOC
 * Wraps components to enforce authentication and role-based access
 */

'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

export interface ProtectedRouteProps {
  requireAdmin?: boolean;
  requireAuth?: boolean;
}

/**
 * Higher-Order Component (HOC) to protect routes
 * Usage:
 * export default withProtectedRoute(MyComponent, { requireAuth: true })
 * export default withProtectedRoute(AdminComponent, { requireAdmin: true })
 */
export function withProtectedRoute<P extends object>(
  Component: ComponentType<P>,
  options: ProtectedRouteProps = { requireAuth: true }
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      // Redirect if not authenticated
      if (options.requireAuth && !isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Redirect if admin is required but user is not admin
      if (options.requireAdmin && !isAdmin) {
        router.push('/dashboard');
        return;
      }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Render component if all checks pass
    if (options.requireAuth && !isAuthenticated) {
      return null;
    }

    if (options.requireAdmin && !isAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Inline hook-based protection (alternative to HOC)
 * Usage in components:
 * const { isAuthenticated, isAdmin } = useAuth();
 * useRouteProtection({ requireAdmin: true });
 */
export function useRouteProtection(options: ProtectedRouteProps = { requireAuth: true }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (options.requireAuth && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (options.requireAdmin && !isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  return {
    isProtected: isAuthenticated && (options.requireAdmin ? isAdmin : true),
    isLoading,
  };
}
