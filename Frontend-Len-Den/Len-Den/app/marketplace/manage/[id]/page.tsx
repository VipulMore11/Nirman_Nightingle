'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockAssets } from '@/lib/data/mockAssets';
import { currentUser } from '@/lib/data/mockUsers';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Settings,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Plus,
  BarChart3,
  Search,
  Download,
  FileText,
  DollarSign,
  Briefcase,
  History,
  Lock,
} from 'lucide-react';

/* ── Asset Management Page ── */
export default function ManageAssetPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;
  let asset = mockAssets.find(a => a.id === assetId);

  // Fallback for newly created demo assets that aren't in the static mockAssets list
  if (!asset && assetId.startsWith('asset-')) {
    asset = {
      ...mockAssets[0],
      id: assetId,
      name: `New Asset ${assetId.split('-')[1]}`,
      totalValue: 1000000,
      totalUnits: 10000,
      unitsAvailable: 10000,
    };
  }

  const [activeTab, setActiveTab] = useState<'discussion' | 'holders' | 'settings'>('discussion');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: 'Monthly Maintenance Fee Adjustment',
      status: 'VOTING',
      votesYes: 45.2,
      votesNo: 12.8,
      quorum: 40,
      endsIn: '2 days',
      comments: 18,
    },
    {
      id: 2,
      title: 'Approve FY25 Security Contract',
      status: 'PASSED',
      votesYes: 82.0,
      votesNo: 2.1,
      quorum: 40,
      endsIn: 'Completed',
      comments: 5,
    },
  ]);

  if (!asset) {
    return (
      <div className="p-8 text-center">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <p>Asset not found</p>
      </div>
    );
  }

  const handleCreateProposal = (title: string, desc: string) => {
    const newProp = {
      id: proposals.length + 1,
      title,
      status: 'VOTING',
      votesYes: 0,
      votesNo: 0,
      quorum: 40,
      endsIn: '7 days',
      comments: 0,
    };
    setProposals([newProp, ...proposals]);
    setShowProposalModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Modals */}
      {showProposalModal && (
        <CreateProposalModal 
          onClose={() => setShowProposalModal(false)} 
          onSubmit={handleCreateProposal} 
        />
      )}
      
      {showSettingsModal && (
        <AssetSettingsModal 
          asset={asset} 
          onClose={() => setShowSettingsModal(false)} 
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 gap-1">
              <ArrowLeft className="w-4 h-4" /> Marketplace
            </Button>
            <span>/</span>
            <span className="font-medium text-foreground">Manage Asset</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{asset.name}</h1>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="bg-accent/5">{asset.category.toUpperCase()}</Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <History className="w-4 h-4" />
              Listed on Jan 12, 2024
            </div>
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <CheckCircle className="w-4 h-4" />
              Active Listing
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => alert('Exporting data to CSV...')}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button className="gap-2 bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4" />
            Asset Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: formatCurrency(asset.totalValue), icon: DollarSign, color: 'text-accent' },
          { label: 'Capital Raised', value: formatCurrency(asset.totalValue * 0.72), icon: TrendingUp, color: 'text-green-500' },
          { label: 'Unique Holders', value: '142', icon: Users, color: 'text-blue-500' },
          { label: 'Active Proposals', value: proposals.filter(p => p.status === 'VOTING').length.toString(), icon: MessageSquare, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-border bg-card hover:border-accent/30 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 border-r border-border pr-6 space-y-2">
          {[
            { id: 'discussion', label: 'Governance Forum', icon: MessageSquare },
            { id: 'holders', label: 'Asset Holders', icon: Users },
            { id: 'settings', label: 'Listing Details', icon: Briefcase },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}

          <div className="mt-8 p-6 rounded-2xl bg-muted/40 border border-border">
            <h4 className="text-xs font-black uppercase mb-4 text-muted-foreground tracking-widest">Listing Health</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span>Funding Progress</span>
                  <span className="text-accent">72%</span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[72%]" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Your asset is trending well. 28% units remaining for public subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'discussion' && (
            <SellerDiscussionView 
              assetTitle={asset.name} 
              proposals={proposals} 
              onCreateClick={() => setShowProposalModal(true)} 
            />
          )}
          {activeTab === 'holders' && <AssetHoldersView totalUnits={asset.totalUnits} />}
          {activeTab === 'settings' && <ListingDetailsView asset={asset} />}
        </div>
      </div>
    </div>
  );
}

/* ── Modal: Create Proposal ── */
function CreateProposalModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (t: string, d: string) => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 shadow-2xl border-accent/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Governance Proposal</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><XCircle className="w-5 h-5" /></Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Proposal Title</label>
            <Input placeholder="e.g. Upgrade Lobby Security" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Detailed Description</label>
            <textarea 
              className="w-full h-32 rounded-lg border border-border bg-background p-3 text-sm focus:ring-2 focus:ring-accent outline-none" 
              placeholder="What changes are you proposing and why?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={() => onSubmit(title, desc)} disabled={!title || !desc}>Create & Launch</Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Modal: Asset Settings ── */
