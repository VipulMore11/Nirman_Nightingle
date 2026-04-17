'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getAssets, GetAssetsResponse } from '@/lib/services/blockchainService';
import { formatCurrency } from '@/lib/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PortfolioPage() {
  const [assets, setAssets] = useState<GetAssetsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssets(1, 50);
        setAssets(data);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const availableAssets = assets?.assets || [];
  
  // Pie chart data based on available supply
  const pieData = availableAssets.slice(0, 6).map((asset) => ({
    name: asset.title,
    value: (asset.available_supply / availableAssets.reduce((sum, a) => sum + a.available_supply, 0)) * 100,
    fullValue: asset.available_supply * asset.unit_price,
  }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Performance chart data (simulated for demo)
  const performanceData = [
    { date: 'Jan', portfolio: 2300000 },
    { date: 'Feb', portfolio: 2450000 },
    { date: 'Mar', portfolio: 2380000 },
    { date: 'Apr', portfolio: 2550000 },
    { date: 'May', portfolio: 2680000 },
    { date: 'Jun', portfolio: 2750000 },
  ];

  // Mock recent transactions for demo
  const recentTransactions = [
    { id: 1, asset: 'Mumbai Tech Park', type: 'purchase', amount: 50000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 2, asset: 'Alpine Gold Fund', type: 'purchase', amount: 25000, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: 3, asset: 'Modern Art Collection', type: 'dividend', amount: 1250, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  ];

  const totalPortfolioValue = pieData.reduce((sum, item) => sum + item.fullValue, 0) || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Portfolio</h1>
          <p className="text-muted-foreground">Detailed analysis of your investments</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Total Market Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Available Assets</p>
          <p className="text-2xl font-bold">{availableAssets.length}</p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Total Supply</p>
          <p className="text-2xl font-bold">{availableAssets.reduce((sum, a) => sum + a.total_supply, 0).toLocaleString()}</p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Verified Assets</p>
          <p className="text-2xl font-bold text-accent">
            {availableAssets.filter(a => a.is_verified).length}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Allocation */}
        <Card className="border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Asset Allocation</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={colors[pieData.indexOf(entry) % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Holdings Table */}
        <Card className="lg:col-span-2 border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Holdings Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Asset</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Total Supply</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Available</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {availableAssets.slice(0, 10).map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-border hover:bg-accent/5 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <Link
                        href={`/marketplace/listings/${asset.id}`}
                        className="flex items-center gap-2 font-medium hover:text-accent transition-colors"
                      >
                        {asset.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                      </Link>
                    </td>
                    <td className="text-right p-4">{formatCurrency(asset.unit_price)}</td>
                    <td className="text-right p-4">{asset.total_supply.toLocaleString()}</td>
                    <td className="text-right p-4 font-medium">{asset.available_supply.toLocaleString()}</td>
                    <td className="text-right p-4 text-muted-foreground">
                      {asset.is_verified ? '✓ Verified' : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Portfolio Performance</h2>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                }}
                formatter={(value) => [formatCurrency(value as number), 'Portfolio Value']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Portfolio Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Asset</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-card/50">
                  <td className="p-4">{transaction.asset}</td>
                  <td className="p-4 text-muted-foreground">
                    {transaction.date.toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'dividend' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {transaction.type === 'dividend' ? 'Dividend' : 'Purchase'}
                    </span>
                  </td>
                  <td className="text-right p-4 font-medium text-green-500">
                    +{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
