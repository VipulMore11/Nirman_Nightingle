'use client';

import { notFound, useRouter } from 'next/navigation';
import { use } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/lib/data/mockUsers';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatDate } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Globe,
  Calendar,
  TrendingUp,
  Wallet,
  BarChart3,
  Package,
  FileText,
  Eye,
  ShieldCheck,
  Image,
} from 'lucide-react';
import { useState } from 'react';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = mockUsers.find((u) => u.id === id);
  if (!user) notFound();

  const [userKycStatus, setUserKycStatus] = useState(user.kycStatus);

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 text-sm px-3 py-1">
            <CheckCircle className="w-4 h-4" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 gap-1 text-sm px-3 py-1">
            <Clock className="w-4 h-4" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-1 text-sm px-3 py-1">
            <XCircle className="w-4 h-4" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const portfolioWithDetails = user.portfolio.map((holding) => {
    const asset = mockAssets.find((a) => a.id === holding.assetId);
    return { ...holding, asset };
  });

  const totalPortfolioValue = user.portfolio.reduce(
    (sum, h) => sum + h.unitsOwned * h.unitPrice,
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-border"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {getKycBadge(user.kycStatus)}
            </div>
            <p className="text-muted-foreground text-sm mb-3">User ID: {user.id}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-4 h-4 shrink-0" />
                <span>{user.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined {formatDate(user.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards - REMOVED per user request */}

      {/* Portfolio Holdings - REMOVED per user request */}

      {/* KYC Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Compliance & KYC Documents</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border bg-card p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Submitted Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'National Identity Card (Front)', size: '1.2 MB', status: 'verified' },
                  { name: 'National Identity Card (Back)', size: '0.9 MB', status: 'verified' },
                  { name: 'Proof of Address (Utility Bill)', size: '2.4 MB', status: 'pending' },
                  { name: 'Tax Compliance Certificate', size: '1.5 MB', status: 'pending' },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Image className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[150px]">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{doc.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <Eye className="w-3 h-3" /> View
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
               <h3 className="font-medium mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                Liveness Check Result
              </h3>
              <div className="flex items-center gap-4">
                 <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden border-2 border-green-500">
                    <img src={user.avatar} className="w-full h-full object-cover grayscale-[0.5]" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-green-500 flex items-center gap-1">
                       <CheckCircle className="w-4 h-4" /> 98% Identity Match
                    </p>
                    <p className="text-xs text-muted-foreground">Selfie-to-ID verification completed on March 25, 2024</p>
                 </div>
              </div>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div className="flex flex-col gap-4">
            <Card className="border-border bg-accent/5 p-6 border-accent/20">
              <h3 className="font-bold text-lg mb-2">Final Decision</h3>
              <p className="text-xs text-muted-foreground mb-6">Review the submitted documents carefully before making a decision.</p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Status</p>
                   {getKycBadge(userKycStatus)}
                </div>

                <div className="space-y-2">
                   <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11"
                    onClick={() => setUserKycStatus('verified')}
                    disabled={userKycStatus === 'verified'}
                   >
                     <CheckCircle className="w-4 h-4" /> Approve User
                   </Button>
                   <Button 
                    variant="outline" 
                    className="w-full gap-2 h-11 border-red-500/50 text-red-500 hover:bg-red-500/10"
                    onClick={() => setUserKycStatus('rejected')}
                    disabled={userKycStatus === 'rejected'}
                   >
                     <XCircle className="w-4 h-4" /> Reject Application
                   </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card">
               <h4 className="text-xs font-bold uppercase tracking-widest mb-3">Audit Log</h4>
               <div className="space-y-4">
                  {[
                    { action: 'KYC Submitted', date: 'Mar 24', time: '14:20' },
                    { action: 'Sanctions Check Cleared', date: 'Mar 25', time: '09:15' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                       <div className="w-2 h-2 rounded-full bg-muted mt-1 z-10 shrink-0" />
                       {i === 0 && <div className="absolute left-1 top-2 bottom-0 w-px bg-muted -ml-[0.5px]" />}
                       <div>
                          <p className="text-xs font-bold">{log.action}</p>
                          <p className="text-[10px] text-muted-foreground">{log.date} at {log.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
