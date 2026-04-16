import VerificationQueueComponent from '@/components/admin/VerificationQueue'

export const metadata = {
  title: 'Verification Queue - Admin',
  description: 'Review and manage pending asset listings',
}

export default function VerificationPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-8 max-w-7xl">
        <VerificationQueueComponent />
      </div>
    </main>
  )
}
