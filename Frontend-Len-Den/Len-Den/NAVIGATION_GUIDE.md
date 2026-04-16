# Navigation Guide - LenDenFractional Investment Platform

## Public Pages (No Authentication Required)

### Landing Page
**Route:** `/`
**Description:** Main landing page with hero, value propositions, and CTA buttons
**Key Sections:**
- Hero banner with platform overview
- Feature highlights (tokenization, liquidity, security)
- Asset statistics
- Call-to-action buttons for Login/Signup
- Footer with links

### Explore Assets
**Route:** `/explore`
**Description:** Public asset discovery page - users can browse available investments without login
**Features:**
- Asset filtering by category
- Search functionality
- ROI and risk indicators
- Investment tier display
- Links to details (requires login to invest)

## Authentication Pages

### Login
**Route:** `/auth/login`
**Description:** User login page
**Features:**
- Email/password form
- "Remember me" checkbox
- Link to signup
- Link to password recovery

### Signup
**Route:** `/auth/signup`
**Description:** User registration page
**Features:**
- Full name input
- Email input
- Password with strength indicator
- Terms acceptance checkbox
- Link to login

### Onboarding
**Route:** `/auth/onboarding`
**Description:** 3-step KYC verification process
**Steps:**
1. Personal Information (name, DOB, nationality, country)
2. Document Upload (ID, proof of address, accreditation letter)
3. Review & Accept Terms

---

## Authenticated User Pages

### Dashboard
**Route:** `/dashboard`
**Description:** Main user home page showing portfolio overview
**Key Sections:**
- Welcome banner with personalized greeting
- Portfolio metrics (total value, invested, gains, ROI)
- Current holdings summary
- Recent activity feed
- Quick action button to browse marketplace

### Portfolio
**Route:** `/portfolio`
**Description:** Detailed portfolio analysis and performance
**Sections:**
- Portfolio value overview
- Asset allocation pie chart
- Performance line chart (6-month)
- Detailed holdings table
- Asset breakdown by category
- Performance metrics

### Dividends
**Route:** `/portfolio/dividends`
**Description:** Dividend history and income tracking
**Features:**
- Dividend payment history
- Distribution breakdown by asset
- Expected future dividends
- Dividend yield analytics

### Marketplace - Listings
**Route:** `/marketplace/listings`
**Description:** Browse and filter investment opportunities
**Features:**
- Full asset catalog with filtering
- Category-based browsing (Real Estate, Gold, Art, Startups, Commodities)
- Search functionality
- Sorting (Popular, ROI, Risk)
- Asset cards with key metrics
- Min investment details

### Asset Details
**Route:** `/marketplace/listings/[id]`
**Description:** Detailed view of a specific asset
**Sections:**
- Asset overview and description
- Full financial metrics
- Historical performance chart
- Investment terms and conditions
- Legal documents
- Investment form with quantity selector
- Investment tier options
- Testimonials/investor comments

### Secondary Marketplace
**Route:** `/marketplace/secondary`
**Description:** Peer-to-peer trading of fractional units
**Features:**
- Active listings from other investors
- Bid/Ask spreads
- Trading history
- Volume indicators
- Sell your holdings
- Buy from other investors

### Transactions
**Route:** `/transactions`
**Description:** Transaction history and records
**Features:**
- Complete transaction history
- Filter by type (buy, sell, dividend)
- Filter by date range
- Transaction details
- Download statements

### Profile
**Route:** `/profile`
**Description:** User profile and account information
**Shows:**
- Personal information
- Account verification status
- KYC status
- Investment summary
- Account activity log
- Connected wallets (if applicable)

### Settings
**Route:** `/settings`
**Description:** Account settings and preferences
**Options:**
- Email preferences
- Notification settings
- Two-factor authentication
- Password change
- Account security
- API settings (for future development)
- Privacy preferences

### Notifications
**Route:** `/notifications`
**Description:** User notification center
**Shows:**
- Investment alerts
- Dividend notifications
- Platform announcements
- Email notification preferences
- Notification history

### Help & Support
**Route:** `/help`
**Description:** Help documentation and FAQ
**Sections:**
- Getting Started guide
- FAQ by category
- Investment guides
- Legal documents
- Contact support
- Video tutorials

---

## Admin Pages (Admin Role Required)

### Admin Dashboard
**Route:** `/admin/dashboard`
**Description:** Admin overview of platform activity
**Metrics:**
- Total platform value
- Active users
- Pending verifications
- Recent transactions
- Platform health status

### Verification Queue
**Route:** `/admin/verification-queue` or `/admin/verification`
**Description:** KYC and document verification interface
**Features:**
- List of pending verifications
- Approve/reject functionality
- Comments/notes for users
- Document review
- Verification status tracking

### Verification Details
**Route:** `/admin/verification`
**Description:** Main verification management page
**Shows:**
- Pending users awaiting KYC approval
- Review submitted documents
- Approve or request resubmission
- View user details
- Status filters

### User Management
**Route:** `/admin/users`
**Description:** Manage all platform users
**Features:**
- User list with search
- User status indicators
- Account actions (suspend, enable 2FA)
- View user portfolio
- View user transaction history
- Send announcements to users

### Listings Management
**Route:** `/admin/listings`
**Description:** Manage asset listings
**Features:**
- Active listings
- Pending listings
- Approve/reject new listings
- Edit asset details
- View investment analytics per asset
- Suspend listings if needed

### Audit Log
**Route:** `/admin/audit-log`
**Description:** Complete platform activity audit trail
**Shows:**
- All system actions
- User actions
- Admin actions
- API calls
- Security events
- Timestamp and actor information

---

## Error Pages

### 404 - Not Found
**Route:** Any non-existent route
**Description:** Friendly error page with navigation back to home

### Error Boundary
**Route:** Any page with runtime error
**Description:** Error fallback page with error details and recovery options

---

## Quick Access Map

```
PUBLIC
├── / (Landing)
└── /explore (Browse Assets)

AUTH
├── /auth/login
├── /auth/signup
└── /auth/onboarding

USER DASHBOARD
├── /dashboard (Home)
├── /portfolio
│   └── /portfolio/dividends
├── /marketplace
│   ├── /marketplace/listings
│   ├── /marketplace/listings/[id]
│   └── /marketplace/secondary
├── /transactions
├── /profile
├── /settings
├── /notifications
└── /help

ADMIN
├── /admin/dashboard
├── /admin/verification-queue
├── /admin/verification
├── /admin/users
├── /admin/listings
└── /admin/audit-log

ERROR
├── /not-found (404)
└── (Global error boundary)
```

---

## Mock Users for Testing

All mock data is prefilled in the application:

- **Demo User:** John Smith (Verified)
  - Email: john@example.com
  - Portfolio Value: $2.75M
  - Holdings: 6 different assets
  - Dividends: $125,000+ received

- **Admin User:** Admin Account (All permissions)
  - Access all admin pages
  - View all user data
  - Manage verifications

---

## Navigation Tips

1. **Sidebar Navigation** - Always available on authenticated pages
2. **Header** - Contains user profile, notifications, and logout
3. **Breadcrumbs** - Shows current location hierarchy
4. **Quick Actions** - Buttons to common tasks from each page
5. **Links** - Cross-page navigation with hover states
