# Project Structure & Architecture

## Directory Overview

```
LenDen/
├── app/                          # Next.js App Router
│   ├── (root pages)
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles with theme
│   ├── auth/
│   │   ├── login/page.tsx       # User login
│   │   ├── signup/page.tsx      # User registration
│   │   └── onboarding/page.tsx  # 3-step KYC flow
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard wrapper
│   │   └── page.tsx             # Main dashboard
│   ├── marketplace/
│   │   ├── layout.tsx           # Marketplace layout
│   │   ├── listings/page.tsx    # Primary marketplace
│   │   ├── listings/[id]/page.tsx # Asset details
│   │   └── secondary/page.tsx   # Secondary trading
│   ├── portfolio/
│   │   ├── layout.tsx           # Portfolio wrapper
│   │   ├── page.tsx             # Portfolio overview
│   │   └── dividends/page.tsx   # Dividend history
│   ├── admin/
│   │   ├── layout.tsx           # Admin wrapper
│   │   ├── dashboard/page.tsx   # Admin overview
│   │   ├── verification/page.tsx # KYC verification
│   │   ├── verification-queue/page.tsx
│   │   ├── listings/page.tsx    # Listing management
│   │   ├── users/page.tsx       # User management
│   │   └── audit-log/page.tsx   # Activity log
│   ├── api/
│   │   ├── portfolio/route.ts   # Portfolio endpoints
│   │   └── transactions/route.ts # Transaction endpoints
│   ├── [other pages]/           # Additional pages
│   │   ├── transactions/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── explore/page.tsx
│   │   └── help/page.tsx
│
├── components/
│   ├── common/                  # Shared components
│   │   ├── Header.tsx           # Top navigation
│   │   ├── Sidebar.tsx          # Left sidebar navigation
│   │   ├── StatCard.tsx         # Statistics display
│   │   ├── TransactionItem.tsx  # Transaction list item
│   │   ├── Dialog.tsx           # Modal/dialog
│   │   ├── SearchFilterBar.tsx  # Search with filters
│   │   ├── Breadcrumbs.tsx      # Navigation breadcrumbs
│   │   ├── Skeletons.tsx        # Loading skeletons
│   │   └── index.ts             # Barrel export
│   ├── marketplace/
│   │   └── AssetCard.tsx        # Asset listing card
│   ├── portfolio/
│   │   ├── PortfolioCard.tsx    # Holdings card
│   │   └── DividendHistory.tsx  # Dividend component
│   ├── charts/
│   │   ├── PerformanceChart.tsx # Line chart
│   │   └── AllocationChart.tsx  # Pie chart
│   ├── admin/
│   │   ├── AdminStatsOverview.tsx # Stats cards
│   │   ├── VerificationQueue.tsx  # Pending verification
│   │   ├── AuditLog.tsx           # Activity log
│   │   └── VerificationStatusBadge.tsx
│   ├── forms/
│   │   └── InvestmentForm.tsx   # Purchase form
│   ├── filters/
│   │   └── CategoryFilter.tsx   # Category selector
│   └── ui/                       # shadcn/ui components
│       └── [auto-generated]
│
├── lib/
│   ├── data/                    # Mock data
│   │   ├── mockAssets.ts        # 15+ assets
│   │   ├── mockUsers.ts         # 1250+ users
│   │   ├── mockTransactions.ts  # Transaction history
│   │   └── mockPendingListings.ts # Pending items
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx      # Auth state
│   │   └── ModalContext.tsx     # Modal state
│   └── utils/
│       └── formatters.ts        # Format functions
│
├── public/                       # Static assets
│
├── [Config Files]
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   └── tailwind.config.ts
│
└── [Documentation]
    ├── README.md                # Project overview
    ├── SETUP.md                # Setup instructions
    ├── DEMO_DATA.md            # Mock data guide
    └── PROJECT_STRUCTURE.md    # This file
```

## Component Architecture

