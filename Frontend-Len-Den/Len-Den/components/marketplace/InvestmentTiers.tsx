'use client'

import { Check } from 'lucide-react'

interface PricingTier {
  name: string
  description: string
  minInvestment: number
  maxInvestment: number
  features: string[]
  riskLevel: string
  expectedReturn: string
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Conservative',
    description: 'Low-risk, stable returns',
    minInvestment: 1000,
    maxInvestment: 25000,
    features: [
      'Real estate focus',
      'Dividend yield: 4-6%',
      'Lower volatility',
      'Quarterly dividends',
      'Premium support',
    ],
    riskLevel: 'Low',
    expectedReturn: '4-6%',
  },
  {
    name: 'Balanced',
    description: 'Mix of growth and income',
    minInvestment: 5000,
    maxInvestment: 100000,
    features: [
      'Diversified portfolio',
      'Dividend yield: 6-8%',
      'Moderate growth',
      'Monthly dividends',
      'Priority support',
      'Quarterly reports',
    ],
    riskLevel: 'Medium',
    expectedReturn: '6-8%',
  },
  {
    name: 'Growth',
    description: 'Higher potential returns',
    minInvestment: 25000,
    maxInvestment: 500000,
    features: [
      'Alternative assets',
      'Dividend yield: 8-12%',
      'Higher volatility',
      'Monthly dividends',
      'Dedicated manager',
      'Weekly reports',
      'VIP events',
    ],
    riskLevel: 'High',
    expectedReturn: '8-12%',
  },
]

export default function InvestmentTiers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Investment Tiers</h2>
        <p className="text-muted-foreground mt-1">Choose the right strategy for your portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-lg p-6 flex flex-col hover:border-accent transition-colors"
          >
            {/* Header */}
            <h3 className="text-xl font-semibold text-foreground mb-2">{tier.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

            {/* Investment Range */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Investment Range</p>
              <p className="font-semibold text-foreground">
                ${(tier.minInvestment / 1000).toFixed(0)}K - ${(tier.maxInvestment / 1000).toFixed(0)}K
              </p>
            </div>

            {/* Risk & Return */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                <p className="font-semibold text-foreground">{tier.riskLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
                <p className="font-semibold text-accent">{tier.expectedReturn}</p>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 mb-6">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Includes:</p>
              <div className="space-y-2">
                {tier.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
