'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/lib/constants/apiConfig';
import { getAuthHeader } from '@/lib/utils/authService';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Briefcase,
  MapPin,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Loader2,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Briefcase },
  { id: 2, label: 'Media & Gallery', icon: ImageIcon },
  { id: 3, label: 'Documents', icon: FileText },
];

export default function ListAssetPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'real-estate',
    description: '',
    totalSupply: '',
    unitPrice: '',
    creatorWallet: '',
    // Files - stored as File objects
    imageFiles: [] as File[],
    documentFiles: [] as File[],
    // Image previews for UI only
    imagePreviews: [] as string[],
  });

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ 
        ...prev, 
        imageFiles: [...prev.imageFiles, ...newFiles],
        imagePreviews: [...prev.imagePreviews, ...newPreviews]
      }));
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL
    URL.revokeObjectURL(formData.imagePreviews[index]);
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        documentFiles: [...prev.documentFiles, ...Array.from(files)]
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);

      // Validation
      if (!formData.title.trim()) throw new Error('Asset title is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.totalSupply) throw new Error('Total supply is required');
      if (!formData.unitPrice) throw new Error('Unit price is required');
      if (!formData.creatorWallet.trim()) throw new Error('Creator wallet address is required');

      // Create FormData for multipart request
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('total_supply', formData.totalSupply);
      fd.append('unit_price', formData.unitPrice);
      fd.append('creator_wallet', formData.creatorWallet);

      // Add metadata (category)
      const metadata = JSON.stringify({
        category: formData.category
      });
      fd.append('metadata_json', metadata);

      // Add image files and names
      if (formData.imageFiles.length > 0) {
        formData.imageFiles.forEach((file) => {
          fd.append('property_image_files', file);
        });
        const imageNames = formData.imageFiles.map((_, idx) => `image_${idx + 1}`);
        fd.append('property_image_names', JSON.stringify(imageNames));
      }

      // Add document files and names
      if (formData.documentFiles.length > 0) {
        formData.documentFiles.forEach((file) => {
          fd.append('legal_document_files', file);
        });
        const docNames = formData.documentFiles.map((file) => file.name.split('.')[0]);
        fd.append('legal_document_names', JSON.stringify(docNames));
      }

      // Submit to API
      const response = await fetch(`${API_ENDPOINTS.CREATE_ASSET}`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          // DO NOT set Content-Type - browser will set it with boundary
        },
        body: fd,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Object.values(errorData)[0] as string || 'Failed to create asset');
      }

      const result = await response.json();
      
      alert('Asset created successfully!');
      // Redirect to asset details or marketplace
      router.push(`/marketplace/listings/${result.id}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create asset';
      setError(errorMsg);
      console.error('Asset creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Title *</label>
                <Input 
                  placeholder="e.g. Downtown Luxury Apartments" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="real-estate">Real Estate</option>
                  <option value="gold">Gold</option>
                  <option value="art">Art</option>
                  <option value="startup">Startup</option>
                  <option value="commodities">Commodities</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Creator Wallet Address *</label>
                <Input 
                  placeholder="0x..." 
                  value={formData.creatorWallet}
                  onChange={(e) => setFormData({...formData, creatorWallet: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price ($) *</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 100" 
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Supply (Units) *</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 10000" 
                  value={formData.totalSupply}
                  onChange={(e) => setFormData({...formData, totalSupply: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <textarea 
                className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Detailed description of the asset..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <label className="block border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-accent transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/10 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-accent" />
              </div>
              <p className="font-medium">Click to upload property photos</p>
              <p className="text-sm text-muted-foreground mt-1">PNG, JPG or WebP (max. 5MB each)</p>
              <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.imagePreviews.map((src, idx) => (
                <div key={idx} className="aspect-video bg-muted rounded-lg border border-border flex items-center justify-center relative group overflow-hidden">
                  <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.imagePreviews.length === 0 && (
                <div className="aspect-video bg-muted/50 rounded-lg border border-border border-dashed flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Legal & Supporting Documents
              </h3>
              <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer bg-muted/30">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-medium">Click to upload documents</p>
                <p className="text-xs text-muted-foreground mt-1">Title Deed, LLC Docs, Appraisals, etc. (PDF, DOC)</p>
                <input type="file" multiple className="hidden" onChange={handleDocumentUpload} accept=".pdf,.doc,.docx" />
              </label>
            </div>

            {formData.documentFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Uploaded Documents</h4>
                <div className="space-y-2">
                  {Array.from(formData.documentFiles).map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="gap-2 mb-8 -ml-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">List New Asset</h1>
        <p className="text-muted-foreground">Provide comprehensive details to attract investors to your asset.</p>
      </div>

      {/* Steper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isActive ? 'bg-accent border-accent text-white scale-110 shadow-lg' : 
                  isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                  'bg-card border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-3 absolute -bottom-6 whitespace-nowrap ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <Card className="border-border bg-card shadow-xl overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          {renderStep()}
        </div>
        
        <div className="px-8 py-6 bg-muted/30 border-t border-border flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 1 || isSubmitting}
          >
            Previous Step
          </Button>
          
          {currentStep === STEPS.length ? (
            <Button 
              className="bg-accent hover:bg-accent/90 px-8 gap-2 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Asset...
                </>
              ) : (
                'Finish & List Asset'
              )}
            </Button>
          ) : (
            <Button 
              className="bg-accent hover:bg-accent/90 px-8"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-8 flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
        <Shield className="w-4 h-4 shrink-0" />
        <p>All listings undergo a verification process by LenDen compliance officers before becoming public to investors. Detailed documentation ensures faster approval.</p>
      </div>
    </div>
  );
}
