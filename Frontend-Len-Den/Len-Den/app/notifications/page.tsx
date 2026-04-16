'use client'

import { useState } from 'react'
import { Bell, Trash2, CheckCircle2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error'
  timestamp: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Investment Successful',
      message: 'Your investment of $5,000 in Manhattan Commercial Tower has been confirmed.',
      type: 'success',
      timestamp: '2024-12-15 14:32',
      read: false,
    },
    {
      id: '2',
      title: 'Dividend Payment',
      message: 'You received a dividend payment of $2,850 from Manhattan Commercial Tower.',
      type: 'success',
      timestamp: '2024-12-15 10:15',
      read: false,
    },
    {
      id: '3',
      title: 'New Asset Available',
      message: 'Check out the newly listed "Coastal Luxury Resort" - perfect for your portfolio.',
      type: 'info',
      timestamp: '2024-12-14 16:45',
      read: true,
    },
    {
      id: '4',
      title: 'Portfolio Update',
      message: 'Your portfolio gained $12,450 this month due to market appreciation.',
      type: 'success',
      timestamp: '2024-12-14 09:00',
      read: true,
    },
    {
      id: '5',
      title: 'Price Alert',
      message: 'Premium Gold Ingots price has dropped 3.2%. Good time to buy?',
      type: 'warning',
      timestamp: '2024-12-13 18:30',
      read: true,
    },
  ])

  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'info'>('all')

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const typeConfig = {
    success: { bg: 'bg-green-500/10', border: 'border-green-200/50', text: 'text-green-600', icon: '✓' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-200/50', text: 'text-yellow-600', icon: '⚠' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-200/50', text: 'text-blue-600', icon: 'ℹ' },
    error: { bg: 'bg-red-500/10', border: 'border-red-200/50', text: 'text-red-600', icon: '✕' },
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notifications
            </h1>
          </div>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-accent hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'unread', 'success', 'warning', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(notification => {
              const config = typeConfig[notification.type]
              return (
                <div
                  key={notification.id}
                  className={`${config.bg} border ${config.border} rounded-lg p-4 flex gap-4 transition-opacity ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${config.text}`}>{config.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-foreground/10 rounded transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
