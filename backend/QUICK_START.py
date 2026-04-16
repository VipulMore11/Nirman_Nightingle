"""
QUICK START GUIDE - API Test Suite

Get up and running in 5 minutes!
"""

# ============================================================================
# STEP 1: Installation & Setup
# ============================================================================

"""
1. Ensure files are in the backend directory:
   - test_api.py
   - api_keys_config.py
   - test_examples.py
   - TEST_SUITE_README.md (this file)

2. Start Django development server:
   $ python manage.py runserver

3. That's it! You're ready to test.
"""

# ============================================================================
# STEP 2: Run Tests
# ============================================================================

"""
OPTION A: Run all tests (Marketplace + Reviews)
$ python test_api.py

OPTION B: Run specific examples
$ python test_examples.py
(Edit test_examples.py and change: example_to_run = '10')

OPTION C: Use in Python code
from test_api import TestRunner
runner = TestRunner()
runner.run_all_tests()
"""

# ============================================================================
# STEP 3: Understanding Output
# ============================================================================

"""
When you run tests, you'll see:

1. API Call Details:
   [POST] http://localhost:8000/api/marketplace/assets/create/
   Status Code: 201
   Response: {...}

2. Test Results:
   ✅ create_asset: PASSED
   ❌ delete_asset: FAILED
   ⚠️  update_asset: ERROR

3. Summary:
   📊 Total: 12/12 tests passed
"""

# ============================================================================
# STEP 4: Common Tasks
# ============================================================================

# Task 1: Test Marketplace Only
from test_api import APITestClient, MarketplaceAPITests

client = APITestClient()
tests = MarketplaceAPITests(client)
tests.test_create_asset()
tests.test_purchase_tokens()
tests.test_distribute_dividend()


# Task 2: Test Reviews Only
from test_api import ReviewsAPITests

reviews = ReviewsAPITests(client)
reviews.test_create_review()
reviews.test_get_reviews()


# Task 3: Test Specific Endpoint
endpoint = '/marketplace/user/portfolio/'
response = client.get(endpoint)
print(response.json())


# Task 4: Test with Custom Data
tests.test_data.ASSET_DATA = {
    'name': 'Tesla Inc.',
    'asset_id': 5001,
    'total_tokens': 10000,
    'tokenized_percentage': 25,
}
tests.test_create_asset()


# Task 5: Set Authentication
token = 'your_auth_token_here'
client.set_auth_token(token)


# ============================================================================
# STEP 5: Troubleshooting
# ============================================================================

"""
Problem: "Connection refused"
Solution: Start Django server: python manage.py runserver

Problem: "401 Unauthorized"
Solution: Set auth token: client.set_auth_token('your_token')

Problem: "404 Not Found"
Solution: Check endpoint URL is correct

Problem: "403 Forbidden"
Solution: Use correct user (asset owner for dividend distribution)

Problem: Tests are slow
Solution: Reduce TEST_CONFIG['timeout'] in api_keys_config.py
"""

# ============================================================================
# STEP 6: API Endpoints Reference
# ============================================================================

ENDPOINTS_REFERENCE = {
    'Marketplace': {
        'Create Asset': 'POST /api/marketplace/assets/create/',
        'Purchase Tokens': 'POST /api/marketplace/tokens/purchase/',
        'Distribute Dividends': 'POST /api/marketplace/dividends/distribute/',
        'User Portfolio': 'GET /api/marketplace/user/portfolio/',
        'User Dashboard': 'GET /api/marketplace/user/dashboard/{asset_id}/',
        'Owner Dashboard': 'GET /api/marketplace/owner/dashboard/{asset_id}/',
        'Dividend History': 'GET /api/marketplace/assets/{asset_id}/dividend-history/',
    },
    'Reviews': {
        'Create Review': 'POST /api/reviews/create/',
        'Get Reviews': 'GET /api/reviews/asset/{asset_id}/',
        'Update Review': 'PUT /api/reviews/{review_id}/update/',
        'Delete Review': 'DELETE /api/reviews/{review_id}/delete/',
        'Mark Helpful': 'POST /api/reviews/{review_id}/helpful/',
    },
}

