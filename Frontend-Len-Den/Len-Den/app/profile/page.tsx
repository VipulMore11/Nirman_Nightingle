'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Verified } from 'lucide-react'
import { mockUsers } from '@/lib/data/mockUsers'

export default function ProfilePage() {
  // Get a sample user for demo
  const user = mockUsers[0]
  const [isEditing, setIsEditing] = useState(false)

  const profileFields = [
    { label: 'Full Name', value: user.name, icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Phone', value: '+1 (555) 123-4567', icon: Phone },
    { label: 'Location', value: 'New York, NY', icon: MapPin },
    { label: 'Member Since', value: '2023-06-15', icon: Calendar },
  ]

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {user.name}
              {user.kycStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                  <Verified className="w-3 h-3" /> Verified
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

        {/* Profile Information */}
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

        {/* KYC Status */}
        <div className="bg-green-500/10 border border-green-200/50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Verified className="w-5 h-5 text-green-600" />
            KYC Verification Status
          </h2>
          <p className="text-foreground mb-4">Your account has been successfully verified.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background/50 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Identity</p>
              <p className="font-semibold text-green-600">✓ Verified</p>
            </div>
            <div className="bg-background/50 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-semibold text-green-600">✓ Verified</p>
            </div>
            <div className="bg-background/50 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="font-semibold text-green-600">✓ Verified</p>
            </div>
          </div>
        </div>

        {/* Account Preferences */}
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
