'use client';

import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
