'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  FileUp,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Camera,
  RefreshCw,
  ShieldCheck,
  User,
  KeyRound,
} from 'lucide-react';

const TOTAL_STEPS = 4;

/* ─────────── helpers ─────────── */
function StepDot({ n, current }: { n: number; current: number }) {
  const done = n < current;
  const active = n === current;
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
        done
          ? 'bg-accent border-accent text-white'
          : active
          ? 'border-accent text-accent bg-accent/10'
          : 'border-border text-muted-foreground'
      }`}
    >
      {done ? <CheckCircle className="w-4 h-4" /> : n}
    </div>
  );
}

/* ─────────── main page ─────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 – personal info
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    phone: '',
  });

  // Step 2 – Aadhaar
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // Step 3 – selfie / camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');

  // Step 4 - terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;

  /* ── stop camera when leaving step 3 ── */
  useEffect(() => {
    if (step !== 3 && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  }, [step]);

  /* ── cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ─────────── step 1 ─────────── */
  const handlePersonalInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  /* ─────────── step 2 – Aadhaar ─────────── */
  const formatAadhaar = (val: string) =>
    val
      .replace(/\D/g, '')
      .slice(0, 12)
      .replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarNumber(formatAadhaar(e.target.value));
  };

  const handleSendOtp = () => {
    if (aadhaarNumber.replace(/\s/g, '').length !== 12) return;
    setOtpLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    // Demo: any 6-digit OTP is accepted
    if (aadhaarOtp.length === 6) {
      setOtpVerified(true);
    }
  };

  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAadhaarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAadhaarPreview(url);
    }
  };

  /* ─────────── step 3 – camera ─────────── */
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCapturedImage(null);
    } catch {
      setCameraError(
        'Camera access denied. Please allow camera permissions in your browser settings.'
      );
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    // stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  /* ─────────── navigation ─────────── */
  const canProceedStep1 =
    personalData.firstName &&
    personalData.lastName &&
    personalData.dateOfBirth &&
    personalData.country;

  const canProceedStep2 = otpVerified && aadhaarFile;

  const canProceedStep3 = !!capturedImage;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  /* ─────────── render ─────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Verify Your Identity</h1>
          <p className="text-muted-foreground">Complete {TOTAL_STEPS} steps to start investing</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="flex items-center gap-2">
              <StepDot n={n} current={step} />
              {n < TOTAL_STEPS && (
                <div
                  className={`w-10 h-0.5 transition-all ${
                    n < step ? 'bg-accent' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* ═══════════════════════════════
            STEP 1 – Personal Information
            ═══════════════════════════════ */}
        {step === 1 && (
          <Card className="p-8 border-border bg-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">
                    We need this to verify your identity and comply with regulations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input name="firstName" value={personalData.firstName} onChange={handlePersonalInput} placeholder="Rajesh" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input name="lastName" value={personalData.lastName} onChange={handlePersonalInput} placeholder="Kumar" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input name="dateOfBirth" type="date" value={personalData.dateOfBirth} onChange={handlePersonalInput} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nationality</label>
                  <Input name="nationality" value={personalData.nationality} onChange={handlePersonalInput} placeholder="Indian" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country of Residence</label>
                  <Input name="country" value={personalData.country} onChange={handlePersonalInput} placeholder="India" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input name="phone" value={personalData.phone} onChange={handlePersonalInput} placeholder="+91-98765-43210" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => router.back()}>Back</Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ═══════════════════════════════
            STEP 2 – Aadhaar Verification
            ═══════════════════════════════ */}
        {step === 2 && (
          <Card className="p-8 border-border bg-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Aadhaar Verification</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your 12-digit Aadhaar number to receive an OTP on your registered mobile.
                  </p>
                </div>
              </div>

              {/* Aadhaar number + OTP */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Aadhaar Number</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="XXXX XXXX XXXX"
                        value={aadhaarNumber}
                        onChange={handleAadhaarChange}
                        maxLength={14}
                        disabled={otpVerified}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendOtp}
                      disabled={
                        aadhaarNumber.replace(/\s/g, '').length !== 12 ||
                        otpSent ||
                        otpVerified ||
                        otpLoading
                      }
                      className="shrink-0"
                    >
                      {otpLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : otpSent ? (
                        'OTP Sent ✓'
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      Enter OTP
                      <span className="text-xs text-muted-foreground font-normal">(sent to registered mobile)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={aadhaarOtp}
                        onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={aadhaarOtp.length !== 6}
                        className="bg-accent hover:bg-accent/90 shrink-0"
                      >
                        Verify OTP
                      </Button>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline"
                      onClick={() => { setOtpSent(false); setAadhaarOtp(''); handleSendOtp(); }}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Aadhaar OTP verified successfully</p>
                  </div>
                )}
              </div>

              {/* Upload Aadhaar image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload Aadhaar Card Image
                  <span className="text-destructive ml-1">*</span>
                </label>
                <p className="text-xs text-muted-foreground">Upload a clear photo of both sides of your Aadhaar card (JPEG / PNG / PDF, max 10 MB)</p>

                {!aadhaarPreview ? (
                  <label
                    htmlFor="aadhaar-upload"
                    className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
                  >
                    <FileUp className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium text-sm">Click to upload Aadhaar</p>
                      <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</p>
                    </div>
                    <input
                      id="aadhaar-upload"
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={handleAadhaarFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={aadhaarPreview} alt="Aadhaar preview" className="w-full max-h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setAadhaarFile(null); setAadhaarPreview(null); }}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80"
                    >
                      Remove
                    </button>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-lg">
                      <CheckCircle className="w-3 h-3" />
                      {aadhaarFile?.name}
                    </div>
                  </div>
                )}
              </div>

              {/* Info banner */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex gap-3">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900">
                  Your Aadhaar data is encrypted and processed in compliance with UIDAI guidelines. We never store your biometric data.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ═══════════════════════════════
            STEP 3 – Selfie / Face Capture
            ═══════════════════════════════ */}
        {step === 3 && (
          <Card className="p-8 border-border bg-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Selfie Verification</h2>
                  <p className="text-sm text-muted-foreground">
                    Take a clear selfie to verify it matches your Aadhaar photo.
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
                {[
                  { emoji: '💡', tip: 'Good lighting' },
                  { emoji: '😐', tip: 'Face the camera' },
                  { emoji: '🚫', tip: 'No glasses/hat' },
                ].map((t) => (
                  <div key={t.tip} className="p-3 rounded-lg border border-border bg-card/50">
                    <div className="text-2xl mb-1">{t.emoji}</div>
                    {t.tip}
                  </div>
                ))}
              </div>

              {/* Camera area */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                {/* Live video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                {/* Face oval overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-52 h-64 rounded-full border-4 border-white/60 border-dashed" />
                  </div>
                )}
                {/* Captured preview */}
                {capturedImage && (
                  <img src={capturedImage} alt="Captured selfie" className="w-full h-full object-cover" />
                )}
                {/* Idle state */}
                {!cameraActive && !capturedImage && (
                  <div className="text-center text-white/60">
                    <Camera className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Camera preview will appear here</p>
                  </div>
                )}
                {/* hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {cameraError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{cameraError}</p>
                </div>
              )}

              {capturedImage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Selfie captured successfully!</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3 justify-center">
                {!cameraActive && !capturedImage && (
                  <Button
                    type="button"
                    onClick={startCamera}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera
                  </Button>
                )}
                {cameraActive && (
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-accent hover:bg-accent/90 gap-2 px-8"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Photo
                  </Button>
                )}
                {capturedImage && (
                  <Button type="button" variant="outline" onClick={retakePhoto} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retake
                  </Button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleNext}
                  disabled={!canProceedStep3}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ═══════════════════════════════
            STEP 4 – Review & Submit
            ═══════════════════════════════ */}
        {step === 4 && (
          <Card className="p-8 border-border bg-card">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Review & Submit</h2>
                <p className="text-muted-foreground text-sm">
                  Confirm your information before final submission
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-3 rounded-xl border border-border p-5 bg-card/50 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{personalData.firstName} {personalData.lastName}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">{personalData.country}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{personalData.phone}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Aadhaar</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    Verified
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Selfie</span>
                  {capturedImage && (
                    <img src={capturedImage} alt="selfie" className="w-10 h-10 rounded-full object-cover border border-border" />
                  )}
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
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to LenDen&apos;s{' '}
                  <Link href="#" className="text-accent hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleComplete}
                  disabled={!agreedToTerms || loading}
                >
                  {loading ? 'Submitting…' : 'Submit & Complete KYC'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Help */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need help?{' '}
            <Link href="#" className="text-accent hover:underline">
              Contact support
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
