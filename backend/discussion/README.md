# Discussion App - Blockchain Governance Forum

A comprehensive Django application for managing blockchain-integrated governance proposals, discussions, and voting with on-chain voting weight tracking and owner veto capabilities.

## Features

- **Proposal Management**: Create, discuss, and vote on governance proposals
- **Blockchain Integration**: Uses Web3.py to interact with ERC-20 token contracts and governance smart contracts
- **Token-Based Voting**: Only shareholders with ≥5% of total token supply can participate
- **Voting Snapshots**: Vote weight locked at specific block when voting starts
- **Quorum Requirements**: 16% of total supply must participate (YES + NO votes)
- **Proposal Extensions**: Automatically extends voting period if quorum not met (max 2 extensions)
- **Owner Veto**: Company owner can veto proposals (max 2 per calendar year, within 7 days of voting end)
- **Transparent Voting**: All votes are public with voter addresses and weights visible
- **Notifications**: In-app notifications for proposal status changes
- **Celery Tasks**: Background jobs for quorum checks and blockchain event syncing
- **Admin Panel**: Comprehensive Django admin interface for proposal management

## Project Structure

```
discussion/
├── __init__.py
├── admin.py              # Django admin configuration
├── apps.py               # App configuration
├── models.py             # Database models
├── serializers.py        # DRF serializers
├── views.py              # API views
├── urls.py               # URL routing
├── signals.py            # Django signals
├── tests.py              # Unit tests
├── tasks.py              # Celery background tasks
├── services/
│   ├── __init__.py
│   ├── blockchain.py     # Web3 interactions
│   └── governance.py     # Business logic
└── migrations/
    └── 0001_initial.py
```

## Models

### Company
Represents a company with blockchain governance.

```python
- name: str
- token_address: str (ERC-20 contract address)
- owner_address: str (wallet of authorized veto user)
- total_supply: Decimal (cached from blockchain)
- created_at: datetime
```

### Proposal
A governance proposal with full lifecycle management.

```python
- company: ForeignKey(Company)
- title: str
- description: str
- proposer_address: str
- status: DRAFT | DISCUSSION | VOTING | PASSED | FAILED | DIED | VETOED
- discussion_end: datetime
- voting_start: datetime
- voting_end: datetime
- snapshot_block: int (block number for vote weight calculation)
- yes_votes_weight: Decimal
- no_votes_weight: Decimal
- quorum_reached: bool
- extension_count: int (0-2)
- veto_count_year: int
- veto_date: datetime
```

### Comment
Discussion comments on proposals (only for large holders).

```python
- proposal: ForeignKey(Proposal)
- author_address: str
- content: str
- created_at: datetime
```

### VoteRecord
Cache of on-chain votes for quick local access.

```python
- proposal: ForeignKey(Proposal)
- voter_address: str
- choice: YES | NO
- weight: Decimal (token balance at snapshot block)
- tx_hash: str (unique)
- created_at: datetime
```

### Notification
In-app notifications for proposal events.

```python
- recipient_address: str
- proposal: ForeignKey(Proposal)
- notification_type: PROPOSAL_CREATED | VOTING_STARTED | PROPOSAL_DIED | etc
- message: str
- read: bool
- created_at: datetime
```

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Companies

```
GET    /api/governance/companies/               # List all companies
GET    /api/governance/companies/<id>/          # Company details
GET    /api/governance/companies/<id>/holders/  # List addresses with ≥5% balance
```

### Proposals

```
POST   /api/governance/proposals/                        # Create proposal (requires ≥5%)
GET    /api/governance/proposals/                         # List proposals
GET    /api/governance/proposals/<id>/                    # Proposal details
PUT    /api/governance/proposals/<id>/                    # Update proposal
DELETE /api/governance/proposals/<id>/                    # Delete proposal (DRAFT only)

POST   /api/governance/proposals/<id>/start_discussion/   # DRAFT → DISCUSSION
POST   /api/governance/proposals/<id>/start_voting/       # DISCUSSION → VOTING
POST   /api/governance/proposals/<id>/finalize/           # Finalize voting
GET    /api/governance/proposals/<id>/results/            # Current voting results

POST   /api/governance/proposals/<id>/comment/            # Add comment (requires ≥5%)
POST   /api/governance/proposals/<id>/vote/               # Cast vote (requires ≥5%)
POST   /api/governance/proposals/<id>/veto/               # Veto (owner only, max 2/year)
```

