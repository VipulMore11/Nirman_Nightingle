export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get('assetId')

  // Mock response
  return Response.json({
    assetId,
    owner: 'Rajesh Kumar',
    shares: 150,
    value: 75000,
    purchaseDate: '2024-06-15',
    performanceChange: 12.5,
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  // Mock response - in production, validate and save to database
  return Response.json(
    {
      id: Date.now(),
      ...body,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  )
}
