import { HelpCircle, BookOpen, Users, Settings, Lock, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Help & Documentation - LenDen',
  description: 'Learn how to use LenDenand manage your investments',
}

export default function HelpPage() {
  const resources = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of investing on LenDen',
      links: [
        { label: 'Complete your KYC', href: '/auth/onboarding' },
        { label: 'Browse Assets', href: '/explore' },
        { label: 'Make Your First Investment', href: '/marketplace/listings' },
      ],
    },
    {
      icon: Users,
      title: 'Portfolio Management',
      description: 'Manage your investments and track performance',
      links: [
        { label: 'View Portfolio', href: '/portfolio' },
        { label: 'Track Dividends', href: '/portfolio/dividends' },
        { label: 'View Transactions', href: '/transactions' },
      ],
    },
    {
      icon: Lock,
      title: 'Account Security',
      description: 'Keep your account safe and secure',
      links: [
        { label: 'Update Password', href: '/settings' },
        { label: 'Two-Factor Authentication', href: '/settings' },
        { label: 'Connected Devices', href: '/settings' },
      ],
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Understand your investment performance',
      links: [
        { label: 'Portfolio Overview', href: '/portfolio' },
        { label: 'Performance Metrics', href: '/portfolio' },
        { label: 'Asset Allocation', href: '/portfolio' },
      ],
    },
  ]

  const faqs = [
    {
      q: 'What is a fractional share?',
      a: 'A fractional share allows you to own a portion of a high-value asset. Instead of buying an entire building or artwork, you can invest smaller amounts and own a percentage.',
    },
    {
      q: 'How do I withdraw my funds?',
      a: 'You can request a withdrawal from your account settings. Funds typically appear in your bank account within 3-5 business days.',
    },
    {
      q: 'What fees does LenDencharge?',
      a: 'We charge a 2% management fee annually and a 1% transaction fee on purchases. No fees for selling on the secondary market.',
    },
    {
      q: 'Can I sell my shares anytime?',
      a: 'Yes! The secondary marketplace allows you to sell your shares 24/7. Liquidity may vary depending on asset demand.',
    },
    {
      q: 'How are dividends paid?',
      a: 'Dividends from assets are automatically distributed to your account monthly. You can reinvest or withdraw them anytime.',
    },
    {
      q: 'Is my money safe?',
      a: 'All assets are held in segregated accounts. Your investments are protected by insurance and regulatory oversight.',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Help & Support</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Find answers and learn how to make the most of LenDen
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, idx) => {
            const Icon = resource.icon
            return (
              <div key={idx} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                    <div className="space-y-2">
                      {resource.links.map((link, linkIdx) => (
                        <Link
                          key={linkIdx}
                          href={link.href}
                          className="block text-sm text-accent hover:underline"
                        >
                          → {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Can&apos;t find what you need?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you with any questions or issues.
          </p>
          <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </main>
  )
}
