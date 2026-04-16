# API Test Suite - Marketplace & Reviews

Complete test suite for testing both the **Marketplace** and **Reviews** Django apps with API key storage and comprehensive test cases.

## 📁 Files

1. **test_api.py** - Main test suite with all test cases
2. **api_keys_config.py** - API keys and configuration storage

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure Django development server is running
python manage.py runserver
```

### Running Tests

```bash
# From the backend directory
python test_api.py
```

## 📦 Test Coverage

### Marketplace API Tests (7 tests)
- ✅ Create Asset
- ✅ Purchase Tokens  
- ✅ Distribute Dividend
- ✅ Owner Dashboard
- ✅ User Dashboard
- ✅ User Portfolio
- ✅ Dividend History

### Reviews API Tests (5 tests)
- ✅ Create Review
- ✅ Get Reviews
- ✅ Mark Review as Helpful
- ✅ Update Review
- ✅ Delete Review

## 🔑 API Key Management

### Configuration File: `api_keys_config.py`

This file stores all API configuration:

```python
# Marketplace API Configuration
MARKETPLACE_API = {
    'base_url': 'http://localhost:8000/api/marketplace',
    'endpoints': {
        'create_asset': '/assets/create/',
        'purchase_tokens': '/tokens/purchase/',
        # ...
    }
}

# Reviews API Configuration  
REVIEWS_API = {
    'base_url': 'http://localhost:8000/api/reviews',
    'endpoints': {
        'create_review': '/create/',
        # ...
    }
}
```

### Adding API Keys

Edit `api_keys_config.py`:

```python
AUTH_TOKENS = {
    'marketplace': {
        'api_key': 'your_marketplace_key',
        'secret_key': 'your_marketplace_secret',
    },
    'reviews': {
        'api_key': 'your_reviews_key',
        'secret_key': 'your_reviews_secret',
    },
}
```

## 🧪 Test Data

### Test Users
```python
TEST_USER = {
    'username': 'testuser',
    'email': 'testuser@example.com',
    'password': 'testpass123',
}

TEST_OWNER = {
    'username': 'testowner',
    'email': 'owner@example.com',
    'password': 'ownerpass123',
}
```

### Marketplace Test Data
```python
ASSET_DATA = {
    'name': 'Apple Inc. Tokenized Asset',
    'asset_id': 1001,
    'total_tokens': 1000,
    'tokenized_percentage': 30,
}

TOKEN_PURCHASE = {
    'asset_id': 1001,
    'tokens_owned': 100,
    'buy_price': 50.0,
}

DIVIDEND_DISTRIBUTION = {
    'asset_id': 1001,
    'total_profit': 10000.0,
}
```

### Reviews Test Data
```python
REVIEW_DATA = {
    'asset_id': 1001,
    'rating': 5,
    'comment': 'Great asset! Highly recommended.',
    'wallet': '0x1234567890abcdef',
}
```

## 🔧 Customizing Tests

### Modify Test Data

Edit `TestData` class in `test_api.py`:

```python
class TestData:
    ASSET_DATA = {
        'name': 'Your Asset Name',
        'asset_id': 2001,  # Change asset ID
        'total_tokens': 5000,
        'tokenized_percentage': 50,
    }
```

### Add Custom Test Cases

```python
def test_custom_feature(self):
    """Test: Your custom feature"""
    print("\n" + "🔵 "*20)
    print("TEST: Custom Feature")
    print("🔵 "*20)
    
    response = self.client.post(
        '/api/marketplace/your-endpoint/',
        {'key': 'value'}
    )
    
    assert response.status_code == 200
    print("✅ Custom test passed")
```

## 📊 Test Output

### Sample Output
```
========================================================================
MARKETPLACE API TESTS
========================================================================

[POST] http://localhost:8000/api/marketplace/assets/create/
Status Code: 201
Response: {...}
✅ Asset created successfully (ID: 1)

[POST] http://localhost:8000/api/marketplace/tokens/purchase/
Status Code: 201
Response: {...}
✅ Tokens purchased successfully

========================================================================
TEST SUMMARY
========================================================================

