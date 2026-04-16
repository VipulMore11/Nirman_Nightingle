"""
Comprehensive API Test Suite for Marketplace and Reviews Apps
Stores API keys, endpoints, and test cases for both applications
"""

import json
import requests
from typing import Dict, Any, Optional
from datetime import datetime

# ============================================================================
# API CONFIGURATION & KEYS
# ============================================================================

API_CONFIG = {
    'BASE_URL': 'http://localhost:8000/api',
    'MARKETPLACE_API_KEY': 'marketplace_key_12345',
    'REVIEWS_API_KEY': 'reviews_key_67890',
    'AUTH_TOKEN': None,  # Will be populated after login
}

# Marketplace API Endpoints
MARKETPLACE_ENDPOINTS = {
    'create_asset': '/marketplace/assets/create/',
    'purchase_tokens': '/marketplace/tokens/purchase/',
    'distribute_dividend': '/marketplace/dividends/distribute/',
    'asset_dividend_history': '/marketplace/assets/{asset_id}/dividend-history/',
    'owner_dashboard': '/marketplace/owner/dashboard/{asset_id}/',
    'user_dashboard': '/marketplace/user/dashboard/{asset_id}/',
    'user_portfolio': '/marketplace/user/portfolio/',
}

# Reviews API Endpoints
REVIEWS_ENDPOINTS = {
    'create_review': '/reviews/create/',
    'get_reviews': '/reviews/asset/{asset_id}/',
    'update_review': '/reviews/{review_id}/update/',
    'delete_review': '/reviews/{review_id}/delete/',
    'helpful_review': '/reviews/{review_id}/helpful/',
    'unhelpful_review': '/reviews/{review_id}/unhelpful/',
}


# ============================================================================
# TEST DATA
# ============================================================================

class TestData:
    """Store test data for API calls"""
    
    # User Test Data
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
    
    # Marketplace Test Data
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
    
    # Reviews Test Data
    REVIEW_DATA = {
        'asset_id': 1001,
        'rating': 5,
        'comment': 'Great asset! Highly recommended.',
        'wallet': '0x1234567890abcdef',
    }


# ============================================================================
# API TEST CLIENT
# ============================================================================

