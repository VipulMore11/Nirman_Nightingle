'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Globe, Lock, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">LenDen</div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-foreground hover:text-accent transition">Login</Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-accent hover:bg-accent/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-4">
              <span className="text-accent font-semibold text-sm">Now Investing in 150+ Premium Assets</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Own the World's Best Assets
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Invest in fractional ownership of premium real estate, gold, fine art, startups, and renewable energy. Blockchain-secured, globally diversified, institutional-grade.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-accent hover:bg-accent/90 gap-2 h-12 px-8 text-base">
                Start Investing <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/marketplace/listings">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Browse Assets
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-16 border-t border-border">
            <div>
              <div className="text-3xl font-bold text-accent">$2.5B</div>
              <div className="text-muted-foreground">Assets Under Management</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">150K+</div>
              <div className="text-muted-foreground">Active Investors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-muted-foreground">Premium Assets</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">Why Investors Choose LenDen</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">Access institutional-grade investments with retail simplicity</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 border border-border hover:border-accent transition">
              <Globe className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Global Diversification</h3>
              <p className="text-muted-foreground">
                Access premium assets across real estate, commodities, fine art, and startups from around the world in one platform.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:border-accent transition">
              <Lock className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Blockchain Secured</h3>
              <p className="text-muted-foreground">
                Your assets are tokenized on Algorand blockchain with complete transparency, immutability, and cryptographic security.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:border-accent transition">
              <TrendingUp className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Strong Returns</h3>
              <p className="text-muted-foreground">
                Historically, our assets deliver 7-12% annual returns with regular dividend distributions to all holders.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:border-accent transition">
              <Users className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Verified Assets</h3>
              <p className="text-muted-foreground">
                All assets undergo rigorous verification, legal compliance, and institutional-grade due diligence before listing.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:border-accent transition">
              <BarChart3 className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground">
                Track portfolio performance, unrealized gains, dividend history, and detailed asset analytics in one dashboard.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:border-accent transition">
              <Zap className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Secondary Market</h3>
              <p className="text-muted-foreground">
                Trade fractional assets peer-to-peer on our secure marketplace with real-time pricing and instant settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Sign Up',
                desc: 'Create account and complete KYC verification in minutes.',
              },
              {
                step: '2',
                title: 'Browse Assets',
                desc: 'Explore thousands of verified investment opportunities.',
              },
              {
                step: '3',
                title: 'Invest',
                desc: 'Buy fractional units starting from as low as $100.',
              },
              {
                step: '4',
                title: 'Earn',
                desc: 'Receive regular dividends and track portfolio growth.',
              },
            ].map((item) => (
              <div key={item.step} className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Investing?</h2>
          <p className="text-lg opacity-90">
            Join thousands of investors building a globally diversified portfolio
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary hover:bg-primary-foreground hover:text-primary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
