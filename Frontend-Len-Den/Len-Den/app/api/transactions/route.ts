export async function POST(request: Request) {
  const body = await request.json()

  // Mock response - in production, integrate with payment processor
  return Response.json(
    {
      transactionId: `TXN-${Date.now()}`,
      ...body,
      status: 'completed',
      timestamp: new Date().toISOString(),
      confirmationCode: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    },
    { status: 201 }
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '20'

  // Mock response
  return Response.json({
    transactions: [
      {
        id: '1',
        type: 'buy',
        asset: 'Manhattan Commercial Tower',
        amount: 5000,
        date: '2024-12-15',
        status: 'completed',
      },
    ],
    total: 1,
    limit: parseInt(limit),
  })
}
