'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAssets } from '@/lib/data/mockAssets';
import { currentUser } from '@/lib/data/mockUsers';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  Calendar,
  MapPin,
  FileText,
  Download,
  AlertCircle,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BarChart3,
  Layers,
  CheckCircle,
  Clock,
  IndianRupee,
  Building2,
  Users,
  Award,
  MessageSquare,
  Stamp,
  Home,
  ShieldCheck,
  Percent,
} from 'lucide-react';

/* ── Photo sets ── */
const CATEGORY_PHOTOS: Record<string, string[]> = {
  'real-estate': [
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
    'https://images.unsplash.com/photo-1554220688-f4e85cb7f7a0?w=1200&q=80',
  ],
  gold: [
    'https://images.unsplash.com/photo-1610375461369-d613b564f4c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=1200&q=80',
  ],
  art: [
    'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=1200&q=80',
    'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80',
  ],
  startup: [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
  ],
  commodities: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80',
  ],
};

/* ── Lightbox ── */
function PhotoLightbox({ photos, startIndex, onClose }: { photos: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={onClose}><X className="w-8 h-8" /></button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">{idx + 1} / {photos.length}</div>
      <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft className="w-6 h-6" /></button>
      <img src={photos[idx]} alt="" className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight className="w-6 h-6" /></button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((p, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} className={`w-14 h-10 rounded overflow-hidden border-2 transition-all ${i === idx ? 'border-white' : 'border-transparent opacity-50'}`}>
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Certificate ── */
function HoldingCertificate({ holder, asset, units, value, certId }: {
  holder: string;
  asset: string;
  units: number;
  value: number;
  certId: string;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
      {/* watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="text-[120px] font-black tracking-widest rotate-[-20deg]">LENDEN</span>
      </div>

      {/* top bar */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs text-accent/80 uppercase tracking-[0.3em] mb-1">Certificate of Ownership</p>
          <p className="text-2xl font-bold">LenDen Platform</p>
        </div>
        <div className="text-right">
          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center ml-auto mb-2">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-400">Cert ID</p>
          <p className="text-xs font-mono text-accent">{certId}</p>
        </div>
      </div>

      {/* body */}
      <div className="space-y-5">
        <p className="text-slate-300 text-sm leading-relaxed">
          This certifies that the holder named below owns fractional units of the listed asset on the LenDen marketplace, governed by blockchain-backed LLC equity tokens.
        </p>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Holder Name</p>
            <p className="font-semibold text-lg">{holder}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Asset</p>
            <p className="font-semibold text-lg">{asset}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Units Held</p>
            <p className="font-semibold text-lg text-accent">{units.toLocaleString()} units</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Value</p>
            <p className="font-semibold text-lg text-green-400">{formatCurrency(value)}</p>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Verification Status</p>
              <p className="text-sm font-semibold text-green-400">Blockchain Verified ✓</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-accent" />
            <div className="text-right">
              <p className="text-xs text-slate-400">Issued by</p>
              <p className="text-sm font-semibold">LenDen™</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = 'details' | 'financials' | 'documents' | 'market';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'details',    label: 'Details',    icon: Home },
  { id: 'financials', label: 'Financials', icon: IndianRupee },
  { id: 'documents',  label: 'Documents',  icon: FileText },
  { id: 'market',     label: 'Market',     icon: BarChart3 },
];

export default function HoldingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.assetId as string;

  const asset = mockAssets.find((a) => a.id === assetId);
  const holding = currentUser.portfolio.find((h) => h.assetId === assetId);

  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ idx: number; value: number; x: number } | null>(null);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!asset || !holding) {
    return (
      <div className="p-8 text-center">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio
        </Button>
        <p className="text-muted-foreground">Holding not found</p>
      </div>
    );
  }

  const photos = CATEGORY_PHOTOS[asset.category] ?? CATEGORY_PHOTOS['real-estate'];
  const [heroPhoto, ...restPhotos] = photos;
  const currentValue = holding.unitsOwned * holding.unitPrice;
  const certId = `CERT-${assetId.toUpperCase()}-${currentUser.id.toUpperCase()}-2024`;

  const handleDownloadCertificate = () => {
    setIsDownloading(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      const headers = ['Certificate ID', 'Holder', 'Asset', 'Units', 'Value', 'Date'];
      const data = [certId, currentUser.name, asset.name, holding.unitsOwned, formatCurrency(currentValue), new Date().toLocaleDateString()];
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + data.join(",");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LenDen_Certificate_${asset.name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
      alert("Ownership Certificate generated and downloaded successfully as PDF (simulated).");
    }, 1500);
  };

  const handleVerifyBlockchain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert(`Blockchain Verification Successful!\n\nTransaction Hash: 0x${Math.random().toString(16).substring(2, 42)}\nNetwork: Polygon Mainnet\nStatus: Finalized`);
    }, 2000);
  };

  /* ── Render ── */
  return (
    <>
      {lightboxIndex !== null && (
        <PhotoLightbox photos={photos} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">

        {/* Back */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Button>

        {/* ── Photo Gallery ── */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px] rounded-2xl overflow-hidden mb-3">
          <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => setLightboxIndex(0)}>
            <img src={heroPhoto} alt="Main" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          {restPhotos.slice(0, 4).map((p, i) => (
            <div key={i} className="relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(i + 1)}>
              <img src={p} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
            </div>
          ))}
        </div>

        {/* View all photos pill */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLightboxIndex(0)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            View all {photos.length} photos
          </button>

          {/* Discussion button */}
          <Link href={`/portfolio/holdings/${assetId}/discussion`}>
            <Button className="gap-2 bg-accent hover:bg-accent/90">
              <MessageSquare className="w-4 h-4" />
              Discussion
            </Button>
          </Link>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize text-xs">{asset.category}</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs gap-1">
                  <CheckCircle className="w-3 h-3" /> You Hold This Asset
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{asset.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                {asset.location}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5 p-4 rounded-xl bg-card border border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Your Units</p>
                  <p className="text-lg font-bold text-accent">{holding.unitsOwned.toLocaleString()}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                  <p className="text-lg font-bold">{formatCurrency(currentValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ownership %</p>
                  <p className="text-lg font-bold text-green-600">
                    {((holding.unitsOwned / asset.totalUnits) * 100).toFixed(3)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Attribute chips */}
            <div className="flex flex-wrap gap-3 relative">
              {[
                { 
                  id: 'category',
                  icon: Building2, 
                  label: asset.category === 'real-estate' ? 'Real Estate' : asset.category,
                  detail: `This asset is categorized as ${asset.category}. Assets in this category typically offer ${asset.category === 'real-estate' ? 'stable rental yields and long-term capital appreciation' : asset.category === 'gold' ? 'wealth preservation and inflation hedging' : 'high growth potential with varying risk profiles'}.`
                },
                { 
                  id: 'units',
                  icon: Users, 
                  label: `${asset.unitsAvailable.toLocaleString()} units available`,
                  detail: `Total Supply: ${asset.totalUnits.toLocaleString()} units. Currently, ${asset.unitsAvailable.toLocaleString()} units remain available for secondary participants. This represents ${(asset.unitsAvailable/asset.totalUnits * 100).toFixed(1)}% of total liquidity.`
                },
                { 
                  id: 'dividends',
                  icon: Calendar, 
                  label: `${asset.dividendFrequency} dividends`,
                  detail: `Historical Payouts (Est. per unit):\nQ1: ₹12.50\nQ2: ₹14.00\nQ3: ₹11.80\nQ4: ₹13.20\n\nNext Payout Scheduled: ${asset.nextDividendDate}`
                },
                { 
                  id: 'risk',
                  icon: Shield, 
                  label: `Risk ${asset.riskScore}/10`,
                  detail: `Risk Profile: ${asset.riskScore <= 3 ? 'Conservative' : asset.riskScore <= 6 ? 'Moderate' : 'Aggressive'}\n\nFactors:\n• Market Volatility: Low\n• Liquidity Risk: Minimal\n• Regulatory Compliance: Audited\n• Asset Backing: 1:1 Physical`
                },
              ].map(chip => (
                <div 
                  key={chip.id} 
                  className="relative group"
                  onMouseEnter={() => setHoveredChip(chip.id)}
                  onMouseLeave={() => setHoveredChip(null)}
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-medium cursor-help transition-colors hover:border-accent">
                    <chip.icon className="w-4 h-4 text-muted-foreground" />
                    <span>{chip.label}</span>
                  </div>
                  {hoveredChip === chip.id && (
                    <div className="absolute top-full left-0 mt-2 w-64 z-20 bg-slate-900 text-white p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-700">
                      <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{chip.label}</p>
                      <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{chip.detail}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Tabs ── */}
            <div className="border-b border-border">
              <div className="flex gap-0 overflow-x-auto">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Details ── */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <Card className="p-6 border-border bg-card">
                  <h2 className="text-xl font-bold mb-4">About This Asset</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>{asset.description_long}</p>
                    <p>
                      The {asset.name} represents a flagship investment opportunity within the {asset.category} sector. Managed by institutional-grade operators with a 15+ year track record, the asset has undergone rigorous 3rd-party appraisal and legal audit to ensure absolute transparency and compliance for fractional holders.
                    </p>
                    <p>
                      Strategically located in {asset.location}, this asset benefits from robust local economic drivers. For real estate, this includes the high-tech infrastructure and proximity to metro hubs; for commodities and startups, this reflects the underlying operational excellence and market demand scalability.
                    </p>
                  </div>
                </Card>

                <Card className="p-6 border-border bg-card">
                  <h2 className="text-xl font-bold mb-4">Offering Details</h2>
                  <ul className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    {[
                      {
                        title: 'Blockchain Legal Structure',
                        text: `The asset title is held by a Special Purpose Vehicle (SPV) registered as a compliant LLC. Your fractional units are encoded as ERC-20 equity tokens on a secure blockchain, granting you proportional rights to cash flows and capital gains.`
                      },
                      {
                        title: 'Income Distribution',
                        text: `Dividends are distributed ${asset.dividendFrequency} in accordance with the underlying lease or revenue agreements. Payouts are automated via audited smart contracts and reflected in your Len-Den wallet instantly.`
                      },
                      {
                        title: 'Oversight & Governance',
                        text: `Holders participate in key governance decisions through the integrated discussion forum. This includes voting on major maintenance, selling the underlying asset at a target price, or switching management providers.`
                      },
                      {
                        title: 'Exit Liquidity',
                        text: `Len-Den provides a 24/7 secondary marketplace where you can list your units for sale. There are no lock-in periods, though holding for 3-5 years is recommended for maximum capital appreciation.`
                      },
                      {
                        title: 'Compliance & Tax',
                        text: `This offering is fully compliant with regional securities laws. All fractional holders receive an annual K-1 or equivalent tax statement summarizing their share of income and expenses.`
                      }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">{item.title}</p>
                          <p className="text-slate-500">{item.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Expected ROI', value: formatPercent(asset.expectedAnnualROI), icon: TrendingUp, color: 'green' },
                    { label: 'Risk Score', value: `${asset.riskScore}/10`, icon: Shield, color: 'blue' },
                    { label: 'Dividend Frequency', value: asset.dividendFrequency, icon: Calendar, color: 'purple' },
                    { label: 'Total Available', value: asset.unitsAvailable.toLocaleString(), icon: Layers, color: 'orange' },
                  ].map(m => {
                    const Icon = m.icon;
                    const cls: Record<string, string> = {
                      green: 'bg-green-100 text-green-600',
                      blue: 'bg-blue-100 text-blue-600',
                      purple: 'bg-purple-100 text-purple-600',
                      orange: 'bg-orange-100 text-orange-600',
                    };
                    return (
                      <Card key={m.label} className="p-5 border-border bg-card">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cls[m.color]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">{m.label}</p>
                            <p className="text-xl font-bold capitalize">{m.value}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <Card className="p-5 border-orange-200 bg-orange-50">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-orange-900">Risk Disclaimer</h3>
                      <p className="text-sm text-orange-800">This investment carries market risk. Asset values may fluctuate. Past performance is not indicative of future results.</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Financials ── */}
            {activeTab === 'financials' && (
              <Card className="p-6 border-border bg-card space-y-6">
                <h2 className="text-xl font-bold">Your Financial Position</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Units Owned', value: holding.unitsOwned.toLocaleString(), icon: Layers },
                    { label: 'Unit Price Paid', value: formatCurrency(holding.unitPrice), icon: IndianRupee },
                    { label: 'Current Value', value: formatCurrency(currentValue), icon: TrendingUp },
                    { label: 'Asset Total Value', value: formatCurrency(asset.totalValue), icon: Building2 },
                    { label: 'Annual ROI', value: `${asset.expectedAnnualROI}%`, icon: Percent },
                    { label: 'Next Dividend', value: asset.nextDividendDate, icon: Calendar },
                  ].map(row => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="w-4 h-4" />
                          {row.label}
                        </div>
                        <span className="font-semibold text-sm">{row.value}</span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Your ownership share</span>
                    <span className="font-semibold">{((holding.unitsOwned / asset.totalUnits) * 100).toFixed(4)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="h-3 rounded-full bg-accent" style={{ width: `${Math.min((holding.unitsOwned / asset.totalUnits) * 100, 100)}%` }} />
                  </div>
                </div>
              </Card>
            )}

            {/* ── Documents ── */}
            {activeTab === 'documents' && (
              <Card className="p-6 border-border bg-card">
                <h2 className="text-xl font-bold mb-4">Legal Documents</h2>
                <div className="space-y-3">
                  {[...asset.legalDocuments, { title: 'Subscription Agreement', url: '#' }, { title: 'Ownership Certificate', url: '#' }].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">PDF · Apr 2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Market ── */}
            {activeTab === 'market' && (
              <Card className="p-6 border-border bg-card space-y-6">
                <h2 className="text-xl font-bold">Market Activity</h2>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">30-day Price History (USD)</p>
                    {hoveredBar && (
                      <div className="text-sm font-semibold text-accent">
                        Day {hoveredBar.idx + 1} — <span className="text-foreground">{formatCurrency(hoveredBar.value)}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    {hoveredBar && (
                      <div className="absolute -top-10 z-10 bg-foreground text-background text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none -translate-x-1/2" style={{ left: `${hoveredBar.x}%` }}>
                        {formatCurrency(hoveredBar.value)}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-foreground" />
                      </div>
                    )}
                    <div className="flex items-end gap-0.5 h-32">
                      {Array.from({ length: 30 }, (_, i) => {
                        const h = 45 + Math.sin(i * 0.7) * 22 + (i % 5) * 3;
                        const val = Math.round(asset.pricePerUnit * (1 + Math.sin(i * 0.7) * 0.1));
                        return (
                          <div key={i} className={`flex-1 rounded-t cursor-pointer transition-all ${hoveredBar?.idx === i ? 'bg-accent' : 'bg-accent/50 hover:bg-accent/80'}`}
                            style={{ height: `${h}%` }}
                            onMouseEnter={(e) => {
                              const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                              const br = e.currentTarget.getBoundingClientRect();
                              setHoveredBar({ idx: i, value: val, x: ((br.left + br.width / 2 - rect.left) / rect.width) * 100 });
                            }}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>30 days ago</span><span>Today</span></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: '24h Volume', value: formatCurrency(asset.pricePerUnit * 850), color: 'blue' },
                    { label: '7d Change', value: '+2.4%', color: 'green' },
                    { label: 'All-time High', value: formatCurrency(asset.pricePerUnit * 1.18), color: 'purple' },
                    { label: 'Your Avg Buy', value: formatCurrency(holding.unitPrice), color: 'orange' },
                    { label: 'Unrealised PnL', value: formatCurrency((asset.pricePerUnit - holding.unitPrice) * holding.unitsOwned), color: 'green' },
                    { label: 'Est. Annual Div', value: formatCurrency((holding.unitsOwned * asset.pricePerUnit * asset.expectedAnnualROI) / 100), color: 'blue' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-4 ${s.color === 'green' ? 'bg-green-50 border-green-100' : s.color === 'purple' ? 'bg-purple-50 border-purple-100' : s.color === 'orange' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <p className={`font-bold ${s.color === 'green' ? 'text-green-700' : s.color === 'purple' ? 'text-purple-700' : s.color === 'orange' ? 'text-orange-700' : 'text-blue-700'}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ══════════════════════════════════════
                CERTIFICATE OF OWNERSHIP
                ══════════════════════════════════════ */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Certificate of Ownership</h2>
              </div>
              <HoldingCertificate
                holder={currentUser.name}
                asset={asset.name}
                units={holding.unitsOwned}
                value={currentValue}
                certId={certId}
              />
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="gap-2 flex-1" 
                  onClick={handleDownloadCertificate}
                  disabled={isDownloading}
                >
                  {isDownloading ? <Clock className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Generating...' : 'Download Certificate (PDF)'}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 flex-1" 
                  onClick={handleVerifyBlockchain}
                  disabled={isVerifying}
                >
                  {isVerifying ? <Clock className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isVerifying ? 'Verifying...' : 'Verify on Blockchain'}
                </Button>
              </div>
            </div>

          </div>{/* end left col */}

          {/* ── RIGHT SIDEBAR — invest again / sell ── */}
          <div className="space-y-4">
            <Card className="p-6 border-border bg-card sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Your Position</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Units Held', value: holding.unitsOwned.toLocaleString() },
                  { label: 'Avg Buy Price', value: formatCurrency(holding.unitPrice) },
                  { label: 'Current Value', value: formatCurrency(currentValue) },
                  { label: 'Ownership', value: `${((holding.unitsOwned / asset.totalUnits) * 100).toFixed(4)}%` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-semibold">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <Button className="w-full bg-accent hover:bg-accent/90">Buy More Units</Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:border-red-400">Sell Units</Button>
                <Link href={`/portfolio/holdings/${assetId}/discussion`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Open Discussion
                  </Button>
                </Link>
              </div>

              <div className="mt-5 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Est. Annual Dividend</span>
                  <span className="font-medium text-green-600">{formatCurrency((holding.unitsOwned * asset.pricePerUnit * asset.expectedAnnualROI) / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Payout</span>
                  <span className="font-medium">{asset.nextDividendDate}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Cert ID: {certId.slice(0, 22)}…</span>
              </div>
            </Card>
          </div>

        </div>{/* end grid */}
      </div>
    </>
  );
}