class APITestClient:
    """
    Client for testing marketplace and reviews APIs
    Handles authentication and API calls
    """
    
    def __init__(self, base_url: str = API_CONFIG['BASE_URL']):
        self.base_url = base_url
        self.auth_token = None
        self.headers = {
            'Content-Type': 'application/json',
        }
    
    def set_auth_token(self, token: str):
        """Set authentication token"""
        self.auth_token = token
        self.headers['Authorization'] = f'Bearer {token}'
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> requests.Response:
        """Make HTTP request to API"""
        url = f"{self.base_url}{endpoint}"
        
        print(f"\n{'='*70}")
        print(f"[{method}] {url}")
        print(f"Headers: {self.headers}")
        if data:
            print(f"Data: {json.dumps(data, indent=2)}")
        print(f"{'='*70}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=self.headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=self.headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=self.headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response
        except Exception as e:
            print(f"Error: {str(e)}")
            raise
    
    def get(self, endpoint: str) -> requests.Response:
        """GET request"""
        return self._make_request('GET', endpoint)
    
    def post(self, endpoint: str, data: Dict = None) -> requests.Response:
        """POST request"""
        return self._make_request('POST', endpoint, data)
    
    def put(self, endpoint: str, data: Dict = None) -> requests.Response:
        """PUT request"""
        return self._make_request('PUT', endpoint, data)
    
    def delete(self, endpoint: str) -> requests.Response:
        """DELETE request"""
        return self._make_request('DELETE', endpoint)


# ============================================================================
# MARKETPLACE API TESTS
# ============================================================================

class MarketplaceAPITests:
    """Test cases for Marketplace API"""
    
    def __init__(self, client: APITestClient):
        self.client = client
        self.test_data = TestData()
        self.created_asset_id = None
    
    def test_create_asset(self):
        """Test: Create a new tokenized asset"""
        print("\n" + "🔵 "*20)
        print("TEST: Create Asset")
        print("🔵 "*20)
        
        response = self.client.post(
            MARKETPLACE_ENDPOINTS['create_asset'],
            self.test_data.ASSET_DATA
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        data = response.json()
        self.created_asset_id = data.get('id')
        print(f"✅ Asset created successfully (ID: {self.created_asset_id})")
        return data
    
    def test_purchase_tokens(self):
        """Test: Purchase tokens in an asset"""
        print("\n" + "🔵 "*20)
        print("TEST: Purchase Tokens")
        print("🔵 "*20)
        
        response = self.client.post(
            MARKETPLACE_ENDPOINTS['purchase_tokens'],
            self.test_data.TOKEN_PURCHASE
        )
        
        assert response.status_code in [201, 200], f"Expected 201 or 200, got {response.status_code}"
        print("✅ Tokens purchased successfully")
        return response.json()
    
    def test_distribute_dividend(self):
        """Test: Distribute dividend to token holders"""
        print("\n" + "🔵 "*20)
        print("TEST: Distribute Dividend")
        print("🔵 "*20)
        
        response = self.client.post(
            MARKETPLACE_ENDPOINTS['distribute_dividend'],
            self.test_data.DIVIDEND_DISTRIBUTION
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        data = response.json()
        print(f"✅ Dividend distributed successfully")
        print(f"   Distributable Profit: {data.get('distributable_profit')}")
        print(f"   Profit Per Token: {data.get('profit_per_token')}")
        print(f"   Users Compensated: {data.get('total_users_compensated')}")
        return data
    
    def test_owner_dashboard(self):
        """Test: Get owner dashboard"""
        print("\n" + "🔵 "*20)
        print("TEST: Owner Dashboard")
        print("🔵 "*20)
        
        asset_id = self.test_data.ASSET_DATA['asset_id']
        endpoint = MARKETPLACE_ENDPOINTS['owner_dashboard'].format(asset_id=asset_id)
        response = self.client.get(endpoint)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print("✅ Owner dashboard retrieved successfully")
        print(f"   Total Profit: {data.get('total_profit')}")
        print(f"   Distributed Profit: {data.get('distributed_profit')}")
        print(f"   Remaining Profit: {data.get('remaining_profit')}")
        print(f"   Total Users: {data.get('total_users')}")
        return data
    
    def test_user_dashboard(self):
        """Test: Get user dashboard"""
        print("\n" + "🔵 "*20)
        print("TEST: User Dashboard")
        print("🔵 "*20)
        
        asset_id = self.test_data.ASSET_DATA['asset_id']
        endpoint = MARKETPLACE_ENDPOINTS['user_dashboard'].format(asset_id=asset_id)
        response = self.client.get(endpoint)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print("✅ User dashboard retrieved successfully")
        print(f"   Tokens Owned: {data.get('tokens_owned')}")
        print(f"   Buy Price: {data.get('buy_price')}")
        print(f"   Total Profit Earned: {data.get('total_profit_earned')}")
        print(f"   Percentage Ownership: {data.get('percentage_ownership')}")
        return data
    
    def test_user_portfolio(self):
        """Test: Get user portfolio"""
        print("\n" + "🔵 "*20)
        print("TEST: User Portfolio")
        print("🔵 "*20)
        
        response = self.client.get(MARKETPLACE_ENDPOINTS['user_portfolio'])
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print("✅ User portfolio retrieved successfully")
        print(f"   Total Assets: {data.get('total_assets')}")
        print(f"   Total Portfolio Value: {data.get('total_portfolio_value')}")
        return data
    
    def test_dividend_history(self):
        """Test: Get dividend history for an asset"""
        print("\n" + "🔵 "*20)
        print("TEST: Dividend History")
        print("🔵 "*20)
        
        asset_id = self.test_data.ASSET_DATA['asset_id']
        endpoint = MARKETPLACE_ENDPOINTS['asset_dividend_history'].format(asset_id=asset_id)
        response = self.client.get(endpoint)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print("✅ Dividend history retrieved successfully")
        print(f"   Total Distributions: {data.get('total_distributions')}")
        return data


# ============================================================================
# REVIEWS API TESTS
# ============================================================================

class ReviewsAPITests:
    """Test cases for Reviews API"""
    
    def __init__(self, client: APITestClient):
        self.client = client
        self.test_data = TestData()
        self.created_review_id = None
    
    def test_create_review(self):
        """Test: Create a new review"""
        print("\n" + "🟢 "*20)
        print("TEST: Create Review")
        print("🟢 "*20)
        
        response = self.client.post(
            REVIEWS_ENDPOINTS['create_review'],
            self.test_data.REVIEW_DATA
        )
        
        assert response.status_code in [201, 200], f"Expected 201 or 200, got {response.status_code}"
        data = response.json()
        self.created_review_id = data.get('id')
        print(f"✅ Review created successfully (ID: {self.created_review_id})")
        print(f"   Rating: {data.get('rating')}")
        print(f"   Comment: {data.get('comment')}")
        return data
    
    def test_get_reviews(self):
        """Test: Get all reviews for an asset"""
        print("\n" + "🟢 "*20)
        print("TEST: Get Reviews for Asset")
        print("🟢 "*20)
        
        asset_id = self.test_data.REVIEW_DATA['asset_id']
        endpoint = REVIEWS_ENDPOINTS['get_reviews'].format(asset_id=asset_id)
        response = self.client.get(endpoint)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"✅ Reviews retrieved successfully")
        if isinstance(data, list):
            print(f"   Total Reviews: {len(data)}")
        else:
            print(f"   Response: {data}")
        return data
    
    def test_mark_review_helpful(self):
        """Test: Mark review as helpful"""
        print("\n" + "🟢 "*20)
        print("TEST: Mark Review Helpful")
        print("🟢 "*20)
        
        if not self.created_review_id:
            print("⚠️  Skipping: No review created yet")
            return
        
        endpoint = REVIEWS_ENDPOINTS['helpful_review'].format(review_id=self.created_review_id)
        response = self.client.post(endpoint)
        
        assert response.status_code in [200, 201], f"Expected 200 or 201, got {response.status_code}"
        print("✅ Review marked as helpful successfully")
        return response.json()
    
    def test_update_review(self):
        """Test: Update a review"""
        print("\n" + "🟢 "*20)
        print("TEST: Update Review")
        print("🟢 "*20)
        
        if not self.created_review_id:
            print("⚠️  Skipping: No review created yet")
            return
        
        update_data = {
            'rating': 4,
            'comment': 'Updated comment - Still great!',
        }
        
        endpoint = REVIEWS_ENDPOINTS['update_review'].format(review_id=self.created_review_id)
        response = self.client.put(endpoint, update_data)
        
        if response.status_code in [200, 201]:
            print("✅ Review updated successfully")
            return response.json()
        else:
            print(f"⚠️  Update failed with status {response.status_code}")
            return None
    
    def test_delete_review(self):
        """Test: Delete a review"""
        print("\n" + "🟢 "*20)
        print("TEST: Delete Review")
        print("🟢 "*20)
        
        if not self.created_review_id:
            print("⚠️  Skipping: No review created yet")
            return
        
        endpoint = REVIEWS_ENDPOINTS['delete_review'].format(review_id=self.created_review_id)
        response = self.client.delete(endpoint)
        
        if response.status_code in [200, 204]:
            print("✅ Review deleted successfully")
            return True
        else:
            print(f"⚠️  Delete failed with status {response.status_code}")
            return False


# ============================================================================
# TEST RUNNER
# ============================================================================

class TestRunner:
    """Main test runner for both APIs"""
    
    def __init__(self):
        self.client = APITestClient()
        self.marketplace_tests = MarketplaceAPITests(self.client)
        self.reviews_tests = ReviewsAPITests(self.client)
        self.results = {
            'marketplace': {},
            'reviews': {},
        }
    
    def run_marketplace_tests(self):
        """Run all marketplace tests"""
        print("\n\n" + "="*70)
        print("MARKETPLACE API TESTS")
        print("="*70)
        
        tests = [
            ('create_asset', self.marketplace_tests.test_create_asset),
            ('purchase_tokens', self.marketplace_tests.test_purchase_tokens),
            ('distribute_dividend', self.marketplace_tests.test_distribute_dividend),
            ('owner_dashboard', self.marketplace_tests.test_owner_dashboard),
            ('user_dashboard', self.marketplace_tests.test_user_dashboard),
            ('user_portfolio', self.marketplace_tests.test_user_portfolio),
            ('dividend_history', self.marketplace_tests.test_dividend_history),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
                self.results['marketplace'][test_name] = 'PASSED'
            except AssertionError as e:
                print(f"❌ Test failed: {str(e)}")
                self.results['marketplace'][test_name] = 'FAILED'
            except Exception as e:
                print(f"❌ Error: {str(e)}")
                self.results['marketplace'][test_name] = 'ERROR'
    
    def run_reviews_tests(self):
        """Run all reviews tests"""
        print("\n\n" + "="*70)
        print("REVIEWS API TESTS")
        print("="*70)
        
        tests = [
            ('create_review', self.reviews_tests.test_create_review),
            ('get_reviews', self.reviews_tests.test_get_reviews),
            ('mark_helpful', self.reviews_tests.test_mark_review_helpful),
            ('update_review', self.reviews_tests.test_update_review),
            ('delete_review', self.reviews_tests.test_delete_review),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
                self.results['reviews'][test_name] = 'PASSED'
            except Exception as e:
                print(f"❌ Error: {str(e)}")
                self.results['reviews'][test_name] = 'ERROR'
    
    def print_summary(self):
        """Print test summary"""
        print("\n\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        
        print("\n📦 MARKETPLACE TESTS:")
        for test_name, result in self.results['marketplace'].items():
            symbol = "✅" if result == 'PASSED' else "❌"
            print(f"  {symbol} {test_name}: {result}")
        
        print("\n📝 REVIEWS TESTS:")
        for test_name, result in self.results['reviews'].items():
            symbol = "✅" if result == 'PASSED' else "❌"
            print(f"  {symbol} {test_name}: {result}")
        
        total_tests = len(self.results['marketplace']) + len(self.results['reviews'])
        passed_tests = sum(1 for r in self.results['marketplace'].values() if r == 'PASSED') + \
                      sum(1 for r in self.results['reviews'].values() if r == 'PASSED')
        
        print(f"\n📊 Total: {passed_tests}/{total_tests} tests passed")
        print("="*70)
    
    def run_all_tests(self):
        """Run all tests"""
        print(f"\n🚀 Starting API Tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            self.run_marketplace_tests()
            self.run_reviews_tests()
            self.print_summary()
        except KeyboardInterrupt:
            print("\n\n⚠️  Tests interrupted by user")
        except Exception as e:
            print(f"\n\n❌ Fatal error: {str(e)}")


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == '__main__':
    # NOTE: Make sure your Django development server is running before executing tests
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║         API TEST SUITE - MARKETPLACE & REVIEWS                       ║
    ║                                                                      ║
    ║  Before running tests:                                              ║
    ║  1. Ensure Django server is running: python manage.py runserver     ║
    ║  2. Create test users if needed                                     ║
    ║  3. Update API_CONFIG with correct authentication tokens            ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    # Create and run test runner
    runner = TestRunner()
    runner.run_all_tests()
