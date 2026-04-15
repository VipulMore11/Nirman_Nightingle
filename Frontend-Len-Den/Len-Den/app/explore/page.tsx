'use client'

import { Header } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { mockAssets } from '@/lib/data/mockAssets'
import { formatCurrency } from '@/lib/utils/formatters'
import { TrendingUp, Globe, Shield, Zap } from 'lucide-react'

export default function ExplorePage() {
  const featuredAssets = mockAssets.slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Invest in Fractional Assets
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Own pieces of high-value assets globally. Start with as little as $100 and grow your portfolio.
          </p>
          <Link href="/auth/signup">
            <Button className="bg-accent hover:bg-accent/90 text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 border-border bg-card">
            <Globe className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Global Access</h3>
            <p className="text-sm text-muted-foreground">Invest in real estate, gold, art, and startups from around the world.</p>
          </Card>
          <Card className="p-6 border-border bg-card">
            <Shield className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Regulated</h3>
            <p className="text-sm text-muted-foreground">All assets are verified and comply with international standards.</p>
          </Card>
          <Card className="p-6 border-border bg-card">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Easy Trading</h3>
            <p className="text-sm text-muted-foreground">Buy, sell, and manage your fractional shares on our secondary market.</p>
          </Card>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Assets</h2>
            <p className="text-muted-foreground">Explore our most popular investments</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAssets.map((asset) => (
              <Link key={asset.id} href={`/marketplace/listings/${asset.id}`}>
                <Card className="group relative overflow-hidden border-border bg-card hover:border-accent/50 transition-all hover:shadow-lg cursor-pointer h-full flex flex-col">
                  {/* Image Section */}
                  <div className="w-full h-32 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-accent/30" />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{asset.category}</p>
                    <h3 className="text-sm font-semibold text-foreground mb-3">{asset.name}</h3>

                    <p className="text-xs text-muted-foreground mb-4 flex-grow">{asset.description.substring(0, 80)}...</p>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Price</p>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(asset.pricePerShare)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">ROI</p>
                        <p className="text-sm font-semibold text-accent">{asset.roi}%</p>
                      </div>
                    </div>

                    <Button className="w-full bg-accent hover:bg-accent/90 text-xs h-8">
                      View Details
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/marketplace/listings">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                Browse All Assets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to start investing?</h2>
          <p className="text-muted-foreground mb-6">Join thousands of investors on LenDen. Verified and regulated for your peace of mind.</p>
          <Link href="/auth/signup">
            <Button className="bg-accent hover:bg-accent/90">Create Account</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
