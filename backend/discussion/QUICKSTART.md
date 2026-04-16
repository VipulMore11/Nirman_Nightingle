# Quick Start Guide: Discussion App

## Prerequisites

- Python 3.10+
- Django 4.0+
- PostgreSQL or SQLite (for development)
- Redis (for Celery)
- Ethereum RPC endpoint (Infura, Alchemy, local node)

## Installation & Setup

### 1. Install Dependencies

```bash
# Add to existing requirements.txt
web3>=6.0.0
celery>=5.3.0
redis>=5.0.0
python-dotenv>=1.0.0
```

Then:
```bash
pip install -r requirements.txt
```

### 2. Configure Blockchain Settings

Create `.env` file in project root:

```env
# Blockchain
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
GOVERNANCE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email (optional, for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

Update `settings.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

WEB3_PROVIDER_URL = os.getenv('WEB3_PROVIDER_URL')
GOVERNANCE_CONTRACT_ADDRESS = os.getenv('GOVERNANCE_CONTRACT_ADDRESS')
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
```

### 3. Create Database Migrations

```bash
# Generate migrations for new models
python manage.py makemigrations

# Apply all migrations
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Create a Company

Via Django shell:

```bash
python manage.py shell
```

```python
from discussion.models import Company
from decimal import Decimal

company = Company.objects.create(
    name="MyCompany Inc",
    token_address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  # USDC on mainnet
    owner_address="0x742d35Cc6634C0532925a3b844Bc9e7595f1bEb3",
    total_supply=Decimal("1000000000000000000")  # 1M tokens with 18 decimals
)
print(f"Company created: {company.id}")
```

Or via Django admin:
1. Go to http://localhost:8000/admin/
2. Under "Governance", click "Companies" → "Add Company"
3. Fill in the form and save

### 6. Start Background Services

**Terminal 1: Redis**
```bash
redis-server
# On Windows: redis-server.exe
```

**Terminal 2: Celery Worker**
```bash
celery -A backend worker -l info
```

**Terminal 3: Celery Beat (optional, for scheduled tasks)**
```bash
celery -A backend beat -l info
```

**Terminal 4: Django Development Server**
```bash
python manage.py runserver
```

## Testing the API

### 1. Get JWT Token (with example auth endpoint)

```bash
# Assuming you have /api/auth/login/ endpoint
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Response:
# {"access": "eyJ0eXAiOiJKV...", "refresh": "eyJ0eXAiOiJKV..."}
```

Copy the access token.

### 2. List Companies

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:8000/api/governance/companies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Create a Proposal

```bash
curl -X POST http://localhost:8000/api/governance/proposals/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": 1,
    "title": "Approve Budget Allocation",
    "description": "Proposal to approve Q4 2024 budget allocation..."
  }'

# Note: User must have ≥5% of company tokens
```

### 4. Transition Proposal to Discussion

```bash
curl -X POST http://localhost:8000/api/governance/proposals/1/start_discussion/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 5. Add a Comment

```bash
curl -X POST http://localhost:8000/api/governance/proposals/1/comment/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I support this proposal because..."
  }'
```

### 6. Start Voting

```bash
# Wait for discussion_end to pass first
curl -X POST http://localhost:8000/api/governance/proposals/1/start_voting/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 7. Cast a Vote

```bash
curl -X POST http://localhost:8000/api/governance/proposals/1/vote/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"choice": "YES"}'
```

### 8. Check Voting Results

```bash
curl -X GET http://localhost:8000/api/governance/proposals/1/results/ \
  -H "Authorization: Bearer $TOKEN"
```

## Admin Panel

1. Go to http://localhost:8000/admin/
2. Log in with superuser credentials
3. Navigate to "GOVERNANCE" section
4. Manage companies, proposals, comments, and votes

## Common Issues & Solutions

### Issue: Web3 connection fails
```
FileNotFoundError: Web3 provider not connected
```
**Solution**: 
- Check WEB3_PROVIDER_URL is correct and public endpoint is accessible
- Test with: `curl https://mainnet.infura.io/v3/YOUR_KEY`
- Ensure firewall allows outbound connections

### Issue: Celery tasks not running
```
celery.exceptions.ConnectionError: [Errno 111] Connection refused
```
**Solution**:
- Start Redis: `redis-server`
- Check Redis is running: `redis-cli ping` (should return PONG)
- Restart Celery worker

### Issue: JWT token authentication fails
```
{"detail":"Authentication credentials were not provided."}
```
**Solution**:
- Ensure token is valid: check JWT not expired
- Use correct header format: `Authorization: Bearer <token>`
- Check token in `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']`

### Issue: Large holder check returns False unexpectedly
```
Error: Must hold ≥5% of total supply
```
**Solution**:
- Verify wallet has tokens: check blockchain explorer
- Ensure correct token_address in Company model
- Check total_supply is accurate: `task_sync_token_supply()` to update
- Try with latest block: balance changes over time

## Next Steps

1. **Deploy Smart Contract**: Deploy governance contract to blockchain
2. **Update Contract Address**: Set GOVERNANCE_CONTRACT_ADDRESS in settings
3. **User Authentication**: Integrate MetaMask for wallet-based login
4. **Email Notifications**: Configure email for proposal notifications
5. **Frontend**: Build React/Vue frontend to interact with API
6. **Production**: Move from SQLite to PostgreSQL, Redis to managed service

## Documentation

- Full API Documentation: See `discussion/README.md`
- Models Documentation: See `discussion/models.py`
- Services Documentation: See `discussion/services/`
- Tests: See `discussion/tests.py`

## Support

Check logs for detailed error messages:

```bash
# View Celery logs
tail -f logs/celery.log

# View Django logs
tail -f logs/django.log

# Python shell debugging
python manage.py shell
>>> from discussion.models import Proposal
>>> p = Proposal.objects.first()
>>> p.yes_votes_weight
```
