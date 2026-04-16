'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';
import { useState } from 'react';

const userNavItems = [
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

const adminNavItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    regex: /^\/admin\/dashboard$/,
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: User,
    regex: /^\/admin\/users/,
  },
  {
    href: '/admin/verification',
    label: 'KYC Verification',
    icon: Package,
    regex: /^\/admin\/verification/,
  },
  {
    href: '/admin/listings',
    label: 'Listings',
    icon: ShoppingCart,
    regex: /^\/admin\/listings/,
  },
  {
    href: '/admin/audit-log',
    label: 'Audit Log',
    icon: History,
    regex: /^\/admin\/audit-log/,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    regex: /^\/settings/,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 sm:hidden z-50"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      <nav
        className={`fixed sm:static left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 sm:translate-x-0 z-40 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-semibold text-sidebar-foreground">
            {isAdmin ? 'Admin Panel' : 'Navigation'}
          </h2>
        </div>

        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.regex.test(pathname);

            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 sm:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
