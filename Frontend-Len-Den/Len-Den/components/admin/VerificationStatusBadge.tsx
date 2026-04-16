'use client'

import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface VerificationStatusBadgeProps {
  status: 'approved' | 'rejected' | 'pending'
  size?: 'sm' | 'md' | 'lg'
}

export function VerificationStatusBadge({ status, size = 'md' }: VerificationStatusBadgeProps) {
  const configs = {
    approved: {
      bg: 'bg-accent/10',
      text: 'text-accent',
      icon: CheckCircle,
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      icon: XCircle,
      label: 'Rejected',
    },
    pending: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600',
      icon: Clock,
      label: 'Pending',
    },
  }

  const config = configs[status]
  const Icon = config.icon
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      <Icon className={`w-${size === 'sm' ? '3' : size === 'md' ? '4' : '5'} h-${size === 'sm' ? '3' : size === 'md' ? '4' : '5'}`} />
      <span className="font-medium">{config.label}</span>
    </div>
  )
}
