'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Plus, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getStoredAuth } from '@/lib/utils/authService';
import { User } from '@/lib/utils/authService';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getStoredAuth();
        if (!auth) {
          router.push('/auth/login');
          return;
        }
        setUser(auth.user);
      } catch (err) {
        console.error('Failed to load user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="p-6 border-destructive bg-destructive/10">
          <p className="text-destructive">{error || 'Failed to load user data'}</p>
        </Card>
      </div>
    );
  }

  const firstName = user.first_name || user.email.split('@')[0];
  const userAssets: any[] = [];
  const totalPortfolioValue = 0;
  const totalGain = 0;
  const gainPercentage = 0;
  const recentTransactions: any[] = [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">Here's your portfolio overview</p>
        </div>
        <Link href="/marketplace/listings">
          <Button className="bg-accent hover:bg-accent/90 gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(0)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Unrealized Gains</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalGain)}</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">ROI</p>
              <p className="text-2xl font-bold text-green-500">+{formatPercent(gainPercentage)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <Card className="lg:col-span-2 border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Your Holdings</h2>
          </div>
          {userAssets.length > 0 ? (
            <div className="divide-y divide-border">
              {userAssets.map(({ asset, holding, currentValue }) => (
                <div key={holding.assetId} className="p-6 hover:bg-card/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{asset?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {holding.unitsOwned.toLocaleString()} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(currentValue)}</p>
                      <p className="text-sm text-green-500">+{formatPercent((currentValue - holding.unitsOwned * holding.unitPrice * 0.95) / (holding.unitsOwned * holding.unitPrice * 0.95))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>No holdings yet. Start investing to see your portfolio grow!</p>
            </div>
          )}
          <div className="p-6 bg-card/50 border-t border-border">
            <Link href="/portfolio">
              <Button variant="outline" className="w-full">
                View Full Portfolio
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {recentTransactions.map((txn) => {
                const isIncome = txn.type === 'dividend';
                return (
                  <div key={txn.id} className="p-4 hover:bg-card/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{txn.assetName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {txn.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isIncome ? 'text-green-500' : 'text-foreground'
                          }`}
                        >
                          {isIncome ? '+' : ''}{formatCurrency(txn.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>No recent activity</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
