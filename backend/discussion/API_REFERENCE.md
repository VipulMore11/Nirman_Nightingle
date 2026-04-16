# API Reference - Discussion / Governance Endpoints

## Base URL
```
http://localhost:8000/api/governance/
```

## Authentication

All endpoints require JWT authentication (except public endpoints):

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses are JSON:

### Success Response (2xx)
```json
{
    "id": 1,
    "field": "value",
    ...
}
```

### Error Response (4xx, 5xx)
```json
{
    "error": "Human-readable error message",
    "detail": "Additional details if available"
}
```

---

## Companies

### List Companies
- **Endpoint**: `GET /companies/`
- **Auth**: Required
- **Query Parameters**:
  - `page`: Pagination (default: 1)
  - `page_size`: Items per page (default: 20)

**Response** (200 OK):
```json
{
    "count": 5,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Tech Corp",
            "token_address": "0x...",
            "owner_address": "0x...",
            "total_supply": "1000000000000000000",
            "created_at": "2024-04-16T10:00:00Z"
        },
        ...
    ]
}
```

### Get Company Details
- **Endpoint**: `GET /companies/<id>/`
- **Auth**: Required
- **Path Parameters**:
  - `id`: Company ID (integer)

**Response** (200 OK):
```json
{
    "id": 1,
    "name": "Tech Corp",
    "token_address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "owner_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f1bEb3",
    "total_supply": "1000000000000000000",
    "created_at": "2024-04-16T10:00:00Z"
}
```

### Get Large Token Holders
- **Endpoint**: `GET /companies/<id>/holders/`
- **Auth**: Required
- **Description**: List addresses with ≥5% of total supply

**Response** (200 OK):
```json
{
    "company_id": 1,
    "company_name": "Tech Corp",
    "total_supply": "1000000000000000000000000",
    "large_holders": [
        {
            "address": "0x1234...",
            "balance": "50000000000000000000000",
            "percentage": "5.00%"
        },
        ...
    ],
    "note": "Requires blockchain indexing or Moralis/similar API"
}
```

---

## Proposals

### List Proposals
- **Endpoint**: `GET /proposals/`
- **Auth**: Required
- **Query Parameters**:
  - `status`: Filter by status (DRAFT, DISCUSSION, VOTING, PASSED, FAILED, DIED, VETOED)
  - `company`: Filter by company ID
  - `proposer_address`: Filter by proposer wallet
  - `page`: Pagination
  - `ordering`: Sort by field (-created_at, -voting_end, status, etc.)

**Response** (200 OK):
```json
{
    "count": 42,
    "next": "http://localhost:8000/api/governance/proposals/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "company": 1,
            "company_name": "Tech Corp",
            "title": "Q4 Budget Approval",
            "proposer_address": "0x1234...",
            "status": "VOTING",
            "voting_start": "2024-04-16T10:00:00Z",
            "voting_end": "2024-04-23T10:00:00Z",
            "yes_votes_weight": "500000000000000000000000",
            "no_votes_weight": "100000000000000000000000",
            "quorum_reached": true,
            "created_at": "2024-04-10T10:00:00Z",
            "comment_count": 5,
            "vote_count": 12
        },
        ...
    ]
}
```

### Create Proposal
- **Endpoint**: `POST /proposals/`
- **Auth**: Required (user must be ≥5% holder)
- **Request Body**:

```json
{
    "company": 1,
    "title": "Approve Annual Budget",
    "description": "This proposal seeks approval for the 2024 annual budget allocation of..."
}
```

**Response** (201 Created):
```json
{
    "id": 2,
    "company": 1,
    "company_name": "Tech Corp",
    "title": "Approve Annual Budget",
    "description": "...",
    "proposer_address": "0x...",
    "status": "DRAFT",
    "discussion_end": null,
    "voting_start": null,
    "voting_end": null,
    "snapshot_block": null,
    "yes_votes_weight": "0",
    "no_votes_weight": "0",
    "quorum_reached": false,
    "extension_count": 0,
    "veto_count_year": 0,
    "veto_date": null,
    "created_at": "2024-04-16T10:30:00Z",
    "updated_at": "2024-04-16T10:30:00Z",
    "comments": [],
    "vote_records": [],
    "quorum_threshold": "160000000000000000000000",
    "time_remaining": null
}
```

