'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Briefcase,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  History,
  HelpCircle,
  User,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    regex: /^\/dashboard$/,
  },
  {
    href: '/marketplace/listings',
    label: 'Marketplace',
    icon: ShoppingCart,
    regex: /^\/marketplace/,
  },
  {
    href: '/dashboard/my-assets',
    label: 'My Assets',
    icon: Package,
    regex: /^\/dashboard\/my-assets/,
  },
  {
    href: '/trading',
    label: 'Trade',
    icon: TrendingUp,
    regex: /^\/trading$/,
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: Package,
    regex: /^\/orders/,
  },
  {
    href: '/portfolio',
    label: 'Portfolio',
    icon: Briefcase,
    regex: /^\/portfolio/,
  },
  {
    href: '/transactions',
    label: 'Transactions',
    icon: History,
    regex: /^\/transactions/,
  },
  {
    href: '/admin/assets',
    label: 'Admin',
    icon: BarChart3,
    regex: /^\/admin/,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    regex: /^\/profile/,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    regex: /^\/settings/,
  },
  {
    href: '/help',
    label: 'Help',
    icon: HelpCircle,
    regex: /^\/help/,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const isLoggedIn = !pathname.includes('/auth');

  // Mobile open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop collapsed/expanded — persisted in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  }, [collapsed]);

  if (!isLoggedIn) return null;

  return (
    <>
      {/* ── Mobile toggle button (bottom-right FAB) ── */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 sm:hidden z-50 bg-sidebar shadow-lg border border-sidebar-border"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {/* ── Sidebar nav panel ── */}
      <nav
        className={`
          fixed sm:static left-0 top-0 h-full bg-sidebar border-r border-sidebar-border
          flex flex-col
          transform transition-all duration-300 ease-in-out
          z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          sm:translate-x-0
          ${collapsed ? 'sm:w-16' : 'sm:w-64'}
          w-64
        `}
        style={{ overflowX: 'hidden' }}
      >
        {/* Header row with title + desktop collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border shrink-0">
          {!collapsed && (
            <h2 className="font-semibold text-sidebar-foreground whitespace-nowrap overflow-hidden">
              Navigation
            </h2>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              hidden sm:flex items-center justify-center w-7 h-7 rounded-md
              text-sidebar-foreground hover:bg-sidebar-accent transition-colors
              ${collapsed ? 'mx-auto' : 'ml-auto'}
            `}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.regex.test(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <button
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${collapsed ? 'justify-center' : ''}
                    ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <Link href="/auth/login" onClick={() => setMobileOpen(false)} title={collapsed ? 'Logout' : undefined}>
            <Button
              variant="outline"
              className={`w-full gap-3 ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 sm:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
