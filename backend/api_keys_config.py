"""
API Keys and Secrets Configuration
IMPORTANT: DO NOT COMMIT THIS FILE TO VERSION CONTROL
Add this file to .gitignore for production use
"""

# Authentication Tokens
AUTH_TOKENS = {
    'marketplace': {
        'api_key': 'marketplace_key_12345',
        'secret_key': 'marketplace_secret_67890',
    },
    'reviews': {
        'api_key': 'reviews_key_abcdef',
        'secret_key': 'reviews_secret_ghijkl',
    },
}

# User Authentication Tokens (populated after login)
USER_AUTH_TOKENS = {
    'test_user': None,
    'test_owner': None,
}

# API Configuration
API_BASE_URL = 'http://localhost:8000'
API_BASE_PATH = '/api'

# Marketplace API
MARKETPLACE_API = {
    'base_url': f'{API_BASE_URL}{API_BASE_PATH}/marketplace',
    'endpoints': {
        'create_asset': '/assets/create/',
        'purchase_tokens': '/tokens/purchase/',
        'distribute_dividend': '/dividends/distribute/',
        'asset_dividend_history': '/assets/{asset_id}/dividend-history/',
        'owner_dashboard': '/owner/dashboard/{asset_id}/',
        'user_dashboard': '/user/dashboard/{asset_id}/',
        'user_portfolio': '/user/portfolio/',
    },
}

# Reviews API
REVIEWS_API = {
    'base_url': f'{API_BASE_URL}{API_BASE_PATH}/reviews',
    'endpoints': {
        'create_review': '/create/',
        'get_reviews': '/asset/{asset_id}/',
        'update_review': '/{review_id}/update/',
        'delete_review': '/{review_id}/delete/',
        'helpful_review': '/{review_id}/helpful/',
        'unhelpful_review': '/{review_id}/unhelpful/',
    },
}

# Authentication API
AUTH_API = {
    'base_url': f'{API_BASE_URL}/auth',
    'login': '/login/',
    'register': '/register/',
    'logout': '/logout/',
    'refresh': '/refresh/',
}

# Default Headers for API Calls
DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

# Test Configuration
TEST_CONFIG = {
    'timeout': 10,  # Request timeout in seconds
    'verbose': True,  # Print detailed logs
    'fail_fast': False,  # Stop on first failure
}