### Layout Hierarchy
```
RootLayout
├── Header (sticky top nav)
├── Sidebar (left nav, responsive)
└── Main Content
    ├── Breadcrumbs (page navigation)
    ├── Page Title & Actions
    └── Page Content
        ├── Cards/Grids
        ├── Charts
        ├── Tables
        └── Forms
```

### Data Flow
```
Mock Data (lib/data/)
    ↓
Components (using mock data)
    ↓
Pages (rendering components)
    ↓
Displayed to User

[Future: Replace with API calls]
API Endpoints (app/api/)
    ↓
Database/External Services
```

## Key Design Decisions

### Color System (Production Fintech)
- **Background**: Dark slate (#0a0e27)
- **Cards**: Slightly lighter (#1a1f3a)
- **Accent**: Green (#10b981) - for success/primary actions
- **Text**: Light (#f1f5f9)
- **Muted**: Gray (#94a3b8)

### Typography
- **Headings**: Geist Sans, bold weights
- **Body**: Geist Sans, regular weight
- **Mono**: Geist Mono (for codes/numbers)

### Layout Approach
- **Desktop**: Sidebar + Main content
- **Tablet**: Collapsible sidebar + Main content
- **Mobile**: Hidden sidebar + Floating menu button

### Component Philosophy
- Reusable and composable
- No hard-coded strings (use props)
- Consistent styling via Tailwind tokens
- Accessible HTML structure
- Mock data injection ready

## Data Models

### Asset
```typescript
{
  id: string
  name: string
  type: 'real-estate' | 'commodities' | 'art' | 'startup'
  location: string
  description: string
  image: string
  totalValue: number
  availableShares: number
  pricePerShare: number
  historicalReturns: number // percentage
  dividendYield: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'pending-review' | 'closed'
  documents: string[]
}
```

### User
```typescript
{
  id: string
  name: string
  email: string
  kycStatus: 'pending' | 'verified' | 'rejected'
  portfolio: {
    holdings: Asset[]
    totalValue: number
    joinDate: string
  }
  documents: string[]
}
```

### Transaction
```typescript
{
  id: string
  type: 'buy' | 'sell' | 'dividend'
  assetId: string
  userId: string
  amount: number
  shares: number
  date: string
  status: 'pending' | 'completed' | 'failed'
}
```

## Styling System

### Tailwind Configuration
- Custom color tokens via CSS variables
- No arbitrary values (uses Tailwind scale)
- Responsive prefixes: `sm:`, `md:`, `lg:`
- Dark theme via `.dark` class on `<html>`

### CSS Variables (in globals.css)
```css
--background: #0a0e27      /* Main background */
--foreground: #f1f5f9      /* Main text */
--card: #1a1f3a            /* Card background */
--accent: #10b981          /* Primary action color */
--border: #2d3748          /* Border color */
--muted: #334155           /* Muted text */
```

## Performance Optimizations

- Server-side rendering for static pages
- Client-side state with React Context
- Lazy loading for images
- Code splitting via Next.js dynamic imports
- No external image CDN (using avataaars for demo)

## Security Considerations

- Mock authentication (replace with real auth)
- No sensitive data in mock data
- All forms ready for backend validation
- Ready for HTTPS deployment
- CORS-ready for API integration

## Testing & Development

### Development Mode
```bash
pnpm dev              # Watch mode with HMR
```

### Production Build
```bash
pnpm build            # Compile and optimize
pnpm start            # Run production build
```

### Linting
```bash
pnpm lint             # Check code quality
```

## Migration Checklist for Backend Integration

- [ ] Replace mock data with API calls
- [ ] Implement real authentication
- [ ] Set up database (Supabase, Neon, etc.)
- [ ] Create payment processing
- [ ] Add email notifications
- [ ] Implement file upload (avatar, documents)
- [ ] Set up admin verification workflow
- [ ] Add transaction confirmation emails
- [ ] Implement dividend distribution
- [ ] Set up compliance/audit logging
