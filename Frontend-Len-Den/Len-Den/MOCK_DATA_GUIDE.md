# Mock Data Guide - LenDen

## Overview

All data in this application is mocked using TypeScript files located in `/lib/data/`. No backend required to see the full UI with realistic data. Perfect for demonstrations and frontend development.

---

## Data Files

### 1. mockAssets.ts
**File:** `/lib/data/mockAssets.ts`
**Contains:** Investment asset listings

**Asset Structure:**
```typescript
{
  id: string
  name: string
  description: string
  category: 'real-estate' | 'gold' | 'art' | 'startup' | 'commodities'
  location: string
  pricePerUnit: number
  unitsAvailable: number
  totalValue: number
  expectedAnnualROI: number
  riskScore: number (0-10)
  tokenContract: string
  documentURL: string
  legalStatus: 'approved' | 'pending' | 'suspended'
  investorCount: number
  yearFounded: number
}
```

**Sample Assets:**
- **Marina Bay Tower** - Real Estate in Singapore, $250K per unit, 8.5% ROI
- **Swiss Gold Reserve** - Gold in Switzerland, $2.5M per unit, 6.2% ROI
- **Banksy Original** - Art in London, $500K per unit, 12% ROI
- **TechVenture AI** - Startup in San Francisco, $50K per unit, 18% ROI
- **Copper Mining** - Commodities in Chile, $100K per unit, 9% ROI

**15 Total Assets** across all categories

---

### 2. mockUsers.ts
**File:** `/lib/data/mockUsers.ts`
**Contains:** User profiles and current user data

**User Structure:**
```typescript
{
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  country: string
  kycStatus: 'pending' | 'approved' | 'rejected'
  accreditationStatus: 'verified' | 'unverified'
  createdAt: string
  totalInvested: number
  totalDividends: number
  portfolio: Array<{
    assetId: string
    unitsOwned: number
    unitPrice: number
    investmentDate: string
  }>
}
```

**Current User:**
- Name: John Smith
- Email: john@example.com
- KYC Status: Approved
- Accreditation: Verified
- Total Invested: $2,500,000
- Portfolio: 6 assets with various holdings

**Portfolio Holdings (Current User):**
1. Marina Bay Tower - 100 units
2. Swiss Gold Reserve - 50 units
3. Banksy Original - 15 units
4. TechVenture AI - 200 units
5. Copper Mining - 75 units
6. Real Estate Fund - 500 units

---

### 3. mockTransactions.ts
**File:** `/lib/data/mockTransactions.ts`
**Contains:** Transaction history and dividend records

**Transaction Structure:**
```typescript
{
  id: string
  userId: string
  assetId: string
  type: 'buy' | 'sell' | 'dividend' | 'withdrawal'
  quantity?: number
  unitPrice?: number
  totalAmount: number
  transactionFee: number
  date: string
  status: 'completed' | 'pending' | 'failed'
  txHash?: string
}
```

**Sample Transactions:**
- Buy orders (varying dates and amounts)
- Sell orders (secondary marketplace)
- Dividend distributions (quarterly)
- Withdrawal transactions
- Platform fees captured

**~50 Total Transactions** with realistic distributions

---

### 4. mockPendingListings.ts
**File:** `/lib/data/mockPendingListings.ts`
**Contains:** New asset listings awaiting admin approval

**Pending Listing Structure:**
```typescript
{
  id: string
  assetName: string
  category: string
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'reviewing' | 'approved'
  documents: string[]
  legalReview: boolean
  estimatedROI: number
}
```

**Sample Pending Listings:**
- Various new assets awaiting verification
- Different submission dates
- Various approval stages
- Complete documentation

---

## Using Mock Data

### Accessing Assets
```typescript
import { mockAssets } from '@/lib/data/mockAssets'

// Get all assets
const allAssets = mockAssets

// Find specific asset
const asset = mockAssets.find(a => a.id === 'asset-1')

// Filter by category
const realEstate = mockAssets.filter(a => a.category === 'real-estate')
```

