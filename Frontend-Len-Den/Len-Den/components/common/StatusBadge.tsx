'use client'

import { Check, Clock, AlertCircle, X } from 'lucide-react'

interface StatusBadgeProps {
  status: 'success' | 'pending' | 'warning' | 'error'
  label: string
  showIcon?: boolean
}

export function StatusBadge({ status, label, showIcon = true }: StatusBadgeProps) {
  const config = {
    success: {
      bg: 'bg-green-500/10',
      text: 'text-green-600',
      border: 'border-green-200/50',
      icon: Check,
    },
    pending: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600',
      border: 'border-yellow-200/50',
      icon: Clock,
    },
    warning: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-600',
      border: 'border-orange-200/50',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-500/10',
      text: 'text-red-600',
      border: 'border-red-200/50',
      icon: X,
    },
  }

  const Icon = config[status].icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config[status].bg} ${config[status].border}`}>
      {showIcon && <Icon className={`w-3 h-3 ${config[status].text}`} />}
      <span className={`text-xs font-semibold ${config[status].text}`}>{label}</span>
    </div>
  )
}

export default StatusBadge
