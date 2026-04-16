'use client'

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon?: React.ReactNode
}

export function StatCard({ label, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {change !== undefined && (
          <p className={`text-xs font-semibold ${trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
            {trend === 'up' ? '+' : '-'}{Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  )
}
