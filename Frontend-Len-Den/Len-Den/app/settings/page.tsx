'use client'

import { Header, Sidebar } from '@/components/common'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { currentUser } from '@/lib/data/mockUsers'
import { LogOut, Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {/* Profile Settings */}
            <Card className="p-6 mb-6 border-border bg-card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
                  <p className="text-sm text-muted-foreground">Update your account details</p>
                </div>
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue={currentUser.name.split(' ')[0]}
                      className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue={currentUser.name.split(' ')[1] || ''}
                      className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Country</label>
                  <input
                    type="text"
                    defaultValue={currentUser.country || 'USA'}
                    className="w-full bg-secondary border border-border rounded px-3 py-2 text-foreground"
                    readOnly
                  />
                </div>

                <Button className="bg-accent hover:bg-accent/90">Save Changes</Button>
              </div>
            </Card>

            {/* KYC Status */}
            <Card className="p-6 mb-6 border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded">
                  <span className="text-sm font-medium text-foreground">Identity Verification</span>
                  <span className="text-xs font-semibold text-accent">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded">
                  <span className="text-sm font-medium text-foreground">Address Verification</span>
                  <span className="text-xs font-semibold text-accent">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded">
                  <span className="text-sm font-medium text-foreground">Income Verification</span>
                  <span className="text-xs font-semibold text-yellow-600">Pending</span>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6 mb-6 border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Security</h2>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Session</h2>
              <Button variant="destructive" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