**Error Responses**:
- 400 Bad Request: Invalid data
- 403 Forbidden: User doesn't hold ≥5% of tokens

### Get Proposal Details
- **Endpoint**: `GET /proposals/<id>/`
- **Auth**: Required
- **Path Parameters**:
  - `id`: Proposal ID (integer)

**Response** (200 OK): (Full proposal object with comments and votes)

### Update Proposal
- **Endpoint**: `PUT /proposals/<id>/` or `PATCH /proposals/<id>/`
- **Auth**: Required (must be proposer or admin)
- **Editable Fields**: `title`, `description` (only in DRAFT status)

**Request Body**:
```json
{
    "title": "Updated Title",
    "description": "Updated description"
}
```

### Delete Proposal
- **Endpoint**: `DELETE /proposals/<id>/`
- **Auth**: Required (must be proposer or admin)
- **Constraint**: Only DRAFT proposals can be deleted

**Response** (204 No Content)

---

## Proposal Transitions

### Start Discussion
- **Endpoint**: `POST /proposals/<id>/start_discussion/`
- **Auth**: Required (proposer or admin)
- **Constraint**: Proposal must be in DRAFT status
- **Sets**: `status=DISCUSSION`, `discussion_end=now+3 days`

**Response** (200 OK): Updated proposal object

### Start Voting
- **Endpoint**: `POST /proposals/<id>/start_voting/`
- **Auth**: Required (proposer or admin)
- **Constraint**: Proposal must be in DISCUSSION, discussion_end must have passed
- **Sets**: `status=VOTING`, `voting_start=now`, `voting_end=now+7 days`, `snapshot_block=current`

**Response** (200 OK): Updated proposal object

### Finalize Proposal
- **Endpoint**: `POST /proposals/<id>/finalize/`
- **Auth**: Required (admin or automatic via Celery)
- **Constraint**: Proposal must be in VOTING, voting_end must have passed
- **Logic**:
  - Checks quorum
  - If quorum met: Sets status to PASSED or FAILED based on YES vs NO votes
  - If quorum not met: Extends voting if extension_count < 2, or sets status to DIED

**Response** (200 OK): Updated proposal object

---

## Comments

### Add Comment to Proposal
- **Endpoint**: `POST /proposals/<id>/comment/`
- **Auth**: Required (user must be ≥5% holder)
- **Constraint**: Proposal must be in DISCUSSION status
- **Request Body**:

```json
{
    "content": "I support this proposal because it aligns with our Q3 roadmap..."
}
```

**Response** (201 Created):
```json
{
    "id": 42,
    "proposal": 1,
    "author_address": "0x...",
    "content": "I support this proposal because...",
    "created_at": "2024-04-16T10:45:00Z"
}
```

**Error Responses**:
- 403 Forbidden: Not a ≥5% holder, or proposal not in DISCUSSION phase

---

## Voting

### Cast Vote
- **Endpoint**: `POST /proposals/<id>/vote/`
- **Auth**: Required (user must be ≥5% holder)
- **Constraint**: Proposal must be in VOTING, user can only vote once
- **Request Body**:

```json
{
    "choice": "YES",
    "tx_hash": "0x..."  // optional, if already on-chain
}
```

**Response** (201 Created):
```json
{
    "success": true,
    "message": "Vote recorded: YES",
    "weight": "500000000000000000000000"
}
```

**Error Responses**:
- 400 Bad Request: Invalid choice (must be YES or NO)
- 403 Forbidden: 
  - Not a ≥5% holder at snapshot block
  - Proposal not in VOTING phase
  - Already voted on this proposal
  - Voting period has ended

### Get Voting Results
- **Endpoint**: `GET /proposals/<id>/results/`
- **Auth**: Required
- **Description**: Current voting state and quorum status

