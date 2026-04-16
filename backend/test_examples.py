"""
Example Usage Scenarios for the API Test Suite

This file shows practical examples of how to use the test suite
for different use cases.
"""

from test_api import (
    APITestClient,
    MarketplaceAPITests,
    ReviewsAPITests,
    TestRunner,
    API_CONFIG,
    TestData,
)


# ============================================================================
# EXAMPLE 1: Run All Tests
# ============================================================================

def example_1_run_all_tests():
    """
    Run the complete test suite for both Marketplace and Reviews APIs
    """
    print("=" * 70)
    print("EXAMPLE 1: Running All Tests")
    print("=" * 70)
    
    runner = TestRunner()
    runner.run_all_tests()


# ============================================================================
# EXAMPLE 2: Test Only Marketplace API
# ============================================================================

def example_2_marketplace_only():
    """
    Test only the Marketplace API functionality
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Testing Only Marketplace API")
    print("=" * 70)
    
    client = APITestClient()
    
    # Set authentication token if needed
    # client.set_auth_token('your_token_here')
    
    marketplace_tests = MarketplaceAPITests(client)
    
    # Run individual marketplace tests
    print("\n1. Creating Asset...")
    asset_data = marketplace_tests.test_create_asset()
    
    print("\n2. Purchasing Tokens...")
    ownership_data = marketplace_tests.test_purchase_tokens()
    
    print("\n3. Distributing Dividends...")
    dividend_data = marketplace_tests.test_distribute_dividend()
    
    print("\n4. Viewing Owner Dashboard...")
    dashboard_data = marketplace_tests.test_owner_dashboard()


# ============================================================================
# EXAMPLE 3: Test Only Reviews API
# ============================================================================

def example_3_reviews_only():
    """
    Test only the Reviews API functionality
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Testing Only Reviews API")
    print("=" * 70)
    
    client = APITestClient()
    
    # Set authentication token if needed
    # client.set_auth_token('your_token_here')
    
    reviews_tests = ReviewsAPITests(client)
    
    # Run individual review tests
    print("\n1. Creating a Review...")
    review_data = reviews_tests.test_create_review()
    
    print("\n2. Getting All Reviews...")
    all_reviews = reviews_tests.test_get_reviews()
    
    print("\n3. Marking Review as Helpful...")
    helpful = reviews_tests.test_mark_review_helpful()
    
    print("\n4. Updating Review...")
    updated = reviews_tests.test_update_review()


# ============================================================================
# EXAMPLE 4: Custom API Client Setup
# ============================================================================

def example_4_custom_client():
    """
    Create a custom API client with specific configuration
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Custom API Client Setup")
    print("=" * 70)
    
    # Create client with custom base URL
    client = APITestClient(base_url='http://localhost:8000/api')
    
    # Set authentication token
    client.set_auth_token('your_auth_token_here')
    
    # Add custom headers
    client.headers['X-API-Key'] = 'your_api_key'
    client.headers['User-Agent'] = 'MyTestClient/1.0'
    
    print("✅ Custom client configured:")
    print(f"   Base URL: {client.base_url}")
    print(f"   Auth Token: {'Set' if client.auth_token else 'Not Set'}")
    print(f"   Headers: {client.headers}")


# ============================================================================
# EXAMPLE 5: Testing with Custom Data
# ============================================================================

def example_5_custom_test_data():
    """
    Run tests with custom test data
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 5: Testing with Custom Data")
    print("=" * 70)
    
    client = APITestClient()
    marketplace_tests = MarketplaceAPITests(client)
    
    # Override test data
    marketplace_tests.test_data.ASSET_DATA = {
        'name': 'Custom Asset - Tesla Inc.',
        'asset_id': 2001,
        'total_tokens': 5000,
        'tokenized_percentage': 50,
    }
    
    marketplace_tests.test_data.DIVIDEND_DISTRIBUTION = {
        'asset_id': 2001,
        'total_profit': 50000.0,
    }
    
    print("✅ Custom test data configured:")
    print(f"   Asset: {marketplace_tests.test_data.ASSET_DATA['name']}")
    print(f"   Total Profit: ${marketplace_tests.test_data.DIVIDEND_DISTRIBUTION['total_profit']}")
    
    # Run tests with custom data
    marketplace_tests.test_create_asset()


# ============================================================================
# EXAMPLE 6: Sequential Testing with Error Handling
# ============================================================================

def example_6_error_handling():
    """
    Run tests with comprehensive error handling
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 6: Sequential Testing with Error Handling")
    print("=" * 70)
    
    client = APITestClient()
    marketplace_tests = MarketplaceAPITests(client)
    
    tests_to_run = [
        ('Create Asset', marketplace_tests.test_create_asset),
        ('Purchase Tokens', marketplace_tests.test_purchase_tokens),
        ('Distribute Dividend', marketplace_tests.test_distribute_dividend),
    ]
    
    results = {}
    for test_name, test_func in tests_to_run:
        try:
            print(f"\n▶️  Running: {test_name}")
            result = test_func()
            results[test_name] = 'PASSED'
            print(f"✅ {test_name} - PASSED")
        except AssertionError as e:
            results[test_name] = f'FAILED: {str(e)}'
            print(f"❌ {test_name} - FAILED: {str(e)}")
        except Exception as e:
            results[test_name] = f'ERROR: {str(e)}'
            print(f"❌ {test_name} - ERROR: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    for test_name, result in results.items():
        status = "✅" if result == 'PASSED' else "❌"
        print(f"{status} {test_name}: {result}")


# ============================================================================
# EXAMPLE 7: Testing Specific Endpoints
# ============================================================================

def example_7_specific_endpoint():
    """
    Test a specific API endpoint directly
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 7: Testing Specific Endpoint")
    print("=" * 70)
    
    client = APITestClient()
    
    # Test the user portfolio endpoint
    print("\nTesting User Portfolio Endpoint...")
    
    # Make the request
    response = client.get('/marketplace/user/portfolio/')
    
    # Check response
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success!")
        print(f"   Total Assets: {data.get('total_assets')}")
        print(f"   Portfolio Value: ${data.get('total_portfolio_value')}")
    else:
        print(f"❌ Failed with status {response.status_code}")


