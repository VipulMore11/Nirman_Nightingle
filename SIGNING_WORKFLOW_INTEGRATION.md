# Asset Signing & Publishing Workflow - Complete Integration

## ✅ Implementation Complete

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSET LIFECYCLE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CREATION PHASE                                             │
│     User creates asset → Stored with status 'Pending Review'  │
│                                                                │
│  2. ADMIN REVIEW PHASE                                        │
│     Admin views pending assets → Approves/Rejects             │
│     On Approve: set approved_by + approved_at                 │
│                                                                │
│  3. SIGNING PHASE (NEW)                                       │
│     Frontend detects approved_at + !asa_id                    │
│     Shows "Sign & Publish" button                             │
│     User clicks button →                                      │
│       GET /auth/get_pending_signature/{id}/ →                │
│       Backend: create_asa_on_blockchain() →                  │
│       Returns: txn_bytes (base64)                            │
│                                                                │
│  4. WALLET SIGNING PHASE                                      │
│     User signs txn_bytes with Pera wallet                    │
│     Returns: signed_txn (base64)                             │
│                                                                │
│  5. BLOCKCHAIN SUBMISSION PHASE                               │
│     POST /auth/submit_asa_transaction/                       │
│     Backend: submit_asa_to_blockchain(signed_txn) →          │
│     Blockchain confirms → Returns: real_asa_id               │
│     Backend updates: asa_id + is_verified=True               │
│                                                                │
│  6. ACTIVE PHASE                                              │
│     Asset now active in marketplace                          │
│     Status: 'Active', asa_id set, fully verified            │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Files Modified

### 1. Authentication/services/transaction_service.py
- ✅ `create_asa_on_blockchain(asset)` - Generates unsigned transaction bytes
- ✅ `submit_asa_to_blockchain(signed_txn_base64)` - Submits signed txn, returns ASA ID
- ✅ `create_atomic_buy()` - For marketplace purchases
- ✅ `create_atomic_sell()` - For marketplace sales

**Key Functions:**
```python
def create_asa_on_blockchain(asset):
    # Validates asset fields
    # Creates ASA transaction
    # Returns base64-encoded transaction bytes
    return {
        'txn_bytes': '...',
        'asset_id': int,
        'asset_name': str,
        'total_supply': int,
        'creator_wallet': str
    }

def submit_asa_to_blockchain(signed_txn_base64):
    # Decodes base64 transaction
    # Submits to Algorand testnet
    # Waits for confirmation
    # Returns real ASA ID
    return asa_id  # int
```

### 2. Authentication/seller_views.py
- ✅ `get_pending_signature(asset_id)` - Returns transaction bytes to sign
- ✅ `submit_asa_transaction()` - Accepts signed txn, updates asset
- ✅ `approve_asset()` - Admin approves and generates transaction
- ✅ `reject_asset()` - Admin rejects with reason
- ✅ `get_my_assets()` - Returns assets with status info

**API Endpoints:**
- `GET /auth/get_pending_signature/{asset_id}/` - Get txn bytes to sign
- `POST /auth/submit_asa_transaction/` - Submit signed txn
- `POST /auth/admin/assets/{asset_id}/approve/` - Admin approves
- `POST /auth/admin/assets/{asset_id}/reject/` - Admin rejects
- `GET /auth/marketplace/my-assets/` - Get seller's assets

### 3. Authentication/urls.py
- ✅ Routes configured:
  - `path('get_pending_signature/<int:asset_id>/', seller_views.get_pending_signature)`
  - `path('submit_asa_transaction/', seller_views.submit_asa_transaction)`
  - `path('admin/assets/<int:asset_id>/approve/', seller_views.approve_asset)`
  - `path('admin/assets/<int:asset_id>/reject/', seller_views.reject_asset)`

### 4. Authentication/services/algorand_service.py
- ✅ `create_asa_txn()` - Creates ASA configuration transaction
- ✅ `opt_in_txn()` - Creates asset opt-in transaction
- ✅ `algod_client` - Connected to Algorand testnet

## Frontend Files Modified

### 1. app/dashboard/my-assets/page.tsx
- ✅ Added signing state management
- ✅ Added `getAssetState()` function to determine status
- ✅ Added `handleInitiateSign()` handler
- ✅ Added `handleSignAndSubmit()` handler
- ✅ Added signing modal dialog
- ✅ Updated asset card to show ASA ID
- ✅ Added "Sign & Publish" button for pending_signature state

**State Management:**
```typescript
interface SigningState {
  assetId: null | number;
  isOpen: boolean;
  isLoading: boolean;
  isSigning: boolean;
  error: null | string;
  txnBytes: null | string;
  assetName: null | string;
  totalSupply: null | number;
}

const getAssetState = (asset) => {
  if (asset.rejection_reason) return 'rejected';
  if (asset.asa_id) return 'published';
  if (asset.approved_at && !asset.asa_id) return 'pending_signature'; ✅
  if (!asset.is_verified) return 'pending_review';
  return 'inactive';
};
```

