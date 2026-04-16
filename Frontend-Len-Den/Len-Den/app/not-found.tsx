import Link from 'next/link'
import { AlertCircle, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
      </div>
    </main>
  )
}
