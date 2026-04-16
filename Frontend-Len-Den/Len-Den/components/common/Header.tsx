'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Menu, Settings, LogOut, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/context/AuthContext';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const isLoggedIn = isAuthenticated;

  if (pathname.includes('/auth')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href={isLoggedIn ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'} className="flex items-center gap-2">
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
          {isLoggedIn && user && (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="relative">
                <div
                  className="flex items-center gap-2 pl-3 border-l border-border cursor-pointer hover:opacity-80"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="flex flex-col items-end text-sm">
                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {isAdmin ? 'Admin' : 'Investor'}
                    </span>
                  </div>
                  <img
                    src={user.profile_pic || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                    <Link href="/profile" onClick={() => setShowDropdown(false)}>
                      <div className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">View Profile</span>
                      </div>
                    </Link>
                    <Link href="/settings" onClick={() => setShowDropdown(false)}>
                      <div className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </div>
                    </Link>
                    <hr className="my-1 border-border" />
                    <div
                      className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </div>
                  </div>
                )}
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
