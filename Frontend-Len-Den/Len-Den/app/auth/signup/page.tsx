'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, User, AlertCircle, Wallet, CheckCircle2, XCircle } from 'lucide-react';
import { usePeraWallet } from '@/hooks/usePeraWallet';
import { signup, storeAuth } from '@/lib/utils/authService';

/** Shorten a wallet address for display: ABCD…WXYZ */
function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Generate username from email */
function generateUsername(email: string): string {
  return email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 7);
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { walletAddress, connecting, error: walletError, connect, disconnect } = usePeraWallet();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!walletAddress) {
      setError('Please connect your Pera Wallet before creating an account.');
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Split full name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const username = generateUsername(formData.email);

      const response = await signup(
        formData.email,
        formData.password,
        firstName,
        lastName,
        username,
        'not_specified' // Default sex value
      );

      storeAuth(response);
      router.push('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/80 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent rounded-lg mb-4">
            <span className="font-bold text-lg text-accent-foreground">AH</span>
          </div>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">Join LenDen and start investing</p>
        </div>

        <Card className="p-8 border-border bg-card">
          <form onSubmit={handleSignup} className="space-y-5">

            {/* ── Error banner ── */}
            {(error || walletError) && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error || walletError}</p>
              </div>
            )}

            {/* ── Full Name ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* ── Email ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* ── Confirm Password ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* ── Pera Wallet Section ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                Pera Wallet
                <span className="text-destructive text-xs ml-1">* required</span>
              </label>

              {!walletAddress ? (
                /* Not connected */
                <button
                  type="button"
                  onClick={connect}
                  disabled={connecting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4 text-accent"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                      Connecting…
                    </>
                  ) : (
                    <>
                      {/* Pera Wallet brand mark */}
                      <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect width="40" height="40" rx="10" fill="#FECC45"/>
                        <path d="M12 28V12h7.5c3.6 0 6.5 2.9 6.5 6.5S23.1 25 19.5 25H16v3h-4z" fill="#1A1A1A"/>
                        <rect x="16" y="15" width="3.5" height="7" rx="1.75" fill="#FECC45"/>
                      </svg>
                      Connect Pera Wallet
                    </>
                  )}
                </button>
              ) : (
                /* Connected state */
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-green-700 font-medium">Wallet connected</p>
                      <p className="text-xs text-green-600 font-mono truncate">{shortenAddress(walletAddress)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={disconnect}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Disconnect wallet"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              )}

              {!walletAddress && (
                <p className="text-xs text-muted-foreground">
                  Don&apos;t have Pera Wallet?{' '}
                  <a
                    href="https://perawallet.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Download here
                  </a>
                </p>
              )}
            </div>

            {/* ── Terms ── */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms" className="cursor-pointer">
                I agree to the{' '}
                <Link href="#" className="text-accent hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="#" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={loading || !walletAddress}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>

            {!walletAddress && (
              <p className="text-center text-xs text-muted-foreground">
                Connect your Pera Wallet above to enable account creation
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
