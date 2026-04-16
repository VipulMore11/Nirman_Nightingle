'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Menu, Settings, LogOut, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const isLoggedIn = !pathname.includes('/auth');

  if (pathname.includes('/auth') && pathname !== '/') {
    return null;
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-lg font-semibold hidden sm:inline">LenDen</span>
        </Link>

        {isLoggedIn && (
          <div className="flex items-center gap-4 flex-1 max-w-md mx-8 hidden sm:flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search assets..."
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 pl-3 border-l border-border">
                <div className="flex flex-col items-end text-sm">
                  <span className="font-medium">Rajesh Kumar</span>
                  <span className="text-xs text-muted-foreground">Investor</span>
                </div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </>
          )}
          {!isLoggedIn && pathname === '/' && (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
