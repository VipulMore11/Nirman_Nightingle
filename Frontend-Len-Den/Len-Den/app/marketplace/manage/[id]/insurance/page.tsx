'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  AlertCircle,
  TrendingUp,
  IndianRupee,
  FileText,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { mockAssets } from '@/lib/data/mockAssets';

export default function InsurancePage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;
  const asset = mockAssets.find(a => a.id === assetId) || mockAssets[0];

  const [status, setStatus] = useState<'active' | 'inactive' | 'claimed'>('active');
  const [isClaiming, setIsClaiming] = useState(false);

  const totalValue = asset.totalValue; // For demo, assuming user owns total or a high stake
  const premium = totalValue * 0.02;
  const coverage = totalValue * 10;

  const handleClaim = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setStatus('claimed');
      setIsClaiming(false);
      alert('Insurance claim submitted successfully! Our agents will contact you within 24 hours.');
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/marketplace/manage/${assetId}`)} className="-ml-3 gap-1">
              <ArrowLeft className="w-4 h-4" /> Manage Asset
            </Button>
            <span>/</span>
            <span className="font-medium text-foreground">Insurance</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             <Shield className="w-10 h-10 text-accent" />
             Protection & Insurance
          </h1>
          <p className="text-muted-foreground">Manage comprehensive coverage for {asset.name}</p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => window.open('https://www.onsurity.com/plus/asset-insurance/', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Provider Portal
          </Button>
          {status === 'active' && (
            <Button 
              className="gap-2 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
              onClick={handleClaim}
              disabled={isClaiming}
            >
              <ShieldAlert className="w-4 h-4" />
              {isClaiming ? 'Processing...' : 'File a Claim'}
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-accent/5 rounded-full transition-all group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Insurance Status</span>
            {status === 'active' ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">ACTIVE</Badge>
            ) : status === 'claimed' ? (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">CLAIM UNDER REVIEW</Badge>
            ) : (
                <Badge className="bg-muted text-muted-foreground hover:bg-muted">INACTIVE</Badge>
            )}
          </div>
          <p className="text-3xl font-black">{status === 'active' ? 'Full Coverage' : status === 'claimed' ? 'Claim Filed' : 'No Active Plan'}</p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Renewed on Jan 01, 2024
          </p>
        </Card>

        <Card className="p-6 border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-green-500/5 rounded-full transition-all group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Premium Paid</span>
            <IndianRupee className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-black">₹{premium.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Annual recurring premium</p>
        </Card>

        <Card className="p-6 border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-500/5 rounded-full transition-all group-hover:scale-110" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Coverage Amount</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black">₹{coverage.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Up to 10x asset valuation</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Detailed Information */}
           <Card className="p-8 border-border bg-card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Coverage Analysis
              </h3>
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <h4 className="text-sm font-bold mb-2">Policy Highlights</h4>
                  <ul className="space-y-3">
                    {[
                      'Natural disaster and environmental damage protection',
                      'Liability coverage for on-site incidents',
                      'Income protection against occupancy shortfalls',
                      'Legal expenses for title disputes or encroachments',
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent translate-y-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Premium Logic</p>
                    <p className="text-sm font-bold">2.00% of Asset Market Value</p>
                    <p className="text-[10px] text-muted-foreground italic">Calculated dynamically based on real-time trade data.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Claim Multiplier</p>
                    <p className="text-sm font-bold">10.0x Maximum Coverage</p>
                    <p className="text-[10px] text-muted-foreground italic">Ensures recovery of initial investment and projected growth.</p>
                  </div>
                </div>
              </div>
           </Card>

           {/* Shareholder Protection */}
           <Card className="p-8 border-border bg-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Shareholder Benefit Distribution
                </h3>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">PRO-RATA BASIS</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                In the event of a total loss or significant claim settlement, the insurance payout is distributed automatically to all token holders according to their verified ownership stake on the ledger.
              </p>
              
              <div className="space-y-3">
                {[
                  { name: 'Rajesh Kumar (Seller)', stake: '65%', potential: (coverage * 0.65).toLocaleString() },
                  { name: 'Sarah Chen', stake: '8.2%', potential: (coverage * 0.082).toLocaleString() },
                  { name: 'James Morrison', stake: '5.1%', potential: (coverage * 0.051).toLocaleString() },
                  { name: 'Public Investors', stake: '21.7%', potential: (coverage * 0.217).toLocaleString() },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-border bg-muted/20 hover:bg-indigo-50/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{s.name[0]}</div>
                      <span className="text-sm font-bold">{s.name}</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">Claim Payout Share</p>
                       <p className="text-sm font-black text-indigo-900">₹{s.potential} <span className="text-[10px] text-indigo-600/70">({s.stake})</span></p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3">
                 <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                 <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                   Payouts are processed via smart contract escrow. Once a claim is approved by the insurer, the recovery amount is locked and then streamed to verified wallet addresses.
                 </p>
              </div>
           </Card>

           {/* Provider Info */}
           <Card className="p-8 border-border bg-card flex flex-col md:flex-row gap-6 items-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                 <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-lg font-bold">Official Partner: Onsurity Plus</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Protecting your digital real-estate assets with global insurance standards. Onsurity provides automated claim processing and 24/7 incident support for all LenDen listed assets.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
                      <CheckCircle2 className="w-3 h-3" /> ISO 27001 Verified
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
                      <CheckCircle2 className="w-3 h-3" /> Global Reinsurance Backing
                   </div>
                </div>
              </div>
              <Button 
                className="bg-accent hover:bg-accent/90 shrink-0"
                onClick={() => window.open('https://www.onsurity.com/plus/asset-insurance/', '_blank')}
              >
                Visit Site
              </Button>
           </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
           {/* Recent Activity */}
           <Card className="p-6 border-border bg-card">
              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-6">Recent Activity</h4>
              <div className="space-y-6">
                {[
                  { type: 'POLICY_RENEWED', date: 'Jan 12, 2024', label: 'Policy Auto-Renewed', desc: 'Premium of $2,450 deducted' },
                  { type: 'COVERAGE_INCREASED', date: 'Dec 05, 2023', label: 'Coverage Adjusted', desc: 'Increased due to 15% value gain' },
                  { type: 'CLAIM_SETTLED', date: 'Aug 20, 2023', label: 'Verification Complete', desc: 'Asset document audit successful' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 2 && <div className="absolute left-[11px] top-6 w-0.5 h-10 bg-border" />}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      act.type === 'POLICY_RENEWED' ? 'bg-green-100 text-green-600' :
                      act.type === 'COVERAGE_INCREASED' ? 'bg-blue-100 text-blue-600' : 'bg-accent/10 text-accent'
                    }`}>
                       <Clock className="w-3 h-3" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold">{act.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{act.desc}</p>
                      <p className="text-[10px] text-muted-foreground/60">{act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>

           <div className="p-6 rounded-2xl bg-accent/[0.03] border border-accent/20 space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Risk Notice</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Insurance premiums are adjusted monthly based on the asset's floor price in the marketplace. Ensure timely payments to avoid coverage gaps.
              </p>
              <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-accent hover:no-underline">
                Read Terms of Service →
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