# ============================================================================
# STEP 7: Test Data Reference
# ============================================================================

TEST_DATA_REFERENCE = {
    'Asset': {
        'name': 'Apple Inc. Tokenized Asset',
        'asset_id': 1001,
        'total_tokens': 1000,
        'tokenized_percentage': 30,
    },
    'Token Purchase': {
        'asset_id': 1001,
        'tokens_owned': 100,
        'buy_price': 50.0,
    },
    'Dividend Distribution': {
        'asset_id': 1001,
        'total_profit': 10000.0,
    },
    'Review': {
        'asset_id': 1001,
        'rating': 5,
        'comment': 'Great asset!',
        'wallet': '0x1234567890abcdef',
    },
}

# ============================================================================
# STEP 8: Example Workflows
# ============================================================================

# Workflow 1: Create Asset and Distribute Dividend
def workflow_create_and_distribute():
    from test_api import TestRunner
    runner = TestRunner()
    runner.marketplace_tests.test_create_asset()
    runner.marketplace_tests.test_purchase_tokens()
    runner.marketplace_tests.test_distribute_dividend()
    print("✅ Workflow complete!")


# Workflow 2: Test Asset Ownership
def workflow_test_ownership():
    from test_api import APITestClient, MarketplaceAPITests
    client = APITestClient()
    tests = MarketplaceAPITests(client)
    
    # Create asset
    tests.test_create_asset()
    
    # Check owner dashboard
    tests.test_owner_dashboard()
    
    # Check user dashboard
    tests.test_user_dashboard()
    print("✅ Ownership workflow complete!")


# Workflow 3: Complete Review Cycle
def workflow_review_cycle():
    from test_api import APITestClient, ReviewsAPITests
    client = APITestClient()
    tests = ReviewsAPITests(client)
    
    # Create review
    tests.test_create_review()
    
    # Get all reviews
    tests.test_get_reviews()
    
    # Mark as helpful
    tests.test_mark_review_helpful()
    
    # Update review
    tests.test_update_review()
    
    print("✅ Review workflow complete!")


# ============================================================================
# STEP 9: Configuration Checklist
# ============================================================================

SETUP_CHECKLIST = {
    'Django Server': '▢ Running (python manage.py runserver)',
    'Test Files': '▢ All 4 files in backend/ directory',
    'API Base URL': '▢ http://localhost:8000/api',
    'Auth Token': '▢ Set in api_keys_config.py',
    'Test Data': '▢ Updated with your data if needed',
    'Dependencies': '▢ requests library installed',
}

# ============================================================================
# STEP 10: Running Your First Test
# ============================================================================

print("""
╔══════════════════════════════════════════════════════════════════════╗
║          YOUR FIRST TEST - 3 SIMPLE STEPS                           ║
╚══════════════════════════════════════════════════════════════════════╝

1. Ensure Django is running:
   $ python manage.py runserver

2. In a new terminal, run:
   $ python test_api.py

3. Watch the magic happen! 🚀

Expected output:
   ✅ Asset created successfully (ID: 1)
   ✅ Tokens purchased successfully
   ✅ Dividend distributed successfully
   ...
   📊 Total: 12/12 tests passed

""")

# ============================================================================
# ADDITIONAL RESOURCES
# ============================================================================

RESOURCES = {
    'Documentation': 'TEST_SUITE_README.md',
    'Examples': 'test_examples.py',
    'API Config': 'api_keys_config.py',
    'Main Tests': 'test_api.py',
}

print("\n📚 Documentation available in:")
for resource_type, filename in RESOURCES.items():
    print(f"   • {resource_type}: {filename}")

print("\n💡 Pro Tips:")
print("   1. Read TEST_SUITE_README.md for comprehensive docs")
print("   2. Check test_examples.py for 10 usage scenarios")
print("   3. Edit api_keys_config.py to add your API keys")
print("   4. Use test_api.py for production testing")
print("\n")
