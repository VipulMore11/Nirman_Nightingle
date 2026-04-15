# LenDen- Fractional Asset Investment Platform

A production-grade UI for a decentralized fractional ownership marketplace. This platform enables users to invest in high-value assets globally with blockchain security and institutional-grade compliance.

## 🎯 Project Overview

LenDenis a comprehensive fractional asset investment platform featuring:

- **Primary Marketplace**: Browse and invest in tokenized real estate, gold, art, startups, and more
- **Secondary Marketplace**: Trade fractional shares with other investors
- **User Portfolio**: Track holdings, performance, and dividends
- **Admin Dashboard**: Verify listings, manage users, and oversee platform operations
- **KYC Onboarding**: 3-step verification process for regulatory compliance
- **Real-time Analytics**: Performance charts, allocation visualization, and transaction history

## 📁 Project Structure

```
app/
├── page.tsx                    # Landing page
├── explore/                    # Asset discovery page
├── auth/
│   ├── login/                 # User login
│   ├── signup/                # User registration
│   └── onboarding/            # 3-step KYC verification
├── dashboard/                 # User dashboard
├── portfolio/                 # Portfolio analytics
├── transactions/              # Transaction history
├── settings/                  # User settings & profile
├── marketplace/
│   ├── listings/              # Asset marketplace
│   ├── listings/[id]/         # Asset details & investment
│   └── secondary/             # Secondary trading market
└── admin/
    ├── dashboard/             # Admin overview
    ├── verification/          # KYC verification queue
    ├── listings/              # Listing management
    └── users/                 # User management

components/
├── common/                    # Shared components
│   ├── Header.tsx            # Top navigation
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── StatCard.tsx          # Stat display card
│   ├── TransactionItem.tsx   # Transaction row
│   └── Dialog.tsx            # Modal component
├── marketplace/
│   └── AssetCard.tsx         # Asset listing card
├── portfolio/
│   └── PortfolioCard.tsx     # Portfolio holding card
├── charts/
│   ├── PerformanceChart.tsx  # Line chart for performance
│   └── AllocationChart.tsx   # Pie chart for allocation
├── forms/
│   └── InvestmentForm.tsx    # Investment quantity selector
├── filters/
│   └── CategoryFilter.tsx    # Category filter buttons
└── admin/
    └── VerificationStatusBadge.tsx # Status indicators

lib/
├── data/
│   ├── mockAssets.ts         # 15+ sample assets
│   ├── mockUsers.ts          # User & portfolio data
│   ├── mockTransactions.ts   # Transaction history
│   └── mockPendingListings.ts # Admin verification queue
├── utils/
│   └── formatters.ts         # Formatting utilities
└── context/
    └── AuthContext.tsx       # Authentication state

app/
├── globals.css               # Theme & design tokens
└── layout.tsx                # Root layout
```

## 🎨 Design System

**Color Scheme** (Dark mode enabled by default):
- Background: Deep slate (#0a0e27)
- Cards: Dark blue (#1a1f3a)
- Primary Accent: Emerald green (#10b981)
- Charts: Blue, Green, Amber, Purple, Pink
- Text: Light gray/white for contrast

**Typography**:
- Font family: Geist (sans-serif)
- Sizing: Consistent Tailwind scale (text-sm, text-base, text-lg, etc.)
- Line heights: 1.4-1.6 for readability

## 🚀 Key Features

### User Experience
- **Landing Page**: Value proposition and featured assets
- **Explore Page**: Discover assets without login
- **Quick Onboarding**: 3-step KYC process with form validation
- **Dashboard**: Portfolio overview with key metrics
- **Investment Flow**: Select quantity and complete purchase
- **Transaction History**: Filter and view all activities

### Admin Features
- **Verification Queue**: Review pending KYC and listings
- **User Management**: Monitor and manage investor accounts
- **Listing Management**: Approve/reject asset listings
- **Platform Analytics**: Overview of AUM, investors, and growth

### Data Visualization
- **Performance Chart**: 6-month portfolio trend line
- **Allocation Chart**: Asset distribution pie chart
- **Real-time Stats**: Portfolio value, gains, daily changes

## 📊 Mock Data

The platform includes comprehensive mock data:

**Assets**: 15+ investments across categories
- Real Estate (office, residential, industrial)
- Precious Metals (gold, silver bars)
- Art & Collectibles (paintings, vintage cars)
- Startups (tech, biotech companies)
- Energy (wind farms, solar projects)

**Users**: Current user profile with portfolio
- Portfolio: 8-10 active holdings
- Total Invested: $250,000+
- Transactions: 25+ buy/sell/dividend records

**Transactions**: Complete history
- Buys, sells, dividends, withdrawals
- Date ranges and status (completed/pending)

## 🎯 Usage

### 1. **View Landing Page**
   ```
   Navigate to / (home)
   ```

### 2. **Browse Assets (No Login)**
   ```
   Navigate to /explore
   Browse marketplace at /marketplace/listings
   ```

### 3. **Sign Up & Onboard**
   ```
   Click "Start Investing" on landing page
   Complete 3-step KYC verification
   ```

### 4. **Invest**
   ```
   From dashboard or marketplace, click "Invest Now"
   Select quantity using the investment form
   Complete purchase
   ```

### 5. **Manage Portfolio**
   ```
   View holdings at /portfolio
   Track performance and allocation
   View transaction history at /transactions
   ```

### 6. **Admin Functions** (Access via /admin)
   ```
   Review KYC at /admin/verification
   Manage listings at /admin/listings
   Manage users at /admin/users
   ```

## 🔧 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS with custom design tokens
- **State**: Context API + React hooks
- **Type Safety**: TypeScript

## 🎨 Customization Guide

### Change Theme Colors
Edit `/app/globals.css`:
```css
:root {
  --accent: #10b981;        /* Primary action color */
  --primary: #0f172a;       /* Text/dark elements */
  --background: #0a0e27;    /* Page background */
  --card: #1a1f3a;          /* Card backgrounds */
}
```

### Add New Asset Category
1. Update mock data in `/lib/data/mockAssets.ts`
2. Add category to category filter in marketplace
3. Category will auto-appear in filters

### Customize Investment Form
Edit `/components/forms/InvestmentForm.tsx` to:
- Change min/max investment limits
- Add additional validation rules
- Customize payment methods

## 🔐 Security Notes

This is a demo/showcase UI with mock data. For production:
- Implement real authentication (Supabase, Auth0, etc.)
- Add backend API validation
- Implement proper KYC/AML verification
- Add blockchain integration for tokenization
- Implement proper role-based access control
- Add rate limiting and fraud detection
- Use HTTPS and secure session management

## 📱 Responsive Design

- **Mobile**: Full-featured on mobile with collapsible sidebar
- **Tablet**: Optimized layout for medium screens
- **Desktop**: Full dashboard and admin features
- Navigation adapts to screen size automatically

## 🎯 Next Steps for Development

1. **Connect Backend API**: Replace mock data with real API calls
2. **Add Authentication**: Implement real user auth system
3. **Blockchain Integration**: Add smart contract interaction
4. **Payment Processing**: Integrate Stripe/PayPal
5. **Real KYC**: Add document verification service
6. **Email Notifications**: Add transactional emails
7. **Mobile App**: React Native version

## 📝 Notes

- All data is client-side mock data for demonstration
- No backend API calls are made
- Forms are functional but don't submit anywhere
- Admin features are fully visible (in production, add role-based access)
- Charts use static data for demo purposes

## 🎓 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Recharts**: https://recharts.org
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Built with v0** | Production-grade UI for fintech applications
