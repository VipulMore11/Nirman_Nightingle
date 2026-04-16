import AuditLogComponent from '@/components/admin/AuditLog'

export const metadata = {
  title: 'Audit Log - Admin',
  description: 'View complete activity history and compliance records',
}

export default function AuditLogPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-8 max-w-7xl">
        <AuditLogComponent />
      </div>
    </main>
  )
}
