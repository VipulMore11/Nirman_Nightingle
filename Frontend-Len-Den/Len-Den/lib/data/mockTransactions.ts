export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  type: 'buy' | 'sell' | 'dividend';
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    userId: 'user-001',
    assetId: 'asset-001',
    type: 'buy',
    units: 2000,
    pricePerUnit: 500,
    totalAmount: 1000000,
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: 'txn-002',
    userId: 'user-001',
    assetId: 'asset-001',
    type: 'dividend',
    units: 2000,
    pricePerUnit: 10.625,
    totalAmount: 21250,
    date: '2024-03-31',
    status: 'completed',
  },
  {
    id: 'txn-003',
    userId: 'user-001',
    assetId: 'asset-003',
    type: 'buy',
    units: 5000,
    pricePerUnit: 100,
    totalAmount: 500000,
    date: '2024-02-20',
    status: 'completed',
  },
  {
    id: 'txn-004',
    userId: 'user-001',
    assetId: 'asset-007',
    type: 'buy',
    units: 1500,
    pricePerUnit: 800,
    totalAmount: 1200000,
    date: '2023-12-10',
    status: 'completed',
  },
  {
    id: 'txn-005',
    userId: 'user-001',
    assetId: 'asset-007',
    type: 'dividend',
    units: 1500,
    pricePerUnit: 73.33,
    totalAmount: 110000,
    date: '2024-04-30',
    status: 'completed',
  },
  {
    id: 'txn-006',
    userId: 'user-002',
    assetId: 'asset-002',
    type: 'buy',
    units: 3000,
    pricePerUnit: 1000,
    totalAmount: 3000000,
    date: '2023-09-05',
    status: 'completed',
  },
  {
    id: 'txn-007',
    userId: 'user-002',
    assetId: 'asset-005',
    type: 'buy',
    units: 800,
    pricePerUnit: 2000,
    totalAmount: 1600000,
    date: '2024-02-14',
    status: 'completed',
  },
  {
    id: 'txn-008',
    userId: 'user-003',
    assetId: 'asset-004',
    type: 'buy',
    units: 4000,
    pricePerUnit: 200,
    totalAmount: 800000,
    date: '2024-01-20',
    status: 'completed',
  },
];
