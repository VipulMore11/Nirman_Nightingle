export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="p-4 border-b border-border bg-muted h-12"></div>
      <div className="space-y-0 border-b border-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-muted/50"></div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/4 mb-6"></div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`flex-1 bg-muted rounded`} style={{ height: `${(i + 1) * 20}%` }}></div>
        ))}
      </div>
    </div>
  )
}