📦 MARKETPLACE TESTS:
  ✅ create_asset: PASSED
  ✅ purchase_tokens: PASSED
  ✅ distribute_dividend: PASSED
  ✅ owner_dashboard: PASSED
  ✅ user_dashboard: PASSED
  ✅ user_portfolio: PASSED
  ✅ dividend_history: PASSED

📝 REVIEWS TESTS:
  ✅ create_review: PASSED
  ✅ get_reviews: PASSED
  ✅ mark_helpful: PASSED
  ✅ update_review: PASSED
  ✅ delete_review: PASSED

📊 Total: 12/12 tests passed
```

## ⚙️ Configuration Options

Edit `TEST_CONFIG` in `api_keys_config.py`:

```python
TEST_CONFIG = {
    'timeout': 10,      # Request timeout in seconds
    'verbose': True,    # Print detailed logs
    'fail_fast': False, # Stop on first failure
}
```

## 🔐 Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit API keys** to version control
   ```bash
   # Add to .gitignore
   echo "api_keys_config.py" >> .gitignore
   ```

2. **Use environment variables** for production:
   ```bash
   export MARKETPLACE_API_KEY="your_key"
   export REVIEWS_API_KEY="your_key"
   ```

3. **Rotate API keys** regularly

4. **Use separate keys** for development, staging, and production

## 🐛 Troubleshooting

### Connection Error
```
Error: Connection refused
```
**Solution:** Start Django server: `python manage.py runserver`

### Authentication Failed
```
Status Code: 401
Error: Unauthorized
```
**Solution:** Check auth tokens in `api_keys_config.py`

### Asset Not Found
```
Status Code: 404
Error: Asset not found
```
**Solution:** Verify asset_id exists in test data

### Permission Denied
```
Status Code: 403
Error: Only asset owner can distribute dividends
```
**Solution:** Use correct user context for operation

## 📝 Test Classes

### APITestClient
Main client for making API requests
```python
client = APITestClient()
client.set_auth_token('your_token')
response = client.get('/api/marketplace/user/portfolio/')
```

### MarketplaceAPITests
All marketplace-related tests
```python
tests = MarketplaceAPITests(client)
tests.test_create_asset()
tests.test_distribute_dividend()
```

### ReviewsAPITests
All review-related tests
```python
tests = ReviewsAPITests(client)
tests.test_create_review()
tests.test_get_reviews()
```

### TestRunner
Orchestrates all tests
```python
runner = TestRunner()
runner.run_all_tests()
```

## 🎯 Use Cases

### 1. Development Testing
```bash
python test_api.py
```

### 2. CI/CD Pipeline Integration
```bash
python -m pytest test_api.py -v
```

### 3. Load Testing
Run tests in loop:
```python
for i in range(100):
    runner.run_all_tests()
```

### 4. Integration Testing
Import and use in other test suites:
```python
from test_api import MarketplaceAPITests, APITestClient

client = APITestClient()
tests = MarketplaceAPITests(client)
tests.test_create_asset()
```

## 📚 API Endpoints Reference

### Marketplace Endpoints
```
POST   /api/marketplace/assets/create/
POST   /api/marketplace/tokens/purchase/
POST   /api/marketplace/dividends/distribute/
GET    /api/marketplace/assets/{asset_id}/dividend-history/
GET    /api/marketplace/owner/dashboard/{asset_id}/
GET    /api/marketplace/user/dashboard/{asset_id}/
GET    /api/marketplace/user/portfolio/
```

### Reviews Endpoints
```
POST   /api/reviews/create/
GET    /api/reviews/asset/{asset_id}/
PUT    /api/reviews/{review_id}/update/
DELETE /api/reviews/{review_id}/delete/
POST   /api/reviews/{review_id}/helpful/
POST   /api/reviews/{review_id}/unhelpful/
```

## 🚀 Advanced Usage

### Custom Headers
```python
client.headers['X-Custom-Header'] = 'value'
```

### Custom Base URL
```python
client = APITestClient(base_url='http://staging.example.com/api')
```

### Response Validation
```python
response = client.post('/endpoint/', data)
data = response.json()
assert data['status'] == 'success'
```

## 📞 Support

For issues or questions:
1. Check test logs for detailed error messages
2. Verify Django server is running
3. Check API credentials in `api_keys_config.py`
4. Review endpoint documentation

## 📄 License

Internal testing tool - Nirman Nightingle Project
