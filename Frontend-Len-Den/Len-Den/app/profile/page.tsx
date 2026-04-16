'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Calendar, Verified, ShieldAlert, ArrowRight } from 'lucide-react'
import { mockUsers } from '@/lib/data/mockUsers'

export default function ProfilePage() {
  // Using user-003 (James Morrison) to demo unverified state; swap index to 0 for verified demo
  const user = mockUsers[2]          // pending KYC
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const profileFields = [
    { label: 'Full Name', value: user.name, icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Phone', value: user.phone, icon: Phone },
    { label: 'Location', value: user.country, icon: MapPin },
    { label: 'Member Since', value: user.joinedDate, icon: Calendar },
  ]

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {user.name}
              {user.kycStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                  <Verified className="w-3 h-3" /> Verified
                </span>
              )}
              {user.kycStatus === 'pending' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-semibold">
                  KYC Pending
                </span>
              )}
              {user.kycStatus === 'rejected' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-semibold">
                  KYC Rejected
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
          >
            {isEditing ? 'Done' : 'Edit Profile'}
          </button>
        </div>

        {/* ── KYC NOT Verified Banner ── */}
        {user.kycStatus !== 'verified' && (
          <div
            className={`rounded-xl border p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
              user.kycStatus === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-orange-50 border-orange-200'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                user.kycStatus === 'rejected' ? 'bg-red-100' : 'bg-orange-100'
              }`}
            >
              <ShieldAlert
                className={`w-5 h-5 ${
                  user.kycStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <p
                className={`font-semibold text-sm ${
                  user.kycStatus === 'rejected' ? 'text-red-800' : 'text-orange-800'
                }`}
              >
                {user.kycStatus === 'rejected'
                  ? 'KYC Verification Rejected'
                  : 'KYC Verification Required'}
              </p>
              <p
                className={`text-xs mt-1 ${
                  user.kycStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'
                }`}
              >
                {user.kycStatus === 'rejected'
                  ? 'Your previous submission was rejected. Please re-submit with valid Aadhaar and a clear selfie.'
                  : 'Your identity has not been verified yet. Complete KYC to unlock full investment features.'}
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/onboarding')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                user.kycStatus === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {user.kycStatus === 'rejected' ? 'Re-verify KYC' : 'Verify KYC Now'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Personal Information ── */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map((field, idx) => {
              const Icon = field.icon
              return (
                <div key={idx}>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Icon className="w-4 h-4" />
                    {field.label}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{field.value}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── KYC Status Card ── */}
        <div
          className={`border rounded-lg p-6 mb-6 ${
            user.kycStatus === 'verified'
              ? 'bg-green-500/10 border-green-200/50'
              : user.kycStatus === 'rejected'
              ? 'bg-red-500/10 border-red-200/50'
              : 'bg-orange-500/10 border-orange-200/50'
          }`}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Verified
              className={`w-5 h-5 ${
                user.kycStatus === 'verified'
                  ? 'text-green-600'
                  : user.kycStatus === 'rejected'
                  ? 'text-red-500'
                  : 'text-orange-500'
              }`}
            />
            KYC Verification Status
          </h2>

          {user.kycStatus === 'verified' ? (
            <>
              <p className="text-foreground mb-4">Your account has been successfully verified.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Aadhaar', 'Address', 'Selfie'].map((label) => (
                  <div key={label} className="bg-background/50 rounded p-4">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="font-semibold text-green-600">✓ Verified</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-foreground mb-4">
                {user.kycStatus === 'rejected'
                  ? 'Your KYC was rejected. Please re-submit your documents.'
                  : 'Complete your KYC verification to access all features.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {['Aadhaar', 'Address', 'Selfie'].map((label) => (
                  <div key={label} className="bg-background/50 rounded p-4">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p
                      className={`font-semibold ${
                        user.kycStatus === 'rejected' ? 'text-red-500' : 'text-orange-500'
                      }`}
                    >
                      {user.kycStatus === 'rejected' ? '✗ Rejected' : '○ Pending'}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/auth/onboarding')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  user.kycStatus === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {user.kycStatus === 'rejected' ? 'Re-submit KYC' : 'Start KYC Verification'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* ── Account Preferences ── */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Account Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates about your investments</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Enhanced security for your account</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Marketing Communications</p>
                <p className="text-xs text-muted-foreground">Updates on new opportunities</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded" />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
