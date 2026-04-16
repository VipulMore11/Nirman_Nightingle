'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          An error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </main>
  )
}