### Accessing User Data
```typescript
import { currentUser, mockUsers } from '@/lib/data/mockUsers'

// Get current logged-in user
const user = currentUser

// Get all users (admin only)
const allUsers = mockUsers

// Get user portfolio
const portfolio = currentUser.portfolio
```

### Accessing Transactions
```typescript
import { mockTransactions } from '@/lib/data/mockTransactions'

// Get user transactions
const userTxns = mockTransactions.filter(t => t.userId === 'user-1')

// Get dividends only
const dividends = mockTransactions.filter(t => t.type === 'dividend')

// Get transactions for specific asset
const assetTxns = mockTransactions.filter(t => t.assetId === 'asset-1')
```

---

## Realistic Mock Patterns

### Portfolio Performance
- Holdings show realistic gain/loss percentages
- ROI calculations based on purchase and current prices
- Dividend distributions quarterly
- Performance charts show 6-month historical data

### Transaction History
- Dates span 2 years of activity
- Mix of buys, sells, and dividends
- Transaction fees are realistic (0.5-1%)
- Mix of pending, completed, and failed statuses

### User Metrics
- Total portfolio value: $2.75M
- Average holding period: 18 months
- Received dividends: $125,000+
- Active in 6 different assets

### Asset Metrics
- Price per unit: $50K - $2.5M
- ROI ranges: 4% - 20% annually
- Risk scores: 2 - 8 out of 10
- Investor count: 50 - 500+ per asset

---

## Demo Scenarios

### Scenario 1: Browse & Invest
1. Start at `/explore` - browse available assets
2. Click asset to see details at `/marketplace/listings/[id]`
3. (Would need login/onboarding in production)
4. See investment form ready to invest

### Scenario 2: Portfolio Review
1. Login → `/dashboard` to see overview
2. Visit `/portfolio` for detailed analytics
3. View performance charts and allocation
4. Check `/portfolio/dividends` for income
5. See `/transactions` for complete history

### Scenario 3: Secondary Trading
1. View own holdings at `/portfolio`
2. List items on `/marketplace/secondary`
3. Browse other investors' listings
4. Complete buy/sell transactions

### Scenario 4: Admin Verification
1. Login as admin
2. Visit `/admin/verification-queue`
3. Review pending user KYC documents
4. Approve or request resubmission
5. Track verification status

### Scenario 5: Platform Monitoring
1. Admin dashboard at `/admin/dashboard`
2. View platform metrics and health
3. Review `/admin/users` for user management
4. Check `/admin/listings` for asset moderation
5. Audit `/admin/audit-log` for all activities

---

## Customizing Mock Data

To modify mock data for different demo scenarios:

1. **Edit `/lib/data/mockAssets.ts`**
   - Change asset prices
   - Adjust ROI expectations
   - Add/remove assets
   - Modify asset descriptions

2. **Edit `/lib/data/mockUsers.ts`**
   - Change user portfolio
   - Adjust account balances
   - Modify user details
   - Add more test users

3. **Edit `/lib/data/mockTransactions.ts`**
   - Add transaction history
   - Modify dividend distributions
   - Adjust fees
   - Change transaction dates

---

## Performance Considerations

- All data loads instantly (no API calls)
- Perfect for local development and testing
- No rate limiting or API quotas
- Use for demos without bandwidth concerns
- Replace with actual API when backend ready

---

## Data Consistency

The mock data is carefully crafted to be realistic:
- Portfolio holdings match asset IDs
- User transactions reference valid assets
- Pending listings include realistic fields
- All IDs follow consistent patterns
- Numbers are realistic for a fintech platform

---

## Next Steps: Backend Integration

When ready to connect a real backend:

1. Replace import statements to use API calls
2. Use SWR or React Query for data fetching
3. Update components to handle loading/error states
4. Keep mock data for fallback/offline scenarios
5. Update TypeScript interfaces to match API responses

---

## Example Data Transformation

### Current (Mock)
```typescript
import { mockAssets } from '@/lib/data/mockAssets'
const assets = mockAssets
```

### Future (API)
```typescript
import useSWR from 'swr'

function useAssets() {
  const { data, error, isLoading } = useSWR('/api/assets')
  return { assets: data || [], isLoading, error }
}
```