### Notifications

```
GET    /api/governance/notifications/                     # List user's notifications
POST   /api/governance/notifications/mark_all_as_read/    # Mark all as read
POST   /api/governance/notifications/<id>/mark_as_read/   # Mark single as read
```

## Request/Response Examples

### Create a Proposal

```bash
POST /api/governance/proposals/
Authorization: Bearer <token>
Content-Type: application/json

{
    "company": 1,
    "title": "Approve Q4 Budget",
    "description": "Vote on proposed Q4 2024 budget allocation..."
}

Response (201 Created):
{
    "id": 1,
    "company": 1,
    "title": "Approve Q4 Budget",
    "description": "...",
    "proposer_address": "0x...",
    "status": "DRAFT",
    "created_at": "2024-04-16T10:30:00Z",
    ...
}
```

### Start Discussion

```bash
POST /api/governance/proposals/1/start_discussion/
Authorization: Bearer <token>

Response (200 OK):
{
    "id": 1,
    "status": "DISCUSSION",
    "discussion_end": "2024-04-19T10:30:00Z",
    ...
}
```

### Start Voting

```bash
POST /api/governance/proposals/1/start_voting/
Authorization: Bearer <token>

Response (200 OK):
{
    "id": 1,
    "status": "VOTING",
    "voting_start": "2024-04-19T10:30:00Z",
    "voting_end": "2024-04-26T10:30:00Z",
    "snapshot_block": 12345678,
    ...
}
```

### Cast a Vote

```bash
POST /api/governance/proposals/1/vote/
Authorization: Bearer <token>
Content-Type: application/json

{
    "choice": "YES"
}

Response (201 Created):
{
    "success": true,
    "message": "Vote recorded: YES",
    "weight": "500000000000000000000000"  # tokens at snapshot block
}
```

### Get Voting Results

```bash
GET /api/governance/proposals/1/results/
Authorization: Bearer <token>

Response (200 OK):
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
    "voting_end": "2024-04-26T10:30:00Z",
    "extensions_used": 0,
    "max_extensions": 2
}
```

### Veto a Proposal (Owner Only)

```bash
POST /api/governance/proposals/1/veto/
Authorization: Bearer <token>
Content-Type: application/json

{
    "owner_signature": "0x..."  # optional, for verification
}

Response (200 OK):
{
    "success": true,
    "message": "Proposal 1 vetoed",
    "status": "VETOED"
}
```

## Business Rules

### Voting Participation
- **Threshold**: Must hold ≥5% of total token supply to create proposals, comment, or vote
- **No Changes**: Cannot change vote after submission
- **Snapshot Block**: Vote weight determined by balance at the block when voting starts
- **One Vote Per Proposal**: Each user can only vote once per proposal

### Quorum
- **Requirement**: YES + NO votes must equal ≥16% of total supply
- **Calculation**: Abstain votes don't count toward quorum
- **Extensions**: If not met at voting end, voting period auto-extends by 3 days (max 2 extensions)
- **Death**: After 2 extensions, if still no quorum, proposal dies (status=DIED)

### Veto
- **Authority**: Only company owner (designated wallet) can veto
- **Timing**: Must be within 7 days of voting end
- **Limit**: Maximum 2 vetoes per calendar year (Jan 1 - Dec 31)
- **Effect**: Sets proposal status to VETOED, ends voting immediately

### Proposal Lifecycle
1. **DRAFT**: Initial state, owner can edit/delete
2. **DISCUSSION**: Open for comments (3 days default)
3. **VOTING**: Active voting (7 days default)
4. **PASSED**: YES > NO and quorum reached
5. **FAILED**: NO ≥ YES or quorum reached with NO winning
6. **DIED**: Voting ended without quorum after 2 extensions
7. **VETOED**: Owner exercised veto within 7 days

## Configuration

