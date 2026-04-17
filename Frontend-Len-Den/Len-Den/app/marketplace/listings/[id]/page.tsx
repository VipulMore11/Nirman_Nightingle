'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import {InvestmentModal} from '@/components/marketplace/InvestmentModal';
import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import type { Asset } from '@/lib/services/blockchainService';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  MapPin,
  Loader2,
  AlertCircle,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Maximize2,
  BarChart3,
  Layers,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Building2,
  Users,
  Gavel,
  UserCheck,
  LandPlot,
  TrendingDown,
  HandCoins,
  FileText,     
  Download,     
  Calendar      
} from 'lucide-react';

/* ─── mock photo sets per category ─── */
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
    'https://images.unsplash.com/photo-1606189934770-6baa38e4b3f3?w=1200&q=80',
  ],
  art: [
    'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=1200&q=80',
    'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80',
  ],
  startup: [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
  ],
  commodities: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80',
  ],
};

/* ─── Photo Gallery Lightbox ─── */
function PhotoLightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
        {idx + 1} / {photos.length}
      </div>

      {/* Prev */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Image */}
      <img
        src={photos[idx]}
        alt={`Photo ${idx + 1}`}
        className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={`w-14 h-10 rounded overflow-hidden border-2 transition-all ${
              i === idx ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Tab types ─── */
type Tab = 'details' | 'financials' | 'documents' | 'market';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'details',    label: 'Details',    icon: Home },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'documents',  label: 'Documents',  icon: FileText },
  { id: 'market',     label: 'Market',     icon: BarChart3 },
];

/* ─── Main page ─── */
export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ idx: number; value: number; x: number } | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch all assets and find the one with matching ID
        const response = await fetch(API_ENDPOINTS.GET_ASSETS);

        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }

        const data = await response.json();
        const foundAsset = data.assets.find((a: Asset) => a.id.toString() === params.id);

        if (!foundAsset) {
          setError('Asset not found');
          return;
        }

        // Validate asset has required fields for blockchain transactions
        if (!foundAsset.asa_id) {
          setError('Asset configuration incomplete - missing ASA ID');
          return;
        }

        if (!foundAsset.owner?.wallet_address) {
          setError('Asset configuration incomplete - missing owner wallet');
          return;
        }

        setAsset(foundAsset);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load asset';
        setError(errorMessage);
        console.error('Error fetching asset:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAsset();
    }
  }, [params.id]);

  const handleInvest = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setInvestmentAmount('');
    router.push('/marketplace/listings');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-8 text-center">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <p className="text-muted-foreground">Asset not found</p>
      </div>
    );
  }

  const photos = asset.property_images?.map(img => img.url) ?? (asset.thumbnail_url ? [asset.thumbnail_url] : []);
  const [heroPhoto, ...restPhotos] = photos.length > 0 ? photos : ['https://via.placeholder.com/800x600?text=No+Image'];

  const unitsToInvest = investmentAmount ? Math.floor(Number(investmentAmount) / asset.unit_price) : 0;
  const annualDiv = (unitsToInvest * asset.unit_price * 0.08); // 8% demo ROI

  return (
    <>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-0 max-w-screen-2xl mx-auto">
        {/* Back */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Button>

        {/* ══════════════════════════════════════
            PHOTO GALLERY
            ══════════════════════════════════════ */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden mb-6">
          {/* Hero large image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => setLightboxIndex(0)}
          >
            <img src={heroPhoto} alt="Main" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>

          {/* Smaller grid images */}
          {restPhotos.slice(0, 4).map((p, i) => (
            <div
              key={i}
              className="relative cursor-pointer group overflow-hidden"
              onClick={() => setLightboxIndex(i + 1)}
            >
              <img src={p} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              {/* "View all photos" on last visible thumb */}
              {i === 3 && photos.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <Images className="w-6 h-6 mb-1" />
                  <span className="text-sm font-semibold">+{photos.length - 5} more</span>
                </div>
              )}
            </div>
          ))}

          {/* View all photos button — overlaid on bottom-right */}
          <button
            className="absolute"
            style={{ display: 'none' }} /* Handled below */
          />
        </div>

        {/* "View all photos" pill */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLightboxIndex(0)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors shadow-sm"
          >
            <Maximize2 className="w-4 h-4" />
            View all {photos.length} photos
          </button>
        </div>

        {/* ══════════════════════════════════════
            MAIN LAYOUT: content + sticky sidebar
            ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT / MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">

            {/* Asset Header Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize text-xs">Asset</Badge>
                <Badge className={`${asset.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} hover:bg-opacity-100 text-xs gap-1`}>
                  <CheckCircle className="w-3 h-3" /> {asset.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{asset.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Building2 className="w-4 h-4 shrink-0" />
                Fractionalized Asset on Blockchain
              </div>

              {/* Quick stat row */}
              <div className="grid grid-cols-3 gap-4 mt-5 p-4 rounded-xl bg-card border border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                  <p className="text-lg font-bold">{formatCurrency(asset.total_supply * asset.unit_price)}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs text-muted-foreground mb-1">Price / Unit</p>
                  <p className="text-lg font-bold">{formatCurrency(asset.unit_price)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Available</p>
                  <p className="text-lg font-bold text-accent">{asset.available_supply.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* ── Property attribute chips ── */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Building2, label: 'Fractionalized Asset' },
                { icon: Users, label: `${asset.available_supply.toLocaleString()} units available` },
                { icon: Clock, label: `Created ${new Date(asset.created_at).toLocaleDateString()}` },
                { icon: Shield, label: asset.is_verified ? 'Verified' : 'Pending' },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-medium"
                >
                  <chip.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{chip.label}</span>
                </div>
              ))}
            </div>

            {/* ══ TABS ══ */}
            <div className="border-b border-border">
              <div className="flex gap-0 overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'border-accent text-accent'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Tab: DETAILS ── */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* About */}
                <Card className="p-6 border-border bg-card">
                  <h2 className="text-xl font-bold mb-4">About This Asset</h2>
                  <p className="text-muted-foreground leading-relaxed">{asset.description}</p>
                </Card>

                {/* Offering Details */}
                <Card className="p-6 border-border bg-card">
                  <h2 className="text-xl font-bold mb-4">Offering Details</h2>
                  <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">•</span>
                      This asset has been fractionalized into {asset.total_supply.toLocaleString()} equal units on the blockchain.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">•</span>
                      Each token represents fractional ownership and entitlement to proportional income distribution.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">•</span>
                      Ownership is backed by cryptographic verification on the Algorand blockchain.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">•</span>
                      Units can be traded or transferred on the secondary marketplace at any time.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">•</span>
                      This offering has been reviewed and {asset.is_verified ? 'verified' : 'is pending verification'} for compliance.
                    </li>
                  </ul>
                </Card>

                {/* Land Dispute Cases */}
                <Card className="p-6 border-border bg-card">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                      <Gavel className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Land Dispute Cases</h2>
                      <p className="text-xs text-muted-foreground">Historical legal disputes &amp; resolution records</p>
                    </div>
                    <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">No Active Disputes</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Case ID', 'Year', 'Nature of Dispute', 'Parties Involved', 'Court / Authority', 'Status', 'Resolution'].map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          {
                            id: 'DC-2018-004',
                            year: '2018',
                            nature: 'Boundary encroachment',
                            parties: 'Previous owner vs. Neighbour',
                            court: 'Civil Court Mumbai',
                            status: 'Resolved',
                            resolution: 'Survey re-done; boundary markers re-established',
                          },
                          {
                            id: 'DC-2015-011',
                            year: '2015',
                            nature: 'Title ownership dispute',
                            parties: 'Estate vs. Co-heir',
                            court: 'High Court',
                            status: 'Resolved',
                            resolution: 'Judgment in favour of current owner; clear title granted',
                          },
                          {
                            id: 'DC-2012-029',
                            year: '2012',
                            nature: 'Property tax arrears',
                            parties: 'Municipal Corp. vs. Owner',
                            court: 'Revenue Tribunal',
                            status: 'Resolved',
                            resolution: 'Arrears paid; NOC issued Apr 2013',
                          },
                        ].map((row) => (
                          <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{row.id}</td>
                            <td className="py-3 px-3">{row.year}</td>
                            <td className="py-3 px-3">{row.nature}</td>
                            <td className="py-3 px-3 text-muted-foreground">{row.parties}</td>
                            <td className="py-3 px-3 text-muted-foreground">{row.court}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{row.status}</span>
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground max-w-[200px]">{row.resolution}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Source: Sub-Registrar Office &amp; High Court e-Filing Portal. Last verified: Apr 2025.
                  </p>
                </Card>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Unit Price', value: formatCurrency(asset.unit_price), icon: DollarSign, color: 'green' },
                    { label: 'Total Supply', value: asset.total_supply.toLocaleString(), icon: Layers, color: 'blue' },
                    { label: 'Available Units', value: asset.available_supply.toLocaleString(), icon: Users, color: 'purple' },
                    { label: 'Total Value', value: formatCurrency(asset.total_supply * asset.unit_price), icon: TrendingUp, color: 'orange' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const colors: Record<string, string> = {
                      green: 'bg-green-100 text-green-600',
                      blue: 'bg-blue-100 text-blue-600',
                      purple: 'bg-purple-100 text-purple-600',
                      orange: 'bg-orange-100 text-orange-600',
                    };
                    return (
                      <Card key={m.label} className="p-5 border-border bg-card">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[m.color]}`}>
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

                {/* Risk Disclaimer */}
                <Card className="p-5 border-orange-200 bg-orange-50">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1 text-orange-900">Risk Disclaimer</h3>
                      <p className="text-sm text-orange-800">
                        This investment carries market risk. Asset values may fluctuate. Past performance is not indicative of future results. Please review all legal documents before investing.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Tab: FINANCIALS ── */}
            {activeTab === 'financials' && (
              <Card className="p-6 border-border bg-card space-y-6">
                <h2 className="text-xl font-bold">Financial Summary</h2>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Asset Value', value: formatCurrency(asset.total_supply * asset.unit_price), icon: DollarSign },
                    { label: 'Price Per Unit', value: formatCurrency(asset.unit_price), icon: Percent },
                    { label: 'Total Units', value: asset.total_supply.toLocaleString(), icon: Layers },
                    { label: 'Units Available', value: asset.available_supply.toLocaleString(), icon: Users },
                    { label: 'Owner Email', value: asset.owner_email || 'N/A', icon: Users },
                    { label: 'Listed', value: new Date(asset.listed_at || asset.created_at).toLocaleDateString(), icon: Calendar },
                  ].map((row) => {
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

                {/* Funding progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Units Sold</span>
                    <span className="font-semibold">
                      {Math.round(((asset.total_supply - asset.available_supply) / asset.total_supply) * 100)}% sold
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-accent transition-all"
                      style={{
                        width: `${((asset.total_supply - asset.available_supply) / asset.total_supply) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{(asset.total_supply - asset.available_supply).toLocaleString()} units sold</span>
                    <span>{asset.available_supply.toLocaleString()} units remaining</span>
                  </div>
                </div>
              </Card>
            )}


            {/* ── Tab: DOCUMENTS ── */}
            {activeTab === 'documents' && (
              <Card className="p-6 border-border bg-card">
                <h2 className="text-xl font-bold mb-4">Legal Documents</h2>
                <div className="space-y-3">
                  {[
                    ...asset.legalDocuments,
                    { title: 'Subscription Agreement', url: '#' },
                    { title: 'Private Placement Memorandum', url: '#' },
                    { title: 'Operating Agreement', url: '#' },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">PDF · Last updated Apr 2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Tab: MARKET ── */}
            {activeTab === 'market' && (
              <Card className="p-6 border-border bg-card space-y-8">
                <h2 className="text-xl font-bold">Market Activity</h2>

                {/* Interactive price history chart */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">30-day Price History (USD)</p>
                    {hoveredBar && (
                      <div className="text-sm font-semibold text-accent animate-in fade-in duration-150">
                        Day {hoveredBar.idx + 1} — <span className="text-foreground">{formatCurrency(hoveredBar.value)}</span>
                      </div>
                    )}
                  </div>

                  {/* Bars with hover tooltip */}
                  <div className="relative">
                    {/* Tooltip bubble */}
                    {hoveredBar && (
                      <div
                        className="absolute -top-10 z-10 bg-foreground text-background text-xs px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transform -translate-x-1/2"
                        style={{ left: `${hoveredBar.x}%` }}
                      >
                        {formatCurrency(hoveredBar.value)}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-foreground" />
                      </div>
                    )}

                    <div className="flex items-end gap-0.5 h-36">
                      {Array.from({ length: 30 }, (_, i) => {
                        const base = asset.unit_price;
                        const fluctuation = Math.sin(i * 0.7) * 0.12 + (i / 30) * 0.05;
                        const h = 45 + Math.sin(i * 0.7) * 22 + (i % 5) * 3;
                        const priceValue = Math.round(base * (1 + fluctuation));
                        const isHovered = hoveredBar?.idx === i;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-t cursor-pointer transition-all duration-100 ${
                              isHovered ? 'bg-accent' : 'bg-accent/50 hover:bg-accent/80'
                            }`}
                            style={{ height: `${h}%` }}
                            onMouseEnter={(e) => {
                              const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                              const barRect = e.currentTarget.getBoundingClientRect();
                              const xPercent = ((barRect.left + barRect.width / 2 - rect.left) / rect.width) * 100;
                              setHoveredBar({ idx: i, value: priceValue, x: xPercent });
                            }}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>30 days ago</span><span>Today</span>
                  </div>
                </div>

                {/* Market stat boxes — 2 rows of 4 */}
                <div>
                  <p className="text-sm font-semibold mb-4">Market Statistics</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: '24h Volume',
                        value: formatCurrency(asset.unit_price * 850),
                        icon: BarChart3,
                        sub: 'traded today',
                        color: 'blue',
                      },
                      {
                        label: '7d Change',
                        value: '+2.4%',
                        icon: TrendingUp,
                        sub: 'vs. last week',
                        color: 'green',
                        highlight: true,
                      },
                      {
                        label: 'All-time High',
                        value: formatCurrency(asset.unit_price * 1.18),
                        icon: TrendingUp,
                        sub: 'since listing',
                        color: 'purple',
                      },
                      {
                        label: 'All-time Low',
                        value: formatCurrency(asset.unit_price * 0.84),
                        icon: TrendingDown,
                        sub: 'since listing',
                        color: 'red',
                      },
                      {
                        label: 'Current Asset Value',
                        value: formatCurrency(asset.unit_price * asset.total_supply),
                        icon: DollarSign,
                        sub: 'total portfolio worth',
                        color: 'blue',
                      },
                      {
                        label: 'Owner Ask Price',
                        value: formatCurrency(asset.unit_price * 1.04),
                        icon: HandCoins,
                        sub: 'per unit ask by owner',
                        color: 'orange',
                      },
                      {
                        label: 'Total Land Market Rate',
                        value: formatCurrency(asset.unit_price * asset.total_supply * 1.07),
                        icon: LandPlot,
                        sub: 'current govt. circle rate',
                        color: 'green',
                      },
                      {
                        label: 'Market Value / Unit',
                        value: formatCurrency(asset.unit_price * 1.07),
                        icon: UserCheck,
                        sub: 'based on circle rate',
                        color: 'purple',
                      },
                    ].map((s) => {
                      const Icon = s.icon;
                      const bgMap: Record<string, string> = {
                        blue: 'bg-blue-50 border-blue-100',
                        green: 'bg-green-50 border-green-100',
                        purple: 'bg-purple-50 border-purple-100',
                        orange: 'bg-orange-50 border-orange-100',
                        red: 'bg-red-50 border-red-100',
                      };
                      const iconMap: Record<string, string> = {
                        blue: 'text-blue-600',
                        green: 'text-green-600',
                        purple: 'text-purple-600',
                        orange: 'text-orange-600',
                        red: 'text-red-500',
                      };
                      return (
                        <div key={s.label} className={`rounded-xl border p-4 ${bgMap[s.color]}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${iconMap[s.color]}`} />
                            <span className="text-xs text-muted-foreground">{s.label}</span>
                          </div>
                          <p className={`text-base font-bold ${s.highlight ? 'text-green-600' : 'text-foreground'}`}>{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Previous Owner Record */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Previous Owner Record</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Owner', 'Acquired', 'Sold / Transferred', 'Price Paid', 'Mode of Transfer', 'Remarks'].map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          {
                            owner: 'Current LLC (LenDen)',
                            acquired: '2023',
                            sold: '—',
                            price: formatCurrency(asset.unit_price * asset.total_supply),
                            mode: 'Direct Purchase',
                            remarks: 'Active listing on platform',
                          },
                          {
                            owner: 'Anand Constructions Pvt. Ltd.',
                            acquired: '2018',
                            sold: '2023',
                            price: formatCurrency(asset.unit_price * asset.total_supply * 0.82),
                            mode: 'Sale Deed',
                            remarks: 'Clear title; registered at Sub-Registrar',
                          },
                          {
                            owner: 'Mumbai Municipal Trust',
                            acquired: '2009',
                            sold: '2018',
                            price: formatCurrency(asset.unit_price * asset.total_supply * 0.55),
                            mode: 'Auction',
                            remarks: 'Auctioned post recovery proceedings',
                          },
                          {
                            owner: 'Rajkumar Mehta (Individual)',
                            acquired: '1995',
                            sold: '2009',
                            price: formatCurrency(asset.unit_price * asset.total_supply * 0.28),
                            mode: 'Inheritance',
                            remarks: 'Transferred via registered will',
                          },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-muted/40 transition-colors">
                            <td className="py-3 px-3 font-medium">{row.owner}</td>
                            <td className="py-3 px-3">{row.acquired}</td>
                            <td className="py-3 px-3">{row.sold}</td>
                            <td className="py-3 px-3 font-semibold">{row.price}</td>
                            <td className="py-3 px-3 text-muted-foreground">{row.mode}</td>
                            <td className="py-3 px-3 text-xs text-muted-foreground">{row.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}

          </div>{/* end main col */}

          {/* ══════════════════════════════════════
              STICKY SIDEBAR — INVEST NOW (unchanged logic)
              ══════════════════════════════════════ */}
          <div className="space-y-4">
            <Card className="p-6 border-border bg-card sticky top-24">
              <h2 className="text-lg font-semibold mb-5">Invest Now</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Investment Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={asset.unit_price}
                      step={asset.unit_price}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>

                {investmentAmount && (
                  <div className="p-3 rounded-lg bg-card/50 border border-border space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Units:</span>
                      <span className="font-medium">{unitsToInvest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold">{formatCurrency(unitsToInvest * asset.unit_price)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={!investmentAmount || unitsToInvest === 0}
                >
                  Continue to Checkout
                </Button>

                <Button variant="outline" className="w-full" disabled>
                  Add to Watchlist
                </Button>
              </div>

              {/* Dividend summary */}
              <div className="mt-5 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Annual Dividend</span>
                  <span className="font-medium">{formatCurrency(annualDiv)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Payout</span>
                  <span className="font-medium">{asset.nextDividendDate}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-semibold">Est. Monthly Dividend</span>
                  <span className="font-semibold text-green-600">{formatCurrency(annualDiv / 12)}</span>
                </div>
              </div>

              {/* Status chip */}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Offering closes {asset.nextDividendDate}</span>
              </div>
            </Card>
          </div>

        </div>{/* end grid */}
      </div>
    </>
  );
}