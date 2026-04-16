'use client';

import { Card } from '@/components/ui/card';
import { currentUser } from '@/lib/data/mockUsers';
import { mockAssets } from '@/lib/data/mockAssets';
import { mockTransactions } from '@/lib/data/mockTransactions';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PortfolioPage() {
  const user = currentUser;
  
  const userAssets = user.portfolio
    .map((holding) => {
      const asset = mockAssets.find((a) => a.id === holding.assetId);
      const currentValue = holding.unitsOwned * holding.unitPrice;
      return { asset, holding, currentValue };
    })
    .filter((a) => a.asset);

  const totalValue = userAssets.reduce((sum, a) => sum + a.currentValue, 0);

  // Pie chart data
  const pieData = userAssets.map((item) => ({
    name: item.asset?.name || 'Unknown',
    value: (item.currentValue / totalValue) * 100,
    fullValue: item.currentValue,
  }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Performance chart data (simulated)
  const performanceData = [
    { date: 'Jan', portfolio: 18000 },
    { date: 'Feb', portfolio: 19500 },
    { date: 'Mar', portfolio: 18800 },
    { date: 'Apr', portfolio: 20500 },
    { date: 'May', portfolio: 21800 },
    { date: 'Jun', portfolio: 23500 },
  ];

  const userDividends = mockTransactions.filter(
    (t) => t.userId === user.id && t.type === 'dividend'
  );

  const totalDividends = userDividends.reduce((sum, t) => sum + t.totalAmount, 0);

  const handleExport = () => {
    // Basic CSV export logic
    const headers = ['Asset Name', 'Units Owned', 'Avg Price', 'Current Value', '% of Portfolio'];
    const rows = userAssets.map(item => [
      item.asset?.name,
      item.holding.unitsOwned,
      formatCurrency(item.holding.unitPrice),
      formatCurrency(item.currentValue),
      `${((item.currentValue / totalValue) * 100).toFixed(1)}%`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Len-Den_Portfolio_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Portfolio</h1>
          <p className="text-muted-foreground">Detailed analysis of your investments</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Total Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Invested Amount</p>
          <p className="text-2xl font-bold">{formatCurrency(user.totalInvested)}</p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Unrealized Gain</p>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(totalValue - user.totalInvested)}
          </p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-muted-foreground text-sm mb-2">Total Dividends</p>
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(totalDividends)}
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
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1f3a', 
                    border: '1px solid #2d3748', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '8px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                  formatter={(value: number, name: string, props: any) => {
                    const amount = props.payload.fullValue;
                    return [`${formatCurrency(amount)} (${value.toFixed(1)}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1.5">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-muted-foreground truncate" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="font-medium shrink-0">{item.value.toFixed(1)}%</span>
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
                  <th className="text-right p-4 font-medium text-muted-foreground">Units</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Value</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {userAssets.map(({ asset, holding, currentValue }) => (
                  <tr
                    key={holding.assetId}
                    className="border-b border-border hover:bg-accent/5 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <Link
                        href={`/portfolio/holdings/${holding.assetId}`}
                        className="flex items-center gap-2 font-medium hover:text-accent transition-colors"
                      >
                        {asset?.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                      </Link>
                    </td>
                    <td className="text-right p-4">{holding.unitsOwned.toLocaleString()}</td>
                    <td className="text-right p-4 font-medium">{formatCurrency(currentValue)}</td>
                    <td className="text-right p-4 text-muted-foreground">
                      {formatPercent((currentValue / totalValue) * 100)}
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
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
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

      {/* Dividend History */}
      <Card className="border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Dividend History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Asset</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Units</th>
              </tr>
            </thead>
            <tbody>
              {userDividends.map((dividend) => {
                const asset = mockAssets.find((a) => a.id === dividend.assetId);
                return (
                  <tr key={dividend.id} className="border-b border-border hover:bg-card/50">
                    <td className="p-4">{asset?.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(dividend.date)}
                    </td>
                    <td className="text-right p-4 font-medium text-green-500">
                      +{formatCurrency(dividend.totalAmount)}
                    </td>
                    <td className="text-right p-4 text-muted-foreground">
                      {dividend.units.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