function AssetSettingsModal({ asset, onClose }: { asset: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl border-border">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Asset Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><XCircle className="w-5 h-5" /></Button>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Visibility</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
              <span className="text-sm font-bold">Marketplace Listing</span>
              <Badge className="bg-green-500">Live</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Liquidity</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
              <span className="text-sm font-bold">Secondary Trading</span>
              <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold">Pause Trading</Button>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Compliance</h3>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs">
              <Shield className="w-4 h-4 shrink-0" />
              <span>KYC enforcement is active for all new subscribers to this asset.</span>
            </div>
          </div>
          <Button className="w-full bg-foreground text-background" onClick={onClose}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}

/* ── Subcomponent: Listing Details View ── */
function ListingDetailsView({ asset }: { asset: any }) {
  const [data, setData] = useState({ ...asset });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black">Listing Details</h2>
        <p className="text-sm text-muted-foreground">Manage the public information shown on the marketplace</p>
      </div>

      <Card className="p-8 border-border bg-card shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Asset Name</label>
            <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Location</label>
            <Input value={data.location} onChange={e => setData({...data, location: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price Per Unit ($)</label>
            <Input type="number" value={data.pricePerUnit} onChange={e => setData({...data, pricePerUnit: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target ROI (%)</label>
            <Input type="number" value={data.expectedAnnualROI} onChange={e => setData({...data, expectedAnnualROI: Number(e.target.value)})} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Market Description</label>
          <Textarea 
            className="w-full h-40 rounded-xl border border-border bg-background p-4 text-sm focus:ring-2 focus:ring-accent outline-none"
            value="This prime real estate asset offers stable long-term yields through established corporate leases. Located in the heart of the business district, the Mumbai Tech Park is a premium office complex serving major international firms. Recent structural upgrades and green building certifications ensure future-proof value."
            onChange={() => {}}
          />
        </div>
        <div className="flex gap-3">
          <Button className="bg-accent hover:bg-accent/90" onClick={() => alert('Listing updated successfully!')}>Update Marketplace Info</Button>
          <Button variant="outline">Discard Changes</Button>
        </div>
      </Card>

      <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-orange-800">Review Required</p>
          <p className="text-xs text-orange-700 leading-relaxed">Changes to Name or Category require a quick re-verification by the platform compliance team. Other edits go live immediately.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Subcomponent: Discussion View ── */
function SellerDiscussionView({ assetTitle, proposals, onCreateClick }: { assetTitle: string; proposals: any[]; onCreateClick: () => void }) {
  const [activeProposalId, setActiveProposalId] = useState<number | null>(null);
  const [showVoters, setShowVoters] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const activeProposal = proposals.find(p => p.id === activeProposalId) || proposals[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black">Governance Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage voting proposals and community discussions for {assetTitle}</p>
        </div>
        <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-xl transition-transform hover:scale-105" onClick={onCreateClick}>
          <Plus className="w-4 h-4" />
          Create Proposal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {proposals.map((p) => (
          <Card key={p.id} className="p-6 border-border bg-card hover:border-accent/10 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1 h-full ${p.status === 'PASSED' ? 'bg-green-500' : 'bg-accent'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex gap-2 mb-2">
                  <Badge className={`rounded ${p.status === 'VOTING' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {p.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">ID: #PROP-00{p.id}</span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-accent transition-colors">{p.title}</h3>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Ends in</span>
                <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg bg-muted text-foreground">
                  <Clock className="w-3 h-3" />
                  {p.endsIn}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-green-600">YES ({p.votesYes}%)</span>
                  <span className="text-red-500">NO ({p.votesNo}%)</span>
                </div>
                <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden flex cursor-pointer" onClick={() => { setActiveProposalId(p.id); setShowVoters(true); }}>
                  <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(p.votesYes / (p.votesYes + p.votesNo || 1)) * 100}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-black">
                  <div className="flex gap-4">
                    <span>Quorum: {p.quorum}%</span>
                    <button onClick={() => { setActiveProposalId(p.id); setShowVoters(true); }} className="hover:text-accent transition-colors underline decoration-dotted">View Voter List</button>
                  </div>
                  <span className={p.votesYes + p.votesNo >= p.quorum ? 'text-green-600' : ''}>
                    Current: {(p.votesYes + p.votesNo).toFixed(1)}% {p.votesYes + p.votesNo >= p.quorum ? ' (Reached)' : ''}
                  </span>
                </div>
              </div>

              {p.status === 'VOTING' && (
                <div className="flex gap-2 py-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 font-bold" onClick={() => alert('Voted YES on-chain!')}>Vote YES</Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 font-bold" onClick={() => alert('Voted NO on-chain!')}>Vote NO</Button>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-border mt-4">
                <button 
                  onClick={() => { setActiveProposalId(p.id); setShowComments(true); }}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-accent transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {p.comments} Comments
                </button>
                <button 
                  onClick={() => { setActiveProposalId(p.id); setShowBroadcast(true); }}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-accent transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Broadcast Update
                </button>
                <button 
                  onClick={() => { setActiveProposalId(p.id); setShowAnalytics(true); }}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-accent transition-colors ml-auto"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Governance Modals */}
      {showVoters && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Voters: {activeProposal?.title}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowVoters(false)}><XCircle className="w-5 h-5" /></Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {[
                { name: 'Rajesh Kumar', stake: '65.0%', vote: 'YES', time: '12m ago' },
                { name: 'Sarah Chen', stake: '8.2%', vote: 'YES', time: '1h ago' },
                { name: 'James Morrison', stake: '5.1%', vote: 'NO', time: '2h ago' },
                { name: 'Unknown Holder', stake: '0.5%', vote: 'NO', time: '4h ago' },
              ].map((v, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold">{v.name[0]}</div>
                    <div>
                      <p className="text-sm font-bold">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">Stake: {v.stake}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={v.vote === 'YES' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{v.vote}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">{v.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6" variant="outline" onClick={() => setShowVoters(false)}>Close</Button>
          </Card>
        </div>
      )}

      {showComments && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-2xl p-6 shadow-2xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Discussions ({activeProposal?.comments})
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowComments(false)}><XCircle className="w-5 h-5" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-3 mb-6 custom-scrollbar">
              {[
                { user: 'Sarah Chen', role: 'Architect', text: 'Does this Maintenance fee cover the solar panel repairs? If so, I am in support.', time: '2h ago', votes: 5 },
                { user: 'James Morrison', role: 'Tenant Rep', text: 'I think the increase is too high given current market rates. Can we optimize vendor contracts first?', time: '4h ago', votes: -2 },
                { user: 'Admin Rajesh', role: 'Seller', text: 'Yes Sarah, it includes the full PV array maintenance for 2024.', time: '1h ago', votes: 12 },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2 ml-if-reply">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">{c.user}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-accent/5">{c.role}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-3">
                    <button className="text-[10px] font-bold text-muted-foreground hover:text-green-500">Upvote</button>
                    <span className="text-[10px] font-bold">{c.votes}</span>
                    <button className="text-[10px] font-bold text-muted-foreground hover:text-red-500">Downvote</button>
                    <button className="text-[10px] font-bold text-muted-foreground ml-auto hover:text-accent">Reply</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <Textarea placeholder="Write a comment..." className="min-h-[80px] bg-muted/20" />
              <div className="flex justify-between items-center">
                 <p className="text-[10px] text-muted-foreground">Posting as <span className="font-bold text-foreground">Rajesh Kumar</span></p>
                 <Button size="sm" className="bg-accent" onClick={() => alert('Comment posted!')}>Post Comment</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showBroadcast && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Send className="w-5 h-5 text-accent" />
                Broadcast Update
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowBroadcast(false)}><XCircle className="w-5 h-5" /></Button>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Active Proposal</h4>
                <p className="text-sm font-bold">{activeProposal?.title}</p>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Update Content</label>
                <Textarea placeholder="Provide additional context or respond to current voting trends..." className="min-h-[120px]" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" id="email" className="rounded border-border text-accent" />
                  <label htmlFor="email">Also send as email notification to all holders</label>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20">
                 <h5 className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Previous Broadcasts</h5>
                 <p className="text-[10px] italic text-muted-foreground">No updates broadcasted for this proposal yet.</p>
              </div>
              <Button className="w-full bg-accent" onClick={() => { alert('Update broadcasted successfully!'); setShowBroadcast(false); }}>Send to all Holders</Button>
            </div>
          </Card>
        </div>
      )}

      {showAnalytics && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-2xl p-6 shadow-2xl h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Voting Analytics
                </h2>
                <p className="text-xs text-muted-foreground">ID: #PROP-00{activeProposal?.id} | {activeProposal?.status}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAnalytics(false)}><XCircle className="w-5 h-5" /></Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 rounded-2xl border border-border bg-card shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Total Participation</p>
                  <p className="text-3xl font-black">{(activeProposal?.votesYes + activeProposal?.votesNo).toFixed(1)}%</p>
               </div>
               <div className="p-4 rounded-2xl border border-border bg-card shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Approval Rating</p>
                  <p className="text-3xl font-black text-green-500">{((activeProposal?.votesYes / (activeProposal?.votesYes + activeProposal?.votesNo || 1)) * 100).toFixed(1)}%</p>
               </div>
            </div>

            <div className="flex-1 bg-muted/20 rounded-2xl border border-border p-6 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-2 right-2 text-[10px] text-muted-foreground font-mono">Live Timeline Data</div>
               {/* Simulating a chart with CSS bars */}
               <div className="flex items-end gap-3 w-full h-40">
                  {[30, 45, 20, 60, 80, 55, 90, 70, 40].map((h, i) => (
                    <div key={i} className="flex-1 bg-accent/20 hover:bg-accent transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
               </div>
               <div className="w-full h-px bg-border my-2" />
               <div className="flex justify-between w-full text-[10px] text-muted-foreground font-black px-1 uppercase tracking-widest">
                  <span>Day 1</span>
                  <span>Day 3</span>
                  <span>Day 5</span>
                  <span>Day 7</span>
               </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-xs font-bold text-muted-foreground">Voter Participation</span>
               </div>
               <p className="text-xs text-muted-foreground text-right italic leading-relaxed">Voting activity peaked 2 hours after your last broadcast.</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── Subcomponent: Asset Holders View ── */
function AssetHoldersView({ totalUnits }: { totalUnits: number }) {
  const [searchTerm, setSearchTerm] = useState('');

  const holders = [
    { name: 'Rajesh Kumar (You)', email: 'rajesh@example.com', units: totalUnits * 0.65, address: '0x1A2...3B4', isSeller: true },
    { name: 'Sarah Chen', email: 'sarah@example.com', units: totalUnits * 0.08, address: '0xDE1...349', isSeller: false },
    { name: 'James Morrison', email: 'james@example.com', units: totalUnits * 0.05, address: '0x7B8...9C0', isSeller: false },
    { name: 'Elena Petrova', email: 'elena@example.com', units: totalUnits * 0.03, address: '0x4F4...1A2', isSeller: false },
    { name: 'David Smith', email: 'david@example.com', units: totalUnits * 0.02, address: '0x333...444', isSeller: false },
  ];

  const filteredHolders = holders.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black">Fractional Owners</h2>
          <p className="text-sm text-muted-foreground">Monitor and communicate with share holders.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search holders..." 
            className="pl-10 w-64 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border bg-card overflow-hidden rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {['Holder Account', 'Ownership Share', 'Governance Weight', 'Last Active', ''].map(h => (
                  <th key={h} className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHolders.map((holder, i) => {
                const stake = (holder.units / totalUnits) * 100;
                return (
                  <tr key={i} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${holder.isSeller ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                          {holder.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-1.5">
                            {holder.name}
                            {holder.isSeller && <Lock className="w-3 h-3 text-accent" />}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{holder.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-black text-foreground">{stake.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">{Math.floor(holder.units).toLocaleString()} units</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {stake >= 5 ? (
                          <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                            <CheckCircle className="w-3 h-3" /> Enabled
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground font-bold text-xs">
                            <AlertTriangle className="w-3 h-3" /> View Only
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-muted-foreground font-medium">
                      Just now
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity font-bold" onClick={() => alert(`Opening secure chat with ${holder.name}...`)}>
                        Message
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30 border border-border rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold">Initial Eligibility List Report</h3>
        </div>
        <div className="p-4 bg-background rounded-xl border border-border">
          <p className="text-xs text-muted-foreground mb-4">Final breakdown of participants eligible for the initial governance voting round.</p>
          <div className="space-y-2">
            {[
              { label: 'Eligible Voters', value: '4' },
              { label: 'Non-Voting Holders', value: '138' },
              { label: 'Total Voting Power', value: '82.0%' },
              { label: 'Platform Stake', value: '18.0%' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="flex gap-4 mt-8">
        <Card className="flex-1 p-6 bg-accent/5 border border-accent/20 rounded-3xl">
          <h4 className="font-black text-sm mb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-accent" />
            Bulk Communication
          </h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Send an emergency announcement or official document to ALL current share holders via platform notifications and email.</p>
          <Button className="w-full bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl" onClick={() => alert('Sending bulk notification to all holders...')}>Notify All Holders</Button>
        </Card>

        <Card className="flex-1 p-6 bg-foreground/5 border border-foreground/10 rounded-3xl">
          <h4 className="font-black text-sm mb-2 flex items-center gap-2 text-foreground">
            <FileText className="w-4 h-4" />
            Holder Audit Log
          </h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Download a full timestamped report of all secondary market transactions and current ownership percentages for your legal records.</p>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => alert('Generating audit report...')}>Download Audit Report (PDF)</Button>
        </Card>
      </div>
    </div>
  );
}