# ============================================================================
# EXAMPLE 8: Batch Testing Multiple Assets
# ============================================================================

def example_8_batch_testing():
    """
    Create and test multiple assets in batch
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 8: Batch Testing Multiple Assets")
    print("=" * 70)
    
    client = APITestClient()
    marketplace_tests = MarketplaceAPITests(client)
    
    # Define multiple assets to test
    assets = [
        {
            'name': 'Apple Inc.',
            'asset_id': 1001,
            'total_tokens': 1000,
            'tokenized_percentage': 30,
        },
        {
            'name': 'Google Inc.',
            'asset_id': 1002,
            'total_tokens': 2000,
            'tokenized_percentage': 40,
        },
        {
            'name': 'Microsoft Inc.',
            'asset_id': 1003,
            'total_tokens': 1500,
            'tokenized_percentage': 25,
        },
    ]
    
    created_assets = []
    
    for asset in assets:
        marketplace_tests.test_data.ASSET_DATA = asset
        try:
            print(f"\n📦 Creating asset: {asset['name']}")
            result = marketplace_tests.test_create_asset()
            created_assets.append(result)
            print(f"✅ Created successfully")
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
    
    print(f"\n✅ Successfully created {len(created_assets)} assets")


# ============================================================================
# EXAMPLE 9: Performance Testing
# ============================================================================

def example_9_performance_testing():
    """
    Run performance tests on API endpoints
    """
    import time
    
    print("\n" + "=" * 70)
    print("EXAMPLE 9: Performance Testing")
    print("=" * 70)
    
    client = APITestClient()
    marketplace_tests = MarketplaceAPITests(client)
    
    num_iterations = 5
    times = []
    
    print(f"\nRunning {num_iterations} iterations of asset creation...")
    
    for i in range(num_iterations):
        start_time = time.time()
        try:
            marketplace_tests.test_create_asset()
            end_time = time.time()
            elapsed = (end_time - start_time) * 1000  # Convert to ms
            times.append(elapsed)
            print(f"  Iteration {i+1}: {elapsed:.2f}ms")
        except Exception as e:
            print(f"  Iteration {i+1}: FAILED - {str(e)}")
    
    if times:
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        print(f"\n📊 Performance Statistics:")
        print(f"   Average: {avg_time:.2f}ms")
        print(f"   Minimum: {min_time:.2f}ms")
        print(f"   Maximum: {max_time:.2f}ms")


# ============================================================================
# EXAMPLE 10: Integration Testing - Full Workflow
# ============================================================================

def example_10_full_workflow():
    """
    Test a complete workflow: Create asset -> Buy tokens -> Distribute dividends
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 10: Full Workflow Integration Test")
    print("=" * 70)
    
    client = APITestClient()
    marketplace_tests = MarketplaceAPITests(client)
    
    try:
        # Step 1: Create Asset
        print("\n📍 Step 1: Creating Asset")
        asset = marketplace_tests.test_create_asset()
        print(f"   ✅ Asset created with ID: {asset.get('id')}")
        
        # Step 2: Purchase Tokens
        print("\n📍 Step 2: Purchasing Tokens")
        ownership = marketplace_tests.test_purchase_tokens()
        print(f"   ✅ Purchased {ownership.get('tokens_owned')} tokens")
        
        # Step 3: Distribute Dividends
        print("\n📍 Step 3: Distributing Dividends")
        dividend = marketplace_tests.test_distribute_dividend()
        print(f"   ✅ Distributed ${dividend.get('distributed_profit')}")
        print(f"   Profit per token: ${dividend.get('profit_per_token')}")
        
        # Step 4: Check Dashboard
        print("\n📍 Step 4: Checking User Dashboard")
        dashboard = marketplace_tests.test_user_dashboard()
        print(f"   ✅ User earned: ${dashboard.get('total_profit_earned')}")
        
        print("\n✅ Complete workflow executed successfully!")
        
    except Exception as e:
        print(f"\n❌ Workflow failed: {str(e)}")


# ============================================================================
# MAIN - Run Examples
# ============================================================================

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║         API TEST SUITE - EXAMPLE USAGE SCENARIOS                    ║
    ║                                                                      ║
    ║  Choose an example to run (1-10):                                   ║
    ║  1. Run all tests                                                   ║
    ║  2. Marketplace API only                                            ║
    ║  3. Reviews API only                                                ║
    ║  4. Custom client setup                                             ║
    ║  5. Custom test data                                                ║
    ║  6. Error handling                                                  ║
    ║  7. Specific endpoint test                                          ║
    ║  8. Batch testing                                                   ║
    ║  9. Performance testing                                             ║
    ║  10. Full workflow integration                                      ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    examples = {
        '1': example_1_run_all_tests,
        '2': example_2_marketplace_only,
        '3': example_3_reviews_only,
        '4': example_4_custom_client,
        '5': example_5_custom_test_data,
        '6': example_6_error_handling,
        '7': example_7_specific_endpoint,
        '8': example_8_batch_testing,
        '9': example_9_performance_testing,
        '10': example_10_full_workflow,
    }
    
    # Run example 10 (full workflow) by default
    # Change this to run different examples
    example_to_run = '10'
    
    if example_to_run in examples:
        try:
            examples[example_to_run]()
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
    else:
        print(f"Invalid example number: {example_to_run}")
