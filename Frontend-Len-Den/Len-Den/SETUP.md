# Setup Guide - LenDen

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Git for version control

## Installation

1. **Clone or download the project**
   ```bash
   cd LenDen
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or npm install / yarn install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## Project Structure

```
LenDen/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages (login, signup, onboarding)
│   ├── dashboard/         # User dashboard
│   ├── marketplace/       # Asset marketplace and listings
│   ├── portfolio/         # User portfolio and dividends
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes for backend integration
│   └── ...               # Other pages
├── components/           # Reusable React components
│   ├── common/          # Shared components (Header, Sidebar, etc)
│   ├── marketplace/     # Marketplace-specific components
│   ├── portfolio/       # Portfolio components
│   ├── admin/          # Admin components
│   ├── charts/         # Chart components
│   └── forms/          # Form components
├── lib/
│   ├── data/           # Mock data files
│   ├── context/        # React Context providers
│   └── utils/          # Utility functions
└── public/             # Static assets
```

## Navigation

### Public Routes
- `/` - Landing page
- `/explore` - Browse assets without logging in
- `/auth/login` - Login page
- `/auth/signup` - Sign up page
- `/auth/onboarding` - 3-step KYC verification
- `/help` - Help and documentation

### Protected Routes (After Login)
- `/dashboard` - Main dashboard with portfolio overview
- `/marketplace/listings` - Primary marketplace
- `/marketplace/listings/[id]` - Asset details
- `/marketplace/secondary` - Secondary marketplace for trading
- `/portfolio` - Portfolio management
- `/portfolio/dividends` - Dividend history
- `/transactions` - Transaction history
- `/settings` - Account settings
- `/profile` - User profile
- `/notifications` - Notification center
- `/admin/*` - Admin panel (for admins only)

## Key Features

✅ **Complete User Interface**
- Landing page with marketing copy
- Responsive design for desktop and mobile
- Dark theme with professional fintech aesthetic
- Production-ready component library

✅ **Authentication Flow**
- Login and signup pages
- 3-step KYC onboarding with form validation
- Mock user verification system

✅ **Marketplace**
- 15+ diverse assets (real estate, commodities, art, startups)
- Advanced filtering by category, min/max price, status
- Asset detail pages with charts and purchase forms
- Secondary marketplace for peer-to-peer trading

✅ **Portfolio Management**
- Portfolio overview with performance metrics
- Dividend tracking and history
- Asset allocation charts
- Transaction history with filters

✅ **Admin Dashboard**
- Platform statistics and metrics
- User verification management
- Pending listings review queue
- Audit log and compliance tracking
- User management interface

✅ **Mock Data**
- 15+ assets with realistic details
- 1250+ user profiles with KYC status
- 100+ transaction records
- Complete dividend history
- Pending listings for verification

## Customization

### Changing Colors
Edit `/app/globals.css` to modify the CSS variables for the dark theme:
- `--background` - Page background
- `--accent` - Primary action color (green by default)
- `--foreground` - Text color
- `--card` - Card background color

### Adding New Assets
Edit `/lib/data/mockAssets.ts` to add new assets with:
- Name, type, location
- Description, image, documents
- Valuation, available shares
- Risk level, dividend yield

### Modifying Users
Edit `/lib/data/mockUsers.ts` to adjust mock users with:
- Name, email, KYC status
- Portfolio value, investment amount
- Verification documents

## Backend Integration

The project is structured to easily swap mock data for real backend:

1. **API Routes** are set up in `/app/api/` ready for implementation
2. **Mock data** is isolated in `/lib/data/` - replace with API calls
3. **Context providers** in `/lib/context/` can manage real authentication
4. **Forms** use React Hook Form - ready for submission to backend

Replace mock data imports with API calls:
```typescript
// Before (mock data)
import { mockAssets } from '@/lib/data/mockAssets'

// After (real API)
const response = await fetch('/api/assets')
const assets = await response.json()
```

## Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Deploy with one click

### Deploy to Other Platforms
Works with any Node.js hosting:
- Netlify, Railway, Fly.io, Render
- Standard `npm run build && npm run start`

## Troubleshooting

**Port 3000 already in use?**
```bash
pnpm dev -- -p 3001
```

**Dependencies not installing?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Build errors?**
```bash
pnpm run build
```

## Support

For issues or questions:
1. Check `/help` page for FAQs
2. Review component implementations in `/components`
3. Check mock data structure in `/lib/data`
4. Review page implementations in `/app`