**Response** (200 OK):
```json
{
    "proposal_id": 1,
    "status": "VOTING",
    "yes_votes": "1500000000000000000000000",
    "no_votes": "500000000000000000000000",
    "total_votes": "2000000000000000000000000",
    "quorum_threshold": "1600000000000000000000000",
    "quorum_reached": true,
    "percentage_of_quorum": "125.0",
    "voting_active": true,
    "voting_end": "2024-04-23T10:00:00Z",
    "extensions_used": 0,
    "max_extensions": 2
}
```

---

## Veto

### Execute Veto
- **Endpoint**: `POST /proposals/<id>/veto/`
- **Auth**: Required (must be company owner)
- **Constraints**:
  - Caller must be the company owner_address
  - Voting must have ended
  - Must be within 7 days of voting_end
  - Company can't have already used 2 vetoes this year
- **Request Body**:

```json
{
    "owner_signature": "0x..."  // optional, for verification
}
```

**Response** (200 OK):
```json
{
    "success": true,
    "message": "Proposal 1 vetoed",
    "status": "VETOED"
}
```

**Error Responses**:
- 403 Forbidden:
  - `"Only company owner can veto"`
  - `"Veto window closed (was 7 days)"`
  - `"Already used 2 vetoes this year"`
- 400 Bad Request: Proposal voting has not ended yet

---

## Notifications

### List User Notifications
- **Endpoint**: `GET /notifications/`
- **Auth**: Required
- **Query Parameters**:
  - `read`: Filter by read status (true/false)
  - `notification_type`: Filter by type (PROPOSAL_CREATED, VOTING_STARTED, etc.)
  - `page`: Pagination

**Response** (200 OK):
```json
{
    "count": 15,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "proposal": 5,
            "proposal_title": "Q4 Budget Approval",
            "notification_type": "PROPOSAL_DIED",
            "message": "Proposal 'Q4 Budget Approval' died due to insufficient quorum.",
            "read": false,
            "created_at": "2024-04-16T14:00:00Z"
        },
        ...
    ]
}
```

### Mark Single Notification as Read
- **Endpoint**: `POST /notifications/<id>/mark_as_read/`
- **Auth**: Required
- **Path Parameters**:
  - `id`: Notification ID

**Response** (200 OK): Notification object with `read=true`

### Mark All Notifications as Read
- **Endpoint**: `POST /notifications/mark_all_as_read/`
- **Auth**: Required

**Response** (200 OK):
```json
{
    "success": true,
    "updated_count": 5
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid request format |
| 401 | Unauthorized - Missing/invalid authentication |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal server error |

---

## Rate Limiting

Not implemented by default, but recommended for production:

```python
# Add to views.py
from django_ratelimit.decorators import ratelimit

@ratelimit(key='user', rate='100/h', method='POST')
def create_proposal(request):
    ...
```

---

## Pagination

All list endpoints support pagination via query parameters:

```
GET /proposals/?page=2&page_size=50
```

Response includes:
```json
{
    "count": 100,
    "next": "http://...?page=3",
    "previous": "http://...?page=1",
    "results": [...]
}
```

---

## Filtering

Common filter patterns:

```
GET /proposals/?status=VOTING
GET /proposals/?company=1&status=PASSED
GET /proposals/?proposer_address=0x...
```

---

## Ordering

Use `-` prefix for descending order:

```
GET /proposals/?ordering=-created_at           # Newest first
GET /proposals/?ordering=voting_end             # Oldest voting_end first
GET /proposals/?ordering=-yes_votes_weight      # Highest votes first
```

---

## Example Workflows

### Complete Voting Cycle

1. **Proposer creates proposal** (DRAFT):
   ```
   POST /proposals/
   ```

2. **Wait/transition to discussion** (DISCUSSION):
   ```
   POST /proposals/1/start_discussion/
   ```

3. **After discussion period, start voting** (VOTING):
   ```
   POST /proposals/1/start_voting/
   ```

4. **Users vote**:
   ```
   POST /proposals/1/vote/
   ```

5. **Check results**:
   ```
   GET /proposals/1/results/
   ```

6. **After voting period, finalize**:
   ```
   POST /proposals/1/finalize/
   ```

---

## WebSocket Support (Future)

For real-time vote updates, consider adding:

```
WS /ws/proposals/<id>/updates/
```

Broadcasts: vote counts, quorum status, proposal status changes