Add to `settings.py`:

```python
# Web3 Provider (e.g., Infura)
WEB3_PROVIDER_URL = 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'

# Governance Contract Address (on blockchain)
GOVERNANCE_CONTRACT_ADDRESS = '0x...'

# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

# Governance Constants
MIN_HOLDER_PERCENTAGE = 5        # 5% minimum
QUORUM_PERCENTAGE = 16           # 16% for quorum
MAX_VETOES_PER_YEAR = 2
VETO_WINDOW_DAYS = 7
```

## Background Tasks (Celery)

Set up Redis and start Celery:

```bash
# Install Celery and Redis
pip install celery redis

# Start Celery worker
celery -A backend worker -l info

# Start Celery beat (scheduler)
celery -A backend beat -l info
```

### Available Tasks

```python
# Runs every hour
task_check_quorum_periodically()
  - Checks all VOTING proposals
  - Applies extensions if quorum not met
  - Finalizes proposals whose voting period ended

# Runs daily at midnight
task_sync_token_supply()
  - Updates cached total_supply from blockchain
  - Runs for all companies

# On-demand
task_poll_vote_events(proposal_id)
  - Syncs on-chain votes to VoteRecord cache
  - Updates quorum calculation

task_notify_proposal_died(proposal_id)
  - Sends notifications to voters when proposal dies
```

## Testing

Run tests:

```bash
# All tests
python manage.py test discussion

# Specific test class
python manage.py test discussion.tests.LargeHolderTestCase

# With coverage
pip install coverage
coverage run --source='discussion' manage.py test discussion
coverage report
```

## Integration with Blockchain

### Smart Contract Interface

The app expects the governance contract to have:

```solidity
// Voting
function vote(uint256 proposalId, bool support) external;

// Veto (owner only)
function veto(uint256 proposalId) external;

// Read functions
function getVote(uint256 proposalId, address voter) 
    external view returns (bool support, uint256 weight);
    
function getSnapshotBlock(uint256 proposalId)
    external view returns (uint256);
```

### Events

Listen for:

```solidity
event VoteCast(
    address indexed voter,
    uint256 indexed proposalId,
    bool support,
    uint256 weight
);

event Vetoed(uint256 indexed proposalId);
```

## User Authentication

Users authenticate with their Ethereum wallet:

1. Frontend calls `/api/auth/challenge/` with wallet address
2. Backend returns a message to sign
3. User signs with MetaMask or similar
4. Frontend sends signature to `/api/auth/verify/`
5. Backend verifies signature and returns JWT token
6. Include JWT in `Authorization: Bearer <token>` header for all requests

The `wallet_address` field is automatically set from authentication.

## Admin Panel

Access at `/admin/`:

```
Governance
├── Companies        # Manage companies and owners
├── Proposals       # View/edit proposals, finalize, extend
├── Comments        # Moderate discussion
├── Vote Records    # Audit voting (read-only)
└── Notifications   # Send notifications, mark as read
```

## Security Considerations

1. **Web3 Provider**: Use Infura/Alchemy with API keys in environment variables
2. **Private Keys**: Never commit private keys; use environment variables or secure vaults
3. **Signature Verification**: Always verify wallet signatures with EIP-712 standard
4. **CSRF Protection**: Rails provides CSRF token validation
5. **Rate Limiting**: Implement Django-ratelimit for API endpoints
6. **Input Validation**: All Ethereum addresses validated with Web3.py

## Troubleshooting

### Web3 Connection Error
```
Error: Web3 provider not connected
```
- Check WEB3_PROVIDER_URL is valid and accessible
- Verify API key/credentials
- Test with `curl https://your-provider-url`

### Quorum not updating
- Run `task_check_quorum_periodically` manually
- Check Celery worker logs
- Verify Redis connection for Celery broker

### Votes not syncing
- Check blockchain transaction confirmation
- Wait for block confirmation (varies by network)
- Run `task_poll_vote_events` for specific proposal
- Verify governance contract address is correct

## Support & Contributing

For issues or feature requests, please open an issue on GitHub.

## License

This project is part of Nirman Nightingle - Blockchain Governance Platform.
