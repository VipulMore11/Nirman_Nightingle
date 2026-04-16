'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockUsers } from '@/lib/data/mockUsers';
import { formatDate } from '@/lib/utils/formatters';
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

  let filtered = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || user.kycStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and KYC verification</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'pending', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border hover:border-accent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">User</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Country</th>
                <th className="text-center p-4 font-semibold">KYC Status</th>
                <th className="text-right p-4 font-semibold">Invested</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-card/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">{user.country}</td>
                  <td className="p-4 text-center">{getKycBadge(user.kycStatus)}</td>
                  <td className="text-right p-4 font-semibold">
                    ${(user.totalInvested / 1000000).toFixed(1)}M
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {formatDate(user.joinedDate)}
                  </td>
                  <td className="text-center p-4">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button size="sm" variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border bg-card">
          <p className="text-muted-foreground text-xs mb-1">Total Users</p>
          <p className="text-2xl font-bold">{mockUsers.length}</p>
        </Card>
        <Card className="p-4 border-border bg-card">
          <p className="text-muted-foreground text-xs mb-1">Verified</p>
          <p className="text-2xl font-bold text-green-500">
            {mockUsers.filter((u) => u.kycStatus === 'verified').length}
          </p>
        </Card>
        <Card className="p-4 border-border bg-card">
          <p className="text-muted-foreground text-xs mb-1">Pending KYC</p>
          <p className="text-2xl font-bold text-orange-500">
            {mockUsers.filter((u) => u.kycStatus === 'pending').length}
          </p>
        </Card>
        <Card className="p-4 border-border bg-card">
          <p className="text-muted-foreground text-xs mb-1">Total Invested</p>
          <p className="text-2xl font-bold">
            ${(
              mockUsers.reduce((sum, u) => sum + u.totalInvested, 0) / 1000000
            ).toFixed(0)}M
          </p>
        </Card>
      </div>
    </div>
  );
}
