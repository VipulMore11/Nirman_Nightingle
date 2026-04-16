'use client';

import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { useRouteProtection } from '@/lib/utils/protectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isProtected, isLoading } = useRouteProtection({ requireAdmin: true });

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

  if (!isProtected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
