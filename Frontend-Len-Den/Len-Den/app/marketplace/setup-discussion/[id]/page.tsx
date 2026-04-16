'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Plus
} from 'lucide-react';

export default function SetupDiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [formData, setFormData] = useState({
    discussionThreshold: '5',
    votingPeriod: '7',
    quorum: '40',
    initialProposal: '',
    sellerStake: 65,
  });

  const handleFinish = () => {
    alert('Governance Forum Activated! You can now manage it from your dashboard.');
    router.push(`/marketplace/manage/${assetId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/marketplace/listings')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Assets
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black">Configure Governance Forum</h1>
        <p className="text-muted-foreground">{assetId.toUpperCase()} has been created. Now set up your community interaction rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-border bg-card shadow-xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
             <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                   <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-foreground">Community Participation Rules</h3>
                      <p className="text-xs text-muted-foreground">Define who can participate in discussions and voting.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-bold">Participation Threshold (%)</label>
                      <span className="text-xs font-bold text-accent">{formData.discussionThreshold}%</span>
                    </div>
                    <Input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={formData.discussionThreshold}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, discussionThreshold: e.target.value})}
                      className="accent-accent"
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Minimum ownership percentage required to create proposals or comment. 
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold">Quorum Requirements (%)</label>
                    <Input 
                      type="number" 
                      value={formData.quorum}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, quorum: e.target.value})}
                      placeholder="e.g. 40"
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Percentage of total units required to participate for a vote to be valid.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Initial Governance Proposal (Optional)</label>
                  <Textarea 
                    className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                    placeholder="e.g. Setting up the first year maintenance budget framework..."
                    value={formData.initialProposal}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, initialProposal: e.target.value})}
                  />
                  <p className="text-[10px] text-muted-foreground">Launching an initial proposal helps engage your first investors immediately.</p>
                </div>
             </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push(`/marketplace/manage/${assetId}`)}>Skip for Now</Button>
            <Button className="bg-accent hover:bg-accent/90 px-10 gap-2" onClick={handleFinish}>
              <CheckCircle className="w-4 h-4" />
              Activate Forum
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-muted/40 border-border">
             <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">Initial Eligibility</h4>
             <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">You (Seller)</span>
                      <span className="text-[10px] font-mono bg-accent/10 px-1.5 py-0.5 rounded text-accent">{formData.sellerStake.toFixed(2)}%</span>
                   </div>
                   <Input 
                      type="range" 
                      min="1" 
                      max="100" 
                      step="0.01"
                      value={formData.sellerStake}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, sellerStake: parseFloat(e.target.value)})}
                      className="accent-accent h-1.5"
                   />
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center opacity-70">
                      <span className="text-xs font-bold text-muted-foreground">Investors (Unsold)</span>
                      <span className="text-[10px] font-mono bg-muted-foreground/10 px-1.5 py-0.5 rounded text-muted-foreground">{(100 - formData.sellerStake).toFixed(2)}%</span>
                   </div>
                   <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-muted-foreground/30 transition-all" style={{ width: `${100 - formData.sellerStake}%` }} />
                   </div>
                </div>

                <p className="text-[10px] text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
                  Adjusting your seller stake determines your voting power once the forum is activated.
                </p>
             </div>
          </Card>

          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
             <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
             <div className="space-y-1">
                <p className="text-xs font-bold text-blue-900">Platform Standards</p>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  LenDen recommends a 10% threshold for stable governance. Too low can lead to spam, too high may stifle community voice.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