### 2. lib/constants/apiConfig.ts
- ✅ `GET_PENDING_SIGNATURE(assetId)` - Maps to backend endpoint
- ✅ `SUBMIT_ASA_TRANSACTION` - Maps to backend endpoint
- ✅ `GET_MY_ASSETS` - Maps to backend endpoint

**API Constants:**
```typescript
GET_PENDING_SIGNATURE: (assetId) => `${API_BASE_URL}/auth/get_pending_signature/${assetId}/`
SUBMIT_ASA_TRANSACTION: `${API_BASE_URL}/auth/submit_asa_transaction/`
```

### 3. hooks/usePeraWallet.ts
- ✅ Provides `signTransaction(txnBytes)` function
- ✅ Handles Pera wallet connection/signing
- ✅ Returns signed transaction base64

## Complete Request/Response Flow

### 1. Get Pending Signature
**Request:**
```
GET /auth/get_pending_signature/123/
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Ready to sign. Use these transaction bytes with Pera wallet.",
  "asset_id": 123,
  "txn_bytes": "gqNSiGE...",
  "asset_name": "Real Estate Investment",
  "total_supply": 1000,
  "creator_wallet": "XXXXXX...XXXXX",
  "approved_at": "2026-04-17T10:30:00Z",
  "approved_by": "admin_user"
}
```

### 2. Submit Signed Transaction
**Request:**
```
POST /auth/submit_asa_transaction/
Headers: Authorization: Bearer {token}
Body:
{
  "asset_id": 123,
  "signed_txn": "gqNSiGE...signed"
}
```

**Response (200 OK):**
```json
{
  "message": "Asset published to blockchain successfully",
  "asset_id": 123,
  "asa_id": 1234567,
  "listing_status": "active",
  "is_verified": true
}
```

### 3. Get My Assets (Updated Status)
**Request:**
```
GET /auth/marketplace/my-assets/
Headers: Authorization: Bearer {token}
```

**Response includes:**
```json
{
  "id": 123,
  "title": "Real Estate Investment",
  "asa_id": 1234567,
  "approved_at": "2026-04-17T10:30:00Z",
  "status_display": "Active",
  "is_verified": true
}
```

## Status Detection Logic

### Frontend (getAssetState)
```typescript
'rejected'           → rejection_reason is set
'published'          → asa_id is set
'pending_signature'  → approved_at set AND asa_id is null AND no rejection ✅ NEW
'pending_review'     → not is_verified AND no rejection
'inactive'           → default
```

### Backend Status Codes
```
HTTP 200 OK             → Success
HTTP 400 BAD_REQUEST    → Invalid asset status, missing fields
HTTP 403 FORBIDDEN      → KYC not verified (admin), not authorized
HTTP 404 NOT_FOUND      → Asset not found
HTTP 500 SERVER_ERROR   → Blockchain/processing error
```

## Error Handling

### Transaction Service Errors
- ✅ Invalid asset fields (missing wallet, title, total_supply)
- ✅ Transaction encoding failures
- ✅ Blockchain submission timeout (>10 rounds)
- ✅ Blockchain errors with detailed messages

### API Endpoint Errors
- ✅ Asset not found or doesn't belong to user
- ✅ Wrong asset status (not in pending_signature state)
- ✅ Missing required fields in request
- ✅ Unauthorized access (non-owner trying to sign)

### Frontend Handling
- ✅ Loading states during transaction preparation
- ✅ Error messages from backend displayed in dialog
- ✅ Wallet connection errors caught and displayed
- ✅ Disabled buttons during signing process

## Testing Checklist

### Backend Testing
- [ ] `create_asa_on_blockchain()` generates valid transaction bytes
- [ ] `submit_asa_to_blockchain()` accepts signed bytes and submits
- [ ] GET endpoint returns correct transaction data
- [ ] POST endpoint updates asset asa_id and is_verified
- [ ] Error handling for all validation scenarios

### Frontend Testing
- [ ] Asset card shows ASA ID when set
- [ ] "Sign & Publish" button appears for pending_signature status
- [ ] Modal shows transaction details correctly
- [ ] Pera wallet integration signs and returns txn bytes
- [ ] POST request submits with correct payload
- [ ] Asset status updates after successful signing
- [ ] Error messages display for all failure scenarios

### Integration Testing
- [ ] Complete workflow: Create → Approve → Sign → Active
- [ ] Status transitions display correctly
- [ ] Multiple assets handled independently
- [ ] Asset data refreshes after signing
- [ ] Pagination works with multiple assets

## Security Considerations

- ✅ Endpoint requires `IsAuthenticated` permission
- ✅ Asset ownership verified (owner=request.user)
- ✅ Admin-only operations use `IsAdminUser` permission
- ✅ Transaction bytes not executed server-side (user signs)
- ✅ Signed transaction verified on blockchain before updating DB
- ✅ ASA ID immutable (unique constraint in DB)

## Next Steps / Phase 3

1. Admin Dashboard UI
2. Asset approval/rejection interface
3. Real-time status notifications
4. Transaction history tracking
5. Asset metrics & analytics

---

**Status:** ✅ COMPLETE & READY FOR TESTING
**Last Updated:** 2026-04-17
