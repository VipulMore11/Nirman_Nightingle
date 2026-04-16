'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: KYC
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    phone: '',
    // Step 2: Documents
    documents: [],
    // Step 3: Review
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Verify Your Identity</h1>
          <p className="text-muted-foreground">Complete in 3 easy steps to start investing</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 border-border bg-card">
          {/* Step 1: KYC Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
                <p className="text-muted-foreground">
                  We need this information to verify your identity and comply with regulations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Rajesh"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nationality</label>
                  <Input
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder="Indian"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country of Residence</label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="India"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91-98765-43210"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleNext}
                  disabled={
                    !formData.firstName ||
                    !formData.lastName ||
                    !formData.dateOfBirth ||
                    !formData.country
                  }
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Documents</h2>
                <p className="text-muted-foreground">
                  Upload a government-issued ID and proof of address to verify your identity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer">
                  <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium mb-1">Government ID</p>
                  <p className="text-xs text-muted-foreground">
                    Passport, Driver License, or National ID
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer">
                  <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium mb-1">Proof of Address</p>
                  <p className="text-xs text-muted-foreground">
                    Utility bill, Bank statement, or Lease
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Document Requirements</p>
                  <p className="text-xs">
                    Files must be in JPEG, PNG, or PDF format. Maximum 10MB per file. Documents must be dated within the last 6 months.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Review & Agree</h2>
                <p className="text-muted-foreground">
                  Your information has been submitted for verification
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-card/50 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{formData.country}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-900">
                  Your KYC verification typically completes within 24 hours. You&apos;ll receive an email once approved.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to LenDen&apos;s{' '}
                  <Link href="#" className="text-accent hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="#" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleComplete}
                  disabled={!formData.agreedToTerms || loading}
                >
                  {loading ? 'Completing...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need help? <Link href="#" className="text-accent hover:underline">Contact support</Link></p>
        </div>
      </div>
    </div>
  );
}
