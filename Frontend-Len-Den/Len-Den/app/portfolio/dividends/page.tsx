import DividendHistoryComponent from '@/components/portfolio/DividendHistory'

export const metadata = {
  title: 'Dividend History - LenDen',
  description: 'View all dividend payments and earnings from your portfolio',
}

export default function DividendHistoryPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-8 max-w-7xl">
        <DividendHistoryComponent />
      </div>
    </main>
  )
}
