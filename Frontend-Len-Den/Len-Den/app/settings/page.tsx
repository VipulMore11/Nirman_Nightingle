'use client'

import { useEffect, useState } from 'react'
import { Header, Sidebar } from '@/components/common'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogOut, Settings, AlertCircle, Loader } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouteProtection } from '@/lib/utils/protectedRoute'
import { getProfile, updateProfile, ProfileData } from '@/lib/utils/profileService'

export default function SettingsPage() {
  const { user } = useAuth()
  const { isProtected, isLoading: isProtecting } = useRouteProtection({ requireAuth: true })
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_no: '',
    age: '',
    dob: '',
  })

  useEffect(() => {
    if (!isProtected || isProtecting) return

    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await getProfile()
        setProfile(data)
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_no: data.phone_no || '',
          age: data.age?.toString() || '',
          dob: data.dob || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isProtected, isProtecting])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      setIsSaving(true)
      const updated = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_no: formData.phone_no,
        age: formData.age ? parseInt(formData.age) : undefined,
        dob: formData.dob,
      })
      setProfile(updated)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isProtecting || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!isProtected || !profile) {
    return null
  }

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

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex gap-2 mb-4">
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">First Name</label>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Last Name</label>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="bg-secondary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Phone Number</label>
                    <Input
                      type="text"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      placeholder="+91 XXXX XXX XXX"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Age</label>
                    <Input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <Button className="bg-accent hover:bg-accent/90" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
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
