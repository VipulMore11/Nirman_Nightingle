export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  totalInvested: number;
  totalGains: number;
  portfolio: {
    assetId: string;
    unitsOwned: number;
    unitPrice: number;
  }[];
  joinedDate: string;
  avatar: string;
}

export const mockUsers: UserProfile[] = [
  {
    id: 'user-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91-98765-43210',
    country: 'India',
    kycStatus: 'verified',
    totalInvested: 2500000,
    totalGains: 187500,
    portfolio: [
      { assetId: 'asset-001', unitsOwned: 2000, unitPrice: 500 },
      { assetId: 'asset-003', unitsOwned: 5000, unitPrice: 100 },
      { assetId: 'asset-007', unitsOwned: 1500, unitPrice: 800 },
    ],
    joinedDate: '2023-06-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
  },
  {
    id: 'user-002',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    phone: '+65-9876-5432',
    country: 'Singapore',
    kycStatus: 'verified',
    totalInvested: 5000000,
    totalGains: 425000,
    portfolio: [
      { assetId: 'asset-002', unitsOwned: 3000, unitPrice: 1000 },
      { assetId: 'asset-005', unitsOwned: 800, unitPrice: 2000 },
      { assetId: 'asset-012', unitsOwned: 200, unitPrice: 2500 },
    ],
    joinedDate: '2023-03-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  },
  {
    id: 'user-003',
    name: 'James Morrison',
    email: 'james@example.com',
    phone: '+44-7700-900000',
    country: 'United Kingdom',
    kycStatus: 'pending',
    totalInvested: 1500000,
    totalGains: 67500,
    portfolio: [
      { assetId: 'asset-004', unitsOwned: 4000, unitPrice: 200 },
      { assetId: 'asset-009', unitsOwned: 1500, unitPrice: 750 },
    ],
    joinedDate: '2024-01-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
  },
];

// Current logged-in user (for demo)
export const currentUser: UserProfile = mockUsers[0];
